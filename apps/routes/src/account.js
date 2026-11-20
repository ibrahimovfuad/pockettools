// Optional Google sign-in (Firebase) and sync. The app works fully without it: everything is on the device.
// When signed in, only what the user explicitly saves is mirrored to their own Firestore documents:
//   users/{uid}/routes_places/{id}        saved places (Home, Work, favourite stops)
//   users/{uid}/routes_meta/settings      settings and the chosen city
//   users/{uid}/routes_meta/history       the last 10 places searched for
// Never trip statistics, never location history. See firebase/firestore.rules.
import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, reauthenticateWithPopup
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, getDocs, getDoc, onSnapshot, writeBatch
} from 'firebase/firestore';
import * as store from './store.js';

const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
export const accountAvailable = !!CFG.apiKey && !/^PASTE/.test(CFG.apiKey);
const C_PLACES = 'routes_places', C_META = 'routes_meta';

let auth = null, db = null, user = null, started = false;
let unsubs = [], pushed = new Map(), pushTimer = null, applying = false, listener = () => {};
const status = { signedIn: false, name: '', email: '', sync: 'off', error: '' };   // sync: off | syncing | ok | offline
const emit = () => listener({ ...status });
const setSync = (s, error = '') => { status.sync = s; status.error = error; emit(); };

export function initAccount(onState) {
  listener = onState;
  if (!accountAvailable || started) { emit(); return; }
  started = true;
  try {
    const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname);
    const app = initializeApp({ ...CFG, authDomain: local ? `${CFG.projectId}.firebaseapp.com` : location.host });
    auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence], popupRedirectResolver: browserPopupRedirectResolver });
    try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) }); }
    catch (e) { db = getFirestore(app); }
    getRedirectResult(auth).catch(e => { status.error = authError(e); emit(); });
    onAuthStateChanged(auth, u => { onUser(u).catch(e => setSync('offline', msg(e))); });
  } catch (e) { started = false; status.error = 'Sign-in is not available in this browser.'; emit(); }
}

function authError(e) {
  const c = (e && e.code) || '';
  if (c.includes('unauthorized-domain')) return 'This domain is not added in Firebase → Authentication → Settings → Authorized domains.';
  if (c.includes('network')) return 'No internet connection.';
  if (c.includes('cancelled') || c.includes('closed')) return '';
  return 'Could not sign in: ' + (c || (e && e.message) || e);
}
const msg = e => (e && (e.code || e.message)) || String(e);

export function signIn() {
  if (!auth) return Promise.reject(new Error('Sign-in is not available.'));
  const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  return signInWithRedirect(auth, p);
}
export async function signOutUser() {
  detach();
  try { if (auth) await signOut(auth); } catch (e) {}
}

// ---------- sync ----------
const col = name => collection(db, 'users', user.uid, name);
const metaDoc = id => doc(db, 'users', user.uid, C_META, id);
const placeData = p => { const { id, ...d } = p; return d; };
// stable key order, so a document read back from Firestore compares equal to the one we wrote
const canon = x => Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, canon(x[k])])) : x;
const json = x => JSON.stringify(canon(x));

async function onUser(u) {
  detach();
  user = u;
  if (!u) { status.signedIn = false; status.name = ''; status.email = ''; setSync('off'); return; }
  status.signedIn = true; status.name = u.displayName || 'Signed in'; status.email = u.email || '';
  setSync('syncing');
  // A different Google account on the same device must never inherit the previous person's places.
  const local = store.get();
  if (local.syncUid && local.syncUid !== u.uid) store.wipe();
  store.setSyncUid(u.uid);

  let places = [], settingsDoc = null, historyDoc = null, fromServer = true;
  try {
    const [pl, se, hi] = await Promise.all([getDocs(col(C_PLACES)), getDoc(metaDoc('settings')), getDoc(metaDoc('history'))]);
    fromServer = !pl.metadata.fromCache;
    pl.forEach(d => places.push({ ...d.data(), id: d.id }));
    settingsDoc = se.exists() ? se.data() : null; historyDoc = hi.exists() ? hi.data() : null;
  } catch (e) { fromServer = false; setSync('offline', 'Could not reach your account. Changes are kept on this phone and synced later.'); }

  // merge with what is on the device (first sign-in, or after being offline)
  const cur = store.get();
  const byId = new Map(cur.places.map(p => [p.id, p]));
  for (const p of places) { const l = byId.get(p.id); if (!l || (p.ts || 0) >= (l.ts || 0)) byId.set(p.id, p); }
  const hist = [...(historyDoc && Array.isArray(historyDoc.items) ? historyDoc.items : []), ...cur.history];
  const seen = new Set(), history = [];
  for (const h of hist.sort((a, b) => (b.ts || 0) - (a.ts || 0))) { const k = h.stopId || `${h.lat},${h.lon}`; if (!seen.has(k)) { seen.add(k); history.push(h); } }
  applying = true;
  store.replaceAll({
    places: [...byId.values()], history: history.slice(0, 10),
    settings: settingsDoc ? { ...cur.settings, ...pick(settingsDoc, ['direction', 'rotate', 'live']) } : cur.settings,
    city: settingsDoc && settingsDoc.city ? settingsDoc.city : cur.city,
    ts: { settings: settingsDoc ? settingsDoc.ts || 0 : cur.ts.settings, history: cur.ts.history }
  });
  applying = false;
  // what the server already has, so only differences are written
  pushed = new Map(places.map(p => [C_PLACES + '/' + p.id, json(placeData(p))]));
  if (settingsDoc) pushed.set(C_META + '/settings', json(settingsDoc));
  if (historyDoc) pushed.set(C_META + '/history', json(historyDoc));
  if (fromServer) { await push(); attach(); }
  else { attach(); schedulePush(); }
}
const pick = (o, keys) => Object.fromEntries(keys.filter(k => typeof o[k] === 'boolean').map(k => [k, o[k]]));

function attach() {
  if (!user) return;
  detach();
  const fail = e => setSync('offline', msg(e));
  unsubs = [
    onSnapshot(col(C_PLACES), s => {
      const cur = store.get(); let list = cur.places.slice(), ch = false;
      s.docChanges().forEach(c => {
        const d = { ...c.doc.data(), id: c.doc.id };
        pushed.set(C_PLACES + '/' + d.id, json(placeData(d)));
        if (c.type === 'removed') { pushed.delete(C_PLACES + '/' + d.id); if (list.some(p => p.id === d.id)) { list = list.filter(p => p.id !== d.id); ch = true; } }
        else { const l = list.find(p => p.id === d.id); if (!l || (d.ts || 0) > (l.ts || 0)) { list = list.filter(p => p.id !== d.id).concat(d); ch = true; } }
      });
      if (ch) { applying = true; store.replaceAll({ places: list }); applying = false; }
      setSync(s.metadata.fromCache && s.metadata.hasPendingWrites ? 'syncing' : 'ok');
    }, fail),
    onSnapshot(metaDoc('settings'), s => {
      if (!s.exists()) return;
      const d = s.data(), cur = store.get();
      pushed.set(C_META + '/settings', json(d));
      if ((d.ts || 0) > (cur.ts.settings || 0)) { applying = true; store.replaceAll({ settings: { ...cur.settings, ...pick(d, ['direction', 'rotate', 'live']) }, city: d.city || cur.city, ts: { ...cur.ts, settings: d.ts || 0 } }); applying = false; }
    }, fail),
    onSnapshot(metaDoc('history'), s => {
      if (!s.exists()) return;
      const d = s.data(), cur = store.get();
      pushed.set(C_META + '/history', json(d));
      if ((d.ts || 0) > (cur.ts.history || 0) && Array.isArray(d.items)) { applying = true; store.replaceAll({ history: d.items.slice(0, 10), ts: { ...cur.ts, history: d.ts || 0 } }); applying = false; }
    }, fail)
  ];
}
function detach() { unsubs.forEach(f => { try { f(); } catch (e) {} }); unsubs = []; clearTimeout(pushTimer); }

// local changes are sent a moment later, only the documents that differ from what the server has
store.onChange(source => { if (source === 'local' && !applying) schedulePush(); });
function schedulePush() { if (!user || !db) return; clearTimeout(pushTimer); pushTimer = setTimeout(() => push().catch(e => setSync('offline', msg(e))), 700); }

async function push() {
  if (!user || !db) return;
  const d = store.get(), ops = [];
  const want = new Map();
  for (const p of d.places) want.set(C_PLACES + '/' + p.id, placeData(p));
  want.set(C_META + '/settings', { ...d.settings, city: d.city, ts: d.ts.settings || Date.now() });
  want.set(C_META + '/history', { items: d.history.slice(0, 10).map(placeData), ts: d.ts.history || Date.now() });
  for (const [path, data] of want) {
    const j = json(data);
    // an untouched default settings/history document is not worth creating
    if (pushed.get(path) === j) continue;
    if (path === C_META + '/history' && !pushed.has(path) && !data.items.length) continue;
    ops.push(setDoc(doc(db, 'users', user.uid, ...path.split('/')), data).then(() => pushed.set(path, j)));
  }
  for (const path of [...pushed.keys()]) {
    if (path.startsWith(C_PLACES + '/') && !want.has(path)) ops.push(deleteDoc(doc(db, 'users', user.uid, ...path.split('/'))).then(() => pushed.delete(path)));
  }
  if (!ops.length) { if (status.sync !== 'ok') setSync('ok'); return; }
  setSync('syncing');
  await Promise.all(ops);
  setSync('ok');
}

// ---------- the user's own data ----------
// Everything this app keeps in the cloud, as a plain object (for "Export my Routes data")
export async function exportCloud() {
  if (!user || !db) throw new Error('Sign in first.');
  const [pl, se, hi] = await Promise.all([getDocs(col(C_PLACES)), getDoc(metaDoc('settings')), getDoc(metaDoc('history'))]);
  const places = []; pl.forEach(d => places.push({ id: d.id, ...d.data() }));
  return { app: 'routes', version: 1, exportedAt: new Date().toISOString(), account: user.email || user.uid, places, settings: se.exists() ? se.data() : null, history: hi.exists() ? hi.data() : null };
}

// Deletes every routes_* document of the signed-in user (the Google account itself stays) and what this phone holds.
export async function deleteMyData() {
  if (!user || !db) throw new Error('Sign in first.');
  detach();
  const snap = await getDocs(col(C_PLACES));
  let batch = writeBatch(db), n = 0;
  for (const d of snap.docs) { batch.delete(d.ref); if (++n % 400 === 0) { await batch.commit(); batch = writeBatch(db); } }
  batch.delete(metaDoc('settings')); batch.delete(metaDoc('history'));
  await batch.commit();
  pushed = new Map();
  applying = true; store.wipe(); applying = false;
  attach(); setSync('ok');
}

// Deletes the user's Routes data and then the Google sign-in account itself.
export async function deleteAccount() {
  if (!user || !auth) throw new Error('Sign in first.');
  const u = user;
  await deleteMyData();
  try { await u.delete(); }
  catch (e) {
    if (e && e.code === 'auth/requires-recent-login') {
      const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      await reauthenticateWithPopup(u, p, browserPopupRedirectResolver);
      await u.delete();
    } else throw e;
  }
  detach();
  try { await signOut(auth); } catch (e) {}
  store.setSyncUid(null);
}
