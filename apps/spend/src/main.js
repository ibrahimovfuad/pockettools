import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';

// ================= Utilities =================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtD = (d, o) => new Intl.DateTimeFormat('en-US', o).format(d);
const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const round2 = n => Math.round(n * 100) / 100;
// 1234.5 → "1 234,50"; whole numbers without decimals
function money(n, always) {
  const neg = n < 0; n = Math.abs(round2(n));
  const whole = Math.floor(n), cents = Math.round((n - whole) * 100);
  const w = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + (cents || always ? `${w},${pad(cents)}` : w);
}
// Accepts what iOS Shortcuts may insert: "23,49", "23.49", "23,49 zł", "PLN 23.49", "1 234,56", "1,234.56".
const parseAmount = str => {
  let t = String(str || '').replace(/[^\d.,]/g, '');                     // drop currency, spaces, letters
  const lastSep = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (lastSep >= 0) {
    const decimals = t.length - lastSep - 1;
    t = decimals > 0 && decimals <= 2
      ? t.slice(0, lastSep).replace(/[.,]/g, '') + '.' + t.slice(lastSep + 1)   // last separator is the decimal one
      : t.replace(/[.,]/g, '');                                                // "1,234" / "1.000" = thousands
  }
  const n = parseFloat(t);
  return isFinite(n) && n > 0 ? round2(n) : 0;
};

const CHEV = '<svg class="chev" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5l6 6-6 6"/></svg>';
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
const ICONS = {
  cart: '<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="16.5" cy="19" r="1.4"/>',
  cup: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5v2.5M12 3.5v2.5"/>',
  fork: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3"/><path d="M17.5 21V3c-2 1.4-3.5 4-3.5 7v3h3.5"/>',
  bus: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8 17.5V20M16 17.5V20"/>',
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7.5v9" stroke-dasharray="2 2.2"/>',
  dots: '<circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/>',
  car: '<path d="M4 15l1.8-5.4A2 2 0 0 1 7.7 8h8.6a2 2 0 0 1 1.9 1.6L20 15"/><rect x="3" y="15" width="18" height="4" rx="1.5"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-1.5-3-5-3.5-5-1.2C7 9 12 9 12 9zM12 9c1.5-3 5-3.5 5-1.2C17 9 12 9 12 9z"/>',
  shirt: '<path d="M8 4l-4 3 2 4 2-1v10h8V10l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z"/>',
  plane: '<path d="M21 3L3 10.5l7 3 3 7z"/><path d="M10 13.5L21 3"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  paw: '<circle cx="7" cy="9" r="1.8"/><circle cx="12" cy="6.5" r="1.8"/><circle cx="17" cy="9" r="1.8"/><path d="M8 16c0-2.5 2-4.5 4-4.5s4 2 4 4.5c0 1.6-1.3 2.5-2.5 2.5-.8 0-1-.4-1.5-.4s-.7.4-1.5.4C9.3 18.5 8 17.6 8 16z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>'
};
const PICK_ICONS = Object.keys(ICONS).filter(k => k !== 'card');
const COLORS = ['#34C759', '#A2845E', '#FF3B30', '#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#8E8E93', '#00C7BE', '#AF52DE', '#30B0C7', '#D4A100'];
const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ICONS.dots}</svg>`;
const sq = c => `<span class="sq" style="background:${esc(c ? c.color : '#8E8E93')}" aria-hidden="true">${svg(c ? c.icon : 'dots')}</span>`;
const DEFAULT_CATS = [
  ['Groceries', 'cart', '#34C759'], ['Coffee', 'cup', '#A2845E'], ['Eating out', 'fork', '#FF3B30'], ['Transport', 'bus', '#007AFF'],
  ['Home', 'home', '#5856D6'], ['Health', 'heart', '#FF2D55'], ['Fun', 'ticket', '#FF9500'], ['Other', 'dots', '#8E8E93']
];
const NO_CAT = { id: '', name: 'Uncategorized', icon: 'dots', color: '#8E8E93' };

// tap and long-press on the same element
function press(el, onTap, onLong) {
  let t = null, long = false, sx = 0, sy = 0;
  const cancel = () => { if (t) { clearTimeout(t); t = null; } };
  el.addEventListener('pointerdown', e => { long = false; sx = e.clientX; sy = e.clientY; cancel(); if (onLong) t = setTimeout(() => { long = true; t = null; if (navigator.vibrate) navigator.vibrate(10); onLong(); }, 450); });
  el.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - sx, e.clientY - sy) > 10) cancel(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, cancel));
  el.addEventListener('click', e => { e.stopPropagation(); if (long) { long = false; return; } onTap(); });
  el.addEventListener('contextmenu', e => e.preventDefault());
}

// ================= Storage: Firebase or demo =================
const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
const DEMO = !CFG.apiKey || /^PASTE/.test(CFG.apiKey) || location.hash === '#demo';
const C_CATS = 'spend_categories', C_EXP = 'spend_expenses', C_META = 'spend_meta';

function firebaseBackend() {
  const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname);
  const app = initializeApp({ ...CFG, authDomain: local ? `${CFG.projectId}.firebaseapp.com` : location.host });
  const auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence], popupRedirectResolver: browserPopupRedirectResolver });
  let db;
  try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) }); }
  catch (e) { db = getFirestore(app); }
  let subs = [];
  const fail = what => e => showError(what + ': ' + (e.code || e.message));
  const list = (uid, name, cb) => onSnapshot(collection(db, 'users', uid, name), s => { const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id })); cb(a, s.metadata.fromCache); }, fail('Loading error'));
  return {
    onUser(cb) {
      getRedirectResult(auth).catch(e => { $('loginErr').textContent = authError(e); });
      onAuthStateChanged(auth, u => cb(u && { uid: u.uid, name: u.displayName || 'No name', email: u.email || '' }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(auth, p); },
    signOut() { subs.forEach(f => f()); subs = []; return signOut(auth); },
    listen(uid, on) {
      subs.forEach(f => f());
      subs = [
        list(uid, C_CATS, on.cats), list(uid, C_EXP, on.exps),
        onSnapshot(doc(db, 'users', uid, C_META, 'settings'), s => on.meta(s.exists() ? s.data() : {}), fail('Loading error'))
      ];
    },
    // no await: on a bad connection the write goes to the local cache first and syncs later
    put(uid, coll, id, data) { setDoc(doc(db, 'users', uid, coll, id), data).catch(fail('Not saved')); },
    del(uid, coll, id) { deleteDoc(doc(db, 'users', uid, coll, id)).catch(fail('Not deleted')); },
    meta(uid, data) { setDoc(doc(db, 'users', uid, C_META, 'settings'), data, { merge: true }).catch(fail('Not saved')); }
  };
}
function authError(e) {
  const c = e && e.code || '';
  if (c.includes('unauthorized-domain')) return 'This domain is not added in Firebase → Authentication → Settings → Authorized domains';
  if (c.includes('network')) return 'No internet connection';
  if (c.includes('cancelled') || c.includes('closed')) return '';
  return 'Could not sign in: ' + (c || e.message || e);
}
function demoBackend() {
  const read = k => { try { return JSON.parse(localStorage.getItem('spend-demo-' + k) || '{}'); } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem('spend-demo-' + k, JSON.stringify(v)); } catch (e) {} };
  let on = null;
  const emit = () => { if (!on) return; on.cats(Object.values(read(C_CATS)), false); on.exps(Object.values(read(C_EXP)), false); on.meta(read(C_META)); };
  return {
    onUser(f) { f({ uid: 'demo', name: 'Demo', email: 'Data stays on this device only' }); },
    signIn() { return Promise.resolve(); }, signOut() { showError('There is nothing to sign out of in demo mode'); return Promise.resolve(); },
    listen(uid, cbs) { on = cbs; emit(); },
    put(uid, coll, id, data) { const a = read(coll); a[id] = { ...data, id }; write(coll, a); emit(); },
    del(uid, coll, id) { const a = read(coll); delete a[id]; write(coll, a); emit(); },
    meta(uid, data) { write(C_META, { ...read(C_META), ...data }); emit(); }
  };
}
const store = DEMO ? demoBackend() : firebaseBackend();

// ================= State =================
let user = null, cats = [], exps = [], meta = {}, seeded = false, loaded = { cats: false, exps: false, meta: false };
let amt = '', view = 'amount', pending = null;   // pending = { merchant, source } from the Apple Pay link
const C = id => cats.find(c => c.id === id) || NO_CAT;
const sortCats = a => a.slice().sort((x, y) => (x.order ?? 0) - (y.order ?? 0));

function seedCategories() {
  if (seeded || cats.length) return;
  seeded = true;
  DEFAULT_CATS.forEach(([name, icon, color], i) => { const id = uid8() + i; store.put(user.uid, C_CATS, id, { name, icon, color, order: i * 10 }); });
}

// ================= Toast =================
let toastTimer = null, lastSaved = null;
function toast(text, undoId) {
  const t = $('toast');
  $('toastText').textContent = text;
  $('toastUndo').classList.toggle('hide', !undoId);
  lastSaved = undoId || null;
  t.classList.remove('hide', 'show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hide'), 3500);
}
function showError(text) { toast(text); $('toast').querySelector('.ok').style.background = '#ff453a'; setTimeout(() => { $('toast').querySelector('.ok').style.background = ''; }, 3600); }
$('toastUndo').onclick = () => {
  if (!lastSaved) return;
  store.del(user.uid, C_EXP, lastSaved); lastSaved = null;
  $('toast').classList.add('hide'); render();
};

// ================= Navigation =================
const SCREENS = { amount: 'scrAmount', category: 'scrCat', month: 'scrMonth', settings: 'scrSettings' };
function go(to, back) {
  const prev = view; view = to;
  Object.entries(SCREENS).forEach(([k, id]) => { const el = $(id); el.classList.toggle('hide', k !== to); el.classList.remove('push-in', 'pop-in'); });
  const el = $(SCREENS[to]); void el.offsetWidth;
  el.classList.add(back ? 'pop-in' : 'push-in');
  if (to === 'amount' && prev === 'amount') el.classList.remove('pop-in', 'push-in');
  el.scrollTop = 0;
  render();
}

// ================= Saving =================
function saveExpense(catId, amount, extra = {}) {
  const id = uid8();
  const data = { amount: round2(amount), catId, date: extra.date || iso(today()), ts: Date.now(), source: extra.source || 'manual' };
  if (extra.note) data.note = extra.note.slice(0, 500);
  if (extra.merchant) data.merchant = extra.merchant.slice(0, 100);
  store.put(user.uid, C_EXP, id, data);
  if (!exps.some(e => e.id === id)) exps = exps.concat([{ ...data, id }]);   // show immediately, without waiting for the network
  amt = ''; pending = null;
  toast(`${C(catId).name} · ${money(amount)} zł`, id);
  if (view !== 'amount') go('amount', true); else render();
}
function setRule(merchant, catId, on) {
  const rules = { ...(meta.rules || {}) }, key = merchant.trim().toLowerCase();
  if (on) rules[key] = catId; else delete rules[key];
  meta = { ...meta, rules }; store.meta(user.uid, { rules });
}

// ================= Step 1: amount =================
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
$('keys').innerHTML = KEYS.map(k => `<button data-k="${k}" aria-label="${k === 'del' ? 'Delete' : k === '.' ? 'Decimal comma' : k}">${k === 'del' ? '⌫' : k === '.' ? ',' : k}</button>`).join('');
$('keys').querySelectorAll('button').forEach(b => b.addEventListener('click', () => key(b.dataset.k)));
function key(d) {
  let a = amt;
  if (d === 'del') a = a.slice(0, -1);
  else if (d === '.') { if (!a.includes('.')) a = (a || '0') + '.'; }
  else {
    if (a.includes('.') && a.split('.')[1].length >= 2) return;
    if (a.replace('.', '').length >= 7) return;
    a = a === '0' ? d : a + d;
  }
  amt = a; renderAmount();
}
function renderAmount() {
  const n = parseFloat(amt) || 0;
  $('amt').textContent = (amt || '0').replace('.', ',');
  $('amt').classList.toggle('on', !!amt);
  $('nextBtn').classList.toggle('on', n > 0);
  const t = iso(today());
  $('todayTotal').textContent = money(exps.filter(e => e.date === t).reduce((s, e) => s + e.amount, 0)) + ' zł';
  // the 3 most frequent (category, amount) pairs of the last 90 days
  const since = iso(addDays(today(), -90)), counts = new Map();
  exps.forEach(e => { if (e.date < since || !cats.some(c => c.id === e.catId)) return; const k = e.catId + '|' + e.amount; counts.set(k, (counts.get(k) || 0) + 1); });
  const top = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3);
  $('chips').innerHTML = top.map(([k]) => { const [cid, a] = k.split('|'); return `<button class="chip press" data-c="${esc(cid)}" data-a="${a}">${esc(C(cid).name)} · ${money(+a)}</button>`; }).join('');
  $('chips').querySelectorAll('.chip').forEach(b => b.onclick = () => saveExpense(b.dataset.c, +b.dataset.a, { source: 'chip' }));
}
$('nextBtn').onclick = () => {
  if (!(parseFloat(amt) > 0)) { const b = $('amtBox'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); if (navigator.vibrate) navigator.vibrate(30); return; }
  go('category');
};
$('openMonth').onclick = () => { monthOff = 0; go('month'); };
$('openSettings').onclick = () => go('settings');

// ================= Step 2: category =================
$('catBack').onclick = () => { pending = null; go('amount', true); };
$('editCats').onclick = () => go('settings');
let ruleOn = true;
function renderCategory() {
  const n = parseFloat(amt) || 0;
  $('catAmt').textContent = money(n, true) + ' zł';
  $('merchantBox').innerHTML = pending && pending.merchant ? `<div class="merchant"><span class="sq" style="background:#000">${svg('card')}</span><div class="m"><small>Apple Pay</small><b>${esc(pending.merchant)}</b></div><span class="a">${money(n, true)} zł</span></div>` : '';
  const list = sortCats(cats);
  $('catGrid').innerHTML = list.map((c, i) => `<button class="tile press" data-id="${esc(c.id)}" style="animation-delay:${(i * 0.035).toFixed(3)}s">${sq(c)}<span>${esc(c.name)}</span></button>`).join('')
    || '<div class="empty" style="grid-column:1/-1">No categories yet — add some in Settings.</div>';
  $('catGrid').querySelectorAll('.tile').forEach(b => press(b,
    () => { const m = pending && pending.merchant; if (m) setRule(m, b.dataset.id, ruleOn); saveExpense(b.dataset.id, n, { merchant: m, source: pending ? pending.source : 'manual' }); },
    () => openNote(b.dataset.id, n)));
  $('ruleBox').innerHTML = pending && pending.merchant ? `<label class="row rulebox group" style="border-radius:12px"><span class="grow">Always file <b>${esc(pending.merchant)}</b> under the category I tap</span><input type="checkbox" class="switch" id="ruleSw" ${ruleOn ? 'checked' : ''}></label><div class="foot">Next time this shop is saved automatically — no screen at all.</div>` : '';
  const sw = $('ruleSw'); if (sw) sw.onchange = () => { ruleOn = sw.checked; };
}

// ================= Sheet =================
function openSheet(html, bind) {
  const s = $('sheet'); s.innerHTML = '<div class="grab"></div>' + html; bind(s);
  $('toast').classList.add('hide');   // a toast from the last save would cover the sheet
  $('sheetBg').classList.add('open'); s.classList.add('open'); s.scrollTop = 0;
}
function closeSheet() { $('sheet').classList.remove('open'); $('sheetBg').classList.remove('open'); }
$('sheetBg').onclick = closeSheet;

function dateSeg(cur) {
  const t = iso(today()), y = iso(addDays(today(), -1)), other = cur !== t && cur !== y;
  return `<div class="seg" id="dSeg"><button data-d="${t}" class="${cur === t ? 'on' : ''}">Today</button><button data-d="${y}" class="${cur === y ? 'on' : ''}">Yesterday</button><button data-d="pick" class="${other ? 'on' : ''}">${other ? fmtD(fromIso(cur), { month: 'short', day: 'numeric' }) : 'Other date'}</button></div><input type="date" id="dPick" class="hide" max="${t}" value="${cur}">`;
}
function bindDateSeg(s, get, set) {
  s.querySelectorAll('#dSeg button').forEach(b => b.onclick = () => {
    if (b.dataset.d === 'pick') { const p = s.querySelector('#dPick'); p.classList.remove('hide'); try { p.showPicker(); } catch (e) { p.focus(); } return; }
    set(b.dataset.d);
  });
  s.querySelector('#dPick').onchange = e => { if (e.target.value) set(e.target.value); };
}

// long-press on a category: note and date before saving
function openNote(catId, n) {
  if (!(n > 0)) return;
  const c = C(catId); let date = iso(today());
  const draw = () => openSheet(`<div class="shead"><button id="nCancel">Cancel</button><b>${esc(c.name)}</b><button id="nSave" style="font-weight:600">Save</button></div>
    <div class="big-ico">${sq(c)}<b>${money(n, true)} zł</b></div>
    <div class="group"><label class="row"><span style="width:70px">Note</span><input class="inl" id="nNote" maxlength="500" placeholder="Optional" style="text-align:left"></label></div>
    <div class="sect">Date</div>${dateSeg(date)}`, s => {
      s.querySelector('#nCancel').onclick = closeSheet;
      s.querySelector('#nSave').onclick = () => { const note = s.querySelector('#nNote').value.trim(), m = pending && pending.merchant; if (m) setRule(m, catId, ruleOn); closeSheet(); saveExpense(catId, n, { note, date, merchant: m, source: pending ? pending.source : 'manual' }); };
      bindDateSeg(s, () => date, d => { const note = s.querySelector('#nNote').value; date = d; draw(); $('nNote').value = note; });
    });
  draw();
}

// ================= Month =================
let monthOff = 0;
function renderMonth() {
  const t = today(), m0 = new Date(t.getFullYear(), t.getMonth() + monthOff, 1), key = iso(m0).slice(0, 7);
  const list = exps.filter(e => e.date.slice(0, 7) === key).sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
  const total = list.reduce((s, e) => s + e.amount, 0);
  const by = new Map(); list.forEach(e => by.set(e.catId, (by.get(e.catId) || 0) + e.amount));
  const rows = [...by.entries()].sort((a, b) => b[1] - a[1]);
  const budget = +meta.budget || 0;
  const daysIn = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
  const left = monthOff === 0 ? daysIn - t.getDate() + 1 : 0;
  const title = fmtD(m0, { month: 'long', year: m0.getFullYear() === t.getFullYear() ? undefined : 'numeric' });
  const days = []; list.forEach(e => { const d = days[days.length - 1]; if (d && d.date === e.date) d.items.push(e); else days.push({ date: e.date, items: [e] }); });
  $('scrMonth').innerHTML = `<div class="nav"><button class="back press" id="mBack">${BACK}New Expense</button>
      <span style="display:flex;gap:4px"><button class="act press" id="mPrev" aria-label="Previous month">‹</button><button class="act press" id="mNext" aria-label="Next month" ${monthOff >= 0 ? 'disabled style="opacity:.3"' : ''}>›</button></span></div>
    <h1 class="large">${esc(title)}</h1>
    <div class="total" style="margin-top:10px"><small>Spent</small><b>${money(total, true)} zł</b>
      ${budget ? `<div class="bar">${rows.map(([cid, a]) => `<span style="width:${Math.min(100, a / Math.max(budget, total) * 100).toFixed(1)}%;background:${esc(C(cid).color)}"></span>`).join('')}</div>
      <small style="font-size:13px">${Math.round(total / budget * 100)}% of your ${money(budget)} zł budget${left ? ` · ${left} ${left === 1 ? 'day' : 'days'} left` : ''}</small>` : ''}</div>
    ${rows.length ? `<div class="sect">By category</div><div class="group">${rows.map(([cid, a]) => `<div class="row ic">${sq(C(cid))}<span class="grow">${esc(C(cid).name)}</span><span class="val">${money(a, true)} zł</span></div>`).join('')}</div>` : '<div class="empty">No expenses this month yet.</div>'}
    ${days.map(d => `<div class="day"><span>${esc(fmtD(fromIso(d.date), { weekday: 'long', month: 'short', day: 'numeric' }))}</span><span>${money(d.items.reduce((s, e) => s + e.amount, 0), true)} zł</span></div>
      <div class="group">${d.items.map(e => `<button class="row ic press" data-e="${esc(e.id)}">${sq(C(e.catId))}<span class="grow">${esc(C(e.catId).name)}<span class="small">${esc(e.note || e.merchant || '')}</span></span><span class="val">${money(e.amount, true)}</span>${CHEV}</button>`).join('')}</div>`).join('')}
    <div style="height:24px"></div>`;
  $('mBack').onclick = () => go('amount', true);
  $('mPrev').onclick = () => { monthOff--; renderMonth(); };
  $('mNext').onclick = () => { if (monthOff < 0) { monthOff++; renderMonth(); } };
  $('scrMonth').querySelectorAll('[data-e]').forEach(b => b.onclick = () => openEdit(b.dataset.e));
}

// tap an expense: change amount, category, note, date — or delete it
function openEdit(id) {
  const e0 = exps.find(x => x.id === id); if (!e0) return;
  const f = { ...e0 }; let armed = false;
  const draw = () => openSheet(`<div class="shead"><button id="eCancel">Cancel</button><b>Expense</b><button id="eSave" style="font-weight:600">Save</button></div>
    <div class="group"><label class="row"><span class="grow">Amount, zł</span><input class="inl" id="eAmt" inputmode="decimal" value="${money(f.amount, true).replace(/\s/g, '')}"></label>
    <label class="row"><span style="width:70px">Note</span><input class="inl" id="eNote" maxlength="500" placeholder="Optional" value="${esc(f.note || '')}" style="text-align:left"></label>
    ${f.merchant ? `<div class="row"><span class="grow">Shop</span><span class="val">${esc(f.merchant)}</span></div>` : ''}</div>
    <div class="sect">Category</div>
    <div class="grid">${sortCats(cats).map(c => `<button class="tile press" data-c="${esc(c.id)}" style="height:86px;animation:none;${c.id === f.catId ? 'box-shadow:0 0 0 2.5px var(--green)' : ''}">${sq(c)}<span>${esc(c.name)}</span></button>`).join('')}</div>
    <div class="sect">Date</div>${dateSeg(f.date)}
    <div class="group" style="margin-top:24px"><button class="row danger press" id="eDel">${armed ? 'Tap again to delete' : 'Delete Expense'}</button></div>`, s => {
      const keep = () => { f.note = s.querySelector('#eNote').value; const n = parseAmount(s.querySelector('#eAmt').value); if (n) f.amount = n; };
      s.querySelector('#eCancel').onclick = closeSheet;
      s.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { keep(); f.catId = b.dataset.c; draw(); });
      bindDateSeg(s, () => f.date, d => { keep(); f.date = d; draw(); });
      s.querySelector('#eDel').onclick = () => {
        if (!armed) { armed = true; keep(); draw(); setTimeout(() => { armed = false; }, 3000); return; }
        store.del(user.uid, C_EXP, id); exps = exps.filter(x => x.id !== id); closeSheet(); render();
      };
      s.querySelector('#eSave').onclick = () => {
        const n = parseAmount(s.querySelector('#eAmt').value); if (!n) { s.querySelector('#eAmt').focus(); return; }
        const note = s.querySelector('#eNote').value.trim();
        const data = { amount: n, catId: f.catId, date: f.date, ts: e0.ts || Date.now(), source: e0.source || 'manual' };
        if (note) data.note = note.slice(0, 500);
        if (e0.merchant) data.merchant = e0.merchant;
        store.put(user.uid, C_EXP, id, data); closeSheet();
      };
    });
  draw();
}

// ================= Settings =================
function renderSettings() {
  const list = sortCats(cats), rules = Object.entries(meta.rules || {});
  const link = `${location.origin}${location.pathname}?amount=AMOUNT&merchant=MERCHANT`;
  $('scrSettings').innerHTML = `<div class="nav"><button class="back press" id="sBack">${BACK}Back</button></div>
    <h1 class="large">Settings</h1>
    <div class="sect">Categories</div>
    <div class="group" id="catList">${list.map(c => `<div class="row ic" data-id="${esc(c.id)}"><span class="handle" aria-label="Drag to reorder"><svg viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2h16M2 7h16M2 12h16"/></svg></span>${sq(c)}<button class="grow" data-edit="${esc(c.id)}" style="text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:38px">${esc(c.name)}${CHEV}</button></div>`).join('')}</div>
    <div class="group" style="margin-top:12px"><button class="row link press" id="addCat">Add Category</button></div>
    <div class="foot">Drag ≡ to change the order on the “What was it?” screen.</div>

    <div class="sect">Monthly budget</div>
    <div class="group"><label class="row"><span class="grow">Budget, zł</span><input class="inl" id="budget" inputmode="decimal" placeholder="Off" value="${meta.budget ? money(meta.budget).replace(/\s/g, '') : ''}"></label></div>
    <div class="foot">Shown as a bar on the month screen. Leave empty to hide it.</div>

    ${rules.length ? `<div class="sect">Shops filed automatically</div><div class="group">${rules.map(([m, cid]) => `<div class="row ic">${sq(C(cid))}<span class="grow">${esc(m)}<span class="small">${esc(C(cid).name)}</span></span><button class="act" data-rule="${esc(m)}" style="color:var(--danger);font-size:15px">Remove</button></div>`).join('')}</div>` : ''}

    <div class="sect">Apple Pay automation</div>
    <div class="group howto">Log Apple Pay payments with one tap:
      <ol><li>Open <b>Shortcuts</b> → <b>Automation</b> → <b>New Automation</b> → <b>Wallet</b> (called “Transaction” on iOS 17–18), pick your cards, choose <b>Run Immediately</b>.</li>
      <li>Add the action <b>Open URLs</b> with this address, replacing AMOUNT and MERCHANT with the Shortcut Input’s <i>Amount</i> and <i>Merchant</i>:<br><code>${esc(link)}</code></li></ol>
      <button class="act press" id="copyLink" style="padding:8px 0 0;height:auto">Copy address</button></div>

    <div class="sect">Data</div>
    <div class="group"><button class="row link press" id="exportCsv">Export to CSV</button></div>

    <div class="sect">Account</div>
    <div class="group"><div class="row"><span class="grow">${esc(user.name)}<span class="small">${esc(user.email)}</span></span></div>
      <button class="row danger press" id="signOut">Sign Out</button></div>
    <a class="nf src" href="https://github.com/ibrahimovfuad/pockettools" target="_blank" rel="noopener">Open source on GitHub</a>
    <a class="nf tight" href="https://www.netlify.com" target="_blank" rel="noopener">This site is powered by Netlify</a>
    <div class="app-ver"></div>
    <div style="height:24px"></div>`;
  $('sBack').onclick = () => go('amount', true);
  $('addCat').onclick = () => openCatEditor(null);
  $('scrSettings').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openCatEditor(C(b.dataset.edit)));
  $('scrSettings').querySelectorAll('[data-rule]').forEach(b => b.onclick = () => setRule(b.dataset.rule, '', false) || renderSettings());
  $('budget').onchange = e => { const n = parseAmount(e.target.value); meta = { ...meta, budget: n || null }; store.meta(user.uid, { budget: n || null }); };
  $('copyLink').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(link).then(() => toast('Address copied'), () => toast(link)); };
  $('exportCsv').onclick = exportCsv;
  $('signOut').onclick = () => store.signOut();
  bindReorder($('catList'));
}

// drag ≡ to reorder categories
function bindReorder(listEl) {
  listEl.querySelectorAll('.handle').forEach(h => h.addEventListener('pointerdown', e => {
    e.preventDefault();
    const row = h.closest('.row'), rows = [...listEl.children], H = row.offsetHeight;
    const start = rows.indexOf(row), y0 = e.clientY; let idx = start;
    row.classList.add('dragging'); h.setPointerCapture(e.pointerId);
    const move = ev => {
      const dy = ev.clientY - y0;
      idx = Math.max(0, Math.min(rows.length - 1, start + Math.round(dy / H)));
      row.style.transform = `translateY(${dy}px) scale(1.02)`;
      rows.forEach((r, i) => { if (r === row) return; let s = 0; if (start < idx && i > start && i <= idx) s = -H; if (start > idx && i < start && i >= idx) s = H; r.style.transition = 'transform .2s'; r.style.transform = s ? `translateY(${s}px)` : ''; });
    };
    const up = () => {
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      rows.forEach(r => { r.style.transform = ''; r.style.transition = ''; }); row.classList.remove('dragging');
      if (idx === start) return;
      const ids = rows.map(r => r.dataset.id); ids.splice(idx, 0, ids.splice(start, 1)[0]);
      ids.forEach((id, i) => { const c = cats.find(x => x.id === id); if (c && c.order !== i * 10) { const { id: _, ...d } = { ...c, order: i * 10 }; store.put(user.uid, C_CATS, id, d); c.order = i * 10; } });
      renderSettings();
    };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  }));
}

function openCatEditor(c0) {
  const isNew = !c0;
  const f = isNew ? { name: '', icon: 'cart', color: COLORS[cats.length % COLORS.length] } : { ...c0 };
  let armed = false;
  const draw = () => openSheet(`<div class="shead"><button id="cCancel">Cancel</button><b>${isNew ? 'New Category' : 'Edit Category'}</b><button id="cSave" style="font-weight:600">${isNew ? 'Add' : 'Done'}</button></div>
    <div class="big-ico">${sq(f)}</div>
    <div class="group"><label class="row"><span style="width:70px">Name</span><input class="inl" id="cName" maxlength="40" placeholder="e.g. Pets" value="${esc(f.name)}" style="text-align:left"></label></div>
    <div class="sect">Color</div><div class="group swatches">${COLORS.map(col => `<button data-col="${col}" class="${col === f.color ? 'on' : ''}" style="background:${col}" aria-label="Color ${col}"></button>`).join('')}</div>
    <div class="sect">Icon</div><div class="group icons">${PICK_ICONS.map(k => `<button data-ic="${k}" class="${k === f.icon ? 'on' : ''}" aria-label="${k}">${svg(k)}</button>`).join('')}</div>
    ${isNew ? '' : `<div class="group" style="margin-top:24px"><button class="row danger press" id="cDel">${armed ? 'Tap again — expenses stay, shown as Uncategorized' : 'Delete Category'}</button></div>`}`, s => {
      const keep = () => { f.name = s.querySelector('#cName').value; };
      s.querySelector('#cCancel').onclick = closeSheet;
      s.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { keep(); f.color = b.dataset.col; draw(); });
      s.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => { keep(); f.icon = b.dataset.ic; draw(); });
      const del = s.querySelector('#cDel');
      if (del) del.onclick = () => { if (!armed) { armed = true; keep(); draw(); setTimeout(() => { armed = false; }, 3500); return; } store.del(user.uid, C_CATS, c0.id); closeSheet(); };
      s.querySelector('#cSave').onclick = () => {
        const name = s.querySelector('#cName').value.trim();
        if (!name) { s.querySelector('#cName').placeholder = 'Give it a name first'; s.querySelector('#cName').focus(); return; }
        const order = isNew ? Math.max(0, ...cats.map(c => c.order ?? 0)) + 10 : (c0.order ?? 0);
        store.put(user.uid, C_CATS, isNew ? uid8() : c0.id, { name: name.slice(0, 40), icon: f.icon, color: f.color, order });
        closeSheet();
      };
    });
  draw();
}

function exportCsv() {
  const cell = v => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = [['Date', 'Amount', 'Category', 'Note', 'Shop', 'Source']].concat(exps.slice().sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts)
    .map(e => [e.date, money(e.amount, true).replace(/\s/g, ''), C(e.catId).name, e.note || '', e.merchant || '', e.source || '']));
  const name = `spend-${iso(today())}.csv`, blob = new Blob(['﻿' + rows.map(r => r.map(cell).join(',')).join('\n')], { type: 'text/csv' });
  const file = typeof File === 'function' ? new File([blob], name, { type: 'text/csv' }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ================= Apple Pay link: ?amount=23.49&merchant=Żabka =================
let incoming = null;
(() => {
  const p = new URLSearchParams(location.search);
  const a = parseAmount(p.get('amount')), m = (p.get('merchant') || '').trim();
  if (a) incoming = { amount: a, merchant: m.slice(0, 100) };
  if (p.has('amount') || p.has('merchant') || p.has('new')) history.replaceState(null, '', location.pathname);
})();
function handleIncoming() {
  if (!incoming || !loaded.cats || !loaded.exps || !loaded.meta || !cats.length) return;
  const { amount, merchant } = incoming; incoming = null;
  const rule = merchant && (meta.rules || {})[merchant.toLowerCase()];
  if (rule && cats.some(c => c.id === rule)) { saveExpense(rule, amount, { merchant, source: 'applepay' }); return; }
  amt = String(amount); pending = { merchant, source: 'applepay' }; ruleOn = true;
  go('category');
}

// ================= Render =================
function render() {
  if (!user) return;
  renderAmount();
  if (view === 'category') renderCategory();
  if (view === 'month') renderMonth();
  if (view === 'settings' && !$('scrSettings').contains(document.activeElement)) renderSettings();
}

// ================= Start-up and sign-in =================
function start() {
  store.onUser(u => {
    user = u;
    $('login').classList.toggle('hide', !!u);
    $('app').classList.toggle('hide', !u);
    if (!u) { cats = []; exps = []; meta = {}; return; }
    loaded = { cats: false, exps: false, meta: false };
    go('amount');
    store.listen(u.uid, {
      cats: (a, fromCache) => { cats = a; if (!fromCache) { loaded.cats = true; if (!a.length) seedCategories(); } else if (a.length) loaded.cats = true; render(); handleIncoming(); },
      exps: (a, fromCache) => { exps = a; if (!fromCache || a.length) loaded.exps = true; render(); handleIncoming(); },
      meta: m => { meta = m || {}; loaded.meta = true; render(); handleIncoming(); }
    });
  });
  $('signInBtn').onclick = () => { $('loginErr').textContent = ''; store.signIn().catch(e => { $('loginErr').textContent = authError(e); }); };
}

// if the app stays open past midnight, "Today" moves forward on its own
let lastDay = iso(today());
setInterval(() => { const t = iso(today()); if (t !== lastDay) { lastDay = t; render(); } }, 60000);

// Service worker with automatic updates: check for a new version on launch and whenever the app
// returns to the foreground (iOS resumes installed apps without reloading them). When a new
// version takes over, reload once — unless the user is typing; then wait until later.
if ('serviceWorker' in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  let updatePending = false, reloading = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || !!amt; };
  const applyUpdate = () => { if (reloading) return; if (busy()) { updatePending = true; return; } reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) applyUpdate(); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (updatePending) applyUpdate(); else reg.update().catch(() => {});
    });
  }).catch(() => {});
  // show the running version (the service worker's cache name, e.g. "spend-v1" → "v1") at the bottom of the app
  navigator.serviceWorker.ready.then(reg => {
    if (!reg.active) return;
    const ch = new MessageChannel();
    ch.port1.onmessage = e => { const v = String(e.data || '').replace(/^.*-(v\d+)$/, '$1'); if (v) document.documentElement.style.setProperty('--app-ver', JSON.stringify(v)); };
    reg.active.postMessage('version', [ch.port2]);
  }).catch(() => {});
}

start();
