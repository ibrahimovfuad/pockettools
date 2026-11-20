import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, getDoc, onSnapshot, writeBatch
} from 'firebase/firestore';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';

// ===================== Utilities =====================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const plural = (n, one, many) => n === 1 ? one : many;
const books_ = n => `${n} ${plural(n, 'book', 'books')}`;
const MONTHS1 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const M1 = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
// dates are stored as strings: "2024", "2024-05" or "2024-05-12" — precision by length
function fmtDate(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  if (d) return `${MONTHS1[+m - 1]} ${+d}, ${y}`;
  if (m) return `${MONTHS1[+m - 1]} ${y}`;
  return y;
}
const shortDate = s => { if (!s) return ''; const [y, m, d] = s.split('-'); const cy = String(new Date().getFullYear()); return d ? `${MONTHS1[+m - 1].slice(0, 3)} ${+d}${y !== cy ? ', ' + y : ''}` : m ? `${MONTHS1[+m - 1].slice(0, 3)} ${y}` : y; };
function daysBetween(a, b) { if (!a || !b || a.length < 10 || b.length < 10) return null; return Math.max(0, Math.round((new Date(b) - new Date(a)) / 864e5)); }
// parsing imported dates: 2024, 2024-05, 2024-05-12, 12.05.2024, 05.2024, 2024/05/12
function parseDate(v) {
  v = String(v || '').trim(); if (!v) return '';
  let m;
  if ((m = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  if ((m = v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/))) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  if ((m = v.match(/^(\d{4})[-/.](\d{1,2})$/))) return `${m[1]}-${pad(m[2])}`;
  if ((m = v.match(/^(\d{1,2})[./-](\d{4})$/))) return `${m[2]}-${pad(m[1])}`;
  if ((m = v.match(/^(\d{4})$/))) return m[1];
  const t = Date.parse(v); if (!isNaN(t)) { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  return '';
}
// generated "cover" color when there is no image: stable per title
const PAL = [['#2F5D62', '#F3EEE3'], ['#D9583B', '#FFF4EC'], ['#3B4A7A', '#EDEBF7'], ['#C9A44B', '#2A2214'], ['#1F2A30', '#E7C77A'], ['#6B4E8C', '#F4EEFB'], ['#5E8C5A', '#F1F7EE'], ['#8FB8C4', '#13313A'], ['#E6C9A8', '#4A2E14'], ['#2B2B2B', '#E9E4D8'], ['#A7A39A', '#24231F'], ['#B03A48', '#FCEFF1']];
const hashOf = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const palOf = b => PAL[hashOf((b.title || '') + (b.author || '')) % PAL.length];
function tint(hex, k = .22) { const n = parseInt(hex.slice(1), 16); const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; const dark = matchMedia('(prefers-color-scheme: dark)').matches; const base = dark ? [14, 14, 13] : [244, 242, 237]; k = dark ? .35 : k; return `rgb(${Math.round(r * k + base[0] * (1 - k))},${Math.round(g * k + base[1] * (1 - k))},${Math.round(b * k + base[2] * (1 - k))})`; }
const seenImg = new Set(), badImg = new Set();
function coverHTML(b, size, w) {
  const [bg, ink] = palOf(b);
  const fs = size === 'big' ? 20 : size === 'grid' ? 17 : size === 'mini' ? (w >= 46 ? 7 : 0) : 10;
  const img = b.cover && !badImg.has(b.cover);
  // while the image loads show a calm background; once loaded it fades in
  return `<div class="cover${img ? ' has-img' : ''}" style="--bg:${bg};color:${ink}${w ? `;width:${w}px;height:${Math.round(w * 1.5)}px` : ''}">${fs ? `<div class="gen"><b style="font-size:${fs}px">${esc(b.title)}</b><small style="font-size:${Math.max(7, fs * .55)}px">${esc(b.author || '')}</small></div>` : ''}${img ? `<img src="${esc(b.cover)}" alt="" ${size === 'big' ? '' : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer" data-cov${seenImg.has(b.cover) ? ' class="ok"' : ''}>` : ''}</div>`;
}
// broken cover image — remove it, the generated one remains
document.addEventListener('error', e => { const t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-cov')) { badImg.add(t.getAttribute('src')); t.parentNode && t.parentNode.classList.remove('has-img'); t.remove(); } }, true);
document.addEventListener('load', e => { const t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-cov')) {
  // Open Library returns an empty 1×1 image when there is no cover
  if (t.naturalWidth < 5) { badImg.add(t.getAttribute('src')); t.parentNode && t.parentNode.classList.remove('has-img'); t.remove(); return; }
  seenImg.add(t.getAttribute('src')); t.classList.add('ok'); } }, true);

let toastId;
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastId); toastId = setTimeout(() => e.classList.remove('show'), 1900); }

const I = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h11M4 17h7"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 8v8M11 8v8M14 8v8M17 8v8"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 20V12M12 20V5M19 20v-9"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M8 11l4 4 4-4M5 20h14"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6"/></svg>',
  grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  chev: '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color:var(--text3);flex:none"><path d="M1 1l6 6-6 6"/></svg>'
};

// ===================== Storage: Firebase or demo =====================
const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
const DEMO = !CFG.apiKey || /^PASTE/.test(CFG.apiKey) || location.hash === '#demo' || sessionStorage.getItem('polka-demo') === '1';
if (location.hash === '#demo') sessionStorage.setItem('polka-demo', '1');

function authError(e) {
  const c = e && e.code || '';
  if (c.includes('unauthorized-domain')) return 'This domain is not added in Firebase → Authentication → Settings → Authorized domains';
  if (c.includes('network')) return 'No internet connection';
  if (c.includes('cancelled') || c.includes('closed')) return '';
  return 'Could not sign in: ' + (c || e.message || e);
}

function firebaseBackend() {
  const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname);
  const app = initializeApp({ ...CFG, authDomain: local ? `${CFG.projectId}.firebaseapp.com` : location.host });
  let db;
  try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) }); }
  catch (e) { db = getFirestore(app); }
  let auth = null;
  const getAuth = () => auth || (auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence], popupRedirectResolver: browserPopupRedirectResolver }));
  let subs = [];
  const fail = what => e => toast(what + ': ' + (e.code || e.message));
  return {
    onUser(cb) {
      const a = getAuth();
      getRedirectResult(a).catch(e => { $('loginErr').textContent = authError(e); });
      onAuthStateChanged(a, u => cb(u && { uid: u.uid, name: u.displayName || 'No name', email: u.email || '', photo: u.photoURL }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(getAuth(), p); },
    signOut() { subs.forEach(f => f()); subs = []; return signOut(getAuth()); },
    listen(uid, on) {
      subs.forEach(f => f());
      subs = [
        onSnapshot(collection(db, 'users', uid, 'books'), s => { const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id })); on.books(a); }, fail('Loading error')),
        onSnapshot(collection(db, 'users', uid, 'quotes'), s => { const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id })); on.quotes(a); }, fail('Loading error')),
        onSnapshot(doc(db, 'users', uid), s => on.profile(s.exists() ? s.data() : {}), () => {})
      ];
    },
    saveBook(uid, b) { const { id, ...d } = b; setDoc(doc(db, 'users', uid, 'books', id), clean(d)).catch(fail('Not saved')); },
    async saveBooks(uid, list) {
      for (let i = 0; i < list.length; i += 400) {
        const bt = writeBatch(db);
        list.slice(i, i + 400).forEach(b => { const { id, ...d } = b; bt.set(doc(db, 'users', uid, 'books', id), clean(d)); });
        await bt.commit().catch(fail('Not saved'));
      }
    },
    deleteBook(uid, id) { deleteDoc(doc(db, 'users', uid, 'books', id)).catch(fail('Not deleted')); },
    saveQuote(uid, q) { const { id, ...d } = q; setDoc(doc(db, 'users', uid, 'quotes', id), clean(d)).catch(fail('Not saved')); },
    deleteQuote(uid, id) { deleteDoc(doc(db, 'users', uid, 'quotes', id)).catch(fail('Not deleted')); },
    saveProfile(uid, p) { setDoc(doc(db, 'users', uid), clean(p), { merge: true }).catch(fail('Not saved')); },
    putPublic(id, data) { return setDoc(doc(db, 'public', id), clean(data)).catch(() => {}); },
    deletePublic(id) { return deleteDoc(doc(db, 'public', id)).catch(() => {}); },
    async getPublic(id) { const s = await getDoc(doc(db, 'public', id)); return s.exists() ? s.data() : null; }
  };
}
// Firestore does not accept undefined
function clean(o) { return JSON.parse(JSON.stringify(o)); }

function demoBackend() {
  const R = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let on = null;
  const emit = () => { if (!on) return; on.books(Object.values(R('polka-books', {}))); on.quotes(Object.values(R('polka-quotes', {}))); on.profile(R('polka-profile', {})); };
  const put = (k, id, v) => { const o = R(k, {}); if (v) o[id] = v; else delete o[id]; W(k, o); };
  return {
    onUser(cb) { cb({ uid: 'demo', name: 'Demo', email: 'data stays on this device only', photo: null }); },
    signIn() { return Promise.resolve(); }, signOut() { toast('There is nothing to sign out of in demo mode'); return Promise.resolve(); },
    listen(uid, o) { on = o; emit(); },
    saveBook(uid, b) { put('polka-books', b.id, clean(b)); emit(); },
    async saveBooks(uid, list) { const o = R('polka-books', {}); list.forEach(b => { o[b.id] = clean(b); }); W('polka-books', o); emit(); },
    deleteBook(uid, id) { put('polka-books', id, null); emit(); },
    saveQuote(uid, q) { put('polka-quotes', q.id, clean(q)); emit(); },
    deleteQuote(uid, id) { put('polka-quotes', id, null); emit(); },
    saveProfile(uid, p) { W('polka-profile', { ...R('polka-profile', {}), ...clean(p) }); emit(); },
    putPublic(id, data) { W('polka-public-' + id, clean(data)); return Promise.resolve(); },
    deletePublic(id) { try { localStorage.removeItem('polka-public-' + id); } catch (e) {} return Promise.resolve(); },
    async getPublic(id) { return R('polka-public-' + id, null); }
  };
}
const store = DEMO ? demoBackend() : firebaseBackend();

// ===================== State =====================
const S = {
  user: null, books: [], quotes: [], profile: {},
  view: 'lib', tab: 'reading', layout: 'list', sort: 'manual',
  genre: '', fl: { author: '', pubYear: '', readYear: '', rating: 0, format: '' }, showSkipped: false,
  q: '', qq: '', results: [], searching: false, statYear: new Date().getFullYear(),
  pub: null   // viewing someone else's shelf via a link
};
try { Object.assign(S, JSON.parse(localStorage.getItem('polka-ui') || '{}')); } catch (e) {}
const saveUI = () => { try { localStorage.setItem('polka-ui', JSON.stringify({ layout: S.layout, sort: S.sort })); } catch (e) {} };
const ro = () => !!S.pub;   // read-only
const B = id => S.books.find(b => b.id === id);
const STATUS = { queue: 'Want to read', reading: 'Reading', done: 'Read', dropped: 'Skipped' };   // stored value stays 'dropped' (existing data)
const FORMATS = ['Paper', 'E-book', 'Audio'];
// older versions stored Russian format/genre names — show them in English
const LEGACY = { 'Бумага': 'Paper', 'Электронная': 'E-book', 'Аудио': 'Audio', 'Художественная': 'Fiction', 'Детская': 'Children', 'Биография': 'Biography', 'История': 'History', 'Наука': 'Science', 'Психология': 'Psychology', 'Бизнес': 'Business', 'Саморазвитие': 'Self-help', 'Философия': 'Philosophy', 'Технологии': 'Technology', 'Поэзия': 'Poetry', 'Путешествия': 'Travel', 'Религия': 'Religion', 'Здоровье': 'Health', 'Кулинария': 'Cooking', 'Искусство': 'Art', 'Образование': 'Education', 'Политика': 'Politics', 'Общество': 'Society', 'Литературоведение': 'Literary criticism', 'Драматургия': 'Drama', 'Тру-крайм': 'True crime', 'Комиксы': 'Comics' };
const fixLegacy = b => ({ ...b, format: LEGACY[b.format] || b.format, genre: LEGACY[b.genre] || b.genre });

// skipped books stay out of Read unless the Skipped chip is on
function inTab(b, tab) { return tab === 'done' ? (b.status === 'done' || (S.showSkipped && b.status === 'dropped')) : b.status === tab; }
function shelf() {
  const f = S.fl;
  let L = S.books.filter(b => inTab(b, S.tab))
    .filter(b => !S.genre || b.genre === S.genre)
    .filter(b => !f.author || b.author === f.author)
    .filter(b => !f.pubYear || String(b.year) === f.pubYear)
    .filter(b => !f.readYear || (b.end || '').startsWith(f.readYear))
    .filter(b => !f.rating || (b.rating || 0) >= f.rating)
    .filter(b => !f.format || b.format === f.format);
  const by = {
    manual: (a, b) => S.tab === 'queue' ? (a.order ?? 0) - (b.order ?? 0) : S.tab === 'done' ? (b.end || b.start || '').localeCompare(a.end || a.start || '') || (b.created || 0) - (a.created || 0) : (b.start || '').localeCompare(a.start || '') || (b.created || 0) - (a.created || 0),
    recent: (a, b) => (b.updated || b.created || 0) - (a.updated || a.created || 0),
    title: (a, b) => (a.title || '').localeCompare(b.title || '', 'en'),
    author: (a, b) => (a.author || '').localeCompare(b.author || '', 'en') || (a.title || '').localeCompare(b.title || '', 'en')
  };
  return L.sort(by[S.sort] || by.manual);
}
const nFilters = () => Object.values(S.fl).filter(Boolean).length;

// ===================== Start-up =====================
const pubMatch = location.pathname.match(/^\/u\/([a-z0-9]{4,32})\/?$/i);
function start() {
  if (pubMatch) return openPublic(pubMatch[1]);
  store.onUser(u => {
    S.user = u;
    $('login').classList.toggle('hide', !!u);
    $('app').classList.toggle('hide', !u); $('bar').classList.toggle('hide', !u);
    if (!u) { closeLayer(); return; }
    let first = true;
    store.listen(u.uid, {
      books: a => { S.books = a.map(fixLegacy); render(); schedulePublic(); if (first) { first = false; enrichQueue(); } },
      quotes: a => { S.quotes = a.sort((x, y) => (y.created || 0) - (x.created || 0)); render(); schedulePublic(); },
      profile: p => { S.profile = p || {}; render(); }
    });
  });
  $('signInBtn').onclick = () => { $('loginErr').textContent = ''; store.signIn().catch(e => { $('loginErr').textContent = authError(e); }); };
}

async function openPublic(id) {
  $('app').classList.remove('hide'); $('bar').classList.remove('hide');
  $('screen').innerHTML = '<div class="empty">Loading the shelf…</div>';
  let data = null;
  try { data = await store.getPublic(id); } catch (e) {}
  if (!data) { $('bar').classList.add('hide'); $('screen').innerHTML = '<div class="empty" style="padding-top:30vh"><b>This link doesn’t work</b>The owner turned it off or replaced it with a new one.</div>'; return; }
  S.pub = data; S.books = (data.books || []).map(fixLegacy); S.quotes = data.quotes || [];
  S.layout = 'grid' === S.layout ? 'grid' : 'list'; S.sort = 'manual';
  render();
}

// ===================== Transitions =====================
// View Transitions (iOS 18+): covers and rows glide to their new places,
// the tab-bar pill slides, screens move like in iOS.
const canVT = !!document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAB_ORDER = ['reading', 'queue', 'done', 'search'];
const SUB_VIEWS = ['stats', 'quotes', 'profile'];
function vt(kind, fn) {
  if (!canVT) { fn(); return null; }
  const root = document.documentElement;
  root.dataset.vt = kind;
  let t;
  try { t = document.startViewTransition(fn); } catch (e) { delete root.dataset.vt; fn(); return null; }
  t.finished.finally(() => { if (root.dataset.vt === kind) delete root.dataset.vt; });
  return t;
}
// which way the screen moves: tab to the right → left, nested screen → like an iOS push
function navKind(fromView, fromTab, toView, toTab) {
  const pos = (v, t) => v === 'lib' ? TAB_ORDER.indexOf(t) : v === 'search' ? 3 : -1;
  if (SUB_VIEWS.includes(toView) && !SUB_VIEWS.includes(fromView)) return 'push';
  if (SUB_VIEWS.includes(fromView) && !SUB_VIEWS.includes(toView)) return 'pop';
  if (SUB_VIEWS.includes(toView)) return 'push';
  return pos(toView, toTab) > pos(fromView, fromTab) ? 'tab-l' : 'tab-r';
}

// ===================== Rendering =====================
let dragging = false, renderPending = false;
function render() {
  if (!S.user && !S.pub) return;
  if (dragging) { renderPending = true; return; }   // do not re-render the list under the finger
  const sc = $('screen');
  const focused = document.activeElement && document.activeElement.id;
  const caret = focused && document.activeElement.selectionStart;
  if (S.view === 'lib') sc.innerHTML = libHTML();
  else if (S.view === 'search') sc.innerHTML = searchHTML();
  else if (S.view === 'stats') sc.innerHTML = statsHTML();
  else if (S.view === 'quotes') sc.innerHTML = quotesHTML();
  else if (S.view === 'profile') sc.innerHTML = profileHTML();
  $('bar').innerHTML = barHTML();
  $('bar').classList.toggle('hide', !(S.view === 'lib' || S.view === 'search'));
  if (focused && (focused === 'q' || focused === 'qq')) { const e = $(focused); if (e) { e.focus(); try { e.setSelectionRange(caret, caret); } catch (x) {} } }
  if (S.view === 'lib') bindDrag();
  if (openSheetId && openSheetId.startsWith('book:') && !$('layer').querySelector('.sheet.closing') && $('layer').querySelector('.sheet').style.transform === '') refreshSheet();   // leave forms alone so typing is not interrupted
}

function barHTML() {
  const n = t => S.books.filter(b => inTab(b, t)).length;
  const tabs = [['reading', 'Reading'], ['queue', 'To read'], ['done', 'Read']];
  return `<div class="tabs">${tabs.map(([k, t]) => { const on = S.view === 'lib' && S.tab === k; return `<button data-tab="${k}" class="${on ? 'on' : ''}">${on ? '<i class="ind"></i>' : ''}<b>${n(k)}</b>${t}</button>`; }).join('')}</div>
    ${ro() ? '' : `<button class="sbtn ${S.view === 'search' ? 'on' : ''}" data-go="search" aria-label="Search and add">${I.search}</button>`}`;
}

function avatarHTML() {
  const u = S.user;
  return `<button class="rb av" data-go="profile" aria-label="Profile">${u && u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : esc(((u && u.name) || '?').trim().charAt(0).toUpperCase())}</button>`;
}

function libHTML() {
  const L = shelf();
  const title = { reading: 'Reading', queue: 'Want to read', done: 'Read' }[S.tab];
  const genres = [...new Set(S.books.filter(b => inTab(b, S.tab)).map(b => b.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en'));
  const dropped = S.tab === 'done' && S.books.some(b => b.status === 'dropped');
  const draggable = !ro() && S.tab === 'queue' && S.sort === 'manual' && !S.genre && !nFilters();
  let sub = books_(L.length);
  if (S.tab === 'queue' && draggable && L.length > 1) sub += ' · drag ⠿ to reorder';
  let html = '';
  html += `<div class="head lib" style="justify-content:flex-end">${ro() ? `${pubWho()}<span style="flex:1"></span><button class="rb" data-act="menu" aria-label="View and sorting">${I.menu}</button>` : `${avatarHTML()}<span style="flex:1"></span><button class="rb" data-act="menu" aria-label="View and sorting">${I.menu}</button><button class="rb" data-act="more" aria-label="More">${I.more}</button>`}</div>
    <h1 class="serif h1" style="margin-top:12px">${title}</h1>`;
  html += `<div class="sub">${sub}</div>`;
  html += `<div class="chips"><button class="chip ${nFilters() ? 'on' : ''}" data-act="filters">${I.filter}Filters${nFilters() ? ' · ' + nFilters() : ''}</button>
    <button class="chip ${!S.genre ? 'on' : ''}" data-genre="">All</button>
    ${genres.map(g => `<button class="chip ${S.genre === g ? 'on' : ''}" data-genre="${esc(g)}">${esc(g)}</button>`).join('')}
    ${dropped ? `<button class="chip ${S.showSkipped ? 'on' : ''}" data-act="skipped">Skipped</button>` : ''}</div>`;
  if (!L.length) {
    const any = S.books.some(b => inTab(b, S.tab));
    html += any ? '<div class="empty"><b>Nothing found</b>Try clearing the filters.</div>'
      : ro() ? '<div class="empty"><b>Empty for now</b></div>'
      : { reading: '<div class="empty"><b>You’re not reading anything right now</b>Add a book with the search button at the bottom right or move one from your queue.</div>',
          queue: '<div class="empty"><b>Your queue is empty</b>Tap search at the bottom right to find a book or scan a barcode.</div>',
          done: '<div class="empty"><b>Books you’ve read will appear here</b>Add older ones with past dates, or import a file from your profile.</div>' }[S.tab];
    return html;
  }
  if (S.layout === 'grid') {
    html += `<div class="grid">${L.map(b => `<button class="gitem" data-open="${b.id}" style="--vtn:r-${b.id}">${coverHTML(b, 'grid')}<div class="m"><span>${metaBadge(b)}</span><span>${esc(metaShort(b))}</span></div></button>`).join('')}</div>`;
  } else {
    html += `<div id="rows">${L.map(b => `<div class="row" data-id="${b.id}" style="--vtn:r-${b.id}"><button data-open="${b.id}" style="display:flex;gap:14px;align-items:center;flex:1;min-width:0;text-align:left">
      <div style="width:66px;height:99px;flex:none">${coverHTML(b, '', 66)}</div>
      <div class="info"><div class="t">${esc(b.title)}</div><div class="a">${esc(b.author || 'Unknown author')}</div><div class="m">${metaBadge(b)}${metaBadge(b) ? ' ' : ''}${esc(metaLine(b))}</div></div></button>
      ${draggable ? `<span class="grip" data-grip aria-label="Drag">${I.grip}</span>` : I.chev}</div>`).join('')}</div>`;
  }
  return html;
}
function pubWho() {
  return `<div style="display:flex;align-items:center;gap:10px">${S.pub.photo ? `<img src="${esc(S.pub.photo)}" alt="" referrerpolicy="no-referrer" style="width:40px;height:40px;border-radius:20px;object-fit:cover">` : ''}<div style="font-size:14px;line-height:1.3"><div style="font-weight:600">Shelf: ${esc(S.pub.name || 'a friend')}</div><div style="color:var(--text2)">view only</div></div></div>`;
}
function metaBadge(b) {
  if (b.status === 'done' && b.rating && (!ro() || S.pub.showR)) return `<span class="stars">${'★'.repeat(b.rating)}</span>`;
  if (b.status === 'dropped') return '<span class="dropped">Skipped</span>';
  return '';
}
function metaLine(b) {
  if (b.status === 'reading') return [b.start ? 'since ' + shortDate(b.start) : '', b.format].filter(Boolean).join(' · ');
  if (b.status === 'queue') return [b.genre, b.year].filter(Boolean).join(' · ');
  if (b.status === 'done') return b.end ? shortDate(b.end) : '';
  return b.why || '';
}
function metaShort(b) { return b.status === 'done' ? shortDate(b.end) : b.status === 'reading' ? (b.format || '') : (b.genre || ''); }

// ---------- search and add ----------
function searchHTML() {
  const q = norm(S.q);
  const mine = q ? S.books.filter(b => norm(b.title + ' ' + b.author).includes(q)).slice(0, 8) : [];
  let html = `<div class="head"><h1 class="serif h1">Search</h1></div><div style="height:12px"></div>
    <div class="search">${I.search}<label for="q" class="sr">Title, author or ISBN</label><input id="q" value="${esc(S.q)}" placeholder="Title, author or ISBN" autocomplete="off" enterkeyhint="search"></div>
    <div class="btn2"><button data-act="scan">${I.scan}Scan barcode</button><button data-act="manual">${I.pen}Add manually</button></div>`;
  if (mine.length) html += `<h2 class="serif h2">On my shelves</h2>${mine.map(b => `<button class="row" data-open="${b.id}"><div style="width:46px;height:69px;flex:none">${coverHTML(b, 'mini', 46)}</div><div class="info"><div class="t" style="font-size:16px">${esc(b.title)}</div><div class="a" style="font-size:14px">${esc(b.author || '')} · ${STATUS[b.status].toLowerCase()}</div></div></button>`).join('')}`;
  if (q.length >= 2) {
    html += `<h2 class="serif h2">In the book database</h2>`;
    if (S.searching && !S.results.length) html += '<div class="empty" style="padding:24px">Searching…</div>';
    else if (!S.results.length) html += '<div class="empty" style="padding:24px">Nothing found. Try different words or add it manually.</div>';
    else html += S.results.map((r, i) => {
      const have = S.books.some(b => (r.isbn && b.isbn === r.isbn) || (norm(b.title) === norm(r.title) && norm(b.author) === norm(r.author)));
      return `<div class="row"><div style="width:46px;height:69px;flex:none">${coverHTML(r, 'mini', 46)}</div><div class="info"><div class="t" style="font-size:16px">${esc(r.title)}</div><div class="a" style="font-size:14px">${esc([r.author, r.year].filter(Boolean).join(' · '))}</div></div>${have ? '<span style="color:var(--text2);font-size:14px">already added</span>' : `<button class="addbtn" data-res="${i}">Add</button>`}</div>`;
    }).join('');
  } else if (!S.q) {
    html += `<div class="foot" style="margin-top:18px">Search by title, author or the ISBN on the back of the book. Cover, description and page count are filled in automatically.</div>`;
  }
  return html;
}
let searchTimer = null, searchSeq = 0;
function runSearch() {
  clearTimeout(searchTimer);
  const q = S.q.trim();
  if (q.length < 2) { S.results = []; S.searching = false; render(); return; }
  S.searching = true; render();
  const seq = ++searchSeq;
  searchTimer = setTimeout(async () => {
    const isbn = q.replace(/[^0-9Xx]/g, '');
    let r = [];
    try { r = (isbn.length === 10 || isbn.length === 13) && /^\d/.test(q) ? [await lookupISBN(isbn)].filter(Boolean) : await searchBooks(q); } catch (e) { r = []; }
    if (seq !== searchSeq) return;
    S.results = r; S.searching = false; render();
  }, 450);
}

// ===================== Book search in open databases =====================
const GENRES = { fiction: 'Fiction', 'juvenile fiction': 'Children', biography: 'Biography', 'biography & autobiography': 'Biography', history: 'History', science: 'Science', psychology: 'Psychology', 'business & economics': 'Business', 'self-help': 'Self-help', philosophy: 'Philosophy', 'computers': 'Technology', poetry: 'Poetry', travel: 'Travel', religion: 'Religion', 'health & fitness': 'Health', cooking: 'Cooking', art: 'Art', education: 'Education', 'political science': 'Politics', 'social science': 'Society', 'literary criticism': 'Literary criticism', drama: 'Drama', 'true crime': 'True crime', 'comics & graphic novels': 'Comics' };
const mapGenre = g => { if (!g) return ''; const k = String(g).toLowerCase().split('/')[0].trim(); return GENRES[k] || LEGACY[g] || ''; };
const stripTags = s => String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\n{3,}/g, '\n\n').trim();
const cutDesc = s => { s = stripTags(s); return s.length > 900 ? s.slice(0, 900).replace(/\s+\S*$/, '') + '…' : s; };
function fromGoogle(it) {
  const v = it.volumeInfo || {};
  const ids = v.industryIdentifiers || [];
  const isbn = (ids.find(x => x.type === 'ISBN_13') || ids.find(x => x.type === 'ISBN_10') || {}).identifier || '';
  let cover = (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) || '';
  if (cover) cover = cover.replace(/^http:/, 'https:').replace('&edge=curl', '').replace('zoom=1', 'zoom=1');
  return { title: v.title + (v.subtitle && v.title.length < 30 ? '. ' + v.subtitle : ''), author: (v.authors || []).join(', '), year: (v.publishedDate || '').slice(0, 4),
    pages: v.pageCount || '', genre: mapGenre((v.categories || [])[0]), desc: cutDesc(v.description), cover, isbn };
}
async function getJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); }
async function lookupISBN(isbn) {
  try {
    const j = await getJSON(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`);
    if (j.items && j.items.length) { const b = fromGoogle(j.items[0]); b.isbn = b.isbn || isbn; if (!b.cover) b.cover = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`; return b; }
  } catch (e) {}
  try {
    const j = await getJSON(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const v = j['ISBN:' + isbn];
    if (v) return { title: v.title, author: (v.authors || []).map(a => a.name).join(', '), year: (String(v.publish_date || '').match(/\d{4}/) || [''])[0], pages: v.number_of_pages || '', genre: '', desc: '', cover: v.cover ? v.cover.medium : '', isbn };
  } catch (e) {}
  return null;
}
async function searchBooks(q) {
  try {
    const j = await getJSON(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=15&printType=books`);
    const seen = new Set();
    const r = (j.items || []).map(fromGoogle).filter(b => b.title && !seen.has(norm(b.title + b.author)) && seen.add(norm(b.title + b.author)));
    if (r.length) return r;
  } catch (e) {}
  try {
    const j = await getJSON(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=15&fields=title,author_name,first_publish_year,number_of_pages_median,cover_i,isbn`);
    return (j.docs || []).map(d => ({ title: d.title, author: (d.author_name || []).join(', '), year: d.first_publish_year || '', pages: d.number_of_pages_median || '', genre: '', desc: '',
      cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '', isbn: (d.isbn || []).find(x => x.length === 13) || '' }));
  } catch (e) { return []; }
}
// after import: quietly fetch covers and descriptions for books without a cover
let enriching = false;
async function enrichQueue() {
  if (enriching || ro()) return; enriching = true;
  const todo = S.books.filter(b => !b.cover && !b.looked);
  for (const b of todo.slice(0, 120)) {
    let r = null;
    try { r = b.isbn ? await lookupISBN(b.isbn) : ((await searchBooks(`intitle:${b.title}${b.author ? ' inauthor:' + b.author.split(',')[0] : ''}`))[0] || null); } catch (e) {}
    const cur = B(b.id); if (!cur) continue;
    const patch = { looked: true };
    if (r && norm(r.title).split(' ')[0] === norm(cur.title).split(' ')[0]) {
      ['cover', 'desc', 'pages', 'year', 'genre', 'isbn'].forEach(k => { if (!cur[k] && r[k]) patch[k] = r[k]; });
    }
    saveBook({ ...cur, ...patch }, true);
    await new Promise(res => setTimeout(res, 450));
  }
  enriching = false;
}

// ---------- statistics ----------
function yearData(y) {
  const ys = String(y);
  const R = S.books.filter(b => b.status === 'done' && (b.end || '').startsWith(ys));
  const months = Array(12).fill(0); let noMonth = 0;
  R.forEach(b => { if (b.end.length >= 7) months[+b.end.slice(5, 7) - 1]++; else noMonth++; });
  const pages = R.reduce((t, b) => t + (+b.pages || 0), 0);
  const rated = R.filter(b => b.rating);
  const avg = rated.length ? rated.reduce((t, b) => t + b.rating, 0) / rated.length : null;
  const gm = {}, am = {};
  R.forEach(b => { if (b.genre) gm[b.genre] = (gm[b.genre] || 0) + 1; if (b.author) am[b.author] = (am[b.author] || 0) + 1; });
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  const dropped = S.books.filter(b => b.status === 'dropped' && ((b.end || b.start || '').startsWith(ys))).length;
  const timed = R.map(b => ({ b, d: daysBetween(b.start, b.end) })).filter(x => x.d != null);
  return { y, R, months, noMonth, pages, avg, genres: top(gm), authors: top(am), dropped, timed };
}
function statsHTML() {
  const years = [...new Set(S.books.filter(b => b.status === 'done' && b.end).map(b => +b.end.slice(0, 4)))].sort((a, b) => b - a);
  if (!years.includes(S.statYear)) years.unshift(S.statYear);
  years.sort((a, b) => b - a);
  const D = yearData(S.statYear), mx = Math.max(1, ...D.months);
  return `<button class="rb" data-go="lib" aria-label="Back">${I.back}</button>
    <h1 class="serif h1" style="margin-top:14px">${S.statYear}</h1><div class="sub">Reading statistics</div>
    <div class="chips">${years.map(y => `<button class="chip ${y === S.statYear ? 'on' : ''}" data-year="${y}">${y}</button>`).join('')}</div>
    <div class="tiles">
      <div class="tile"><span>Read</span><b>${D.R.length}</b></div>
      <div class="tile"><span>Pages</span><b>${D.pages ? D.pages.toLocaleString('en-US') : '—'}</b></div>
      <div class="tile"><span>Average rating</span><b>${D.avg ? D.avg.toFixed(1) + ' ★' : '—'}</b></div>
      <div class="tile"><span>Skipped</span><b>${D.dropped}</b></div>
    </div>
    ${D.R.length ? `<button class="pill acc" data-act="stories" style="margin-top:14px;display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:18px;height:18px;display:inline-block">${I.play}</span>${S.statYear} in review</button>` : ''}
    <div class="lbl">By month</div>
    <div class="tile" style="padding:16px 12px 10px">
      <div style="display:flex;align-items:flex-end;gap:6px;height:120px">${D.months.map(v => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px"><span style="font-size:11px;color:var(--text2)">${v || ''}</span><div style="width:100%;max-width:20px;border-radius:4px 4px 1px 1px;height:${v ? Math.max(8, v / mx * 92) : 3}px;background:${v ? 'var(--accent)' : 'var(--fill)'}"></div></div>`).join('')}</div>
      <div style="display:flex;gap:6px;margin-top:6px">${M1.map(m => `<span style="flex:1;text-align:center;font-size:11px;color:var(--text2)">${m}</span>`).join('')}</div>
    </div>
    ${D.noMonth ? `<div class="foot">${books_(D.noMonth)} without a month (only the year is known). They count in the totals but not in the chart.</div>` : ''}
    ${D.genres.length ? `<div class="lbl">Genres</div><div class="grp">${D.genres.slice(0, 8).map(([g, n]) => `<div style="padding:12px 18px;border-bottom:.5px solid var(--sep)"><div style="display:flex;justify-content:space-between"><span>${esc(g)}</span><span style="color:var(--text2)">${n}</span></div><div style="height:6px;border-radius:3px;background:var(--fill);margin-top:6px"><div style="height:6px;border-radius:3px;width:${Math.round(n / D.R.length * 100)}%;background:var(--accent)"></div></div></div>`).join('')}</div>` : ''}
    ${D.authors.length ? `<div class="lbl">Authors</div><div class="grp">${D.authors.slice(0, 6).map(([a, n]) => `<div class="gi"><span class="grow">${esc(a)}</span><span class="val">${books_(n)}</span></div>`).join('')}</div>` : ''}
    ${!D.R.length ? `<div class="empty"><b>Nothing for ${S.statYear} yet</b>Mark a book as read or add older ones with dates.</div>` : ''}`;
}

// ---------- quotes ----------
function quotesHTML() {
  const q = norm(S.qq);
  const L = S.quotes.map(x => ({ ...x, b: B(x.bookId) })).filter(x => x.b && (!q || norm(x.text + ' ' + x.b.title + ' ' + x.b.author).includes(q)));
  return `<button class="rb" data-go="lib" aria-label="Back">${I.back}</button>
    <h1 class="serif h1" style="margin:14px 0 12px">Quotes</h1>
    <div class="search" style="margin-bottom:14px">${I.search}<label for="qq" class="sr">Search quotes</label><input id="qq" value="${esc(S.qq)}" placeholder="A word from a quote, a book or an author" autocomplete="off"></div>
    ${L.length ? L.map(x => `<button class="q rise" data-open="${x.b.id}"><div class="qt">«${esc(x.text)}»</div><div class="qm"><div style="width:22px;height:33px">${coverHTML(x.b, 'mini', 22)}</div>${esc(x.b.title)}${x.page ? ' · p. ' + esc(x.page) : ''}</div></button>`).join('')
      : `<div class="empty"><b>${S.quotes.length ? 'Nothing found' : 'No quotes yet'}</b>${S.quotes.length ? '' : 'Open a book and add a quote or note at the bottom of its card.'}</div>`}`;
}

// ---------- profile ----------
function profileHTML() {
  const u = S.user, sh = S.profile.share || {};
  const n = s => S.books.filter(b => b.status === s).length;
  const link = sh.on && sh.id ? `${location.origin}/u/${sh.id}` : '';
  return `<button class="rb" data-go="lib" aria-label="Back">${I.back}</button>
    <div style="display:flex;flex-direction:column;align-items:center;margin:4px 0 22px;text-align:center">
      <div style="width:88px;height:88px;border-radius:44px;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;font-size:38px;font-weight:700;overflow:hidden" class="serif">${u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover">` : esc((u.name || '?').charAt(0).toUpperCase())}</div>
      <h1 class="serif" style="margin:14px 0 2px;font-size:30px;font-weight:700">${esc(u.name)}</h1>
      <div style="color:var(--text2);font-size:15px">${esc(u.email)}</div>
    </div>
    <div class="tiles" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="tile" style="text-align:center"><b>${n('reading')}</b><span>reading</span></div>
      <div class="tile" style="text-align:center"><b>${n('queue')}</b><span>to read</span></div>
      <div class="tile" style="text-align:center"><b>${n('done')}</b><span>read</span></div>
    </div>
    <div class="lbl">Shelf for friends</div>
    <div class="grp">
      <label class="gi"><span class="grow">View-only link</span><input type="checkbox" class="switch" data-share="on" ${sh.on ? 'checked' : ''}></label>
      ${sh.on ? `<button class="gi" data-act="copylink"><span class="grow" style="color:var(--accent);font-size:15px;word-break:break-all">${esc(link.replace(/^https?:\/\//, ''))}</span><span class="val" style="font-size:14px">Send</span></button>
      <label class="gi"><span class="grow">Show ratings and reviews</span><input type="checkbox" class="switch" data-share="showR" ${sh.showR !== false ? 'checked' : ''}></label>
      <label class="gi"><span class="grow">Show quotes</span><input type="checkbox" class="switch" data-share="showQ" ${sh.showQ !== false ? 'checked' : ''}></label>
      <button class="gi" data-act="preview" style="color:var(--accent)">Preview as a friend</button>
      <button class="gi danger" data-act="newlink">Replace link</button>` : ''}
    </div>
    <div class="foot">${sh.on ? 'Friends open the link without signing in and see your shelves. They cannot change anything. If you turn it off or replace it, the old link stops working.' : 'Turn on to get a view-only link you can send to anyone.'}</div>
    <div class="lbl">Data</div>
    <div class="grp">
      <button class="gi" data-act="import">${I.up.replace('<svg', '<svg width="20" height="20" style="color:var(--accent)"')}<span class="grow">Import from file</span>${I.chev}</button>
      <button class="gi" data-act="export">${I.down.replace('<svg', '<svg width="20" height="20" style="color:var(--accent)"')}<span class="grow">Export</span>${I.chev}</button>
      <button class="gi" data-go="stats">${I.chart.replace('<svg', '<svg width="20" height="20" style="color:var(--accent)"')}<span class="grow">Statistics and year in review</span>${I.chev}</button>
    </div>
    ${DEMO ? '<div class="foot">Demo mode: data is stored on this device only.</div>' : ''}
    <div class="grp" style="margin-top:22px"><button class="gi danger center" data-act="signout">Sign out</button></div>
    <a class="nf src" href="https://github.com/ibrahimovfuad/pockettools" target="_blank" rel="noopener">Open source on GitHub</a>
    <div class="app-ver"></div>`;
}

// ===================== Actions =====================
function saveBook(b, silent) {
  b.updated = Date.now();
  const i = S.books.findIndex(x => x.id === b.id);
  if (i > -1) S.books[i] = b; else S.books.push(b);
  store.saveBook(S.user.uid, b);
  if (!silent) render();
}
function newBook(d) {
  const st = d.status || 'queue';
  const minOrder = Math.min(0, ...S.books.filter(b => b.status === 'queue').map(b => b.order ?? 0));
  const maxOrder = Math.max(0, ...S.books.filter(b => b.status === 'queue').map(b => b.order ?? 0));
  return { id: uid8(), title: '', author: '', genre: '', year: '', pages: '', format: 'Paper', isbn: '', cover: '', desc: '', status: st, start: '', end: '', rating: 0, review: '', why: '', order: d.top ? minOrder - 10 : maxOrder + 10, created: Date.now(), ...d };
}
function setStatus(b, st) {
  const t = todayIso(), nb = { ...b, status: st };
  if (st === 'reading' && !nb.start) nb.start = t;
  if (st === 'done') { if (!nb.end) nb.end = t; if (!nb.start) nb.start = ''; }
  if (st === 'queue') { nb.order = Math.max(0, ...S.books.filter(x => x.status === 'queue').map(x => x.order ?? 0)) + 10; }
  saveBook(nb);
  toast({ reading: 'Started reading', done: 'Finished!', queue: 'Added to queue', dropped: 'Marked as skipped' }[st]);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-tab],[data-open],[data-act],[data-genre],[data-res],[data-year]');
  if (!t || t.closest('#layer')) return;
  const d = t.dataset;
  if (d.go) {
    if (d.go === S.view) return;
    if (d.go === 'search') setTimeout(() => $('q') && !S.q && $('q').focus({ preventScroll: true }), 420);
    vt(navKind(S.view, S.tab, d.go, S.tab), () => { S.view = d.go; scrollTo(0, 0); render(); });
    return;
  }
  if (d.tab) {
    if (S.view === 'lib' && S.tab === d.tab) { scrollTo({ top: 0, behavior: 'smooth' }); return; }
    vt(navKind(S.view, S.tab, 'lib', d.tab), () => { S.tab = d.tab; S.view = 'lib'; S.genre = ''; scrollTo(0, 0); render(); });
    return;
  }
  if (d.open) { openBook(d.open, t.querySelector('.cover')); return; }
  if (d.genre != null && t.dataset.genre !== undefined && !d.act) { if (S.genre === d.genre) return; vt('reflow', () => { S.genre = d.genre; render(); }); return; }
  if (d.res) { const r = S.results[+d.res]; openEdit(null, { ...r, status: 'queue' }); return; }
  if (d.year) { S.statYear = +d.year; render(); return; }
  const a = d.act;
  if (a === 'menu') openMenu();
  if (a === 'more') openMore();
  if (a === 'filters') openFilters();
  if (a === 'skipped') vt('reflow', () => { S.showSkipped = !S.showSkipped; render(); });
  if (a === 'scan') openScan();
  if (a === 'manual') openEdit(null, { title: S.q.trim(), status: 'queue' });
  if (a === 'stories') openStories(S.statYear);
  if (a === 'import') pickImport();
  if (a === 'export') openExport();
  if (a === 'signout') store.signOut();
  if (a === 'copylink') shareLink();
  if (a === 'newlink') newLink();
  if (a === 'preview') { const sh = S.profile.share || {}; if (sh.id) { publishNow(); window.open('/u/' + sh.id, '_blank'); } }
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') { S.q = e.target.value; runSearch(); }
  if (e.target.id === 'qq') { S.qq = e.target.value; render(); }
});
document.addEventListener('change', e => {
  const k = e.target.dataset && e.target.dataset.share;
  if (!k) return;
  const sh = { ...(S.profile.share || {}) };
  sh[k] = e.target.checked;
  if (k === 'on' && sh.on && !sh.id) sh.id = randId();
  if (k === 'on' && !sh.on && sh.id) store.deletePublic(sh.id);
  S.profile = { ...S.profile, share: sh };
  store.saveProfile(S.user.uid, { share: sh });
  render();
  if (sh.on) publishNow();
  if (k === 'on') toast(sh.on ? 'Link turned on' : 'Link turned off');
});

// ---------- public shelf ----------
const randId = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), x => 'abcdefghjkmnpqrstuvwxyz23456789'[x % 31]).join('');
function publicData() {
  const sh = S.profile.share || {};
  const showR = sh.showR !== false, showQ = sh.showQ !== false;
  return {
    uid: S.user.uid, name: (S.user.name || '').split(' ')[0], photo: S.user.photo || '', showR, showQ, updated: Date.now(),
    books: S.books.map(b => ({ id: b.id, title: b.title, author: b.author, genre: b.genre, year: b.year, pages: b.pages, format: b.format, cover: b.cover,
      desc: (b.desc || '').slice(0, 600), status: b.status, start: b.start, end: b.end, order: b.order, created: b.created,
      rating: showR ? b.rating : 0, review: showR ? b.review : '', why: b.why })),
    quotes: showQ ? S.quotes.map(q => ({ id: q.id, bookId: q.bookId, page: q.page, text: q.text, created: q.created })) : []
  };
}
let pubTimer = null;
function schedulePublic() { const sh = S.profile.share || {}; if (ro() || !S.user || !sh.on || !sh.id) return; clearTimeout(pubTimer); pubTimer = setTimeout(publishNow, 2000); }
function publishNow() { const sh = S.profile.share || {}; if (!sh.on || !sh.id) return Promise.resolve(); clearTimeout(pubTimer); return store.putPublic(sh.id, publicData()); }
async function shareLink() {
  const sh = S.profile.share || {}; const url = `${location.origin}/u/${sh.id}`;
  publishNow();
  if (navigator.share) { navigator.share({ title: 'My bookshelf', url }).catch(() => {}); return; }
  try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { toast(url); }
}
function newLink() {
  const sh = { ...(S.profile.share || {}) };
  if (sh.id) store.deletePublic(sh.id);
  sh.id = randId(); S.profile = { ...S.profile, share: sh };
  store.saveProfile(S.user.uid, { share: sh }); publishNow(); render();
  toast('Done: the old link no longer works');
}

// ===================== Layers: menus and sheets =====================
// while a sheet is open, the page underneath does not scroll
let lockY = null;
function lockScroll() { if (lockY !== null) return; lockY = scrollY; Object.assign(document.body.style, { position: 'fixed', top: -lockY + 'px', left: '0', right: '0' }); }
function unlockScroll() { if (lockY === null) return; Object.assign(document.body.style, { position: '', top: '', left: '', right: '' }); scrollTo(0, lockY); lockY = null; }
function clearLayer() { $('layer').innerHTML = ''; unlockScroll(); }
let openSheetId = null, sheetRender = null;
function closeLayer(how) {
  const L = $('layer'), sh = L.querySelector('.sheet');
  stopCamera(); stopStories();
  const wasBook = openSheetId && openSheetId.startsWith('book:') && openSheetId.slice(5);
  openSheetId = null; sheetRender = null;
  if (!sh) { clearLayer(); return; }
  const dim = L.querySelector('.dim');
  if (how === 'swipe') {   // the sheet is already being dragged — finish closing from the current spot
    sh.style.transition = 'transform .26s cubic-bezier(.3,.6,.4,1)'; sh.style.transform = 'translateY(calc(100% + 120px))';
    if (dim) { dim.style.transition = 'opacity .26s'; dim.style.opacity = 0; }
    setTimeout(() => { if (!openSheetId) clearLayer(); }, 270);
    return;
  }
  if (canVT) {
    // the sheet slides down, the cover flies back to its place in the list
    sh.style.viewTransitionName = 'sheet';
    if (dim) dim.style.viewTransitionName = 'dim';
    const hc = sh.querySelector('.hero .cover');
    const back = wasBook && document.querySelector(`#screen [data-open="${wasBook}"] .cover`);
    const fly = hc && back && inView(back);
    if (fly) hc.style.viewTransitionName = 'bookcover';
    vt('sheet-close', () => {
      if (!openSheetId) clearLayer();
      if (fly) back.style.viewTransitionName = 'bookcover';
    })?.finished.finally(() => { if (back) back.style.viewTransitionName = ''; });
    return;
  }
  sh.classList.add('closing'); if (dim) dim.style.opacity = 0;
  setTimeout(() => { if (!openSheetId) clearLayer(); }, 280);
}
const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
function popup(html) {
  $('layer').innerHTML = `<div class="dim light" data-close></div><div class="popm">${html}</div>`;
  $('layer').querySelector('[data-close]').onclick = () => closeLayer();
}
function sheet(id, fn, short) {
  openSheetId = id; sheetRender = fn;
  lockScroll();
  $('layer').innerHTML = `<div class="dim" data-close></div><div class="sheet${short ? ' short' : ''}" role="dialog" aria-modal="true"><div class="grab" aria-hidden="true"></div><div class="sc"></div></div>`;
  $('layer').querySelector('[data-close]').onclick = () => closeLayer();
  const sh = $('layer').querySelector('.sheet');
  bindSwipe(sh, $('layer').querySelector('.dim'));
  fn(sh.querySelector('.sc'), true);
}
// swiping down closes the sheet (when its content is scrolled to the top)
function bindSwipe(sh, dim) {
  const sc = sh.querySelector('.sc');
  let y0 = null, dy = 0, t0 = 0, on = false, lastY = 0, lastT = 0, v = 0;
  sh.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || e.target.closest('input,textarea,select,.chips,.vf')) { y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0; on = false;
  }, { passive: true });
  sh.addEventListener('touchmove', e => {
    if (y0 == null) return;
    const y = e.touches[0].clientY, d = y - y0, now = performance.now();
    if (!on) {
      if (d > 0 && sc.scrollTop <= 0) { on = true; y0 = y; lastY = y; lastT = t0 = now; sh.style.transition = 'none'; if (dim) dim.style.transition = 'none'; }
      else if (d < 0 || sc.scrollTop > 0) { y0 = null; return; }
      else return;
    }
    e.preventDefault();
    dy = Math.max(0, y - y0);
    v = (y - lastY) / Math.max(1, now - lastT); lastY = y; lastT = now;
    sh.style.transform = `translateY(${dy}px)`;
    if (dim) dim.style.opacity = String(Math.max(0, 1 - dy / (sh.offsetHeight * .9)));
  }, { passive: false });
  const end = () => {
    if (y0 == null && !on) return;
    y0 = null;
    if (!on) return;
    on = false;
    if (dy > Math.min(160, sh.offsetHeight * .3) || (v > .5 && dy > 30)) { closeLayer('swipe'); return; }
    sh.style.transition = 'transform .4s cubic-bezier(.2,1.1,.3,1)'; sh.style.transform = '';
    if (dim) { dim.style.transition = 'opacity .3s'; dim.style.opacity = ''; }
  };
  sh.addEventListener('touchend', end); sh.addEventListener('touchcancel', end);
}
function refreshSheet() {
  const el = $('layer').querySelector('.sheet .sc'); if (!el || !sheetRender) return;
  const a = document.activeElement, fid = a && el.contains(a) && a.id, caret = fid && a.selectionStart;
  sheetRender(el, false);
  if (fid) { const e = el.querySelector('#' + fid); if (e) { e.focus({ preventScroll: true }); try { e.setSelectionRange(caret, caret); } catch (x) {} } }
}

function openMenu() {
  const ck = on => `<span class="ck">${on ? '✓' : ''}</span>`;
  popup(`<button data-m="layout:list">${ck(S.layout === 'list')}List</button><button data-m="layout:grid">${ck(S.layout === 'grid')}Covers</button><hr><div class="cap">Sort by</div>
    ${[['manual', S.tab === 'queue' ? 'My order' : 'Dates'], ['recent', 'Recently changed'], ['title', 'Title'], ['author', 'Author']].map(([k, t]) => `<button data-m="sort:${k}">${ck(S.sort === k)}${t}</button>`).join('')}`);
  $('layer').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const [k, v] = b.dataset.m.split(':'); closeLayer(); if (S[k] === v) return; vt('reflow', () => { S[k] = v; saveUI(); render(); }); });
}
function openMore() {
  popup(`<button data-m="quotes">${I.quote}Quotes</button><button data-m="stats">${I.chart}Statistics and review</button><button data-m="profile">${I.up}Shelf for friends</button><hr><button data-m="import">${I.file}Import from file</button><button data-m="export">${I.down}Export</button>`);
  $('layer').querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
    const m = b.dataset.m; closeLayer();
    if (m === 'import') return pickImport();
    if (m === 'export') return openExport();
    vt('push', () => { S.view = m; S.qq = ''; scrollTo(0, 0); render(); });
  });
}
function openFilters() {
  const all = S.books;
  const opts = (vals, cur, fmt = v => v) => `<option value="">Any</option>` + vals.map(v => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(fmt(v))}</option>`).join('');
  const uniq = (f) => [...new Set(all.map(f).filter(Boolean))];
  sheet('filters', el => {
    el.innerHTML = `<div class="sh-head"><button class="tbtn" data-x>Reset</button><b>Filters</b><button class="tbtn" data-ok>Done</button></div><div class="sh-body"><div class="grp">
      <label class="gi"><span class="grow">Author</span><select id="fAuthor" style="max-width:190px">${opts(uniq(b => b.author).sort((a, b) => a.localeCompare(b, 'en')), S.fl.author)}</select></label>
      <label class="gi"><span class="grow">Year published</span><select id="fPub">${opts(uniq(b => String(b.year || '')).sort().reverse(), S.fl.pubYear)}</select></label>
      <label class="gi"><span class="grow">Year read</span><select id="fRead">${opts(uniq(b => (b.end || '').slice(0, 4)).sort().reverse(), S.fl.readYear)}</select></label>
      <label class="gi"><span class="grow">Rating</span><select id="fRate">${opts([5, 4, 3, 2, 1], S.fl.rating || '', v => v + ' ★ and up')}</select></label>
      <label class="gi"><span class="grow">Format</span><select id="fFmt">${opts(FORMATS, S.fl.format)}</select></label>
    </div><div class="foot">Pick a genre with the chips above the list.</div></div>`;
    const apply = () => { const fl = { author: $('fAuthor').value, pubYear: $('fPub').value, readYear: $('fRead').value, rating: +$('fRate').value || 0, format: $('fFmt').value }; closeLayer(); setTimeout(() => vt('reflow', () => { S.fl = fl; render(); }), 320); };
    el.querySelector('[data-ok]').onclick = apply;
    el.querySelector('[data-x]').onclick = () => { closeLayer(); setTimeout(() => vt('reflow', () => { S.fl = { author: '', pubYear: '', readYear: '', rating: 0, format: '' }; render(); }), 320); };
  }, true);
}

// ---------- book card ----------
let descOpen = false, delArmed = null;
function openBook(id, src) {
  descOpen = false;
  if (canVT && src && !$('layer').querySelector('.sheet')) {
    src.style.viewTransitionName = 'bookcover';
    vt('sheet-open', () => {
      src.style.viewTransitionName = '';
      openBookNow(id);
      const L = $('layer'), hc = L.querySelector('.hero .cover');
      if (hc) hc.style.viewTransitionName = 'bookcover';
      const sh = L.querySelector('.sheet'), dim = L.querySelector('.dim');
      sh.style.viewTransitionName = 'sheet';
      dim.style.viewTransitionName = 'dim';
      // the view transition already animates them in; without this their own CSS animation
      // would replay once data-vt is removed and the sheet would slide up a second time
      sh.style.animation = dim.style.animation = 'none';
    })?.finished.finally(() => { const L = $('layer'); L.querySelectorAll('.sheet,.dim,.hero .cover').forEach(e => { e.style.viewTransitionName = ''; }); });
    return;
  }
  openBookNow(id);
}
function openBookNow(id) {
  sheet('book:' + id, (el, first) => {
    const b = B(id); if (!b) { closeLayer(); return; }
    const keep = el.scrollTop, [bg] = palOf(b);
    const qs = S.quotes.filter(q => q.bookId === id);
    const days = daysBetween(b.start, b.end);
    const showR = !ro() || S.pub.showR, showQ = !ro() || S.pub.showQ;
    const newQ = el.querySelector('#nq') ? el.querySelector('#nq').value : '', newP = el.querySelector('#np') ? el.querySelector('#np').value : '';
    el.innerHTML = `<div class="hero" style="background:${tint(bg)}"><div class="bar"><button class="rb" data-x aria-label="Close">${I.x.replace('<svg', '<svg width="16" height="16"')}</button>${ro() ? '' : `<button class="rb" data-edit aria-label="Edit">${I.pen}</button>`}</div>
      ${coverHTML(b, 'big')}
      <h2 class="serif">${esc(b.title)}</h2><div class="au">${esc(b.author || 'Unknown author')}</div>
      <div class="mt">${esc([b.genre, b.year, b.pages ? b.pages + ' pages' : '', b.format].filter(Boolean).join(' · '))}</div></div>
      <div class="sh-body">
      ${ro() ? `<div style="text-align:center;margin-top:18px;font-weight:600;color:var(--accent)">${STATUS[b.status]}</div>`
        : `<div class="seg" style="margin-top:18px">${[['queue', 'To read'], ['reading', 'Reading'], ['done', 'Read'], ['dropped', 'Skipped']].map(([k, t]) => `<button data-st="${k}" class="${b.status === k ? 'on' : ''}">${t}</button>`).join('')}</div>`}
      ${b.status !== 'queue' ? `<div class="lbl">Reading</div><div class="grp">
        <div class="gi"><span class="grow">Started</span><span class="val">${fmtDate(b.start)}</span></div>
        ${b.status === 'done' || b.status === 'dropped' ? `<div class="gi"><span class="grow">${b.status === 'done' ? 'Finished' : 'Skipped'}</span><span class="val">${fmtDate(b.end)}${days != null ? ' · ' + days + ' ' + plural(days, 'day', 'days') : ''}</span></div>` : ''}
        ${b.status === 'done' && showR ? `<div class="gi"><span class="grow">Rating</span><span>${[1, 2, 3, 4, 5].map(n => `<button class="star ${n <= (b.rating || 0) ? 'on' : ''}" data-rate="${n}" aria-label="Rating ${n}" ${ro() ? 'disabled' : ''}>★</button>`).join('')}</span></div>` : ''}
        ${b.status === 'dropped' ? `<div class="gi"><span class="grow">Why</span><span class="val" style="max-width:62%">${esc(b.why || '—')}</span></div>` : ''}
        ${ro() ? '' : `<button class="gi btn" data-edit>Edit dates</button>`}
      </div>` : ro() ? '' : `<div class="grp" style="margin-top:14px"><button class="gi btn" data-top>Read next</button></div>`}
      ${b.review && showR ? `<div class="lbl">Review</div><div class="tile desc">${esc(b.review)}</div>` : ''}
      ${b.desc ? `<div class="lbl">About the book</div><div class="desc ${descOpen ? '' : 'clamp'}">${esc(b.desc)}</div>${b.desc.length > 260 ? `<button class="more" data-more>${descOpen ? 'Show less' : 'More'}</button>` : ''}` : ''}
      ${showQ ? `<div class="lbl">Quotes and notes · ${qs.length}</div>
        ${qs.map(q => `<div class="q"><div class="qt">«${esc(q.text)}»</div><div class="qm">${q.page ? 'p. ' + esc(q.page) : ''}</div>${ro() ? '' : `<button class="x" data-delq="${q.id}" aria-label="Delete quote">${delArmed === q.id ? '<span style="color:var(--danger);font-size:12px;font-weight:700">Delete?</span>' : I.x.replace('<svg', '<svg width="12" height="12"')}</button>`}</div>`).join('')}
        ${ro() ? (qs.length ? '' : '<div class="foot">None yet</div>') : `<div class="addq"><label for="np" class="sr">Page</label><input id="np" inputmode="numeric" placeholder="p." style="width:68px" value="${esc(newP)}"><label for="nq" class="sr">Quote or note</label><input id="nq" placeholder="Quote or note" style="flex:1" value="${esc(newQ)}"><button class="rb" data-addq aria-label="Add quote" style="background:var(--accent);color:var(--on-accent);box-shadow:none">${I.plus.replace('<svg', '<svg width="18" height="18"')}</button></div><div class="err" id="qErr"></div>`}` : ''}
      ${ro() ? '' : `<div class="grp" style="margin-top:26px"><button class="gi danger center" data-del>${delArmed === 'book' ? 'Tap again to delete the book' : 'Delete book'}</button></div>`}
      </div>`;
    if (!first) el.scrollTop = keep;
    el.querySelector('[data-x]').onclick = closeLayer;
    el.querySelectorAll('[data-edit]').forEach(x => x.onclick = () => openEdit(b));
    el.querySelectorAll('[data-st]').forEach(x => x.onclick = () => { if (x.dataset.st === b.status) return; if (x.dataset.st === 'dropped') { openEdit({ ...b, status: 'dropped', end: b.end || todayIso() }, null, 'Why did you skip it?'); return; } setStatus(b, x.dataset.st); });
    el.querySelectorAll('[data-rate]').forEach(x => x.onclick = () => saveBook({ ...b, rating: +x.dataset.rate === b.rating ? 0 : +x.dataset.rate }));
    const tp = el.querySelector('[data-top]'); if (tp) tp.onclick = () => { saveBook({ ...b, order: Math.min(0, ...S.books.filter(x => x.status === 'queue').map(x => x.order ?? 0)) - 10 }); toast('It is now first in your queue'); };
    const mr = el.querySelector('[data-more]'); if (mr) mr.onclick = () => { descOpen = !descOpen; refreshSheet(); };
    el.querySelectorAll('[data-delq]').forEach(x => x.onclick = () => { if (delArmed !== x.dataset.delq) { delArmed = x.dataset.delq; refreshSheet(); setTimeout(() => { delArmed = null; refreshSheet(); }, 3000); return; } delArmed = null; S.quotes = S.quotes.filter(q => q.id !== x.dataset.delq); store.deleteQuote(S.user.uid, x.dataset.delq); render(); });
    const aq = el.querySelector('[data-addq]');
    if (aq) aq.onclick = () => {
      const text = el.querySelector('#nq').value.trim(), page = el.querySelector('#np').value.replace(/\D/g, '');
      if (!text) { el.querySelector('#qErr').textContent = 'Type the text first'; return; }
      const q = { id: uid8(), bookId: id, page, text: text.slice(0, 2000), created: Date.now() };
      S.quotes.unshift(q); store.saveQuote(S.user.uid, q);
      el.querySelector('#nq').value = ''; el.querySelector('#np').value = '';
      render(); toast('Quote saved');
    };
    const dl = el.querySelector('[data-del]');
    if (dl) dl.onclick = () => { if (delArmed !== 'book') { delArmed = 'book'; refreshSheet(); setTimeout(() => { if (delArmed === 'book') { delArmed = null; refreshSheet(); } }, 3500); return; }
      delArmed = null; S.books = S.books.filter(x => x.id !== id); store.deleteBook(S.user.uid, id);
      S.quotes.filter(q => q.bookId === id).forEach(q => store.deleteQuote(S.user.uid, q.id)); S.quotes = S.quotes.filter(q => q.bookId !== id);
      closeLayer(); render(); toast('Book deleted'); };
  });
}

// ---------- adding and editing ----------
// date with selectable precision: day / month / year only
function dateField(name, label, val) {
  const prec = !val ? 'day' : val.length === 4 ? 'year' : val.length === 7 ? 'month' : 'day';
  const input = prec === 'year' ? `<input type="number" inputmode="numeric" min="1900" max="2100" placeholder="2024" data-date="${name}" value="${esc(val ? val.slice(0, 4) : '')}" style="width:90px">`
    : prec === 'month' ? `<input type="month" data-date="${name}" value="${esc(val ? val.slice(0, 7) : '')}">`
    : `<input type="date" data-date="${name}" value="${esc(val || '')}">`;
  return `<div class="gi" style="flex-wrap:wrap;gap:8px 14px"><span class="grow">${label}</span>${input}
    <div class="seg" style="width:100%;margin-bottom:4px">${[['day', 'Day'], ['month', 'Month'], ['year', 'Year only']].map(([k, t]) => `<button type="button" data-prec="${name}:${k}" class="${prec === k ? 'on' : ''}" style="height:30px;font-size:13px">${t}</button>`).join('')}</div></div>`;
}
function openEdit(book, prefill, focusWhy) {
  const isNew = !book || !B(book.id);
  const f = isNew ? newBook(prefill || {}) : { ...book };
  if (isNew && f.status === 'reading' && !f.start) f.start = todayIso();
  if (isNew && f.status === 'done' && !f.end) f.end = todayIso();
  let err = '';
  const read = el => {
    const g = s => el.querySelector(s);
    f.title = g('#eT').value.trim(); f.author = g('#eA').value.trim(); f.genre = g('#eG').value.trim(); f.year = g('#eY').value.trim();
    f.pages = g('#eP').value.replace(/\D/g, ''); f.isbn = g('#eI').value.replace(/[^0-9Xx]/g, '');
    f.review = g('#eR') ? g('#eR').value.trim() : f.review; f.why = g('#eW') ? g('#eW').value.trim() : f.why; f.desc = g('#eD').value.trim();
    el.querySelectorAll('[data-date]').forEach(i => { const v = i.value.trim(); f[i.dataset.date] = i.type === 'number' ? (/^\d{4}$/.test(v) ? v : '') : v; });
  };
  sheet('edit', (el, first) => {
    if (!first) read(el);
    const genres = [...new Set(S.books.map(b => b.genre).filter(Boolean))];
    el.innerHTML = `<div class="sh-head"><button class="tbtn" data-x>Cancel</button><b>${isNew ? 'New book' : 'Edit'}</b><button class="tbtn" data-save>${isNew ? 'Add' : 'Done'}</button></div>
      <div class="sh-body">
        <div style="display:flex;gap:14px;align-items:flex-end;margin-bottom:6px"><div style="width:76px;height:114px;flex:none">${coverHTML(f, '', 76)}</div>
          <div style="flex:1;color:var(--text2);font-size:13px">${f.cover ? 'Cover from the book database' : 'No cover — a colored one will be generated'}</div></div>
        <div class="err">${esc(err)}</div>
        <div class="grp">
          <label class="gi"><span style="width:96px">Title</span><input type="text" id="eT" value="${esc(f.title)}" placeholder="Required" style="text-align:left;color:var(--text)"></label>
          <label class="gi"><span style="width:96px">Author</span><input type="text" id="eA" value="${esc(f.author)}" placeholder="Author name" style="text-align:left;color:var(--text)"></label>
          <label class="gi"><span style="width:96px">Genre</span><input type="text" id="eG" list="genreList" value="${esc(f.genre)}" placeholder="Novel, non-fiction…" style="text-align:left;color:var(--text)"><datalist id="genreList">${genres.map(g => `<option value="${esc(g)}">`).join('')}</datalist></label>
          <label class="gi"><span style="width:96px">Year</span><input type="number" inputmode="numeric" id="eY" value="${esc(f.year)}" style="text-align:left;color:var(--text)"></label>
          <label class="gi"><span style="width:96px">Pages</span><input type="number" inputmode="numeric" id="eP" value="${esc(f.pages)}" style="text-align:left;color:var(--text)"></label>
          <label class="gi"><span style="width:96px">ISBN</span><input type="text" inputmode="numeric" id="eI" value="${esc(f.isbn)}" style="text-align:left;color:var(--text)"></label>
        </div>
        <div class="lbl">Format</div><div class="seg">${FORMATS.map(x => `<button type="button" data-fmt="${x}" class="${f.format === x ? 'on' : ''}">${x}</button>`).join('')}</div>
        <div class="lbl">Status</div><div class="seg">${[['queue', 'To read'], ['reading', 'Reading'], ['done', 'Read'], ['dropped', 'Skipped']].map(([k, t]) => `<button type="button" data-est="${k}" class="${f.status === k ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${f.status !== 'queue' ? `<div class="lbl">Dates</div><div class="grp">${dateField('start', 'Started', f.start)}${f.status === 'done' || f.status === 'dropped' ? dateField('end', f.status === 'done' ? 'Finished' : 'Skipped', f.end) : ''}</div>
          <div class="foot">Any past date works. Don’t remember the day? Pick “Month” or “Year only”.</div>` : ''}
        ${f.status === 'done' ? `<div class="lbl">Rating</div><div class="grp"><div class="gi" style="justify-content:center">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star ${n <= (f.rating || 0) ? 'on' : ''}" data-erate="${n}" aria-label="Rating ${n}" style="font-size:32px">★</button>`).join('')}</div></div>
          <div class="lbl">Review</div><textarea class="field" id="eR" placeholder="A few words about the book">${esc(f.review)}</textarea>` : ''}
        ${f.status === 'dropped' ? `<div class="lbl">Why you skipped it</div><textarea class="field" id="eW" placeholder="Briefly" style="min-height:60px">${esc(f.why)}</textarea>` : ''}
        <div class="lbl">About the book</div><textarea class="field" id="eD" placeholder="Description">${esc(f.desc)}</textarea>
      </div>`;
    el.querySelector('[data-x]').onclick = () => { if (!isNew && openSheetId === 'edit') openBook(f.id); else closeLayer(); };
    el.querySelectorAll('[data-fmt]').forEach(x => x.onclick = () => { f.format = x.dataset.fmt; refreshSheet(); });
    el.querySelectorAll('[data-est]').forEach(x => x.onclick = () => { read(el); f.status = x.dataset.est; if (f.status === 'reading' && !f.start) f.start = todayIso(); if ((f.status === 'done' || f.status === 'dropped') && !f.end) f.end = todayIso(); sheetRender(el, true); });
    el.querySelectorAll('[data-erate]').forEach(x => x.onclick = () => { f.rating = +x.dataset.erate === f.rating ? 0 : +x.dataset.erate; refreshSheet(); });
    el.querySelectorAll('[data-prec]').forEach(x => x.onclick = () => {
      read(el); const [name, p] = x.dataset.prec.split(':'); const v = f[name] || '';
      const y = v.slice(0, 4) || String(new Date().getFullYear()), m = v.slice(5, 7) || pad(new Date().getMonth() + 1), d = v.slice(8, 10) || '01';
      f[name] = p === 'year' ? y : p === 'month' ? `${y}-${m}` : `${y}-${m}-${d}`;
      sheetRender(el, true);
    });
    el.querySelector('[data-save]').onclick = () => {
      read(el);
      if (!f.title) { err = 'Enter a title'; sheetRender(el, true); el.scrollTop = 0; return; }
      if (f.start && f.end && f.end < f.start.slice(0, f.end.length)) { err = 'The end date is before the start date'; sheetRender(el, true); el.scrollTop = 0; return; }
      if (f.status === 'queue') { f.start = f.start || ''; }
      saveBook(f);
      if (isNew) { S.tab = f.status === 'dropped' ? 'done' : f.status; if (f.status === 'dropped') S.showSkipped = true; S.view = 'lib'; S.genre = ''; toast('Book added'); closeLayer(); render(); }
      else { toast('Saved'); openBook(f.id); }
    };
    if (first && focusWhy) setTimeout(() => el.querySelector('#eW') && el.querySelector('#eW').focus(), 400);
  });
}

// ---------- barcode scanner ----------
let cam = null, scanLoop = null, scanReady = null;
function stopCamera() { clearTimeout(scanLoop); scanLoop = null; if (cam) { cam.getTracks().forEach(t => t.stop()); cam = null; } }
function zxingReady() {
  if (!scanReady) { prepareZXingModule({ overrides: { locateFile: (p, prefix) => p.endsWith('.wasm') ? '/zxing_reader.wasm' : prefix + p } }); scanReady = true; }
}
function openScan() {
  zxingReady();
  let state = 'start', found = null, msg = '';
  sheet('scan', el => {
    el.innerHTML = `<div class="sh-head"><b class="serif" style="font-size:24px">Scanner</b><button class="rb" data-x aria-label="Close">${I.x.replace('<svg', '<svg width="16" height="16"')}</button></div>
      <div class="sh-body">
        <div class="vf"><video id="vid" playsinline muted></video><div class="frame"></div>${state === 'scan' ? '<div class="line"></div>' : ''}<div class="hint">${esc(msg || (state === 'scan' ? 'Point at the barcode on the back of the book' : state === 'look' ? 'Looking up the book…' : ''))}</div></div>
        ${found ? `<div class="rise"><div style="display:flex;gap:14px;align-items:center;margin-top:16px"><div style="width:60px;height:90px;flex:none">${coverHTML(found, 'mini', 60)}</div><div><div style="font-weight:600;font-size:17px">${esc(found.title)}</div><div style="color:var(--text2);font-size:14px">${esc([found.author, found.year, found.pages ? found.pages + ' pages' : ''].filter(Boolean).join(' · '))}</div></div></div>
          <div class="lbl">Add to</div><div style="display:flex;gap:8px">${[['queue', 'To read'], ['reading', 'Reading'], ['done', 'Read']].map(([k, t]) => `<button class="pill soft" data-to="${k}" style="flex:1;padding:0">${t}</button>`).join('')}</div>
          <button class="pill soft" data-again style="margin-top:10px;color:var(--accent)">Scan another</button></div>` : ''}
        ${state === 'start' ? `<button class="pill" data-go-cam style="margin-top:16px">Turn on camera</button>` : ''}
        ${state === 'notfound' ? `<button class="pill soft" data-again style="margin-top:12px">Scan again</button><button class="pill soft" data-manual style="margin-top:8px">Add manually</button>` : ''}
        <div class="foot">The ISBN barcode is usually on the back cover and starts with 978 or 979.</div>
      </div>`;
    const v = el.querySelector('#vid');
    if (cam && v) { v.srcObject = cam; v.play().catch(() => {}); }
    el.querySelector('[data-x]').onclick = closeLayer;
    const go = el.querySelector('[data-go-cam]'); if (go) go.onclick = startCam;
    el.querySelectorAll('[data-again]').forEach(b => b.onclick = () => { found = null; msg = ''; startCam(); });
    const mn = el.querySelector('[data-manual]'); if (mn) mn.onclick = () => openEdit(null, { isbn: msg.replace(/\D/g, ''), status: 'queue' });
    el.querySelectorAll('[data-to]').forEach(b => b.onclick = () => {
      if (S.books.some(x => found.isbn && x.isbn === found.isbn)) { toast('This book is already on your shelf'); return; }
      openEdit(null, { ...found, status: b.dataset.to });
    });
  }, true);
  async function startCam() {
    stopCamera();
    try { cam = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
    catch (e) { msg = 'No camera access. Allow it in your settings'; state = 'start'; refreshSheet(); return; }
    state = 'scan'; refreshSheet(); tick();
  }
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
  async function tick() {
    const v = document.querySelector('#vid');
    if (!cam || !v || openSheetId !== 'scan') return;
    if (v.videoWidth) {
      const w = Math.min(960, v.videoWidth), h = Math.round(v.videoHeight * w / v.videoWidth);
      cv.width = w; cv.height = h; ctx.drawImage(v, 0, 0, w, h);
      try {
        const res = await readBarcodes(ctx.getImageData(0, 0, w, h), { formats: ['EAN-13'], tryHarder: true, maxNumberOfSymbols: 1 });
        const code = res && res[0] && res[0].text;
        if (code && /^97[89]\d{10}$/.test(code)) {
          stopCamera(); try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
          state = 'look'; msg = 'ISBN ' + code; refreshSheet();
          const b = await lookupISBN(code);
          if (b) { found = b; state = 'found'; msg = 'ISBN ' + code; } else { state = 'notfound'; msg = 'No book found for ISBN ' + code; }
          refreshSheet(); return;
        }
      } catch (e) {}
    }
    scanLoop = setTimeout(tick, 180);
  }
}

// ===================== Import and export =====================
function pickImport() { const f = $('fileIn'); f.value = ''; f.click(); }
$('fileIn').onchange = async e => {
  const file = e.target.files && e.target.files[0]; if (!file) return;
  let text = await file.text();
  let rows = [];
  try {
    if (/\.json$/i.test(file.name) || /^\s*[\[{]/.test(text)) rows = fromJSON(JSON.parse(text));
    else rows = fromCSV(text);
  } catch (err) { toast('Unrecognized file format'); return; }
  if (!rows.length) { toast('No books found in the file'); return; }
  previewImport(rows, file.name);
};
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0];
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : ',';
  const out = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); out.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); out.push(row); }
  return out.filter(r => r.some(x => x.trim()));
}
const COLS = {
  title: ['название', 'title', 'книга', 'book'], author: ['автор', 'author', 'авторы', 'authors'], status: ['статус', 'status', 'exclusive shelf', 'полка', 'shelf'],
  start: ['начал', 'start', 'начало', 'date started', 'started'], end: ['закончил', 'end', 'прочитал', 'дата прочтения', 'date read', 'finished', 'окончание', 'конец'],
  rating: ['оценка', 'rating', 'my rating'], isbn: ['isbn', 'isbn13'], genre: ['жанр', 'genre'], format: ['формат', 'format', 'binding'],
  pages: ['страниц', 'pages', 'number of pages'], year: ['год издания', 'year', 'year published', 'original publication year'], review: ['отзыв', 'review', 'my review'],
  why: ['почему бросил', 'why'], desc: ['описание', 'description']
};
function statusOf(v, hasEnd) {
  v = norm(v);
  if (/брос|dropp|skip|abandon|did not finish|dnf/.test(v)) return 'dropped';
  if (/^чита|reading|currently|сейчас/.test(v)) return 'reading';
  if (/хоч|очеред|to read|want|queue|plan/.test(v)) return 'queue';
  if (/прочит|read|done|finish|готов/.test(v)) return 'done';
  return hasEnd ? 'done' : '';
}
function normalizeRow(o) {
  const g = k => { for (const n of COLS[k]) { const key = Object.keys(o).find(x => norm(x) === norm(n)); if (key != null && String(o[key]).trim() !== '') return String(o[key]).trim(); } return ''; };
  const title = g('title').replace(/\s*\([^)]*#\d+\)\s*$/, '');
  if (!title) return null;
  const end = parseDate(g('end')), start = parseDate(g('start'));
  let isbn = g('isbn').replace(/[^0-9Xx]/g, '');
  const rating = Math.max(0, Math.min(5, Math.round(+String(g('rating')).replace(',', '.') || 0)));
  const fmt = g('format'); const format = /аудио|audio/i.test(fmt) ? 'Audio' : /электр|kindle|ebook|e-book|digital/i.test(fmt) ? 'E-book' : fmt ? 'Paper' : '';
  return { title, author: g('author'), status: statusOf(g('status'), !!end), start, end, rating, isbn, genre: g('genre'), format, pages: g('pages').replace(/\D/g, ''), year: (g('year').match(/\d{4}/) || [''])[0], review: g('review'), why: g('why'), desc: g('desc') };
}
function fromCSV(text) {
  const t = parseCSV(text); if (t.length < 2) return [];
  const head = t[0];
  return t.slice(1).map(r => { const o = {}; head.forEach((h, i) => { o[h] = r[i] || ''; }); return normalizeRow(o); }).filter(Boolean);
}
function fromJSON(j) {
  if (j && j.app === 'polka' && Array.isArray(j.books)) return j.books.map(b => ({ ...b, _full: true, _quotes: (j.quotes || []).filter(q => q.bookId === b.id) }));
  const arr = Array.isArray(j) ? j : Array.isArray(j.books) ? j.books : [];
  return arr.map(normalizeRow).filter(Boolean);
}
function matchBook(r) {
  return S.books.find(b => (r.id && b.id === r.id) || (r.isbn && b.isbn && b.isbn === r.isbn) || (norm(b.title) === norm(r.title) && (!r.author || !b.author || norm(b.author) === norm(r.author))));
}
function previewImport(rows, name) {
  const plan = rows.map(r => ({ r, m: matchBook(r) }));
  const nNew = plan.filter(p => !p.m).length, nUpd = plan.length - nNew;
  let enrich = true;
  sheet('import', el => {
    el.innerHTML = `<div class="sh-head"><button class="tbtn" data-x>Cancel</button><b>Import</b><button class="tbtn" data-go-imp>Import</button></div>
      <div class="sh-body">
        <div class="tiles"><div class="tile"><span>New books</span><b>${nNew}</b></div><div class="tile"><span>To update</span><b>${nUpd}</b></div></div>
        <div class="foot">${esc(name)}. Books already on your shelf won’t be duplicated: only the fields from the file, such as reading dates, will be updated.</div>
        <div class="grp" style="margin-top:14px"><label class="gi"><span class="grow">Fetch covers and descriptions</span><input type="checkbox" class="switch" id="impEnrich" ${enrich ? 'checked' : ''}></label></div>
        <div class="lbl">In the file</div>
        <div class="grp">${plan.slice(0, 60).map(({ r, m }) => `<div class="gi"><div class="grow"><div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.title)}</div><div style="font-size:13px;color:var(--text2)">${esc([r.author, r.status ? STATUS[r.status] : '', r.end ? 'read ' + shortDate(r.end) : ''].filter(Boolean).join(' · '))}</div></div><span style="font-size:12px;color:${m ? 'var(--text2)' : 'var(--accent)'};font-weight:600">${m ? 'update' : 'new'}</span></div>`).join('')}</div>
        ${plan.length > 60 ? `<div class="foot">…and ${plan.length - 60} more</div>` : ''}
      </div>`;
    el.querySelector('[data-x]').onclick = closeLayer;
    el.querySelector('#impEnrich').onchange = e => { enrich = e.target.checked; };
    el.querySelector('[data-go-imp]').onclick = async () => {
      const out = [], quotes = [];
      let order = Math.max(0, ...S.books.filter(b => b.status === 'queue').map(b => b.order ?? 0));
      plan.forEach(({ r, m }) => {
        const fields = {};
        Object.keys(r).forEach(k => { if (k[0] !== '_' && r[k] !== '' && r[k] != null && !(k === 'rating' && !r[k])) fields[k] = r[k]; });
        if (m) { const nb = { ...m, ...fields, id: m.id, looked: enrich ? false : m.looked, updated: Date.now() };
          if (fields.end && !fields.start && nb.start && nb.start.slice(0, fields.end.length) > fields.end) nb.start = '';   // the old start date is after the new end date
          out.push(nb); }
        else { const nb = newBook({ ...fields, status: fields.status || 'queue' }); if (nb.status === 'queue') nb.order = (order += 10); if (!enrich) nb.looked = true; out.push(r._full ? { ...nb, ...fields } : nb); }
        if (r._quotes) r._quotes.forEach(q => { if (!S.quotes.some(x => x.id === q.id)) quotes.push(q); });
      });
      out.forEach(b => { const i = S.books.findIndex(x => x.id === b.id); if (i > -1) S.books[i] = b; else S.books.push(b); });
      closeLayer(); render();
      await store.saveBooks(S.user.uid, out);
      quotes.forEach(q => store.saveQuote(S.user.uid, q));
      toast(`Done: ${nNew} new, ${nUpd} updated`);
      if (enrich) { enriching = false; setTimeout(enrichQueue, 800); }
    };
  });
}
function download(name, text, type) {
  const blob = new Blob([text], { type });
  const file = typeof File === 'function' ? new File([blob], name, { type }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
const csvCell = v => { v = String(v == null ? '' : v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const CSV_HEAD = ['Title', 'Author', 'Status', 'Started', 'Finished', 'Rating', 'Genre', 'Format', 'Pages', 'Year', 'ISBN', 'Review', 'Why'];
function toCSV(list) {
  const st = { queue: 'want to read', reading: 'reading', done: 'read', dropped: 'skipped' };
  return '﻿' + [CSV_HEAD, ...list.map(b => [b.title, b.author, st[b.status], b.start, b.end, b.rating || '', b.genre, b.format, b.pages, b.year, b.isbn, b.review, b.why])].map(r => r.map(csvCell).join(',')).join('\n');
}
function openExport() {
  sheet('export', el => {
    el.innerHTML = `<div class="sh-head"><span style="min-width:72px"></span><b>Export</b><button class="tbtn" data-x>Done</button></div><div class="sh-body">
      <div class="grp">
        <button class="gi" data-e="csv">${I.file.replace('<svg', '<svg width="22" height="22" style="color:var(--accent)"')}<div class="grow"><div>CSV spreadsheet</div><div style="font-size:13px;color:var(--text2)">Opens in Numbers, Excel and Google Sheets</div></div></button>
        <button class="gi" data-e="json">${I.down.replace('<svg', '<svg width="22" height="22" style="color:var(--accent)"')}<div class="grow"><div>Backup</div><div style="font-size:13px;color:var(--text2)">All books, quotes and covers — for restoring</div></div></button>
        <button class="gi" data-e="tpl">${I.pen.replace('<svg', '<svg width="22" height="22" style="color:var(--accent)"')}<div class="grow"><div>Empty template</div><div style="font-size:13px;color:var(--text2)">To fill in books and dates in a spreadsheet</div></div></button>
      </div>
      <div class="foot">An easy way to set dates for many books at once: export the CSV, fill in the “Finished” column (just a year or month works too: 2023, 2023-05) and load the file back with Import. Books are updated, not duplicated.</div></div>`;
    el.querySelector('[data-x]').onclick = closeLayer;
    el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => {
      const d = todayIso();
      if (b.dataset.e === 'csv') download(`polka-${d}.csv`, toCSV(S.books), 'text/csv');
      if (b.dataset.e === 'json') download(`polka-${d}.json`, JSON.stringify({ app: 'polka', version: 1, exported: new Date().toISOString(), books: S.books, quotes: S.quotes }, null, 1), 'application/json');
      if (b.dataset.e === 'tpl') download('bookshelf-template.csv', '﻿' + [CSV_HEAD, ['Example Book', 'Author Name', 'read', '2023-03', '2023-04', '5', 'Novel', 'Paper', '', '', '', '', ''], ['Another Example', 'Another Author', 'read', '', '2022', '', '', '', '', '', '', '', '']].map(r => r.map(csvCell).join(',')).join('\n'), 'text/csv');
    });
  }, true);
}

// ===================== Queue drag and drop =====================
function bindDrag() {
  const box = $('rows'); if (!box) return;
  box.querySelectorAll('[data-grip]').forEach(h => {
    h.onpointerdown = e => {
      e.preventDefault();
      const row = h.closest('.row'); row.classList.add('drag'); dragging = true;
      // listen on window: moving the row in the DOM loses pointer capture
      const move = ev => {
        const sib = [...box.children].filter(r => r !== row);
        for (const s of sib) { const r = s.getBoundingClientRect(); if (ev.clientY < r.top + r.height / 2) { if (row.nextSibling !== s) box.insertBefore(row, s); return; } }
        if (box.lastElementChild !== row) box.appendChild(row);
      };
      const up = () => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        row.classList.remove('drag'); dragging = false;
        const ids = [...box.children].map(r => r.dataset.id);
        const changed = [];
        ids.forEach((id, i) => { const b = B(id); if (b && b.order !== (i + 1) * 10) { b.order = (i + 1) * 10; b.updated = Date.now(); changed.push(b); } });
        if (changed.length) { store.saveBooks(S.user.uid, changed); schedulePublic(); }
        if (renderPending) { renderPending = false; render(); }
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    };
  });
}

// ===================== Year in review: stories =====================
let storyTimer = null, storyRAF = null;
function stopStories() { clearTimeout(storyTimer); cancelAnimationFrame(storyRAF); storyTimer = null; }
function storySlides(y) {
  const D = yearData(y), prev = yearData(y - 1), R = D.R;
  const sl = [];
  const covers = list => list.filter(Boolean).slice(0, 6);
  sl.push({ bg: '#1F3B36', fg: '#F4F2ED', kick: `${y} in review`, big: String(R.length), txt: `${plural(R.length, 'book', 'books')} read this year`, covers: covers(R) });
  if (D.pages) sl.push({ bg: '#D9583B', fg: '#FFF4EC', kick: 'Pages', big: D.pages.toLocaleString('en-US'), txt: `pages — about ${Math.max(1, Math.round(D.pages / 365))} a day, every day` });
  const mi = D.months.indexOf(Math.max(...D.months));
  if (D.months[mi] > 0) sl.push({ bg: '#3B4A7A', fg: '#EDEBF7', kick: 'Most bookish month', big: MONTHS1[mi], mid: true, txt: `${books_(D.months[mi])} in one month`, bars: D.months, hi: mi });
  if (D.genres.length) sl.push({ bg: '#C9A44B', fg: '#2A2214', kick: 'Favorite genre', big: D.genres[0][0], mid: true, txt: `${books_(D.genres[0][1])}${D.genres[1] ? ` · then ${D.genres[1][0].toLowerCase()}` : ''}` });
  if (D.authors.length && D.authors[0][1] > 1) sl.push({ bg: '#6B4E8C', fg: '#F4EEFB', kick: 'Your author of the year', big: D.authors[0][0], mid: true, txt: `${books_(D.authors[0][1])} by the same author`, covers: covers(R.filter(b => b.author === D.authors[0][0])) });
  const longest = R.filter(b => +b.pages).sort((a, b) => b.pages - a.pages)[0];
  if (longest) sl.push({ bg: '#2B2B2B', fg: '#E9E4D8', kick: 'The longest one', big: `${longest.pages} pages`, mid: true, txt: `«${longest.title}»${longest.author ? ' — ' + longest.author : ''}`, covers: [longest] });
  const fast = D.timed.filter(x => x.d >= 0).sort((a, b) => a.d - b.d)[0];
  if (fast && D.timed.length > 1) sl.push({ bg: '#5E8C5A', fg: '#F1F7EE', kick: 'Finished the fastest', big: `${Math.max(1, fast.d)} ${plural(Math.max(1, fast.d), 'day', 'days')}`, mid: true, txt: `«${fast.b.title}»`, covers: [fast.b] });
  const fives = R.filter(b => b.rating === 5);
  if (fives.length) sl.push({ bg: '#B03A48', fg: '#FCEFF1', kick: 'Five stars', big: String(fives.length), txt: plural(fives.length, 'book you gave the top rating', 'books you gave the top rating'), covers: covers(fives) });
  const qs = S.quotes.filter(q => R.some(b => b.id === q.bookId));
  if (qs.length) { const q = qs[hashOf(y) % qs.length], b = B(q.bookId); sl.push({ bg: '#F4F2ED', fg: '#1B1B1A', kick: 'Quote of the year', big: `«${q.text.length > 140 ? q.text.slice(0, 140) + '…' : q.text}»`, quote: true, txt: b ? b.title : '' }); }
  if (D.dropped) sl.push({ bg: '#A7A39A', fg: '#24231F', kick: 'Honestly', big: String(D.dropped), txt: `${plural(D.dropped, 'book', 'books')} you dropped. Fair enough — life is too short for boring books` });
  if (prev.R.length) { const d = R.length - prev.R.length; sl.push({ bg: '#2F5D62', fg: '#F3EEE3', kick: `${y} vs ${y - 1}`, big: (d > 0 ? '+' : d < 0 ? '−' : '') + Math.abs(d), txt: d > 0 ? `more books than the year before (${prev.R.length})` : d < 0 ? `fewer books than the year before (${prev.R.length}). It happens` : `the same as the year before` }); }
  sl.push({ bg: '#1B1B1A', fg: '#F4F2ED', kick: `My ${y} in books`, big: books_(R.length), mid: true, txt: D.avg ? `average rating ${D.avg.toFixed(1)} ★` : '', covers: R.slice(0, 18), mosaic: true });
  return sl;
}
function openStories(y) {
  const slides = storySlides(y); let i = 0, paused = false, t0 = 0, elapsed = 0;
  const DUR = 5500;
  const L = $('layer');
  openSheetId = 'stories'; sheetRender = null; lockScroll();
  const show = () => {
    const s = slides[i];
    L.innerHTML = `<div class="story" style="background:${s.bg};color:${s.fg}">
      <div class="bars">${slides.map((_, k) => `<i><b style="width:${k < i ? 100 : 0}%"></b></i>`).join('')}</div>
      <div class="top"><button data-share aria-label="Share">${I.up}</button><button data-x aria-label="Close">${I.x}</button></div>
      <div class="body anim">
        <div class="kick">${esc(s.kick)}</div>
        <div class="big ${s.mid ? 'mid' : ''}" style="${s.quote ? 'font-size:32px;line-height:1.25' : ''}">${esc(s.big)}</div>
        ${s.txt ? `<div class="txt">${esc(s.txt)}</div>` : ''}
        ${s.bars ? `<div class="mbars">${s.bars.map((v, k) => `<div class="${k === s.hi ? 'hi' : ''}" style="height:${v ? Math.max(6, v / Math.max(...s.bars) * 100) : 3}%"></div>`).join('')}</div>` : ''}
        ${s.covers && s.covers.length ? `<div class="covs ${s.mosaic ? 'mosaic' : ''}">${s.covers.map(b => coverHTML(b, s.mosaic ? 'mini' : '')).join('')}</div>` : ''}
      </div>
      <div class="tapl" data-prev></div><div class="tapr" data-next></div></div>`;
    const st = L.querySelector('.story');
    st.querySelector('[data-x]').onclick = closeLayer;
    const me = slides[i];
    if (!me.file) me.file = slideFile(me, y);
    st.querySelector('[data-share]').onclick = () => shareSlide(me);
    st.querySelector('[data-prev]').onclick = () => go(i - 1);
    st.querySelector('[data-next]').onclick = () => go(i + 1);
    st.onpointerdown = e => { if (e.target.closest('button')) return; paused = true; elapsed += performance.now() - t0; };
    st.onpointerup = st.onpointercancel = () => { if (paused) { paused = false; t0 = performance.now(); } };
    elapsed = 0; t0 = performance.now(); loop();
  };
  const go = k => { if (k < 0) k = 0; if (k >= slides.length) { closeLayer(); return; } i = k; show(); };
  const loop = () => {
    cancelAnimationFrame(storyRAF);
    storyRAF = requestAnimationFrame(function f() {
      if (openSheetId !== 'stories') return;
      const p = paused ? elapsed : elapsed + performance.now() - t0;
      const bar = L.querySelectorAll('.bars b')[i]; if (bar) bar.style.width = Math.min(100, p / DUR * 100) + '%';
      if (p >= DUR) { go(i + 1); return; }
      storyRAF = requestAnimationFrame(f);
    });
  };
  show();
}
// a 1080×1920 image for stories
function loadImg(src) { return new Promise(res => { if (!src) return res(null); const im = new Image(); im.crossOrigin = 'anonymous'; im.referrerPolicy = 'no-referrer'; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; setTimeout(() => res(null), 4000); }); }
function wrap(ctx, text, x, y, maxW, lh, maxLines = 6) {
  const words = String(text).split(/\s+/); let line = '', n = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++n >= maxLines - 1) { line += '…'; break; } } else line = t; }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}
async function drawCover(ctx, b, x, y, w, h, safe) {
  const [bg, ink] = palOf(b);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); ctx.restore();
  let ok = false;
  if (b.cover && safe) { const im = await loadImg(b.cover); if (im) { ctx.drawImage(im, x, y, w, h); ok = true; } }
  if (!ok) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w * .94, h); ctx.clip(); ctx.fillStyle = ink; ctx.font = `700 ${Math.round(w / 8)}px "Source Serif 4", Georgia, serif`; wrap(ctx, b.title, x + w * .14, y + w * .26, w * .74, w / 6.8, 5); ctx.restore(); }
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(x, y, Math.max(4, w * .04), h);
}
async function renderSlide(s, y, safe) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const ctx = c.getContext('2d');
  try { await document.fonts.load('700 80px "Source Serif 4"'); } catch (e) {}
  ctx.fillStyle = s.bg; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = s.fg; ctx.textBaseline = 'alphabetic';
  let yy = s.covers && s.covers.length ? 560 : 760;
  ctx.globalAlpha = .85; ctx.font = '600 44px -apple-system, "Segoe UI", Roboto, sans-serif'; ctx.fillText(s.kick.toUpperCase(), 96, yy); ctx.globalAlpha = 1;
  yy += 40;
  const bigSize = s.quote ? 70 : s.mid ? 120 : 260;
  ctx.font = `700 ${bigSize}px "Source Serif 4", Georgia, serif`;
  yy = wrap(ctx, s.big, 96, yy + bigSize * .9, 888, bigSize * 1.08, s.quote ? 7 : 3);
  if (s.txt) { ctx.globalAlpha = .92; ctx.font = '400 52px -apple-system, "Segoe UI", Roboto, sans-serif'; yy = wrap(ctx, s.txt, 96, yy + 30, 888, 68, 4); ctx.globalAlpha = 1; }
  if (s.bars) { const mx = Math.max(...s.bars), bw = 888 / 12; s.bars.forEach((v, k) => { const h = v ? Math.max(14, v / mx * 260) : 6; ctx.globalAlpha = k === s.hi ? 1 : .35; ctx.fillStyle = s.fg; ctx.fillRect(96 + k * bw + 6, yy + 300 - h, bw - 12, h); }); ctx.globalAlpha = 1; yy += 320; }
  if (s.covers && s.covers.length) {
    if (s.mosaic) { const n = 6, gap = 18, w = (888 - gap * (n - 1)) / n, h = w * 1.5; for (let k = 0; k < s.covers.length; k++) await drawCover(ctx, s.covers[k], 96 + (k % n) * (w + gap), yy + 50 + Math.floor(k / n) * (h + gap), w, h, safe); }
    else { const w = 210, h = 315, gap = 28; for (let k = 0; k < Math.min(4, s.covers.length); k++) await drawCover(ctx, s.covers[k], 96 + k * (w + gap), yy + 60, w, h, safe); }
  }
  ctx.globalAlpha = .6; ctx.fillStyle = s.fg; ctx.font = '600 36px -apple-system, "Segoe UI", Roboto, sans-serif'; ctx.fillText(`Bookshelf · ${y}`, 96, 1820); ctx.globalAlpha = 1;
  return c;
}
function slideFile(s, y) {
  const p = (async () => {
    let c = await renderSlide(s, y, true), blob = null;
    try { blob = await new Promise(r => c.toBlob(r, 'image/png')); } catch (e) { blob = null; }
    if (!blob) { c = await renderSlide(s, y, false); blob = await new Promise(r => c.toBlob(r, 'image/png')); }   // a cover blocked copying — draw generated ones instead
    s.ready = new File([blob], `polka-${y}.png`, { type: 'image/png' });
    return s.ready;
  })();
  p.catch(() => {});
  return p;
}
function shareSlide(s) {
  const file = s.ready;
  if (!file) { toast('Preparing the image… tap again in a second'); return; }
  if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file] }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ===================== Start-up =====================
// Service worker with automatic updates: check for a new version on launch and whenever the app
// returns to the foreground (iOS resumes installed apps without reloading them). When a new
// version takes over, reload once — unless the user is typing; then wait until later.
if ('serviceWorker' in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  let updatePending = false, reloading = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };
  const applyUpdate = () => { if (reloading) return; if (busy()) { updatePending = true; return; } reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) applyUpdate(); });
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (updatePending) applyUpdate(); else reg.update().catch(() => {});
    });
  }).catch(() => {});
  // show the running version (the service worker's cache name, e.g. "mood-v7" → "v7") at the bottom of the app
  navigator.serviceWorker.ready.then(reg => {
    if (!reg.active) return;
    const ch = new MessageChannel();
    ch.port1.onmessage = e => { const v = String(e.data || '').replace(/^.*-(v\d+)$/, '$1'); if (v) document.documentElement.style.setProperty('--app-ver', JSON.stringify(v)); };
    reg.active.postMessage('version', [ch.port2]);
  }).catch(() => {});
}
start();
