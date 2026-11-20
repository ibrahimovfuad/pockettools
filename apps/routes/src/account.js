// Account and data controls shared by every Pocket Tools app that stores user data.
// Edit this file in shared/ and run "npm run sync-shared"; it is copied into each app's src/.
//
// What it does (the list of collections and server stores comes from user-data.json):
//   exportData()          download one JSON file with everything stored about the user in ALL Pocket Tools apps
//   deleteAppData()       delete only the collections and server stores of the calling app; stay signed in
//   deleteAccount()       delete the data of every app, then the Google sign-in account itself
//   initAccount(ctx)      wire the "Account & data" section (accountHTML()) to those three
//
// ctx = {
//   app: 'mood',                       key in user-data.json
//   getUser: () => ({ uid, name, email }) | null,
//   getFirebase: () => ({ db, auth }) | null,   null means demo mode (data lives in localStorage)
//   demoKeys: ['mood-demo'],           localStorage keys (or prefixes) used in demo mode
//   stopListening: () => void          optional: detach Firestore listeners before the account is removed
// }
import {
  collection, deleteDoc, doc, documentId, getDocFromServer, getDocsFromServer, limit, orderBy, query, startAfter,
  terminate, clearIndexedDbPersistence, writeBatch
} from 'firebase/firestore';
import { deleteUser, reauthenticateWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import REG from './user-data.json' with { type: 'json' };

export const registry = REG;
const NET_TIMEOUT = 30000;
const PAGE = 400;                                   // Firestore allows 500 writes per batch
const RECENT_LOGIN_MS = 4 * 60 * 1000;              // Firebase wants a sign-in from the last few minutes to delete an account

// ---------------------------------------------------------------- registry helpers
const entries = () => [...Object.entries(REG.apps), ...Object.entries(REG.legacy || {})].map(([id, a]) => ({ id, ...a }));
export const appIds = () => entries().map(a => a.id);
export const appEntry = id => entries().find(a => a.id === id);
export const collectionsOf = id => ((appEntry(id) || {}).collections || []).map(c => c.id);
export const everyCollection = () => entries().flatMap(a => a.collections.map(c => c.id));

// ---------------------------------------------------------------- small utilities
const withTimeout = (p, ms, what) => Promise.race([
  p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error(`${what} timed out`), { code: 'timeout' })), ms))
]);
const pick = (obj, path) => path.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);

export function describeError(e) {
  const c = e && typeof e.code === 'string' ? e.code : '';   // DOMExceptions have numeric codes
  if (c === 'timeout' || c.includes('unavailable') || c.includes('network')) return 'no connection to the server';
  if (c.includes('permission-denied')) return 'not allowed (permission denied)';
  if (c.includes('popup-blocked')) return 'the sign-in window was blocked';
  if (c.includes('popup-closed') || c.includes('cancelled')) return 'the sign-in window was closed';
  if (c.includes('user-mismatch')) return 'you signed in with a different Google account';
  return c || (e && e.message) || String(e);
}

// Firestore values -> plain JSON (timestamps become ISO strings)
export function plain(v) {
  if (v === null || typeof v !== 'object') return v;
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (typeof v.path === 'string' && v.firestore) return v.path;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
}

// ---------------------------------------------------------------- storage adapter
// Everything below talks to Firestore through this small interface, so it can be tested without a database.
export function firestoreAdapter(db, uid) {
  const col = c => collection(db, 'users', uid, c);
  return {
    // one page of documents (ordered by id), always read from the server so that "offline" fails loudly
    async page(c, after, size = PAGE) {
      const q = after ? query(col(c), orderBy(documentId()), startAfter(after), limit(size)) : query(col(c), orderBy(documentId()), limit(size));
      return (await withTimeout(getDocsFromServer(q), NET_TIMEOUT, 'Reading')).docs.map(d => ({ id: d.id, data: d.data() }));
    },
    async removeMany(c, ids) {
      const b = writeBatch(db);
      ids.forEach(id => b.delete(doc(db, 'users', uid, c, id)));
      await withTimeout(b.commit(), NET_TIMEOUT, 'Deleting');
    },
    async profile() { const s = await withTimeout(getDocFromServer(doc(db, 'users', uid)), NET_TIMEOUT, 'Reading'); return s.exists() ? s.data() : null; },
    async removeProfile() { await withTimeout(deleteDoc(doc(db, 'users', uid)), NET_TIMEOUT, 'Deleting'); },
    async publicDoc(c, id) { const s = await withTimeout(getDocFromServer(doc(db, c, id)), NET_TIMEOUT, 'Reading'); return s.exists() ? s.data() : null; },
    async removePublic(c, id) { await withTimeout(deleteDoc(doc(db, c, id)), NET_TIMEOUT, 'Deleting'); }
  };
}

async function allDocs(adapter, c, onCount) {
  const out = {};
  let after = null;
  for (;;) {
    const rows = await adapter.page(c, after);
    rows.forEach(r => { out[r.id] = plain(r.data); });
    if (onCount) onCount(Object.keys(out).length);
    if (rows.length < PAGE) return out;
    after = rows[rows.length - 1].id;
  }
}

async function emptyCollection(adapter, c, onCount) {
  let total = 0, lastFirst = null;
  for (;;) {
    const rows = await adapter.page(c, null);
    if (!rows.length) return total;
    if (rows[0].id === lastFirst) throw new Error('documents were not removed');   // no progress: stop instead of looping forever
    lastFirst = rows[0].id;
    await adapter.removeMany(c, rows.map(r => r.id));
    total += rows.length;
    if (onCount) onCount(total);
  }
}

// ---------------------------------------------------------------- server-side stores (push subscriptions)
async function callServer(ctx, server, action) {
  const token = await ctx.token();
  if (!token) throw new Error('not signed in');
  const own = server.app === ctx.app;
  const url = own ? new URL(server.url).pathname : server.url;   // same origin when possible (also works on a fork or localhost)
  const res = await withTimeout(fetch(url, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ action })
  }), NET_TIMEOUT, 'Server');
  if (!res.ok) throw new Error(`server answered ${res.status}`);
  return res.json();
}

async function unsubscribeThisDevice() {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && reg.pushManager && await reg.pushManager.getSubscription();
  return sub ? sub.unsubscribe() : false;
}

// ---------------------------------------------------------------- context
function makeCtx(raw) {
  const fb = raw.getFirebase ? raw.getFirebase() : null;
  const user = raw.getUser();
  const ctx = {
    ...raw, user, fb,
    adapter: raw.adapter || (fb && user ? firestoreAdapter(fb.db, user.uid) : null),
    token: raw.token || (() => (fb && fb.auth.currentUser ? fb.auth.currentUser.getIdToken() : Promise.resolve(null)))
  };
  // Servers of every app, remembering which app they belong to
  ctx.servers = entries().flatMap(a => (a.server || []).map(s => ({ ...s, app: a.id, appName: a.name })));
  return ctx;
}

// Run one step, record the result and report progress
async function step(rep, onProgress, label, kind, fn) {
  const s = { label, kind, status: 'run', detail: '' };
  rep.steps.push(s);
  const tell = () => onProgress && onProgress(rep);
  s.progress = n => { s.detail = String(n); tell(); };
  tell();
  try { const d = await fn(s.progress); s.status = 'ok'; if (d != null && d !== '') s.detail = String(d); }
  catch (e) { s.status = 'fail'; s.detail = describeError(e); s.error = e; rep.failed.push(s); }
  delete s.progress;
  tell();
  return s.status === 'ok';
}

const newReport = () => ({ steps: [], failed: [] });
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------- export
export async function exportData(raw, onProgress) {
  const ctx = makeCtx(raw), rep = newReport();
  const out = {
    format: 'pocket-tools-export', version: 1, exportedAt: new Date().toISOString(), project: REG.project,
    account: { uid: ctx.user.uid, name: ctx.user.name || '', email: ctx.user.email || '' },
    note: 'Everything Pocket Tools stores about this account. Timestamps are ISO 8601 strings.',
    apps: {}
  };
  rep.data = out;
  for (const a of entries()) {
    const A = out.apps[a.id] = { name: a.name, collections: {} };
    for (const c of a.collections) {
      await step(rep, onProgress, `${a.name}: ${c.what}`, 'firestore', async prog => {
        const docs = await allDocs(ctx.adapter, c.id, prog);
        const n = Object.keys(docs).length;
        if (n || !(REG.legacy || {})[a.id]) A.collections[c.id] = docs;   // legacy collections only if they hold something
        return count(n, 'item', 'items');
      });
    }
    if (a.profile) {
      await step(rep, onProgress, `${a.name}: ${a.profile.what}`, 'firestore', async () => {
        const p = await ctx.adapter.profile();
        if (p) A.profile = plain(p);
        return p ? 'found' : 'none';
      });
    }
    if (a.publicShelf) {
      await step(rep, onProgress, `${a.name}: ${a.publicShelf.what}`, 'firestore', async () => {
        const id = pick(A.profile || await ctx.adapter.profile() || {}, a.publicShelf.idPath);
        if (typeof id !== 'string' || !id) return 'none';
        const d = await ctx.adapter.publicDoc(a.publicShelf.collection, id);
        if (d) A.publicShelf = { id, data: plain(d) };
        return d ? 'found' : 'none';
      });
    }
    for (const s of a.server || []) {
      await step(rep, onProgress, `${a.name}: ${s.what}`, 'server', async () => {
        const r = await callServer(ctx, { ...s, app: a.id }, 'export');
        (A.server = A.server || []).push({ what: s.what, data: r });
        return 'found';
      });
    }
  }
  out.counts = Object.fromEntries(Object.entries(out.apps).map(([id, a]) => [id, Object.values(a.collections).reduce((n, d) => n + Object.keys(d).length, 0)]));
  out.errors = rep.failed.map(f => `${f.label}: ${f.detail}`);
  rep.total = Object.values(out.counts).reduce((n, x) => n + x, 0);
  return rep;
}

// ---------------------------------------------------------------- delete
// Deletes the data of the given apps. Order inside an app: server stores, public shelf, collections, profile document
// (the profile is removed last because it holds the id of the public shelf).
export async function deleteApps(raw, ids, onProgress) {
  const ctx = makeCtx(raw), rep = newReport();
  for (const id of ids) {
    const a = appEntry(id);
    if (!a) continue;
    let appOk = true;
    for (const s of a.server || []) {
      appOk = await step(rep, onProgress, `${a.name}: ${s.what}`, 'server', () => callServer(ctx, { ...s, app: a.id }, 'delete').then(() => 'deleted')) && appOk;
    }
    let shelfId = null;
    if (a.publicShelf) {
      appOk = await step(rep, onProgress, `${a.name}: ${a.publicShelf.what}`, 'firestore', async () => {
        const p = await ctx.adapter.profile();
        shelfId = p ? pick(p, a.publicShelf.idPath) : null;
        if (typeof shelfId !== 'string' || !shelfId) return 'none';
        await ctx.adapter.removePublic(a.publicShelf.collection, shelfId);
        return 'deleted';
      }) && appOk;
    }
    for (const c of a.collections) {
      appOk = await step(rep, onProgress, `${a.name}: ${c.what}`, 'firestore', async prog => {
        const n = await emptyCollection(ctx.adapter, c.id, prog);
        return n ? `${count(n, 'item', 'items')} deleted` : 'nothing stored';
      }) && appOk;
    }
    if (a.profile && appOk) {
      await step(rep, onProgress, `${a.name}: ${a.profile.what}`, 'firestore', async () => { await ctx.adapter.removeProfile(); return 'deleted'; });
    }
    if (id === ctx.app && (a.server || []).length) {
      await step(rep, onProgress, 'Notifications on this device', 'local', async () => ((await unsubscribeThisDevice()) ? 'turned off' : 'none'));
    }
  }
  return rep;
}

export const deleteAppData = (raw, onProgress) => deleteApps(raw, [raw.app], onProgress);

// Deletes everything and then the account. Safe to call again after a failure or after re-authentication:
// every step is idempotent. Returns a report: { steps, failed, accountDeleted, needsReauth }.
//   opts.ignoreServerFailures: go on and delete the account even if a server store could not be cleaned
export async function deleteAccount(raw, onProgress, opts = {}) {
  const ctx = makeCtx(raw);
  const rep = await deleteApps(raw, appIds(), onProgress);
  rep.accountDeleted = false; rep.needsReauth = false;
  const blocking = rep.failed.filter(f => !(opts.ignoreServerFailures && f.kind === 'server') && f.kind !== 'local');
  if (blocking.length) return rep;
  const user = ctx.fb && ctx.fb.auth.currentUser;
  if (!user) { rep.failed.push({ label: 'Sign-in account', kind: 'auth', status: 'fail', detail: 'you are not signed in' }); return rep; }
  if (ctx.stopListening) { try { ctx.stopListening(); } catch (e) { /* ignore */ } }
  const ok = await step(rep, onProgress, 'Google sign-in account', 'auth', async () => {
    try { await deleteUser(user); }
    catch (e) { if (e && e.code === 'auth/requires-recent-login') rep.needsReauth = true; throw e; }
    return 'deleted';
  });
  if (!ok) return rep;
  rep.accountDeleted = true;
  try { await signOut(ctx.fb.auth); } catch (e) { /* the account is gone; nothing to sign out of */ }
  try { await terminate(ctx.fb.db); await clearIndexedDbPersistence(ctx.fb.db); } catch (e) { /* cached copy stays only if the browser refuses */ }
  try { localStorage.clear(); } catch (e) { /* ignore */ }
  return rep;
}

// Ask Google for a fresh sign-in (must run inside a click handler so the browser allows the pop-up)
export async function reauthenticate(raw) {
  const { auth } = raw.getFirebase();
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  await reauthenticateWithPopup(auth.currentUser, p);
}
export function signInIsStale(raw) {
  const fb = raw.getFirebase && raw.getFirebase();
  const u = fb && fb.auth.currentUser;
  const t = u && u.metadata && Date.parse(u.metadata.lastSignInTime);
  return !t || Date.now() - t > RECENT_LOGIN_MS;
}

// ---------------------------------------------------------------- demo mode (localStorage only)
const demoKeys = ctx => Object.keys(localStorage).filter(k => (ctx.demoKeys || []).some(p => k === p || k.startsWith(p)));
export function demoExport(raw) {
  const data = {};
  for (const k of demoKeys(raw)) { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch (e) { data[k] = localStorage.getItem(k); } }
  return { format: 'pocket-tools-export', version: 1, exportedAt: new Date().toISOString(), demo: true, note: 'Demo mode: data stored on this device only.', data };
}
export function demoClear(raw) { demoKeys(raw).forEach(k => localStorage.removeItem(k)); }

// ---------------------------------------------------------------- UI
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const h = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v); }
  kids.flat().forEach(k => { if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k)); });
  return e;
};

const CSS = `
.pta-h{font-size:13px;text-transform:uppercase;color:var(--text2,#6c6c70);padding:22px 16px 7px;letter-spacing:.2px}
.pta-list{background:var(--card,#fff);border-radius:16px;overflow:hidden}
.pta-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:48px;padding:11px 16px;position:relative;text-align:left;background:none;border:0;cursor:pointer;font:inherit;color:var(--accent,var(--blue,#2a78d6))}
.pta-row+.pta-row::before{content:"";position:absolute;top:0;left:16px;right:0;border-top:.5px solid var(--sep,rgba(60,60,67,.16))}
.pta-row.pta-danger{color:var(--danger,#d03b3b)}
.pta-row:active{opacity:.6}
.pta-foot{font-size:13px;color:var(--text2,#6c6c70);padding:7px 16px 0}
.pta-foot a{color:inherit}
.pta-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;-webkit-user-select:none;user-select:none}
.pta-box{background:var(--card,#fff);color:var(--text,#111);border-radius:18px;padding:20px;width:100%;max-width:420px;max-height:calc(100vh - 32px);overflow-y:auto;font:16px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif}
.pta-box h2{font-size:19px;line-height:1.25;margin:0 0 10px}
.pta-box p{margin:0 0 10px;color:var(--text,#111)}
.pta-box p.pta-dim{color:var(--text2,#6c6c70);font-size:14px}
.pta-box ul{margin:0 0 12px 20px;padding:0}
.pta-box li{margin:3px 0}
.pta-box input{display:block;width:100%;box-sizing:border-box;margin:6px 0 12px;padding:11px 12px;border-radius:10px;border:1px solid var(--sep,rgba(60,60,67,.3));background:var(--fill,rgba(118,118,128,.12));font:inherit;color:inherit;-webkit-user-select:text;user-select:text}
.pta-steps{list-style:none;margin:0 0 12px;padding:0}
.pta-steps li{display:grid;grid-template-columns:18px 1fr;gap:0 10px;margin:7px 0;font-size:15px}
.pta-steps .m{flex:none;width:18px;text-align:center;font-weight:700}
.pta-steps .ok .m{color:var(--on,#2e9e4f)}
.pta-steps .fail .m,.pta-steps .fail .d{color:var(--danger,#d03b3b)}
.pta-steps .d{display:block;color:var(--text2,#6c6c70);font-size:13px;overflow-wrap:anywhere}
.pta-btns{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.pta-btn{min-height:46px;padding:11px 14px;border-radius:12px;border:0;font:inherit;font-weight:600;cursor:pointer;background:var(--fill,rgba(118,118,128,.14));color:var(--text,#111)}
.pta-btn.primary{background:var(--accent,var(--blue,#2a78d6));color:#fff}
.pta-btn.danger{background:var(--danger,#d03b3b);color:#fff}
.pta-btn:disabled{opacity:.45;cursor:default}
`;
let styled = false;
function ensureStyle() {
  if (styled) return;
  styled = true;
  document.head.append(h('style', { 'data-pta': '' }, CSS));
}

// Markup for the settings screen. Buttons are handled by initAccount() through event delegation,
// so this can be put into a screen that is re-rendered with innerHTML.
export function accountHTML(raw) {
  ensureStyle();
  const demo = raw && raw.getFirebase && !raw.getFirebase();
  const can = !demo || (raw.demoKeys && raw.demoKeys.length);
  return `<div class="pta" data-pta-root>
    <div class="pta-h">Account &amp; data</div>
    <div class="pta-list">
      ${can ? `<button class="pta-row" data-pta="export">Export my data</button>
      <button class="pta-row pta-danger" data-pta="app">Delete this app’s data</button>` : ''}
      ${demo ? '' : '<button class="pta-row pta-danger" data-pta="account">Delete account</button>'}
      <a class="pta-row" href="${esc(REG.privacyUrl)}" target="_blank" rel="noopener" style="text-decoration:none">Privacy policy</a>
    </div>
    <div class="pta-foot">${demo ? 'Demo mode: nothing leaves this device.' : 'Download or delete everything Pocket Tools stores about you. Your data is visible only to you.'}</div>
  </div>`;
}

let C = null, bound = false;

// Call once after the user is known. Fills every <div data-pta-host> and starts listening for clicks.
export function initAccount(ctx) {
  C = ctx;
  ensureStyle();
  document.querySelectorAll('[data-pta-host]').forEach(el => { el.innerHTML = accountHTML(ctx); });
  if (bound) return;
  bound = true;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button[data-pta]');
    if (!b || !C || !C.getUser()) return;
    const kind = b.dataset.pta;
    if (kind === 'export') runExport();
    else if (kind === 'app') confirmDeleteApp();
    else if (kind === 'account') confirmDeleteAccount();
  });
}

function dialog() {
  const prev = document.activeElement;
  const box = h('div', { class: 'pta-box', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pta-title' });
  const ov = h('div', { class: 'pta-ov' }, box);
  let busy = false;
  const api = {
    show(s) {
      busy = !!s.busy;
      box.replaceChildren(...[
        h('h2', { id: 'pta-title' }, s.title),
        ...(s.text || []).map(t => h('p', t.dim ? { class: 'pta-dim' } : null, t.dim || t)),
        s.list && h('ul', null, s.list.map(x => h('li', null, x))),
        s.note && h('p', { class: 'pta-dim' }, s.note),
        s.steps && h('ul', { class: 'pta-steps', 'aria-live': 'polite' }, s.steps.map(x => h('li', { class: x.status },
          h('span', { class: 'm', 'aria-hidden': 'true' }, x.status === 'ok' ? '✓' : x.status === 'fail' ? '✕' : '…'),
          h('div', null, x.label, (x.detail || x.status === 'fail') && h('span', { class: 'd' }, x.status === 'fail' ? `Failed: ${x.detail}` : x.detail))))),
        s.input && h('label', null, s.input.label, s.input.el),
        h('div', { class: 'pta-btns' }, (s.buttons || []).map(b => {
          const btn = h('button', { type: 'button', class: `pta-btn ${b.kind || ''}`, disabled: b.disabled }, b.text);
          btn.addEventListener('click', () => b.onClick(btn));
          if (b.ref) b.ref(btn);
          return btn;
        }))
      ].filter(Boolean));
      const first = box.querySelector('input,button:not([disabled])');
      if (first && !s.keepFocus) first.focus({ preventScroll: true });
    },
    close() { ov.remove(); document.removeEventListener('keydown', onKey, true); if (prev && prev.focus) prev.focus(); },
    isBusy: () => busy
  };
  const onKey = e => {
    if (e.key === 'Escape' && !busy) api.close();
    if (e.key === 'Tab') {            // keep focus inside the dialog
      const f = [...box.querySelectorAll('input,button:not([disabled])')];
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); }
    }
  };
  document.addEventListener('keydown', onKey, true);
  document.body.append(ov);
  return api;
}

const reload = () => location.reload();
const demoMode = () => !C.getFirebase();
const offline = () => navigator.onLine === false;

function saveFile(text, name) {
  const file = new File([text], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return navigator.share({ files: [file], title: name }).catch(() => {});
  }
  const url = URL.createObjectURL(file);
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return Promise.resolve();
}

async function runExport() {
  const d = dialog();
  const fileName = `pocket-tools-data-${new Date().toISOString().slice(0, 10)}.json`;
  if (demoMode()) {
    const data = JSON.stringify(demoExport(C), null, 2);
    d.show({ title: 'Export my data', text: ['Demo data is stored on this device only. Your file is ready.'],
      buttons: [{ text: 'Save file', kind: 'primary', onClick: () => saveFile(data, fileName) }, { text: 'Close', onClick: () => d.close() }] });
    return;
  }
  if (offline()) { d.show({ title: 'You are offline', text: ['Connect to the internet and try again.'], buttons: [{ text: 'Close', onClick: () => d.close() }] }); return; }
  d.show({ title: 'Preparing your data…', busy: true, steps: [] });
  const rep = await exportData(C, r => d.show({ title: 'Preparing your data…', busy: true, steps: r.steps, keepFocus: true }));
  const text = JSON.stringify(rep.data, null, 2);
  const failed = rep.failed.length;
  d.show({
    title: failed ? 'Your data is ready, with problems' : 'Your data is ready',
    text: [`${count(rep.total, 'item', 'items')} from ${Object.keys(rep.data.apps).length} apps (${Math.max(1, Math.round(text.length / 1024))} KB).`,
      failed ? { dim: `${count(failed, 'part', 'parts')} could not be read and is missing from the file. The problems are listed inside the file too.` } : { dim: 'The file contains your data from every Pocket Tools app, not only this one.' }],
    steps: failed ? rep.steps.filter(s => s.status === 'fail') : null,
    buttons: [{ text: 'Save file', kind: 'primary', onClick: () => saveFile(text, fileName) }, { text: 'Close', onClick: () => d.close() }]
  });
}

function confirmDeleteApp() {
  const d = dialog(), a = appEntry(C.app);
  const what = demoMode() ? a.collections.filter(c => !c.id.endsWith('_consent')).map(c => c.what)
    : [...a.collections.map(c => c.what), ...(a.profile ? [a.profile.what] : []), ...(a.publicShelf ? [a.publicShelf.what] : []), ...(a.server || []).map(s => s.what)];
  d.show({
    title: `Delete all ${a.name} data?`,
    text: [demoMode() ? 'This permanently deletes the demo data stored on this device:' : 'This permanently deletes:'],
    list: what.map(w => w.charAt(0).toUpperCase() + w.slice(1)),
    note: demoMode() ? 'Nothing else is affected.' : 'Your account and the data of the other Pocket Tools apps stay. You cannot undo this — export your data first if you may need it.',
    buttons: [
      { text: `Delete ${a.name} data`, kind: 'danger', onClick: () => runDeleteApp(d) },
      { text: 'Cancel', onClick: () => d.close() }
    ]
  });
}

async function runDeleteApp(d) {
  const a = appEntry(C.app);
  if (demoMode()) { demoClear(C); d.show({ title: 'Done', text: ['The demo data was deleted.'], buttons: [{ text: 'Done', kind: 'primary', onClick: reload }] }); return; }
  if (offline()) { d.show({ title: 'You are offline', text: ['Connect to the internet and try again.'], buttons: [{ text: 'Close', onClick: () => d.close() }] }); return; }
  const title = `Deleting ${a.name} data…`;
  d.show({ title, busy: true, steps: [] });
  const rep = await deleteAppData(C, r => d.show({ title, busy: true, steps: r.steps, keepFocus: true }));
  if (rep.failed.length) {
    d.show({
      title: 'Not everything was deleted',
      text: [`Some ${a.name} data is still stored. You are still signed in; nothing else was touched.`],
      steps: rep.steps,
      buttons: [{ text: 'Try again', kind: 'primary', onClick: () => runDeleteApp(d) }, { text: 'Close', onClick: reload }]
    });
  } else {
    d.show({ title: 'Done', text: [`All ${a.name} data was deleted. You are still signed in.`], steps: rep.steps, buttons: [{ text: 'Done', kind: 'primary', onClick: reload }] });
  }
}

function confirmDeleteAccount() {
  const d = dialog();
  const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Type DELETE to confirm' });
  let go;
  d.show({
    title: 'Delete your account?',
    text: ['This permanently deletes your Pocket Tools account and all of its data in every app:'],
    list: [...appIds().map(id => appEntry(id)).filter(a => !(REG.legacy || {})[a.id]).map(a => a.name), 'Reminder and notification settings', 'Your Google sign-in link to Pocket Tools'],
    note: 'This cannot be undone. Your Google account itself is not touched. Google may ask you to sign in again to confirm it is you. Export your data first if you want a copy.',
    input: { label: 'Type DELETE to confirm', el: input },
    buttons: [
      { text: 'Delete account', kind: 'danger', disabled: true, ref: b => { go = b; }, onClick: () => runDeleteAccount(d, false) },
      { text: 'Cancel', onClick: () => d.close() }
    ]
  });
  input.addEventListener('input', () => { go.disabled = input.value.trim().toUpperCase() !== 'DELETE'; });
}

// Also used by the "Sign in with Google" retry: every deletion step is idempotent, so running it again is safe.
async function runDeleteAccount(d, ignoreServer) {
  if (offline()) { d.show({ title: 'You are offline', text: ['Connect to the internet and try again. Nothing was deleted.'], buttons: [{ text: 'Close', onClick: () => d.close() }] }); return; }
  // The sign-in pop-up only opens from a tap, so ask for it first, before the long deletion starts.
  if (signInIsStale(C)) {
    try { await reauthenticate(C); }
    catch (e) {
      d.show({
        title: 'Could not confirm it is you',
        text: [`Google sign-in failed: ${describeError(e)}. Nothing was deleted.`, { dim: 'If the sign-in window does not open, sign out, sign in again and then delete the account right away.' }],
        buttons: [{ text: 'Try again', kind: 'primary', onClick: () => runDeleteAccount(d, ignoreServer) }, { text: 'Close', onClick: () => d.close() }]
      });
      return;
    }
  }
  const title = 'Deleting your account…';
  d.show({ title, busy: true, steps: [] });
  const rep = await deleteAccount(C, r => d.show({ title, busy: true, steps: r.steps, keepFocus: true }), { ignoreServerFailures: ignoreServer });
  if (rep.accountDeleted) {
    d.show({
      title: 'Your account was deleted',
      text: [rep.failed.length ? `Your account and data were deleted. ${count(rep.failed.length, 'minor step', 'minor steps')} failed (listed below).` : 'Your account and all of its data were deleted from every Pocket Tools app. You were signed out.',
        { dim: 'Other Pocket Tools apps on this device will ask you to sign in again the next time you open them.' }],
      steps: rep.steps,
      buttons: [{ text: 'Done', kind: 'primary', onClick: reload }]
    });
  } else if (rep.needsReauth) {
    d.show({
      title: 'Please confirm it is you',
      text: ['Your data was deleted, but Google needs a fresh sign-in before it removes the account itself.'],
      steps: rep.steps,
      buttons: [{ text: 'Sign in with Google', kind: 'primary', onClick: () => runDeleteAccount(d, ignoreServer) }, { text: 'Close', onClick: () => d.close() }]
    });
  } else {
    const hard = rep.failed.filter(f => f.kind !== 'local');
    const onlyServers = hard.length > 0 && hard.every(f => f.kind === 'server');
    d.show({
      title: 'Your account was NOT deleted',
      text: [hard.some(f => f.kind === 'auth')
        ? 'Your data was deleted, but the sign-in account itself could not be removed (see below). Try again; if it keeps failing, sign out, sign in again and retry right away.'
        : onlyServers
        ? 'Some notification settings could not be removed from the server. Your other data was deleted. You can try again, or delete the account anyway: the notification subscriptions on this device are turned off and the server drops the rest the next time a notification fails.'
        : 'Some data could not be deleted, so the account was kept. Nothing is hidden: the failed steps are listed below. Try again when you are online.'],
      steps: rep.steps,
      buttons: [
        { text: 'Try again', kind: 'primary', onClick: () => runDeleteAccount(d, ignoreServer) },
        ...(onlyServers ? [{ text: 'Delete the account anyway', kind: 'danger', onClick: () => runDeleteAccount(d, true) }] : []),
        { text: 'Close', onClick: () => d.close() }
      ]
    });
  }
}
