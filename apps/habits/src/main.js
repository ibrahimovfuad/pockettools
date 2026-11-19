import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, onSnapshot, deleteField
} from 'firebase/firestore';

// ================= Utilities =================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const wdi = d => (d.getDay() + 6) % 7;                 // Mon = 0 … Sun = 6
const monday = d => addDays(d, -wdi(d));
const fmt = (d, o) => new Intl.DateTimeFormat('en-US', o).format(d);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, one, many) => n === 1 ? one : many;
const pct = x => x == null ? '–' : Math.round(x * 100) + '%';
const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const WD = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const EMOJIS = ['💪', '🏃', '🧘', '📚', '💧', '🥗', '😴', '🦷', '✍️', '🧠', '🎯', '🚭', '🍎', '🚶', '🎸', '🌿', '☀️', '💊', '🧹', '💰'];
const TEMPLATES = [
  { name: 'Drink water', emoji: '💧', target: 8, unit: 'glasses' },
  { name: 'Workout', emoji: '💪' },
  { name: 'Read', emoji: '📚' },
  { name: 'Meditate', emoji: '🧘' },
  { name: 'In bed by 11 pm', emoji: '😴' },
  { name: 'No smoking', emoji: '🚭', kind: 'quit' },
  { name: 'No alcohol', emoji: '🍷', kind: 'quit' }
];

let toastId;
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastId); toastId = setTimeout(() => e.classList.remove('show'), 1800); }

// Tap and long-press on the same element
function press(el, onTap, onLong) {
  let t = null, long = false, sx = 0, sy = 0;
  const cancel = () => { if (t) { clearTimeout(t); t = null; } };
  el.addEventListener('pointerdown', e => { long = false; sx = e.clientX; sy = e.clientY; cancel(); if (onLong) t = setTimeout(() => { long = true; t = null; onLong(); }, 450); });
  el.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - sx, e.clientY - sy) > 10) cancel(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, cancel));
  el.addEventListener('click', e => { e.stopPropagation(); if (long) { long = false; return; } onTap(); });
  el.addEventListener('contextmenu', e => e.preventDefault());
}

// ================= Storage: Firebase or demo =================
const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
const DEMO = !CFG.apiKey || /^PASTE/.test(CFG.apiKey) || location.hash === '#demo';

function logPatch(hid, isoDate, c, note) {
  const md = isoDate.slice(5);
  return { habitId: hid, year: Number(isoDate.slice(0, 4)), d: { [md]: c > 0 ? c : deleteField() }, n: { [md]: note ? note : deleteField() } };
}
function parseLogs(docs) {
  const m = new Map();
  docs.forEach(x => {
    if (!x || !x.habitId) return;
    const hm = m.get(x.habitId) || new Map(); m.set(x.habitId, hm);
    const keys = new Set([...Object.keys(x.d || {}), ...Object.keys(x.n || {})]);
    keys.forEach(md => { const c = (x.d || {})[md] || 0, n = (x.n || {})[md] || ''; if (c || n) hm.set(`${x.year}-${md}`, { c, n }); });
  });
  return m;
}

function firebaseBackend() {
  const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname);
  const app = initializeApp({ ...CFG, authDomain: local ? `${CFG.projectId}.firebaseapp.com` : location.host });
  const auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence], popupRedirectResolver: browserPopupRedirectResolver });
  let db;
  try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) }); }
  catch (e) { db = getFirestore(app); }
  let subs = [];
  const fail = what => e => toast(what + ': ' + (e.code || e.message));
  return {
    onUser(cb) {
      getRedirectResult(auth).catch(e => { $('loginErr').textContent = authError(e); });
      onAuthStateChanged(auth, u => cb(u && { uid: u.uid, name: u.displayName || 'No name', email: u.email || '', photo: u.photoURL }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(auth, p); },
    signOut() { subs.forEach(f => f()); subs = []; return signOut(auth); },
    listen(uid, onHabits, onLogs) {
      subs.forEach(f => f());
      subs = [
        onSnapshot(collection(db, 'users', uid, 'habits'), s => { const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id })); onHabits(a); }, fail('Loading error')),
        onSnapshot(collection(db, 'users', uid, 'logs'), s => { const a = []; s.forEach(d => a.push(d.data())); onLogs(parseLogs(a)); }, fail('Loading error'))
      ];
    },
    // no await: on a bad connection the write goes to the local cache first and syncs later
    saveHabit(uid, h) { const { id, ...data } = h; setDoc(doc(db, 'users', uid, 'habits', id), data).catch(fail('Not saved')); },
    deleteHabit(uid, id, years) {
      deleteDoc(doc(db, 'users', uid, 'habits', id)).catch(fail('Not deleted'));
      years.forEach(y => deleteDoc(doc(db, 'users', uid, 'logs', `${id}_${y}`)).catch(() => {}));
    },
    setLog(uid, hid, d, c, note) { setDoc(doc(db, 'users', uid, 'logs', `${hid}_${d.slice(0, 4)}`), logPatch(hid, d, c, note), { merge: true }).catch(fail('Not saved')); },
    putYear(uid, hid, year, d, n) { setDoc(doc(db, 'users', uid, 'logs', `${hid}_${year}`), { habitId: hid, year: Number(year), d, n }, { merge: true }).catch(fail('Not saved')); }
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
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let cbH = null, cbL = null;
  const emit = () => {
    cbH && cbH(Object.values(read('habits-demo')));
    const L = read('habits-demo-logs');   // { hid: { iso: {c, n} } }
    const m = new Map(); Object.entries(L).forEach(([h, o]) => m.set(h, new Map(Object.entries(o)))); cbL && cbL(m);
  };
  return {
    onUser(f) { f({ uid: 'demo', name: 'Demo', email: 'Data stays on this device only', photo: null }); },
    signIn() { return Promise.resolve(); }, signOut() { toast('There is nothing to sign out of in demo mode'); },
    listen(uid, h, l) { cbH = h; cbL = l; emit(); },
    saveHabit(uid, h) { const a = read('habits-demo'); a[h.id] = h; write('habits-demo', a); emit(); },
    deleteHabit(uid, id) { const a = read('habits-demo'); delete a[id]; write('habits-demo', a); const L = read('habits-demo-logs'); delete L[id]; write('habits-demo-logs', L); emit(); },
    setLog(uid, hid, d, c, note) {
      const L = read('habits-demo-logs'); L[hid] = L[hid] || {};
      if (c > 0 || note) L[hid][d] = { c, n: note || '' }; else delete L[hid][d];
      write('habits-demo-logs', L); emit();
    },
    putYear(uid, hid, year, d, n) {
      const L = read('habits-demo-logs'); L[hid] = L[hid] || {};
      Object.keys({ ...d, ...n }).forEach(md => { L[hid][`${year}-${md}`] = { c: d[md] || 0, n: n[md] || '' }; });
      write('habits-demo-logs', L); emit();
    }
  };
}

const store = DEMO ? demoBackend() : firebaseBackend();

// ================= State =================
let user = null;
let habits = [];                 // all habits, including archived ones
let logs = new Map();            // habitId → Map(iso → {c, n})
let tab = 'home';
let detailId = null, detailMonth = 0, detailPeriod = 'week', detailOff = 0;
let statPeriod = 'week', statOff = 0;
let cache = new Map();           // habitId → {start, streak, total}

const active = () => habits.filter(h => !h.archived);
const H = id => habits.find(h => h.id === id);
const target = h => Math.max(1, h.target || 1);
const entry = (h, d) => { const m = logs.get(h.id); return (m && m.get(d)) || null; };
const count = (h, d) => { const e = entry(h, d); return e ? e.c || 0 : 0; };
const isQuit = h => h.kind === 'quit';
// "Break a habit": every day is clean by default, only slips are marked
const done = (h, d) => isQuit(h) ? d >= h.start && d <= iso(today()) && count(h, d) === 0 : count(h, d) >= target(h);
const slipped = (h, d) => isQuit(h) && count(h, d) > 0;
const isWeekly = h => !isQuit(h) && h.freq && h.freq.type === 'weekly';
const scheduled = (h, d) => isWeekly(h) || !h.freq || (h.freq.days || []).includes(wdi(d));

function freqText(h) {
  if (isQuit(h)) return `No slips since ${fmt(fromIso(h.start), { day: 'numeric', month: 'long', year: fromIso(h.start).getFullYear() === today().getFullYear() ? undefined : 'numeric' })}`;
  if (isWeekly(h)) { const n = h.freq.times; return `${n} ${plural(n, 'time', 'times')} a week`; }
  const ds = (h.freq && h.freq.days) || [0, 1, 2, 3, 4, 5, 6];
  if (ds.length === 7) return 'Every day';
  const k = ds.slice().sort().join('');
  if (k === '01234') return 'Weekdays';
  if (k === '56') return 'Weekends';
  return ds.slice().sort().map(i => WD[i]).join(', ');
}
const unitText = (h, n) => h.unit ? h.unit : plural(n, 'time', 'times');

// --- calculations ---
function weekDone(h, mon) {         // completed days of the week (iso), in order
  const out = [];
  for (let i = 0; i < 7; i++) { const k = iso(addDays(mon, i)); if (done(h, k)) out.push(k); }
  return out;
}
// expected vs done per day: weekly habits count as N/7 "expected" per day
function dayParts(h, d) {
  const k = iso(d), c = cache.get(h.id);
  if (!c || k < c.start || d > today()) return null;
  if (isQuit(h)) return { exp: 1, got: slipped(h, k) ? 0 : 1 };
  if (isWeekly(h)) {
    const list = weekDone(h, monday(d));
    return { exp: h.freq.times / 7, got: list.indexOf(k) > -1 && list.indexOf(k) < h.freq.times ? 1 : 0 };
  }
  if (!scheduled(h, d)) return { exp: 0, got: 0 };
  return { exp: 1, got: Math.min(1, count(h, k) / target(h)) };
}
function rateOver(hs, days) {
  let e = 0, g = 0;
  hs.forEach(h => days.forEach(d => { const p = dayParts(h, d); if (p) { e += p.exp; g += p.got; } }));
  return e > 0 ? Math.min(1, g / e) : null;
}

function computeCache() {
  cache = new Map();
  const t = today(), tIso = iso(t);
  habits.forEach(h => {
    let start = h.start || tIso;
    const m = logs.get(h.id);
    let total = 0;
    if (m && !isQuit(h)) m.forEach((v, k) => { if (k < start && v.c) start = k; if (v.c >= target(h)) total++; });
    const c = { start, total, cur: 0, best: 0 };
    cache.set(h.id, c);
    if (isQuit(h)) {                         // streak = consecutive days without a slip, including today
      let cur = 0, best = 0;
      for (let d = fromIso(start); d <= t; d = addDays(d, 1)) {
        if (slipped(h, iso(d))) cur = 0; else { cur++; total++; }
        best = Math.max(best, cur);
      }
      c.cur = cur; c.best = best; c.total = total; c.unit = 'day';
    } else if (isWeekly(h)) {                       // streak in weeks
      let cur = 0, best = 0;
      for (let w = monday(fromIso(start)); w <= t; w = addDays(w, 7)) {
        const ok = weekDone(h, w).length >= h.freq.times;
        const now = iso(w) === iso(monday(t));
        if (ok) cur++; else if (!now) cur = 0;
        best = Math.max(best, cur);
      }
      c.cur = cur; c.best = best; c.unit = 'week';
    } else {                                 // streak in days: scheduled days off do not break it
      let cur = 0, best = 0;
      for (let d = fromIso(start); d <= t; d = addDays(d, 1)) {
        const k = iso(d);
        if (done(h, k)) cur++;
        else if (scheduled(h, d) && k !== tIso) cur = 0;   // today is not over yet
        best = Math.max(best, cur);
      }
      c.cur = cur; c.best = best; c.unit = 'day';
    }
  });
}
const streakText = (c, n) => `${n} ${c.unit === 'week' ? plural(n, 'week', 'weeks') : plural(n, 'day', 'days')}`;

// ================= Start-up and sign-in =================
function start() {
  store.onUser(u => {
    user = u;
    $('login').classList.toggle('hide', !!u);
    $('main').classList.toggle('hide', !u);
    if (!u) { habits = []; logs = new Map(); closeDetail(true); return; }
    $('demoBanner').classList.toggle('hide', !DEMO);
    renderAccount();
    store.listen(u.uid, a => { habits = a.sort((x, y) => (x.created || 0) - (y.created || 0)); refresh(); }, m => { logs = m; refresh(); });
  });
  $('signInBtn').onclick = () => { $('loginErr').textContent = ''; store.signIn().catch(e => { $('loginErr').textContent = authError(e); }); };
}

function refresh() {
  computeCache();
  if (tab === 'home') renderHome();
  if (tab === 'stats') renderStats();
  if (tab === 'settings') renderArchive();
  if (detailId) { if (H(detailId)) renderDetail(); else closeDetail(true); }
}

// ================= Tabs =================
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
function showTab(t) {
  tab = t;
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hide', s.id !== 'tab-' + t));
  scrollTo(0, 0);
  refresh();
}

// ================= Home =================
const ICON_CHECK = '<svg class="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_FLAME = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8.6 1c.3 2.1-.6 3.3-1.6 4.4C6 6.5 5 7.6 5 9.4 5 11.4 6.4 13 8 13s3-1.4 3-3.3c0-.9-.3-1.7-.8-2.3.1.9-.3 1.6-1 1.9.4-1.9-.3-3.4-1-4.3 1.6.2 3.8 2 3.8 4.9C12 12.9 10.2 15 8 15s-4-2-4-5.2c0-2.5 1.4-4 2.6-5.3C7.7 3.3 8.6 2.4 8.6 1z"/></svg>';

const ICON_X = '<svg class="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
function checkBtn(h, d) {
  if (isQuit(h)) {
    if (d < h.start) return `<button class="check c${h.color}" data-check="${h.id}" aria-label="Not started yet"><svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="var(--c)" stroke-width="2.5" opacity=".3"/></svg></button>`;
    return slipped(h, d)
      ? `<button class="check slip c${h.color}" data-check="${h.id}" aria-label="Slip — tap to remove">${ICON_X}</button>`
      : `<button class="check done c${h.color}" data-check="${h.id}" aria-label="No slip — tap if you slipped">${ICON_CHECK}</button>`;
  }
  const c = count(h, d), t = target(h), full = c >= t;
  if (t === 1) return `<button class="check c${h.color} ${full ? 'done' : ''}" data-check="${h.id}" aria-label="Mark done">${full ? ICON_CHECK : `<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="var(--c)" stroke-width="2.5" opacity=".55"/></svg>`}</button>`;
  const r = 20, L = 2 * Math.PI * r, f = Math.min(1, c / t);
  return `<button class="check c${h.color} ${full ? 'done' : ''}" data-check="${h.id}" aria-label="Add">${full ? ICON_CHECK :
    `<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--empty)" stroke-width="4"/><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--c)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${L * f} ${L}" transform="rotate(-90 23 23)"/></svg><span class="num">${c}/${t}</span>`}</button>`;
}

function heatmap(h, weeks, opts = {}) {
  const t = today(), first = addDays(monday(t), -7 * (weeks - 1)), tg = target(h);
  let s = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(first, i), k = iso(d), c = count(h, k);
    const cls = d > t ? 'x' : isQuit(h) ? (k < h.start ? '' : c > 0 ? 's' : 'f') : c >= tg ? 'f' : c > 0 ? 'p' : '';
    s += `<i class="${cls}${opts.markToday && k === iso(t) ? ' t' : ''}"></i>`;
  }
  return s;
}

function todaySummary() {
  const t = today(), k = iso(t);
  let due = 0, ok = 0;
  active().forEach(h => {
    if (isWeekly(h)) {
      const before = weekDone(h, monday(t)).filter(x => x !== k).length;
      if (before < h.freq.times) { due++; if (done(h, k)) ok++; }
    } else if (scheduled(h, t)) { due++; if (done(h, k)) ok++; }
  });
  return { due, ok };
}

// how many weeks of history a habit has (from start to the current week)
const weeksSince = h => { const c = cache.get(h.id); return c ? Math.round((monday(today()) - monday(fromIso(c.start))) / (7 * 864e5)) + 1 : 1; };
const heatScroll = new Map();     // habitId → {left, atEnd}: history scroll position between re-renders

function renderHome() {
  const t = today();
  $('homeDate').textContent = cap(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' }));
  const body = $('homeBody'), list = active();
  if (!list.length) {
    body.innerHTML = `<div class="empty"><div class="big">🌱</div><b>No habits yet</b><p>Start with one or two — it makes them easier to keep. For example:</p>
      <div class="chips">${TEMPLATES.map((x, i) => `<button class="chip" data-tpl="${i}">${x.emoji} ${esc(x.name)}</button>`).join('')}</div>
      <div style="margin-top:22px"><button class="primary" id="emptyAdd">Custom habit</button></div></div>`;
    body.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => openEditor(null, TEMPLATES[b.dataset.tpl]));
    $('emptyAdd').onclick = () => openEditor();
    return;
  }
  const { due, ok } = todaySummary();
  const L = 2 * Math.PI * 22, f = due ? ok / due : 1;
  const w = Math.min(600, innerWidth) - 32 - 28;
  const fit = Math.max(8, Math.floor((w + 3) / 14));
  body.querySelectorAll('[data-hs]').forEach(el => heatScroll.set(el.dataset.hs, { left: el.scrollLeft, atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 }));
  let html = `<div class="today"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--empty)" stroke-width="6"/><circle cx="26" cy="26" r="22" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${L * f} ${L}" transform="rotate(-90 26 26)"/></svg>
    <div><b>${due === 0 ? 'Nothing planned for today' : ok >= due ? 'All done for today' : `Today: ${ok} of ${due}`}</b><span>${due && ok < due ? `${due - ok} ${plural(due - ok, 'habit', 'habits')} left` : 'Keep it up'}</span></div></div>`;
  list.forEach(h => {
    const c = cache.get(h.id) || { cur: 0 }, k = iso(t);
    let meta = '';
    if (c.cur > 0) meta += `${ICON_FLAME}<span>${streakText(c, c.cur)}</span><span>·</span>`;
    else if (isQuit(h) && k >= h.start) meta += `${ICON_FLAME}<span>0 days</span><span>·</span>`;
    if (isQuit(h)) meta += `<span>${slipped(h, k) ? 'Slipped today' : esc(freqText(h))}</span>`;
    else if (isWeekly(h)) meta += `<span>${weekDone(h, monday(t)).length} of ${h.freq.times} this week</span>`;
    else if (!scheduled(h, t)) meta += `<span>Day off today</span>`;
    else meta += `<span>${esc(freqText(h))}</span>`;
    html += `<div class="habit c${h.color}" data-open="${h.id}">
      <div class="hrow"><div class="icon">${esc(h.emoji || '✨')}</div><div class="hname"><b>${esc(h.name)}</b><div class="meta" style="color:${c.cur > 0 ? 'var(--text2)' : ''}">${meta}</div></div>${checkBtn(h, k)}</div>
      <div class="heatwrap" data-hs="${h.id}"><div class="heat" style="--cell:11px">${heatmap(h, Math.max(fit, weeksSince(h)), { markToday: true })}</div></div></div>`;
  });
  body.innerHTML = html;
  body.querySelectorAll('[data-hs]').forEach(el => {          // scroll to today by default, otherwise to where the user left off
    const p = heatScroll.get(el.dataset.hs);
    el.scrollLeft = !p || p.atEnd ? el.scrollWidth : p.left;
  });
  body.querySelectorAll('[data-open]').forEach(el => el.onclick = () => openDetail(el.dataset.open));
  body.querySelectorAll('[data-check]').forEach(el => press(el, () => tapDay(el.dataset.check, iso(today()), el), () => openDay(el.dataset.check, iso(today()))));
}
$('addBtn').onclick = () => openEditor();

// Marking: one tap toggles done; for "N times" goals it adds +1
function tapDay(hid, d, el) {
  const h = H(hid); if (!h) return;
  const c = count(h, d), t = target(h), e = entry(h, d);
  if (isQuit(h)) {
    if (d < h.start) { toast('Nothing to mark before the start date'); return; }
    setLog(h, d, c > 0 ? 0 : 1, e ? e.n : '');
    toast(c > 0 ? 'Slip removed' : 'Slip marked. The streak starts over');
    return;
  }
  const n = t === 1 ? (c >= 1 ? 0 : 1) : c + 1;
  setLog(h, d, n, e ? e.n : '');
  if (n >= t && c < t) { toast(t === 1 ? 'Done' : 'Daily goal reached'); if (el) { const b = document.querySelector(`[data-check="${hid}"]`); b && b.classList.add('pop'); } }
}
function setLog(h, d, c, note) {
  const m = logs.get(h.id) || new Map(); logs.set(h.id, m);
  if (c > 0 || note) m.set(d, { c, n: note || '' }); else m.delete(d);
  store.setLog(user.uid, h.id, d, c, note || '');
  refresh();
}

// ================= Habit screen =================
function openDetail(id) {
  detailId = id; detailMonth = 0; detailPeriod = 'week'; detailOff = 0;
  renderDetail();
  const el = $('detail'); el.scrollTop = 0; el.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => el.classList.add('open'));
  try { history.pushState({ detail: id }, ''); } catch (e) {}
}
function closeDetail(silent) {
  if (!detailId) return;
  detailId = null; $('detail').classList.remove('open'); $('detail').setAttribute('aria-hidden', 'true');
  if (!silent && history.state && history.state.detail) { try { history.back(); } catch (e) {} }
}
addEventListener('popstate', () => { if (detailId) { detailId = null; $('detail').classList.remove('open'); } });

function renderDetail() {
  const h = H(detailId); if (!h) return;
  const c = cache.get(h.id) || { cur: 0, best: 0, total: 0 }, t = today();
  const el = $('detail');
  const keepScroll = el.scrollTop;
  el.className = (el.classList.contains('open') ? 'open ' : '') + 'c' + h.color;

  // month calendar
  const m0 = new Date(t.getFullYear(), t.getMonth() + detailMonth, 1);
  const days = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
  let cal = WD.map(w => `<div class="wd">${w}</div>`).join('') + '<div></div>'.repeat(wdi(m0));
  for (let i = 1; i <= days; i++) {
    const d = new Date(m0.getFullYear(), m0.getMonth(), i), k = iso(d), n = count(h, k), e = entry(h, k);
    const st = isQuit(h) ? (k < h.start ? 'off pre' : n > 0 ? 's' : d <= t ? 'f' : '') : n >= target(h) ? 'f' : n > 0 ? 'p' : '';
    const cls = ['d', d > t ? 'fut' : '', st, !scheduled(h, d) ? 'off' : '', k === iso(t) ? 't' : '', e && e.n ? 'n' : ''].join(' ');
    cal += `<div class="${cls}" data-day="${k}">${i}</div>`;
  }

  // notes
  const notes = [...(logs.get(h.id) || new Map()).entries()].filter(([, v]) => v.n).sort((a, b) => b[0] < a[0] ? -1 : 1).slice(0, 30);

  // year: 53 weeks, month labels
  const weeks = Math.max(53, weeksSince(h)), first = addDays(monday(t), -7 * (weeks - 1));
  let months = '';
  for (let w = 0; w < weeks; w++) { const d = addDays(first, w * 7), prev = addDays(d, -7); months += `<span>${w === 0 || d.getMonth() !== prev.getMonth() ? cap(fmt(d, { month: 'short' }).replace('.', '')) : ''}</span>`; }

  el.innerHTML = `
    <div class="navbar"><button class="back" id="dBack"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Habits</button><button id="dEdit">Edit</button></div>
    <div class="wrap" style="padding-top:4px">
      <div class="dhead"><div class="icon">${esc(h.emoji || '✨')}</div><div><h2>${esc(h.name)}</h2><p>${esc(freqText(h))}${target(h) > 1 ? ` · ${target(h)} ${esc(unitText(h, target(h)))} a day` : ''}</p></div></div>
      <div class="tiles">
        <div class="tile"><span>Streak</span><b>${c.cur}</b><small>${c.unit === 'week' ? plural(c.cur, 'week', 'weeks') : plural(c.cur, 'day', 'days')}</small></div>
        <div class="tile"><span>Best</span><b>${c.best}</b><small>${c.unit === 'week' ? plural(c.best, 'week', 'weeks') : plural(c.best, 'day', 'days')}</small></div>
        <div class="tile"><span>Total</span><b>${c.total}</b><small>${isQuit(h) ? plural(c.total, 'clean day', 'clean days') : plural(c.total, 'day', 'days') + ' done'}</small></div>
      </div>
      <div class="card"><div class="yearwrap heatwrap" id="yearWrap"><div class="months" style="grid-template-columns:repeat(${weeks},11px)">${months}</div><div class="heat" style="--cell:11px;justify-content:start;margin-top:0">${heatmap(h, weeks)}</div></div></div>
      <div class="sect">Calendar</div>
      <div class="card">
        <div class="pnav"><button id="mPrev" aria-label="Previous month">‹</button><span>${cap(fmt(m0, { month: 'long', year: m0.getFullYear() === t.getFullYear() ? undefined : 'numeric' }))}</span><button id="mNext" ${detailMonth >= 0 ? 'disabled' : ''} aria-label="Next month">›</button></div>
        <div class="cal" id="cal">${cal}</div>
        <div class="hint">${isQuit(h) ? 'Tap a day to mark or remove a slip. Hold for a note.' : `Tap a day to mark it. Hold for ${target(h) > 1 ? 'the count and ' : ''}a note.`}</div>
      </div>
      <div class="sect">Statistics</div>
      <div class="card">
        <div class="seg" id="dSeg">${['week', 'month', 'year'].map(p => `<button data-p="${p}" class="${p === detailPeriod ? 'on' : ''}">${{ week: 'Week', month: 'Month', year: 'Year' }[p]}</button>`).join('')}</div>
        <div class="pnav"><button data-dnav="-1" aria-label="Previous">‹</button><span>${periodTitle(detailPeriod, detailOff)}</span><button data-dnav="1" ${detailOff >= 0 ? 'disabled' : ''} aria-label="Next">›</button></div>
        <div class="tiles" id="dTiles"></div>
        <div class="chart" id="dChart"></div>
      </div>
      <div class="sect">Notes</div>
      <div class="list">${notes.length ? notes.map(([k, v]) => `<div class="note"><small>${cap(fmt(fromIso(k), { weekday: 'short', day: 'numeric', month: 'long' }))}</small><div>${esc(v.n)}</div></div>`).join('') : '<div class="note" style="color:var(--text2);text-align:center">Hold a day in the calendar to add a note</div>'}</div>
    </div>`;

  $('dBack').onclick = () => closeDetail();
  $('dEdit').onclick = () => openEditor(h);
  $('mPrev').onclick = () => { detailMonth--; renderDetail(); };
  $('mNext').onclick = () => { if (detailMonth < 0) { detailMonth++; renderDetail(); } };
  el.querySelectorAll('#dSeg button').forEach(b => b.onclick = () => { detailPeriod = b.dataset.p; detailOff = 0; renderDetail(); });
  el.querySelectorAll('[data-dnav]').forEach(b => b.onclick = () => { const n = detailOff + Number(b.dataset.dnav); if (n <= 0) { detailOff = n; renderDetail(); } });
  el.querySelectorAll('#cal [data-day]:not(.pre)').forEach(d => press(d, () => tapDay(h.id, d.dataset.day), () => openDay(h.id, d.dataset.day)));
  const yw = $('yearWrap'); yw.scrollLeft = yw.scrollWidth;
  renderHabitStats(h);
  el.scrollTop = keepScroll;
}

function renderHabitStats(h) {
  const slots = slotsFor(detailPeriod, detailOff, d => {
    const p = dayParts(h, d), k = iso(d), n = count(h, k);
    if (!p) return null;
    if (isQuit(h)) return { v: n > 0 ? 0 : 1, n };
    if (p.exp === 0 && !n) return { v: null, off: true };
    return { v: Math.min(1, n / target(h)), n };
  }, days => rateOver([h], days));
  const days = periodDays(detailPeriod, detailOff), prevDays = periodDays(detailPeriod, detailOff - 1);
  const r = rateOver([h], days), pr = rateOver([h], prevDays);
  const doneN = days.filter(d => d <= today() && done(h, iso(d))).length;
  const missed = days.filter(d => { const p = dayParts(h, d); return p && p.exp === 1 && p.got < 1 && iso(d) !== iso(today()); }).length;
  const counts = days.map(d => count(h, iso(d))).filter(x => x > 0);
  const slips = days.filter(d => d <= today() && slipped(h, iso(d))).length;
  const third = isQuit(h) ? `<div class="tile"><span>Slips</span><b>${slips}</b><small>this period</small></div>`
    : target(h) > 1
    ? `<div class="tile"><span>Average</span><b>${counts.length ? (Math.round(counts.reduce((a, b) => a + b, 0) / counts.length * 10) / 10).toString() : '–'}</b><small>${esc(unitText(h, 5))} a day</small></div>`
    : isWeekly(h) ? `<div class="tile"><span>Weeks on target</span><b>${weeksHit(h, days)}</b><small>of ${weeksIn(days)}</small></div>`
    : `<div class="tile"><span>Missed</span><b>${missed}</b><small>scheduled days</small></div>`;
  $('dTiles').innerHTML = `<div class="tile"><span>${isQuit(h) ? 'Slip-free' : 'Completion'}</span><b>${pct(r)}</b><small>${delta(r, pr)}</small></div>
    <div class="tile"><span>${isQuit(h) ? 'Clean days' : 'Done'}</span><b>${doneN}</b><small>${plural(doneN, 'day', 'days')}</small></div>${third}`;
  drawChart($('dChart'), slots, { color: 'var(--c)', tip: s => s.year
    ? [cap(fmt(s.date, { month: 'long' })), s.v == null ? 'No data' : `Completion ${pct(s.v)}`]
    : [cap(fmt(s.date, { weekday: 'short', day: 'numeric', month: 'long' })), s.future ? 'Still ahead' : s.off ? 'Scheduled day off' : s.v == null ? 'No data' : isQuit(h) ? (s.v ? 'No slip' : 'Slip') : target(h) > 1 ? `${s.n || 0} of ${target(h)} ${unitText(h, target(h))}` : s.v >= 1 ? 'Done' : 'Not done'] });
}
const weeksIn = days => new Set(days.filter(d => d <= today()).map(d => iso(monday(d)))).size;
const weeksHit = (h, days) => [...new Set(days.filter(d => d <= today()).map(d => iso(monday(d))))].filter(w => weekDone(h, fromIso(w)).length >= h.freq.times).length;
function delta(r, pr) {
  if (r == null || pr == null) return '';
  const d = Math.round((r - pr) * 100);
  return d === 0 ? 'same as before' : `${d > 0 ? '+' : '−'}${Math.abs(d)} pts vs previous`;
}

// ================= Periods and chart =================
function periodDays(p, off) {
  const t = today();
  if (p === 'week') { const s = addDays(monday(t), off * 7); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
  if (p === 'month') { const m0 = new Date(t.getFullYear(), t.getMonth() + off, 1), n = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate(); return Array.from({ length: n }, (_, i) => new Date(m0.getFullYear(), m0.getMonth(), i + 1)); }
  const y = t.getFullYear() + off, out = [];
  for (let d = new Date(y, 0, 1); d.getFullYear() === y; d = addDays(d, 1)) out.push(d);
  return out;
}
function periodTitle(p, off) {
  const t = today();
  if (p === 'week') {
    if (off === 0) return 'This week'; if (off === -1) return 'Last week';
    const s = addDays(monday(t), off * 7), e = addDays(s, 6);
    return `${fmt(s, { day: 'numeric', month: 'short' })} – ${fmt(e, { day: 'numeric', month: 'short' })}`;
  }
  if (p === 'month') { const d = new Date(t.getFullYear(), t.getMonth() + off, 1); return cap(fmt(d, { month: 'long', year: d.getFullYear() === t.getFullYear() ? undefined : 'numeric' })); }
  return String(t.getFullYear() + off);
}
// chart slots: days (week/month) or months (year)
function slotsFor(p, off, dayVal, monthRate) {
  const t = today(), tIso = iso(t);
  if (p === 'year') {
    const y = t.getFullYear() + off;
    return Array.from({ length: 12 }, (_, m) => {
      const date = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate();
      const days = Array.from({ length: n }, (_, i) => new Date(y, m, i + 1));
      return { year: true, date, label: MONTHS_SHORT[m], v: date > t ? null : monthRate(days), now: y === t.getFullYear() && m === t.getMonth(), future: date > t };
    });
  }
  return periodDays(p, off).map((d, i, arr) => {
    const r = d > t ? null : dayVal(d);
    const day = d.getDate(), n = arr.length;
    const label = p === 'week' ? WD[i] : (day === 1 || day % 5 === 0) && day !== 30 || day === n ? String(day) : '';
    return { date: d, label, v: r ? r.v : null, n: r && r.n, off: r && r.off, now: iso(d) === tIso, future: d > t };
  });
}

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
function barPath(x, w, y0, y1) { const h = y0 - y1, r = Math.min(4, w / 2, h); return `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 + r} V${y0} Z`; }

function drawChart(box, slots, opt) {
  box.innerHTML = '<svg role="img" aria-label="Completion chart"></svg><div class="tip hide"></div>';
  const svg = box.firstChild, tip = box.lastChild;
  const W = box.clientWidth || 320, Hh = 200;
  svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  const L = 34, R = 4, T = 8, B = 24, pw = W - L - R, ph = Hh - T - B;
  const y = v => T + ph - v * ph;
  const n = slots.length, slotW = pw / n;
  const barW = Math.max(2, Math.min(n === 7 ? 28 : n === 12 ? 16 : 9, slotW - 2));
  [0, .5, 1].forEach(v => {
    svgEl('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: 'var(--grid)', 'stroke-width': 1 }, svg);
    svgEl('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, svg).textContent = Math.round(v * 100) + '%';
  });
  const bars = slots.map((s, i) => {
    const cx = L + slotW * i + slotW / 2;
    let b = null;
    if (s.v != null) b = svgEl('path', { d: barPath(cx - barW / 2, barW, y(0), Math.min(y(s.v), y(0) - 3)), fill: opt.color }, svg);
    else if (!s.future) svgEl('circle', { cx, cy: y(0) - 3, r: 1.6, fill: 'var(--text3)' }, svg);
    if (s.label) { const tx = svgEl('text', { x: cx, y: Hh - 6, 'text-anchor': 'middle' }, svg); tx.textContent = s.label; if (s.now) tx.setAttribute('class', 'now'); }
    return b;
  });
  const hit = svgEl('rect', { x: L, y: 0, width: pw, height: Hh, fill: 'transparent' }, svg);
  let active = -1;
  const show = i => {
    const lines = opt.tip(slots[i]);
    bars.forEach((b, j) => b && b.setAttribute('opacity', j === i ? 1 : .35));
    tip.innerHTML = `<div>${esc(lines[0])}</div><b>${esc(lines[1])}</b>`;
    tip.classList.remove('hide');
    const r = svg.getBoundingClientRect(), bx = box.getBoundingClientRect();
    const cx = (L + slotW * i + slotW / 2) * (r.width / W) + (r.left - bx.left), half = tip.offsetWidth / 2;
    tip.style.left = Math.max(half, Math.min(bx.width - half, cx)) + 'px';
    tip.style.top = '-6px';
  };
  const pick = e => { const r = svg.getBoundingClientRect(); const i = Math.floor((e.clientX - r.left - L * r.width / W) / (slotW * r.width / W)); if (i >= 0 && i < n && i !== active) { active = i; show(i); } };
  const clear = () => { active = -1; bars.forEach(b => b && b.setAttribute('opacity', 1)); tip.classList.add('hide'); };
  hit.addEventListener('pointerdown', pick); hit.addEventListener('pointermove', pick);
  hit.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') clear(); });
  box._clear = clear;
}
document.addEventListener('pointerdown', e => document.querySelectorAll('.chart').forEach(c => { if (!c.contains(e.target) && c._clear) c._clear(); }));

// ================= Overall statistics =================
document.querySelectorAll('#statSeg button').forEach(b => b.onclick = () => {
  statPeriod = b.dataset.p; statOff = 0;
  document.querySelectorAll('#statSeg button').forEach(x => x.classList.toggle('on', x === b));
  renderStats();
});
document.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { const n = statOff + Number(b.dataset.nav); if (n <= 0) { statOff = n; renderStats(); } });

function renderStats() {
  const hs = active();
  $('statLabel').textContent = periodTitle(statPeriod, statOff);
  document.querySelector('[data-nav="1"]').disabled = statOff >= 0;
  const days = periodDays(statPeriod, statOff), prev = periodDays(statPeriod, statOff - 1);
  const r = rateOver(hs, days), pr = rateOver(hs, prev);
  let marks = 0, perfect = 0;
  days.forEach(d => {
    if (d > today()) return;
    const k = iso(d); let due = 0, ok = 0;
    hs.forEach(h => { if (done(h, k)) marks++; if (!isWeekly(h)) { const p = dayParts(h, d); if (p && p.exp) { due++; if (p.got >= 1) ok++; } } });
    if (due && ok === due) perfect++;
  });
  $('statTiles').innerHTML = `<div class="tile"><span>Completion</span><b>${pct(r)}</b><small>${delta(r, pr)}</small></div>
    <div class="tile"><span>Check-ins</span><b>${marks}</b><small>this period</small></div>
    <div class="tile"><span>Perfect days</span><b>${perfect}</b><small>everything done</small></div>`;
  if (!hs.length) { $('statChart').innerHTML = '<div class="hint" style="margin:30px 0">Add a habit and statistics will appear here</div>'; $('statList').innerHTML = ''; return; }
  const slots = slotsFor(statPeriod, statOff, d => { const v = rateOver(hs, [d]); return v == null ? null : { v }; }, ds => rateOver(hs, ds));
  drawChart($('statChart'), slots, { color: 'var(--accent)', tip: s => [s.year ? cap(fmt(s.date, { month: 'long' })) : cap(fmt(s.date, { weekday: 'short', day: 'numeric', month: 'long' })), s.future ? 'Still ahead' : s.v == null ? 'Nothing planned' : `Completion ${pct(s.v)}`] });
  const rows = hs.map(h => ({ h, r: rateOver([h], days) })).sort((a, b) => (b.r ?? -1) - (a.r ?? -1));
  $('statList').innerHTML = rows.map(({ h, r }) => `<button class="row c${h.color}" data-open="${h.id}"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow"><div>${esc(h.name)}</div><div class="meter"><i style="width:${Math.round((r || 0) * 100)}%"></i></div></div><span class="val">${pct(r)}</span><span class="chev">›</span></button>`).join('');
  $('statList').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openDetail(b.dataset.open));
}
addEventListener('resize', () => refresh());

// ================= Bottom sheet =================
function openSheet(html, mount) {
  const s = $('sheet'); s.innerHTML = '<div class="grab"></div>' + html; s.scrollTop = 0;
  mount && mount(s);
  $('sheetBg').classList.add('open'); requestAnimationFrame(() => s.classList.add('open'));
}
function closeSheet() { $('sheet').classList.remove('open'); $('sheetBg').classList.remove('open'); }
$('sheetBg').onclick = closeSheet;

// --- day: count and note ---
function openDay(hid, d) {
  const h = H(hid); if (!h) return;
  const e = entry(h, d) || { c: 0, n: '' }, t = isQuit(h) ? 1 : target(h);
  let c = e.c || 0;
  const title = cap(fmt(fromIso(d), { weekday: 'short', day: 'numeric', month: 'long' }));
  openSheet(`<div class="shead"><button id="sCancel">Cancel</button><b>${esc(title)}</b><button id="sDone">Done</button></div>
    <div class="list c${h.color}"><div class="row"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow"><b style="font-weight:600">${esc(h.name)}</b></div>
    ${t === 1 ? `<input type="checkbox" class="switch" id="sDoneSw" ${c >= 1 ? 'checked' : ''} aria-label="${isQuit(h) ? 'Slipped' : 'Done'}">` : ''}</div>
    ${isQuit(h) ? '<div class="row" style="color:var(--text2);font-size:15px">Switch on means you slipped on this day</div>' : ''}</div>
    ${t > 1 ? `<div class="card" style="margin-top:12px"><div class="big-step"><button id="sMinus" aria-label="Less">−</button><b id="sCount">${c}</b><button id="sPlus" aria-label="More">+</button></div><div class="hint" style="margin-top:0">Goal: ${t} ${esc(unitText(h, t))}</div></div>` : ''}
    <div class="sect">Note</div>
    <div class="card"><textarea class="field" id="sNote" maxlength="500" placeholder="What helped or got in the way?">${esc(e.n || '')}</textarea></div>`, s => {
    const upd = () => { $('sCount').textContent = c; };
    if (t > 1) { $('sMinus').onclick = () => { c = Math.max(0, c - 1); upd(); }; $('sPlus').onclick = () => { c = Math.min(999, c + 1); upd(); }; }
    $('sCancel').onclick = closeSheet;
    $('sDone').onclick = () => {
      if (t === 1) c = $('sDoneSw').checked ? 1 : 0;
      setLog(h, d, c, $('sNote').value.trim().slice(0, 500));
      closeSheet();
    };
  });
}

// --- creating and editing a habit ---
function openEditor(h, tpl) {
  const isNew = !h;
  const used = new Set(active().map(x => x.color));
  const nextColor = [0, 1, 2, 3, 4, 5, 6, 7].find(i => !used.has(i)) ?? (active().length % 8);
  const f = h ? JSON.parse(JSON.stringify(h)) : {
    id: uid8(), name: tpl ? tpl.name : '', emoji: tpl ? tpl.emoji : '💪', color: nextColor,
    freq: { type: 'days', days: [0, 1, 2, 3, 4, 5, 6] }, target: tpl && tpl.target || 1, unit: tpl && tpl.unit || '', archived: false, start: iso(today()), created: Date.now(),
    kind: tpl && tpl.kind || 'build'
  };
  if (!f.kind) f.kind = 'build';
  if (!f.freq) f.freq = { type: 'days', days: [0, 1, 2, 3, 4, 5, 6] };
  let mode = isWeekly(f) ? 'weekly' : f.freq.days.length === 7 ? 'daily' : 'days';
  let days = isWeekly(f) ? [0, 1, 2, 3, 4] : f.freq.days.slice();
  let times = isWeekly(f) ? f.freq.times : 3;
  let delArmed = false;

  const draw = () => {
    const s = $('sheet'), keep = s.scrollTop, name = $('eName') ? $('eName').value : f.name, unit = $('eUnit') ? $('eUnit').value : f.unit;
    f.name = name; f.unit = unit;
    s.innerHTML = `<div class="grab"></div><div class="shead"><button id="eCancel">Cancel</button><b>${isNew ? 'New habit' : 'Edit'}</b><button id="eSave">${isNew ? 'Add' : 'Done'}</button></div>
      <div class="list c${f.color}"><div class="row"><div class="sicon" style="width:36px;height:36px;font-size:20px">${esc(f.emoji)}</div><input class="field grow" id="eName" maxlength="60" placeholder="Name, e.g. “Workout”" value="${esc(f.name)}"></div></div>
      <div class="sect">Icon</div>
      <div class="card" style="padding:10px"><div class="emojis">${[...new Set([f.emoji, ...EMOJIS])].map(e => `<button data-emoji="${esc(e)}" class="${e === f.emoji ? 'on' : ''}">${esc(e)}</button>`).join('')}</div>
        <div class="row" style="padding:8px 6px 2px;min-height:0"><span class="grow" style="color:var(--text2);font-size:15px">Custom emoji</span><input class="unit" id="eEmoji" maxlength="8" placeholder="paste here" style="width:120px"></div></div>
      <div class="sect">Color</div>
      <div class="card"><div class="colors">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<button class="c${i} ${i === f.color ? 'on' : ''}" data-color="${i}" aria-label="Color ${i + 1}"></button>`).join('')}</div></div>
      <div class="sect">Type</div>
      <div class="card">
        <div class="seg" style="margin-bottom:0">${[['build', 'Build a habit'], ['quit', 'Break a habit']].map(([k, t]) => `<button data-kind="${k}" class="${k === f.kind ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${f.kind === 'quit' ? `<div class="row" style="padding:14px 0 0;min-height:0"><span class="grow">Quit since</span><input type="date" id="eStart" class="unit" style="width:auto" max="${iso(today())}" value="${f.start}"></div>` : ''}
      </div>
      <div class="foot">${f.kind === 'quit' ? 'Every day counts as done automatically. Mark only slips — the streak shows how many days in a row you have held on.' : 'Mark it when you do it. The streak shows how many times in a row you kept to the schedule.'}</div>
      ${f.kind === 'quit' ? '' : `<div class="sect">Schedule</div>
      <div class="card">
        <div class="seg" style="margin-bottom:0">${[['daily', 'Every day'], ['days', 'Days of week'], ['weekly', 'N times a week']].map(([k, t]) => `<button data-mode="${k}" class="${k === mode ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${mode === 'days' ? `<div class="days">${WD.map((w, i) => `<button data-wd="${i}" class="${days.includes(i) ? 'on' : ''}">${w}</button>`).join('')}</div>` : ''}
        ${mode === 'weekly' ? `<div class="row" style="padding:14px 0 0;min-height:0"><span class="grow">${times} ${plural(times, 'time', 'times')} a week, any days</span><div class="stepper"><button data-times="-1" aria-label="Less">−</button><button data-times="1" aria-label="More">+</button></div></div>` : ''}
      </div>
      <div class="sect">Daily goal</div>
      <div class="list">
        <div class="row"><span class="grow">${f.target === 1 ? 'Just a check-in' : `${f.target} ${esc(unitText(f, f.target))}`}</span><div class="stepper"><button data-tg="-1" aria-label="Less">−</button><button data-tg="1" aria-label="More">+</button></div></div>
        ${f.target > 1 ? `<div class="row"><span class="grow">Unit</span><input class="unit" id="eUnit" maxlength="20" placeholder="times" value="${esc(f.unit)}"></div>` : ''}
      </div>
      <div class="foot">For example, 8 glasses of water or 20 pages. Leave 1 for a simple check-in.</div>`}
      ${isNew ? '' : `<div class="sect"></div><div class="list">
        <button class="row btn" id="eArchive">${f.archived ? 'Restore from archive' : 'Move to archive'}</button>
        <button class="row danger" id="eDelete">${delArmed ? 'Tap again — all history will be deleted' : 'Delete habit'}</button></div>`}`;
    s.scrollTop = keep;
    $('eCancel').onclick = closeSheet;
    $('eSave').onclick = save;
    s.querySelectorAll('[data-emoji]').forEach(b => b.onclick = () => { f.emoji = b.dataset.emoji; draw(); });
    $('eEmoji').oninput = e => { const v = [...e.target.value.trim()].slice(0, 2).join(''); if (v) { f.emoji = v; } };
    $('eEmoji').onchange = () => draw();
    s.querySelectorAll('[data-color]').forEach(b => b.onclick = () => { f.color = Number(b.dataset.color); draw(); });
    s.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; draw(); });
    s.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { f.kind = b.dataset.kind; if (f.kind === 'quit' && !h && f.emoji === '💪') f.emoji = '🚫'; draw(); });
    if ($('eStart')) $('eStart').onchange = e => { if (e.target.value && e.target.value <= iso(today())) f.start = e.target.value; };
    s.querySelectorAll('[data-wd]').forEach(b => b.onclick = () => { const i = Number(b.dataset.wd); days = days.includes(i) ? days.filter(x => x !== i) : [...days, i].sort(); draw(); });
    s.querySelectorAll('[data-times]').forEach(b => b.onclick = () => { times = Math.min(6, Math.max(1, times + Number(b.dataset.times))); draw(); });
    s.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => { f.target = Math.min(99, Math.max(1, f.target + Number(b.dataset.tg))); draw(); });
    if (!isNew) {
      $('eArchive').onclick = () => { f.archived = !f.archived; commit(); closeSheet(); toast(f.archived ? 'Moved to archive' : 'Habit restored'); if (f.archived) closeDetail(); };
      $('eDelete').onclick = () => {
        if (!delArmed) { delArmed = true; draw(); setTimeout(() => { delArmed = false; if ($('eDelete')) $('eDelete').textContent = 'Delete habit'; }, 3500); return; }
        const years = [...new Set([...(logs.get(f.id) || new Map()).keys()].map(k => k.slice(0, 4)))];
        habits = habits.filter(x => x.id !== f.id); logs.delete(f.id);
        store.deleteHabit(user.uid, f.id, years);
        closeSheet(); closeDetail(); refresh(); toast('Habit deleted');
      };
    }
  };
  const commit = () => {
    f.name = ($('eName') ? $('eName').value : f.name).trim().slice(0, 60);
    f.unit = ($('eUnit') ? $('eUnit').value : f.unit).trim().slice(0, 20);
    f.freq = f.kind === 'quit' ? { type: 'days', days: [0, 1, 2, 3, 4, 5, 6] } : mode === 'weekly' ? { type: 'weekly', times } : { type: 'days', days: mode === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : days };
    if (f.kind === 'quit') { f.target = 1; if ($('eStart') && $('eStart').value && $('eStart').value <= iso(today())) f.start = $('eStart').value; }
    const i = habits.findIndex(x => x.id === f.id);
    if (i > -1) habits[i] = f; else habits.push(f);
    store.saveHabit(user.uid, f);
    refresh();
  };
  function save() {
    const name = $('eName').value.trim();
    if (!name) { $('eName').focus(); $('eName').placeholder = 'Give it a name first'; return; }
    if (f.kind !== 'quit' && mode === 'days' && !days.length) { toast('Pick at least one day'); return; }
    commit(); closeSheet();
    if (isNew) toast('Habit added');
  }
  openSheet('', () => {});
  draw();
}

// ================= Settings =================
function renderAccount() {
  const a = $('avatar'); a.innerHTML = '';
  if (user.photo) { const img = document.createElement('img'); img.src = user.photo; img.referrerPolicy = 'no-referrer'; img.alt = ''; a.appendChild(img); }
  else a.textContent = (user.name || '?').trim().charAt(0).toUpperCase();
  $('userName').textContent = user.name; $('userEmail').textContent = user.email;
}
function renderArchive() {
  const arch = habits.filter(h => h.archived), box = $('archiveList');
  box.innerHTML = arch.length ? arch.map(h => `<button class="row c${h.color}" data-edit="${h.id}"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow">${esc(h.name)}</div><span class="chev">›</span></button>`).join('')
    : '<div class="row" style="color:var(--text2)">Empty</div>';
  box.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openEditor(H(b.dataset.edit)));
}
$('signOutBtn').onclick = () => store.signOut();

// ================= Import and export =================
const HK_COLORS = { blue: 0, sky: 0, orange: 1, emerald: 2, teal: 2, cyan: 2, aqua: 2, yellow: 3, amber: 3, pink: 4, fuchsia: 4, rose: 4, magenta: 4, green: 5, lime: 5, indigo: 6, purple: 6, violet: 6, red: 7 };
const NAME_EMOJI = [[/медит|meditat|йог|yoga/i, '🧘'], [/алког|alcohol|вино|пив|beer|wine/i, '🍷'], [/кур|сигар|smok|cigar|vape/i, '🚭'],
  [/вод|water/i, '💧'], [/чит|read|книг|book/i, '📚'], [/бег|run|jog/i, '🏃'], [/зарядк|гимнаст|gymnast|workout|спорт|fitness|exercis|gym/i, '💪'],
  [/сон|спать|sleep|bed/i, '😴'], [/сахар|sugar|sweet/i, '🍬'], [/гвозд|садху|sadhu/i, '🦶'], [/зуб|floss|teeth/i, '🦷'],
  [/прогул|walk|шаг|step/i, '🚶'], [/англ|english|язык|language|study|учёб|learn/i, '🧠'], [/журнал|journal|дневник|write|писа/i, '✍️']];
const emojiFor = name => (NAME_EMOJI.find(([r]) => r.test(name)) || [0, '✨'])[1];
// HabitKit stores a UTC instant + zone offset — convert to a local date
const localIso = (s, tz) => { const d = new Date(Date.parse(s) + (Number(tz) || 0) * 60000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };

function parseImport(j) {
  if (j && j.app === 'habits' && Array.isArray(j.habits)) return { habits: j.habits, logs: j.logs || {}, source: 'Backup' };
  if (j && Array.isArray(j.habits) && Array.isArray(j.completions)) return fromHabitKit(j);
  throw new Error('format');
}
function fromHabitKit(j) {
  const out = { habits: [], logs: {}, source: 'HabitKit' }, idMap = {};
  const base = Math.min(...j.habits.map(x => Date.parse(x.createdAt) || Date.now()));   // same order as in HabitKit
  j.habits.slice().sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).forEach((x, i) => {
    const id = 'hk' + String(x.id).replace(/[^a-z0-9]/gi, '').slice(0, 16);
    idMap[x.id] = id;
    // the current goal is the last interval (no end date, or the latest one)
    const iv = (j.intervals || []).filter(v => v.habitId === x.id)
      .sort((a, b) => (a.endDate ? Date.parse(a.endDate) : Infinity) - (b.endDate ? Date.parse(b.endDate) : Infinity)).pop();
    const quit = !!x.isInverse;
    let freq = { type: 'days', days: [0, 1, 2, 3, 4, 5, 6] }, target = 1;
    if (iv && !quit) {
      if (iv.type === 'week' && iv.requiredNumberOfCompletions && iv.requiredNumberOfCompletions < 7) freq = { type: 'weekly', times: Math.max(1, iv.requiredNumberOfCompletions) };
      target = Math.min(99, Math.max(1, Number(iv.requiredNumberOfCompletionsPerDay) || 1));
    }
    const created = Date.parse(x.createdAt) || Date.now();
    out.habits.push({
      id, name: String(x.name || 'Habit').slice(0, 60), emoji: x.emoji || emojiFor(String(x.name || '')),
      color: HK_COLORS[x.color] ?? i % 8, kind: quit ? 'quit' : 'build', freq, target: quit ? 1 : target, unit: '',
      archived: !!x.archived, start: quit && x.inverseStartDate ? String(x.inverseStartDate).slice(0, 10) : iso(new Date(created)), created: base + i * 1000
    });
    out.logs[id] = {};
  });
  // with several entries per day, the latest one wins
  (j.completions || []).slice().sort((a, b) => String(a.capturedAt || '').localeCompare(String(b.capturedAt || ''))).forEach(c => {
    const id = idMap[c.habitId]; if (!id || !c.date) return;
    const k = localIso(c.date, c.timezoneOffsetInMinutes), n = Math.min(999, Math.max(0, Number(c.amountOfCompletions) || 0));
    const note = c.note ? String(c.note).slice(0, 500) : '';
    if (n || note) out.logs[id][k] = { c: n, n: note }; else delete out.logs[id][k];
  });
  return out;
}

$('importBtn').onclick = () => { $('importFile').value = ''; $('importFile').click(); };
$('importFile').onchange = async e => {
  const file = e.target.files && e.target.files[0]; if (!file) return;
  let data;
  try { data = parseImport(JSON.parse(await file.text())); }
  catch (err) { toast('Unrecognized file format'); return; }
  const marks = Object.values(data.logs).reduce((a, m) => a + Object.keys(m).length, 0);
  const again = data.habits.filter(h => H(h.id)).length;
  openSheet(`<div class="shead"><button id="iCancel">Cancel</button><b>Import</b><button id="iGo">Import</button></div>
    <div class="list">${data.habits.map(h => `<div class="row c${h.color}"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow"><div>${esc(h.name)}</div><div class="sub">${h.kind === 'quit' ? 'Break a habit' : esc(freqText(h))}${h.archived ? ' · archived' : ''} · ${Object.keys(data.logs[h.id] || {}).length} ${plural(Object.keys(data.logs[h.id] || {}).length, 'check-in', 'check-ins')}</div></div></div>`).join('')}</div>
    <div class="foot">${esc(data.source)}: ${data.habits.length} ${plural(data.habits.length, 'habit', 'habits')}, ${marks} ${plural(marks, 'check-in', 'check-ins')}.${again ? ` ${again} were imported before and will be updated.` : ''} You can change the color, icon and schedule later.</div>`, () => {
    $('iCancel').onclick = closeSheet;
    $('iGo').onclick = () => { applyImport(data); closeSheet(); };
  });
};

function applyImport(data) {
  data.habits.forEach(x => {
    const h = { ...x }; if (!h.freq) h.freq = { type: 'days', days: [0, 1, 2, 3, 4, 5, 6] };
    const i = habits.findIndex(y => y.id === h.id);
    if (i > -1) habits[i] = { ...habits[i], ...h }; else habits.push(h);
    store.saveHabit(user.uid, i > -1 ? habits[i] : h);
    const m = logs.get(h.id) || new Map(); logs.set(h.id, m);
    const years = {};
    Object.entries(data.logs[h.id] || {}).forEach(([k, v]) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      m.set(k, { c: v.c || 0, n: v.n || '' });
      const y = k.slice(0, 4), md = k.slice(5); years[y] = years[y] || { d: {}, n: {} };
      if (v.c) years[y].d[md] = v.c;
      if (v.n) years[y].n[md] = v.n;
    });
    Object.entries(years).forEach(([y, v]) => store.putYear(user.uid, h.id, y, v.d, v.n));
  });
  habits.sort((x, y) => (x.created || 0) - (y.created || 0));
  refresh();
  toast(`Imported ${data.habits.length} ${plural(data.habits.length, 'habit', 'habits')}`);
}

$('exportBtn').onclick = () => {
  const data = { app: 'habits', version: 1, exportedAt: new Date().toISOString(), habits, logs: Object.fromEntries([...logs].map(([h, m]) => [h, Object.fromEntries(m)])) };
  const name = `habits-${iso(today())}.json`, blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const file = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (isIOS && !standalone) {
  $('installSect').classList.remove('hide'); $('installBox').classList.remove('hide');
  $('installText').textContent = 'Install it to your Home Screen: Share → Add to Home Screen.';
}

// if the app stays open past midnight, "today" moves forward on its own
let lastDay = iso(today());
setInterval(() => { const t = iso(today()); if (t !== lastDay) { lastDay = t; refresh(); } }, 60000);
// Service worker with automatic updates: check for a new version on launch and whenever the app
// returns to the foreground (iOS resumes installed apps without reloading them). When a new
// version takes over, reload once — unless the user is typing; then wait until later.
if ('serviceWorker' in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  let updatePending = false, reloading = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };
  const applyUpdate = () => { if (reloading) return; if (busy()) { updatePending = true; return; } reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) applyUpdate(); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (updatePending) applyUpdate(); else reg.update().catch(() => {});
    });
  }).catch(() => {});
}

start();
