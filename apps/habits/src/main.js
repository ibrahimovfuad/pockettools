import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, onSnapshot, deleteField
} from 'firebase/firestore';

// ================= Утилиты =================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const wdi = d => (d.getDay() + 6) % 7;                 // Пн = 0 … Вс = 6
const monday = d => addDays(d, -wdi(d));
const fmt = (d, o) => new Intl.DateTimeFormat('ru-RU', o).format(d);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
const pct = x => x == null ? '–' : Math.round(x * 100) + '%';
const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_SHORT = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];
const EMOJIS = ['💪', '🏃', '🧘', '📚', '💧', '🥗', '😴', '🦷', '✍️', '🧠', '🎯', '🚭', '🍎', '🚶', '🎸', '🌿', '☀️', '💊', '🧹', '💰'];
const TEMPLATES = [
  { name: 'Пить воду', emoji: '💧', target: 8, unit: 'стаканов' },
  { name: 'Зарядка', emoji: '💪' },
  { name: 'Читать', emoji: '📚' },
  { name: 'Медитация', emoji: '🧘' },
  { name: 'Лечь до 23:00', emoji: '😴' },
  { name: 'Без сигарет', emoji: '🚭', kind: 'quit' },
  { name: 'Без алкоголя', emoji: '🍷', kind: 'quit' }
];

let toastId;
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastId); toastId = setTimeout(() => e.classList.remove('show'), 1800); }

// Нажатие и удержание на одном элементе
function press(el, onTap, onLong) {
  let t = null, long = false, sx = 0, sy = 0;
  const cancel = () => { if (t) { clearTimeout(t); t = null; } };
  el.addEventListener('pointerdown', e => { long = false; sx = e.clientX; sy = e.clientY; cancel(); if (onLong) t = setTimeout(() => { long = true; t = null; onLong(); }, 450); });
  el.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - sx, e.clientY - sy) > 10) cancel(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, cancel));
  el.addEventListener('click', e => { e.stopPropagation(); if (long) { long = false; return; } onTap(); });
  el.addEventListener('contextmenu', e => e.preventDefault());
}

// ================= Хранилище: Firebase или демо =================
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
      onAuthStateChanged(auth, u => cb(u && { uid: u.uid, name: u.displayName || 'Без имени', email: u.email || '', photo: u.photoURL }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(auth, p); },
    signOut() { subs.forEach(f => f()); subs = []; return signOut(auth); },
    listen(uid, onHabits, onLogs) {
      subs.forEach(f => f());
      subs = [
        onSnapshot(collection(db, 'users', uid, 'habits'), s => { const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id })); onHabits(a); }, fail('Ошибка загрузки')),
        onSnapshot(collection(db, 'users', uid, 'logs'), s => { const a = []; s.forEach(d => a.push(d.data())); onLogs(parseLogs(a)); }, fail('Ошибка загрузки'))
      ];
    },
    // без await: при плохом интернете запись сначала ложится в локальный кэш и уходит позже
    saveHabit(uid, h) { const { id, ...data } = h; setDoc(doc(db, 'users', uid, 'habits', id), data).catch(fail('Не сохранилось')); },
    deleteHabit(uid, id, years) {
      deleteDoc(doc(db, 'users', uid, 'habits', id)).catch(fail('Не удалилось'));
      years.forEach(y => deleteDoc(doc(db, 'users', uid, 'logs', `${id}_${y}`)).catch(() => {}));
    },
    setLog(uid, hid, d, c, note) { setDoc(doc(db, 'users', uid, 'logs', `${hid}_${d.slice(0, 4)}`), logPatch(hid, d, c, note), { merge: true }).catch(fail('Не сохранилось')); },
    putYear(uid, hid, year, d, n) { setDoc(doc(db, 'users', uid, 'logs', `${hid}_${year}`), { habitId: hid, year: Number(year), d, n }, { merge: true }).catch(fail('Не сохранилось')); }
  };
}

function authError(e) {
  const c = e && e.code || '';
  if (c.includes('unauthorized-domain')) return 'Этот домен не добавлен в Firebase → Authentication → Settings → Authorized domains';
  if (c.includes('network')) return 'Нет интернета';
  if (c.includes('cancelled') || c.includes('closed')) return '';
  return 'Не получилось войти: ' + (c || e.message || e);
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
    onUser(f) { f({ uid: 'demo', name: 'Демо', email: 'Данные только на этом устройстве', photo: null }); },
    signIn() { return Promise.resolve(); }, signOut() { toast('В демо-режиме выходить некуда'); },
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

// ================= Состояние =================
let user = null;
let habits = [];                 // все привычки, включая архивные
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
// «Бросить привычку»: день чистый по умолчанию, отмечаются только срывы
const done = (h, d) => isQuit(h) ? d >= h.start && d <= iso(today()) && count(h, d) === 0 : count(h, d) >= target(h);
const slipped = (h, d) => isQuit(h) && count(h, d) > 0;
const isWeekly = h => !isQuit(h) && h.freq && h.freq.type === 'weekly';
const scheduled = (h, d) => isWeekly(h) || !h.freq || (h.freq.days || []).includes(wdi(d));

function freqText(h) {
  if (isQuit(h)) return `Без срывов с ${fmt(fromIso(h.start), { day: 'numeric', month: 'long', year: fromIso(h.start).getFullYear() === today().getFullYear() ? undefined : 'numeric' })}`;
  if (isWeekly(h)) { const n = h.freq.times; return `${n} ${plural(n, 'раз', 'раза', 'раз')} в неделю`; }
  const ds = (h.freq && h.freq.days) || [0, 1, 2, 3, 4, 5, 6];
  if (ds.length === 7) return 'Каждый день';
  const k = ds.slice().sort().join('');
  if (k === '01234') return 'По будням';
  if (k === '56') return 'По выходным';
  return ds.slice().sort().map(i => WD[i]).join(', ');
}
const unitText = (h, n) => h.unit ? h.unit : plural(n, 'раз', 'раза', 'раз');

// --- расчёты ---
function weekDone(h, mon) {         // выполненные дни недели (iso), по порядку
  const out = [];
  for (let i = 0; i < 7; i++) { const k = iso(addDays(mon, i)); if (done(h, k)) out.push(k); }
  return out;
}
// ожидание и выполнение за день: недельные привычки дают N/7 «ожидания» в день
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
    if (isQuit(h)) {                         // серия = дни подряд без срыва, включая сегодня
      let cur = 0, best = 0;
      for (let d = fromIso(start); d <= t; d = addDays(d, 1)) {
        if (slipped(h, iso(d))) cur = 0; else { cur++; total++; }
        best = Math.max(best, cur);
      }
      c.cur = cur; c.best = best; c.total = total; c.unit = 'day';
    } else if (isWeekly(h)) {                       // серия в неделях
      let cur = 0, best = 0;
      for (let w = monday(fromIso(start)); w <= t; w = addDays(w, 7)) {
        const ok = weekDone(h, w).length >= h.freq.times;
        const now = iso(w) === iso(monday(t));
        if (ok) cur++; else if (!now) cur = 0;
        best = Math.max(best, cur);
      }
      c.cur = cur; c.best = best; c.unit = 'week';
    } else {                                 // серия в днях: выходные по расписанию не рвут серию
      let cur = 0, best = 0;
      for (let d = fromIso(start); d <= t; d = addDays(d, 1)) {
        const k = iso(d);
        if (done(h, k)) cur++;
        else if (scheduled(h, d) && k !== tIso) cur = 0;   // сегодня ещё не поздно
        best = Math.max(best, cur);
      }
      c.cur = cur; c.best = best; c.unit = 'day';
    }
  });
}
const streakText = (c, n) => `${n} ${c.unit === 'week' ? plural(n, 'неделя', 'недели', 'недель') : plural(n, 'день', 'дня', 'дней')}`;

// ================= Запуск и вход =================
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

// ================= Вкладки =================
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
function showTab(t) {
  tab = t;
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hide', s.id !== 'tab-' + t));
  scrollTo(0, 0);
  refresh();
}

// ================= Главная =================
const ICON_CHECK = '<svg class="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_FLAME = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8.6 1c.3 2.1-.6 3.3-1.6 4.4C6 6.5 5 7.6 5 9.4 5 11.4 6.4 13 8 13s3-1.4 3-3.3c0-.9-.3-1.7-.8-2.3.1.9-.3 1.6-1 1.9.4-1.9-.3-3.4-1-4.3 1.6.2 3.8 2 3.8 4.9C12 12.9 10.2 15 8 15s-4-2-4-5.2c0-2.5 1.4-4 2.6-5.3C7.7 3.3 8.6 2.4 8.6 1z"/></svg>';

const ICON_X = '<svg class="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
function checkBtn(h, d) {
  if (isQuit(h)) {
    if (d < h.start) return `<button class="check c${h.color}" data-check="${h.id}" aria-label="Ещё не начато"><svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="var(--c)" stroke-width="2.5" opacity=".3"/></svg></button>`;
    return slipped(h, d)
      ? `<button class="check slip c${h.color}" data-check="${h.id}" aria-label="Срыв — нажми, чтобы убрать">${ICON_X}</button>`
      : `<button class="check done c${h.color}" data-check="${h.id}" aria-label="Без срыва — нажми, если сорвался">${ICON_CHECK}</button>`;
  }
  const c = count(h, d), t = target(h), full = c >= t;
  if (t === 1) return `<button class="check c${h.color} ${full ? 'done' : ''}" data-check="${h.id}" aria-label="Отметить">${full ? ICON_CHECK : `<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="var(--c)" stroke-width="2.5" opacity=".55"/></svg>`}</button>`;
  const r = 20, L = 2 * Math.PI * r, f = Math.min(1, c / t);
  return `<button class="check c${h.color} ${full ? 'done' : ''}" data-check="${h.id}" aria-label="Добавить">${full ? ICON_CHECK :
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

// сколько недель истории у привычки (от начала до текущей недели)
const weeksSince = h => { const c = cache.get(h.id); return c ? Math.round((monday(today()) - monday(fromIso(c.start))) / (7 * 864e5)) + 1 : 1; };
const heatScroll = new Map();     // habitId → {left, atEnd}: позиция прокрутки истории между перерисовками

function renderHome() {
  const t = today();
  $('homeDate').textContent = cap(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' }));
  const body = $('homeBody'), list = active();
  if (!list.length) {
    body.innerHTML = `<div class="empty"><div class="big">🌱</div><b>Пока нет привычек</b><p>Начни с одной-двух — так проще не бросить. Например:</p>
      <div class="chips">${TEMPLATES.map((x, i) => `<button class="chip" data-tpl="${i}">${x.emoji} ${esc(x.name)}</button>`).join('')}</div>
      <div style="margin-top:22px"><button class="primary" id="emptyAdd">Своя привычка</button></div></div>`;
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
    <div><b>${due === 0 ? 'На сегодня ничего не запланировано' : ok >= due ? 'Всё на сегодня сделано' : `Сегодня: ${ok} из ${due}`}</b><span>${due && ok < due ? `Осталось ${due - ok} ${plural(due - ok, 'привычка', 'привычки', 'привычек')}` : 'Так держать'}</span></div></div>`;
  list.forEach(h => {
    const c = cache.get(h.id) || { cur: 0 }, k = iso(t);
    let meta = '';
    if (c.cur > 0) meta += `${ICON_FLAME}<span>${streakText(c, c.cur)}</span><span>·</span>`;
    else if (isQuit(h) && k >= h.start) meta += `${ICON_FLAME}<span>0 дней</span><span>·</span>`;
    if (isQuit(h)) meta += `<span>${slipped(h, k) ? 'Сегодня срыв' : esc(freqText(h))}</span>`;
    else if (isWeekly(h)) meta += `<span>${weekDone(h, monday(t)).length} из ${h.freq.times} на этой неделе</span>`;
    else if (!scheduled(h, t)) meta += `<span>Сегодня выходной</span>`;
    else meta += `<span>${esc(freqText(h))}</span>`;
    html += `<div class="habit c${h.color}" data-open="${h.id}">
      <div class="hrow"><div class="icon">${esc(h.emoji || '✨')}</div><div class="hname"><b>${esc(h.name)}</b><div class="meta" style="color:${c.cur > 0 ? 'var(--text2)' : ''}">${meta}</div></div>${checkBtn(h, k)}</div>
      <div class="heatwrap" data-hs="${h.id}"><div class="heat" style="--cell:11px">${heatmap(h, Math.max(fit, weeksSince(h)), { markToday: true })}</div></div></div>`;
  });
  body.innerHTML = html;
  body.querySelectorAll('[data-hs]').forEach(el => {          // по умолчанию — к сегодняшнему дню, иначе туда, где остановился
    const p = heatScroll.get(el.dataset.hs);
    el.scrollLeft = !p || p.atEnd ? el.scrollWidth : p.left;
  });
  body.querySelectorAll('[data-open]').forEach(el => el.onclick = () => openDetail(el.dataset.open));
  body.querySelectorAll('[data-check]').forEach(el => press(el, () => tapDay(el.dataset.check, iso(today()), el), () => openDay(el.dataset.check, iso(today()))));
}
$('addBtn').onclick = () => openEditor();

// Отметка: одно нажатие — выполнено/снять; для целей «N раз» — +1
function tapDay(hid, d, el) {
  const h = H(hid); if (!h) return;
  const c = count(h, d), t = target(h), e = entry(h, d);
  if (isQuit(h)) {
    if (d < h.start) { toast('До даты начала отмечать нечего'); return; }
    setLog(h, d, c > 0 ? 0 : 1, e ? e.n : '');
    toast(c > 0 ? 'Срыв убран' : 'Отмечен срыв. Серия начнётся заново');
    return;
  }
  const n = t === 1 ? (c >= 1 ? 0 : 1) : c + 1;
  setLog(h, d, n, e ? e.n : '');
  if (n >= t && c < t) { toast(t === 1 ? 'Готово' : 'Цель на день выполнена'); if (el) { const b = document.querySelector(`[data-check="${hid}"]`); b && b.classList.add('pop'); } }
}
function setLog(h, d, c, note) {
  const m = logs.get(h.id) || new Map(); logs.set(h.id, m);
  if (c > 0 || note) m.set(d, { c, n: note || '' }); else m.delete(d);
  store.setLog(user.uid, h.id, d, c, note || '');
  refresh();
}

// ================= Экран привычки =================
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

  // календарь месяца
  const m0 = new Date(t.getFullYear(), t.getMonth() + detailMonth, 1);
  const days = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
  let cal = WD.map(w => `<div class="wd">${w}</div>`).join('') + '<div></div>'.repeat(wdi(m0));
  for (let i = 1; i <= days; i++) {
    const d = new Date(m0.getFullYear(), m0.getMonth(), i), k = iso(d), n = count(h, k), e = entry(h, k);
    const st = isQuit(h) ? (k < h.start ? 'off pre' : n > 0 ? 's' : d <= t ? 'f' : '') : n >= target(h) ? 'f' : n > 0 ? 'p' : '';
    const cls = ['d', d > t ? 'fut' : '', st, !scheduled(h, d) ? 'off' : '', k === iso(t) ? 't' : '', e && e.n ? 'n' : ''].join(' ');
    cal += `<div class="${cls}" data-day="${k}">${i}</div>`;
  }

  // заметки
  const notes = [...(logs.get(h.id) || new Map()).entries()].filter(([, v]) => v.n).sort((a, b) => b[0] < a[0] ? -1 : 1).slice(0, 30);

  // год: 53 недели, подписи месяцев
  const weeks = Math.max(53, weeksSince(h)), first = addDays(monday(t), -7 * (weeks - 1));
  let months = '';
  for (let w = 0; w < weeks; w++) { const d = addDays(first, w * 7), prev = addDays(d, -7); months += `<span>${w === 0 || d.getMonth() !== prev.getMonth() ? cap(fmt(d, { month: 'short' }).replace('.', '')) : ''}</span>`; }

  el.innerHTML = `
    <div class="navbar"><button class="back" id="dBack"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Привычки</button><button id="dEdit">Изменить</button></div>
    <div class="wrap" style="padding-top:4px">
      <div class="dhead"><div class="icon">${esc(h.emoji || '✨')}</div><div><h2>${esc(h.name)}</h2><p>${esc(freqText(h))}${target(h) > 1 ? ` · ${target(h)} ${esc(unitText(h, target(h)))} в день` : ''}</p></div></div>
      <div class="tiles">
        <div class="tile"><span>Серия</span><b>${c.cur}</b><small>${c.unit === 'week' ? plural(c.cur, 'неделя', 'недели', 'недель') : plural(c.cur, 'день', 'дня', 'дней')}</small></div>
        <div class="tile"><span>Рекорд</span><b>${c.best}</b><small>${c.unit === 'week' ? plural(c.best, 'неделя', 'недели', 'недель') : plural(c.best, 'день', 'дня', 'дней')}</small></div>
        <div class="tile"><span>Всего</span><b>${c.total}</b><small>${isQuit(h) ? plural(c.total, 'чистый день', 'чистых дня', 'чистых дней') : plural(c.total, 'день', 'дня', 'дней') + ' выполнено'}</small></div>
      </div>
      <div class="card"><div class="yearwrap heatwrap" id="yearWrap"><div class="months" style="grid-template-columns:repeat(${weeks},11px)">${months}</div><div class="heat" style="--cell:11px;justify-content:start;margin-top:0">${heatmap(h, weeks)}</div></div></div>
      <div class="sect">Календарь</div>
      <div class="card">
        <div class="pnav"><button id="mPrev" aria-label="Предыдущий месяц">‹</button><span>${cap(fmt(m0, { month: 'long', year: m0.getFullYear() === t.getFullYear() ? undefined : 'numeric' }))}</span><button id="mNext" ${detailMonth >= 0 ? 'disabled' : ''} aria-label="Следующий месяц">›</button></div>
        <div class="cal" id="cal">${cal}</div>
        <div class="hint">${isQuit(h) ? 'Нажми на день — отметить или убрать срыв. Удерживай — заметка.' : `Нажми на день — отметить. Удерживай — ${target(h) > 1 ? 'количество и ' : ''}заметка.`}</div>
      </div>
      <div class="sect">Статистика</div>
      <div class="card">
        <div class="seg" id="dSeg">${['week', 'month', 'year'].map(p => `<button data-p="${p}" class="${p === detailPeriod ? 'on' : ''}">${{ week: 'Неделя', month: 'Месяц', year: 'Год' }[p]}</button>`).join('')}</div>
        <div class="pnav"><button data-dnav="-1" aria-label="Назад">‹</button><span>${periodTitle(detailPeriod, detailOff)}</span><button data-dnav="1" ${detailOff >= 0 ? 'disabled' : ''} aria-label="Вперёд">›</button></div>
        <div class="tiles" id="dTiles"></div>
        <div class="chart" id="dChart"></div>
      </div>
      <div class="sect">Заметки</div>
      <div class="list">${notes.length ? notes.map(([k, v]) => `<div class="note"><small>${cap(fmt(fromIso(k), { weekday: 'short', day: 'numeric', month: 'long' }))}</small><div>${esc(v.n)}</div></div>`).join('') : '<div class="note" style="color:var(--text2);text-align:center">Удерживай день в календаре, чтобы добавить заметку</div>'}</div>
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
  const third = isQuit(h) ? `<div class="tile"><span>Срывов</span><b>${slips}</b><small>за период</small></div>`
    : target(h) > 1
    ? `<div class="tile"><span>В среднем</span><b>${counts.length ? (Math.round(counts.reduce((a, b) => a + b, 0) / counts.length * 10) / 10).toString().replace('.', ',') : '–'}</b><small>${esc(unitText(h, 5))} в день</small></div>`
    : isWeekly(h) ? `<div class="tile"><span>Недель с целью</span><b>${weeksHit(h, days)}</b><small>из ${weeksIn(days)}</small></div>`
    : `<div class="tile"><span>Пропусков</span><b>${missed}</b><small>по расписанию</small></div>`;
  $('dTiles').innerHTML = `<div class="tile"><span>${isQuit(h) ? 'Без срывов' : 'Выполнение'}</span><b>${pct(r)}</b><small>${delta(r, pr)}</small></div>
    <div class="tile"><span>${isQuit(h) ? 'Чистых дней' : 'Выполнено'}</span><b>${doneN}</b><small>${plural(doneN, 'день', 'дня', 'дней')}</small></div>${third}`;
  drawChart($('dChart'), slots, { color: 'var(--c)', tip: s => s.year
    ? [cap(fmt(s.date, { month: 'long' })), s.v == null ? 'Нет данных' : `Выполнение ${pct(s.v)}`]
    : [cap(fmt(s.date, { weekday: 'short', day: 'numeric', month: 'long' })), s.future ? 'Ещё впереди' : s.off ? 'Выходной по расписанию' : s.v == null ? 'Нет данных' : isQuit(h) ? (s.v ? 'Без срыва' : 'Срыв') : target(h) > 1 ? `${s.n || 0} из ${target(h)} ${unitText(h, target(h))}` : s.v >= 1 ? 'Выполнено' : 'Не выполнено'] });
}
const weeksIn = days => new Set(days.filter(d => d <= today()).map(d => iso(monday(d)))).size;
const weeksHit = (h, days) => [...new Set(days.filter(d => d <= today()).map(d => iso(monday(d))))].filter(w => weekDone(h, fromIso(w)).length >= h.freq.times).length;
function delta(r, pr) {
  if (r == null || pr == null) return '';
  const d = Math.round((r - pr) * 100);
  return d === 0 ? 'как раньше' : `${d > 0 ? '+' : '−'}${Math.abs(d)} п.п. к прошлому`;
}

// ================= Периоды и график =================
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
    if (off === 0) return 'Эта неделя'; if (off === -1) return 'Прошлая неделя';
    const s = addDays(monday(t), off * 7), e = addDays(s, 6);
    return `${fmt(s, { day: 'numeric', month: 'short' })} – ${fmt(e, { day: 'numeric', month: 'short' })}`;
  }
  if (p === 'month') { const d = new Date(t.getFullYear(), t.getMonth() + off, 1); return cap(fmt(d, { month: 'long', year: d.getFullYear() === t.getFullYear() ? undefined : 'numeric' })); }
  return String(t.getFullYear() + off);
}
// слоты графика: дни (неделя/месяц) или месяцы (год)
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
  box.innerHTML = '<svg role="img" aria-label="График выполнения"></svg><div class="tip hide"></div>';
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

// ================= Общая статистика =================
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
  $('statTiles').innerHTML = `<div class="tile"><span>Выполнение</span><b>${pct(r)}</b><small>${delta(r, pr)}</small></div>
    <div class="tile"><span>Отметок</span><b>${marks}</b><small>за период</small></div>
    <div class="tile"><span>Идеальных дней</span><b>${perfect}</b><small>всё по плану</small></div>`;
  if (!hs.length) { $('statChart').innerHTML = '<div class="hint" style="margin:30px 0">Добавь привычку, и здесь появится статистика</div>'; $('statList').innerHTML = ''; return; }
  const slots = slotsFor(statPeriod, statOff, d => { const v = rateOver(hs, [d]); return v == null ? null : { v }; }, ds => rateOver(hs, ds));
  drawChart($('statChart'), slots, { color: 'var(--accent)', tip: s => [s.year ? cap(fmt(s.date, { month: 'long' })) : cap(fmt(s.date, { weekday: 'short', day: 'numeric', month: 'long' })), s.future ? 'Ещё впереди' : s.v == null ? 'Ничего не запланировано' : `Выполнение ${pct(s.v)}`] });
  const rows = hs.map(h => ({ h, r: rateOver([h], days) })).sort((a, b) => (b.r ?? -1) - (a.r ?? -1));
  $('statList').innerHTML = rows.map(({ h, r }) => `<button class="row c${h.color}" data-open="${h.id}"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow"><div>${esc(h.name)}</div><div class="meter"><i style="width:${Math.round((r || 0) * 100)}%"></i></div></div><span class="val">${pct(r)}</span><span class="chev">›</span></button>`).join('');
  $('statList').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openDetail(b.dataset.open));
}
addEventListener('resize', () => refresh());

// ================= Нижний лист =================
function openSheet(html, mount) {
  const s = $('sheet'); s.innerHTML = '<div class="grab"></div>' + html; s.scrollTop = 0;
  mount && mount(s);
  $('sheetBg').classList.add('open'); requestAnimationFrame(() => s.classList.add('open'));
}
function closeSheet() { $('sheet').classList.remove('open'); $('sheetBg').classList.remove('open'); }
$('sheetBg').onclick = closeSheet;

// --- день: количество и заметка ---
function openDay(hid, d) {
  const h = H(hid); if (!h) return;
  const e = entry(h, d) || { c: 0, n: '' }, t = isQuit(h) ? 1 : target(h);
  let c = e.c || 0;
  const title = cap(fmt(fromIso(d), { weekday: 'short', day: 'numeric', month: 'long' }));
  openSheet(`<div class="shead"><button id="sCancel">Отмена</button><b>${esc(title)}</b><button id="sDone">Готово</button></div>
    <div class="list c${h.color}"><div class="row"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow"><b style="font-weight:600">${esc(h.name)}</b></div>
    ${t === 1 ? `<input type="checkbox" class="switch" id="sDoneSw" ${c >= 1 ? 'checked' : ''} aria-label="${isQuit(h) ? 'Был срыв' : 'Выполнено'}">` : ''}</div>
    ${isQuit(h) ? '<div class="row" style="color:var(--text2);font-size:15px">Переключатель включён — значит, в этот день был срыв</div>' : ''}</div>
    ${t > 1 ? `<div class="card" style="margin-top:12px"><div class="big-step"><button id="sMinus" aria-label="Меньше">−</button><b id="sCount">${c}</b><button id="sPlus" aria-label="Больше">+</button></div><div class="hint" style="margin-top:0">Цель — ${t} ${esc(unitText(h, t))}</div></div>` : ''}
    <div class="sect">Заметка</div>
    <div class="card"><textarea class="field" id="sNote" maxlength="500" placeholder="Что помогло или помешало?">${esc(e.n || '')}</textarea></div>`, s => {
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

// --- создание и редактирование привычки ---
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
    s.innerHTML = `<div class="grab"></div><div class="shead"><button id="eCancel">Отмена</button><b>${isNew ? 'Новая привычка' : 'Изменить'}</b><button id="eSave">${isNew ? 'Добавить' : 'Готово'}</button></div>
      <div class="list c${f.color}"><div class="row"><div class="sicon" style="width:36px;height:36px;font-size:20px">${esc(f.emoji)}</div><input class="field grow" id="eName" maxlength="60" placeholder="Название, например «Зарядка»" value="${esc(f.name)}"></div></div>
      <div class="sect">Иконка</div>
      <div class="card" style="padding:10px"><div class="emojis">${[...new Set([f.emoji, ...EMOJIS])].map(e => `<button data-emoji="${esc(e)}" class="${e === f.emoji ? 'on' : ''}">${esc(e)}</button>`).join('')}</div>
        <div class="row" style="padding:8px 6px 2px;min-height:0"><span class="grow" style="color:var(--text2);font-size:15px">Свой эмодзи</span><input class="unit" id="eEmoji" maxlength="8" placeholder="вставь сюда" style="width:120px"></div></div>
      <div class="sect">Цвет</div>
      <div class="card"><div class="colors">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<button class="c${i} ${i === f.color ? 'on' : ''}" data-color="${i}" aria-label="Цвет ${i + 1}"></button>`).join('')}</div></div>
      <div class="sect">Тип</div>
      <div class="card">
        <div class="seg" style="margin-bottom:0">${[['build', 'Развить привычку'], ['quit', 'Бросить привычку']].map(([k, t]) => `<button data-kind="${k}" class="${k === f.kind ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${f.kind === 'quit' ? `<div class="row" style="padding:14px 0 0;min-height:0"><span class="grow">Не делаю с</span><input type="date" id="eStart" class="unit" style="width:auto" max="${iso(today())}" value="${f.start}"></div>` : ''}
      </div>
      <div class="foot">${f.kind === 'quit' ? 'Каждый день сам считается выполненным. Отмечай только срывы — серия покажет, сколько дней подряд ты держишься.' : 'Отмечай, когда сделал. Серия — сколько раз подряд получилось по расписанию.'}</div>
      ${f.kind === 'quit' ? '' : `<div class="sect">Расписание</div>
      <div class="card">
        <div class="seg" style="margin-bottom:0">${[['daily', 'Каждый день'], ['days', 'Дни недели'], ['weekly', 'N раз в неделю']].map(([k, t]) => `<button data-mode="${k}" class="${k === mode ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${mode === 'days' ? `<div class="days">${WD.map((w, i) => `<button data-wd="${i}" class="${days.includes(i) ? 'on' : ''}">${w}</button>`).join('')}</div>` : ''}
        ${mode === 'weekly' ? `<div class="row" style="padding:14px 0 0;min-height:0"><span class="grow">${times} ${plural(times, 'раз', 'раза', 'раз')} в неделю, в любые дни</span><div class="stepper"><button data-times="-1" aria-label="Меньше">−</button><button data-times="1" aria-label="Больше">+</button></div></div>` : ''}
      </div>
      <div class="sect">Цель на день</div>
      <div class="list">
        <div class="row"><span class="grow">${f.target === 1 ? 'Просто отметка' : `${f.target} ${esc(unitText(f, f.target))}`}</span><div class="stepper"><button data-tg="-1" aria-label="Меньше">−</button><button data-tg="1" aria-label="Больше">+</button></div></div>
        ${f.target > 1 ? `<div class="row"><span class="grow">Единица</span><input class="unit" id="eUnit" maxlength="20" placeholder="раз" value="${esc(f.unit)}"></div>` : ''}
      </div>
      <div class="foot">Например, 8 стаканов воды или 20 страниц. Для обычной отметки оставь 1.</div>`}
      ${isNew ? '' : `<div class="sect"></div><div class="list">
        <button class="row btn" id="eArchive">${f.archived ? 'Вернуть из архива' : 'Перенести в архив'}</button>
        <button class="row danger" id="eDelete">${delArmed ? 'Нажми ещё раз — удалится вся история' : 'Удалить привычку'}</button></div>`}`;
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
      $('eArchive').onclick = () => { f.archived = !f.archived; commit(); closeSheet(); toast(f.archived ? 'Перенесено в архив' : 'Привычка вернулась'); if (f.archived) closeDetail(); };
      $('eDelete').onclick = () => {
        if (!delArmed) { delArmed = true; draw(); setTimeout(() => { delArmed = false; if ($('eDelete')) $('eDelete').textContent = 'Удалить привычку'; }, 3500); return; }
        const years = [...new Set([...(logs.get(f.id) || new Map()).keys()].map(k => k.slice(0, 4)))];
        habits = habits.filter(x => x.id !== f.id); logs.delete(f.id);
        store.deleteHabit(user.uid, f.id, years);
        closeSheet(); closeDetail(); refresh(); toast('Привычка удалена');
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
    if (!name) { $('eName').focus(); $('eName').placeholder = 'Сначала придумай название'; return; }
    if (f.kind !== 'quit' && mode === 'days' && !days.length) { toast('Выбери хотя бы один день'); return; }
    commit(); closeSheet();
    if (isNew) toast('Привычка добавлена');
  }
  openSheet('', () => {});
  draw();
}

// ================= Настройки =================
function renderAccount() {
  const a = $('avatar'); a.innerHTML = '';
  if (user.photo) { const img = document.createElement('img'); img.src = user.photo; img.referrerPolicy = 'no-referrer'; img.alt = ''; a.appendChild(img); }
  else a.textContent = (user.name || '?').trim().charAt(0).toUpperCase();
  $('userName').textContent = user.name; $('userEmail').textContent = user.email;
}
function renderArchive() {
  const arch = habits.filter(h => h.archived), box = $('archiveList');
  box.innerHTML = arch.length ? arch.map(h => `<button class="row c${h.color}" data-edit="${h.id}"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow">${esc(h.name)}</div><span class="chev">›</span></button>`).join('')
    : '<div class="row" style="color:var(--text2)">Пусто</div>';
  box.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openEditor(H(b.dataset.edit)));
}
$('signOutBtn').onclick = () => store.signOut();

// ================= Импорт и экспорт =================
const HK_COLORS = { blue: 0, sky: 0, orange: 1, emerald: 2, teal: 2, cyan: 2, aqua: 2, yellow: 3, amber: 3, pink: 4, fuchsia: 4, rose: 4, magenta: 4, green: 5, lime: 5, indigo: 6, purple: 6, violet: 6, red: 7 };
const NAME_EMOJI = [[/медит|meditat|йог|yoga/i, '🧘'], [/алког|alcohol|вино|пив|beer|wine/i, '🍷'], [/кур|сигар|smok|cigar|vape/i, '🚭'],
  [/вод|water/i, '💧'], [/чит|read|книг|book/i, '📚'], [/бег|run|jog/i, '🏃'], [/зарядк|гимнаст|gymnast|workout|спорт|fitness|exercis|gym/i, '💪'],
  [/сон|спать|sleep|bed/i, '😴'], [/сахар|sugar|sweet/i, '🍬'], [/гвозд|садху|sadhu/i, '🦶'], [/зуб|floss|teeth/i, '🦷'],
  [/прогул|walk|шаг|step/i, '🚶'], [/англ|english|язык|language|study|учёб|learn/i, '🧠'], [/журнал|journal|дневник|write|писа/i, '✍️']];
const emojiFor = name => (NAME_EMOJI.find(([r]) => r.test(name)) || [0, '✨'])[1];
// HabitKit хранит момент в UTC + смещение пояса — переводим в локальную дату
const localIso = (s, tz) => { const d = new Date(Date.parse(s) + (Number(tz) || 0) * 60000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };

function parseImport(j) {
  if (j && j.app === 'habits' && Array.isArray(j.habits)) return { habits: j.habits, logs: j.logs || {}, source: 'Резервная копия' };
  if (j && Array.isArray(j.habits) && Array.isArray(j.completions)) return fromHabitKit(j);
  throw new Error('format');
}
function fromHabitKit(j) {
  const out = { habits: [], logs: {}, source: 'HabitKit' }, idMap = {};
  const base = Math.min(...j.habits.map(x => Date.parse(x.createdAt) || Date.now()));   // порядок как в HabitKit
  j.habits.slice().sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).forEach((x, i) => {
    const id = 'hk' + String(x.id).replace(/[^a-z0-9]/gi, '').slice(0, 16);
    idMap[x.id] = id;
    // действующая цель — последний интервал (без даты окончания или самый поздний)
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
      id, name: String(x.name || 'Привычка').slice(0, 60), emoji: x.emoji || emojiFor(String(x.name || '')),
      color: HK_COLORS[x.color] ?? i % 8, kind: quit ? 'quit' : 'build', freq, target: quit ? 1 : target, unit: '',
      archived: !!x.archived, start: quit && x.inverseStartDate ? String(x.inverseStartDate).slice(0, 10) : iso(new Date(created)), created: base + i * 1000
    });
    out.logs[id] = {};
  });
  // при нескольких записях за день побеждает самая поздняя
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
  catch (err) { toast('Не понял формат файла'); return; }
  const marks = Object.values(data.logs).reduce((a, m) => a + Object.keys(m).length, 0);
  const again = data.habits.filter(h => H(h.id)).length;
  openSheet(`<div class="shead"><button id="iCancel">Отмена</button><b>Импорт</b><button id="iGo">Импорт</button></div>
    <div class="list">${data.habits.map(h => `<div class="row c${h.color}"><div class="sicon">${esc(h.emoji || '✨')}</div><div class="grow"><div>${esc(h.name)}</div><div class="sub">${h.kind === 'quit' ? 'Бросить привычку' : esc(freqText(h))}${h.archived ? ' · в архиве' : ''} · ${Object.keys(data.logs[h.id] || {}).length} ${plural(Object.keys(data.logs[h.id] || {}).length, 'отметка', 'отметки', 'отметок')}</div></div></div>`).join('')}</div>
    <div class="foot">${esc(data.source)}: ${data.habits.length} ${plural(data.habits.length, 'привычка', 'привычки', 'привычек')}, ${marks} ${plural(marks, 'отметка', 'отметки', 'отметок')}.${again ? ` ${again} уже были импортированы раньше — они обновятся.` : ''} Цвет, иконку и расписание потом можно поменять.</div>`, () => {
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
  toast(`Импортировано: ${data.habits.length} ${plural(data.habits.length, 'привычка', 'привычки', 'привычек')}`);
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
  $('installText').textContent = 'Установи на экран «Домой»: «Поделиться» → «На экран Домой».';
}

// если приложение открыто через полночь — «сегодня» сдвигается само
let lastDay = iso(today());
setInterval(() => { const t = iso(today()); if (t !== lastDay) { lastDay = t; refresh(); } }, 60000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

start();
