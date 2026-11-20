// Storage: Firebase (read-only on the other apps' data, plus the digest's own weekly snapshots) or demo mode.
import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, onSnapshot
} from 'firebase/firestore';
import { $ } from './util.js';
import { signOutAndWipe } from './account.js';
import { demoData } from './demo.js';

const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
export const DEMO = !CFG.apiKey || /^PASTE/.test(CFG.apiKey) || location.hash === '#demo';

export function authError(e) {
  const c = e && e.code || '';
  if (c.includes('unauthorized-domain')) return 'This domain is not added in Firebase → Authentication → Settings → Authorized domains';
  if (c.includes('network')) return 'No internet connection';
  if (c.includes('cancelled') || c.includes('closed')) return '';
  return 'Could not sign in: ' + (c || e.message || e);
}

// Collections the digest reads (all written by the other apps) — see README.
const LISTS = {
  days: 'days', habits: 'habits', logs: 'logs', exps: 'spend_expenses', cats: 'spend_categories', books: 'books', quotes: 'quotes', snaps: 'digest_weeks'
};

function firebaseBackend(onError) {
  const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname);
  // authDomain = our own domain: Netlify proxies /__/auth/* to Firebase (see _redirects)
  const app = initializeApp({ ...CFG, authDomain: local ? `${CFG.projectId}.firebaseapp.com` : location.host });
  const auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence], popupRedirectResolver: browserPopupRedirectResolver });
  let db;
  try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) }); }
  catch (e) { db = getFirestore(app); }
  let subs = [];
  const fail = what => e => onError(what + ': ' + (e.code || e.message));
  return {
    onUser(cb) {
      getRedirectResult(auth).catch(e => { $('loginErr').textContent = authError(e); });
      onAuthStateChanged(auth, u => cb(u && { uid: u.uid, name: u.displayName || 'No name', email: u.email || '' }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(auth, p); },
    signOut() { return signOutAndWipe({ db, auth }, () => { subs.forEach(f => f()); subs = []; }); },
    firebase: () => ({ db, auth }),
    stop() { subs.forEach(f => f()); subs = []; },
    // on[name](docs, fromCache) for every collection in LISTS
    listen(uid, on) {
      subs.forEach(f => f());
      subs = [
        ...Object.entries(LISTS).map(([k, coll]) => onSnapshot(collection(db, 'users', uid, coll), s => {
          const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id }));
          on[k](a, s.metadata.fromCache);
        }, fail('Loading error'))),
        onSnapshot(doc(db, 'users', uid, 'spend_meta', 'settings'), s => on.meta(s.exists() ? s.data() : {}), fail('Loading error'))
      ];
    },
    // the digest's only write: a small snapshot per ISO week
    saveSnapshot(uid, id, data) { setDoc(doc(db, 'users', uid, 'digest_weeks', id), data).catch(fail('Not saved')); },
    token() { return auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null); }
  };
}

// Demo mode (placeholder Firebase config or #demo): a clearly labelled sample dataset, nothing is stored.
function demoBackend() {
  return {
    onUser(f) { f({ uid: 'demo', name: 'Demo', email: 'Sample data — nothing is stored' }); },
    signIn() { return Promise.resolve(); },
    signOut() { return Promise.resolve(); },
    firebase: () => null, stop() {},
    listen(uid, on) {
      const d = demoData();
      Object.keys(LISTS).forEach(k => on[k](d[k] || [], false));
      on.meta(d.meta);
    },
    saveSnapshot() {},
    token() { return Promise.resolve(null); }
  };
}

export const makeStore = onError => DEMO ? demoBackend() : firebaseBackend(onError);
