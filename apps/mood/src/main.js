import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp
} from 'firebase/firestore';

// ================= Утилиты =================
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const weekStart = d => addDays(d, -((d.getDay() + 6) % 7));
const fmt = (d, o) => new Intl.DateTimeFormat('ru-RU', o).format(d);
const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
const one = x => x == null ? '–' : (Math.round(x * 10) / 10).toString().replace('.', ',');
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };

const LABELS = ['Ужасный день', 'Очень плохой день', 'Плохой день', 'Тяжёлый день', 'Так себе', 'Обычный день',
  'Неплохой день', 'Хороший день', 'Очень хороший день', 'Отличный день', 'Лучший'];

let toastId;
function toast(t) {
  const e = $('toast'); e.textContent = t; e.classList.add('show');
  clearTimeout(toastId); toastId = setTimeout(() => e.classList.remove('show'), 1800);
}

// ================= Хранилище: Firebase или демо =================
const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
const DEMO = !CFG.apiKey || /^PASTE/.test(CFG.apiKey);

function firebaseBackend() {
  const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname);
  // authDomain = наш же домен: запросы /__/auth/* Netlify проксирует в Firebase (см. _redirects)
  const app = initializeApp({ ...CFG, authDomain: local ? `${CFG.projectId}.firebaseapp.com` : location.host });
  const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver
  });
  let db;
  try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) }); }
  catch (e) { db = getFirestore(app); }
  let unsub = null;
  return {
    onUser(cb) {
      getRedirectResult(auth).catch(e => { $('loginErr').textContent = authError(e); });
      onAuthStateChanged(auth, u => cb(u && { uid: u.uid, name: u.displayName || 'Без имени', email: u.email || '', photo: u.photoURL }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(auth, p); },
    signOut() { if (unsub) unsub(); return signOut(auth); },
    listen(uid, cb) {
      if (unsub) unsub();
      unsub = onSnapshot(collection(db, 'users', uid, 'days'), snap => {
        const m = new Map(); snap.forEach(d => m.set(d.id, d.data())); cb(m);
      }, e => toast('Ошибка загрузки: ' + (e.code || e.message)));
    },
    // без await: при плохом интернете запись сначала ложится в локальный кэш и уходит позже
    save(uid, date, score, note) { setDoc(doc(db, 'users', uid, 'days', date), { score, note, updatedAt: serverTimestamp() }).catch(e => toast('Не сохранилось: ' + (e.code || e.message))); },
    remove(uid, date) { deleteDoc(doc(db, 'users', uid, 'days', date)).catch(e => toast('Не удалилось: ' + (e.code || e.message))); },
    token() { return auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null); }
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
  const KEY = 'mood-demo';
  const read = () => { try { return new Map(Object.entries(JSON.parse(localStorage.getItem(KEY) || '{}'))); } catch (e) { return new Map(); } };
  let cb = null;
  const write = m => { try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(m))); } catch (e) {} cb && cb(read()); };
  return {
    onUser(f) { f({ uid: 'demo', name: 'Демо', email: 'Данные только на этом устройстве', photo: null }); },
    signIn() {}, signOut() { toast('В демо-режиме выходить некуда'); },
    listen(uid, f) { cb = f; f(read()); },
    save(uid, date, score, note) { const m = read(); m.set(date, { score, note }); write(m); },
    remove(uid, date) { const m = read(); m.delete(date); write(m); },
    token() { return Promise.resolve(null); }
  };
}

const store = DEMO ? demoBackend() : firebaseBackend();

// ================= Состояние =================
let user = null;
let entries = new Map();
let rateDate = iso(today());       // за какой день ставим оценку
let editing = false;
let period = 'week', offset = 0;

function start() {
  store.onUser(u => {
  user = u;
  $('login').classList.toggle('hide', !!u);
  $('main').classList.toggle('hide', !u);
  if (!u) { entries = new Map(); return; }
  $('demoBanner').classList.toggle('hide', !DEMO);
  renderAccount();
  store.listen(u.uid, m => { entries = m; renderToday(); renderStats(); });
  loadReminder();
  });
}

$('signInBtn').onclick = () => {
  $('loginErr').textContent = '';
  store.signIn().catch(e => { $('loginErr').textContent = authError(e); });
};

// ================= Вкладки =================
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
function showTab(t) {
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hide', s.id !== 'tab-' + t));
  scrollTo(0, 0);
  if (t === 'stats') renderStats();
}

// ================= Сегодня =================
const slider = $('slider');
function paintSlider() {
  const v = Number(slider.value);
  slider.style.setProperty('--p', (v * 10) + '%');
  $('scoreNum').textContent = v;
  $('scoreLabel').textContent = LABELS[v];
}
slider.addEventListener('input', () => {
  paintSlider();
  const n = $('scoreNum'); n.classList.add('bump'); setTimeout(() => n.classList.remove('bump'), 120);
});

document.querySelectorAll('#daySeg button').forEach(b => b.onclick = () => {
  rateDate = iso(addDays(today(), Number(b.dataset.off)));
  editing = false; renderToday();
});

function renderToday() {
  const t = iso(today()), y = iso(addDays(today(), -1));
  const d = fromIso(rateDate);
  $('todayTitle').textContent = rateDate === t ? 'Сегодня' : rateDate === y ? 'Вчера' : fmt(d, { day: 'numeric', month: 'long' });
  const wd = fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
  $('todayDate').textContent = wd.charAt(0).toUpperCase() + wd.slice(1);
  document.querySelectorAll('#daySeg button').forEach(b =>
    b.classList.toggle('on', iso(addDays(today(), Number(b.dataset.off))) === rateDate));
  $('question').textContent = rateDate === t ? 'Как прошёл день?' : 'Как прошёл этот день?';

  const e = entries.get(rateDate);
  const showForm = !e || editing;
  $('form').classList.toggle('hide', !showForm);
  $('saved').classList.toggle('hide', showForm);
  if (showForm) {
    if (!$('form').dataset.for || $('form').dataset.for !== rateDate + (e ? '1' : '0') + editing) {
      slider.value = e ? e.score : 5;
      $('note').value = e && e.note || '';
      $('form').dataset.for = rateDate + (e ? '1' : '0') + editing;
    }
    paintSlider();
    $('saveBtn').textContent = e ? 'Сохранить изменения' : 'Сохранить';
    $('cancelBtn').classList.toggle('hide', !e);
  } else {
    $('savedWhen').textContent = rateDate === t ? 'Твой день сегодня' : 'Твой день';
    $('savedScore').textContent = e.score;
    $('savedLabel').textContent = LABELS[e.score];
    $('savedNote').textContent = e.note || '';
    $('savedNote').classList.toggle('hide', !e.note);
  }
  resetDelete();
}

$('saveBtn').onclick = () => {
  const score = Number(slider.value), note = $('note').value.trim().slice(0, 1000);
  store.save(user.uid, rateDate, score, note);
  entries.set(rateDate, { score, note });     // сразу показываем, не дожидаясь сети
  editing = false; $('form').dataset.for = '';
  renderToday(); renderStats();
  toast('Сохранено');
  if (rateDate === iso(today())) reminderApi({ action: 'rated', date: rateDate });
};
$('editBtn').onclick = () => { editing = true; $('form').dataset.for = ''; renderToday(); };
$('cancelBtn').onclick = () => { editing = false; renderToday(); };

let delArmed = null;
function resetDelete() { clearTimeout(delArmed); delArmed = null; $('delBtn').textContent = 'Удалить оценку'; }
$('delBtn').onclick = () => {
  if (!delArmed) { $('delBtn').textContent = 'Нажми ещё раз, чтобы удалить'; delArmed = setTimeout(resetDelete, 3500); return; }
  resetDelete();
  store.remove(user.uid, rateDate);
  entries.delete(rateDate);
  editing = false; $('form').dataset.for = '';
  renderToday(); renderStats();
  toast('Оценка удалена');
  if (rateDate === iso(today())) reminderApi({ action: 'rated', date: null });
};

// ================= Статистика =================
document.querySelectorAll('#periodSeg button').forEach(b => b.onclick = () => {
  period = b.dataset.p; offset = 0;
  document.querySelectorAll('#periodSeg button').forEach(x => x.classList.toggle('on', x === b));
  renderStats();
});
$('prevP').onclick = () => { offset--; renderStats(); };
$('nextP').onclick = () => { if (offset < 0) { offset++; renderStats(); } };

const MONTHS_SHORT = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Возвращает слоты периода: [{key, label, value, count, date?, note?}]
function slotsFor(p, off) {
  const t = today();
  if (p === 'week') {
    const s = addDays(weekStart(t), off * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(s, i), k = iso(d), e = entries.get(k);
      return { key: k, date: d, label: WD[i], value: e ? e.score : null, note: e && e.note, isToday: k === iso(t), future: d > t };
    });
  }
  if (p === 'month') {
    const m0 = new Date(t.getFullYear(), t.getMonth() + off, 1);
    const n = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(m0.getFullYear(), m0.getMonth(), i + 1), k = iso(d), e = entries.get(k);
      const day = i + 1;
      return { key: k, date: d, label: (day === 1 || day % 5 === 0) && day !== 30 || day === n ? String(day) : '', value: e ? e.score : null, note: e && e.note, isToday: k === iso(t), future: d > t };
    });
  }
  const y = t.getFullYear() + off;
  return Array.from({ length: 12 }, (_, m) => {
    const vals = [];
    entries.forEach((e, k) => { if (k.startsWith(`${y}-${pad(m + 1)}-`)) vals.push(e.score); });
    const d = new Date(y, m, 1);
    return { key: `${y}-${pad(m + 1)}`, date: d, label: MONTHS_SHORT[m], value: avg(vals), count: vals.length, isToday: y === t.getFullYear() && m === t.getMonth(), future: d > t };
  });
}

function periodTitle(p, off) {
  const t = today();
  if (p === 'week') {
    const s = addDays(weekStart(t), off * 7), e = addDays(s, 6);
    if (off === 0) return 'Эта неделя';
    if (off === -1) return 'Прошлая неделя';
    const same = s.getMonth() === e.getMonth();
    return same ? `${s.getDate()}–${e.getDate()} ${fmt(e, { month: 'long', day: 'numeric' }).split(' ')[1]}`
                : `${fmt(s, { day: 'numeric', month: 'short' })} – ${fmt(e, { day: 'numeric', month: 'short' })}`;
  }
  if (p === 'month') {
    const d = new Date(t.getFullYear(), t.getMonth() + off, 1);
    const s = fmt(d, { month: 'long', year: d.getFullYear() === t.getFullYear() ? undefined : 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return String(t.getFullYear() + off);
}

function dayValues(p, off) {
  // все дневные оценки периода (для года тоже по дням, а не по месяцам)
  if (p !== 'year') return slotsFor(p, off).filter(s => s.value != null).map(s => ({ k: s.key, v: s.value, d: s.date }));
  const y = String(today().getFullYear() + off), out = [];
  entries.forEach((e, k) => { if (k.startsWith(y + '-')) out.push({ k, v: e.score, d: fromIso(k) }); });
  return out;
}

function renderStats() {
  if (!user) return;
  $('periodLabel').textContent = periodTitle(period, offset);
  $('nextP').disabled = offset >= 0;

  const cur = dayValues(period, offset), prev = dayValues(period, offset - 1);
  const a = avg(cur.map(x => x.v)), pa = avg(prev.map(x => x.v));
  $('avgV').textContent = one(a);
  const prevName = { week: 'прошлой неделе', month: 'прошлому месяцу', year: 'прошлому году' }[period];
  if (a != null && pa != null) {
    const diff = Math.round((a - pa) * 10) / 10;
    $('avgD').textContent = diff === 0 ? 'как раньше' : `${diff > 0 ? '+' : '−'}${one(Math.abs(diff))} к ${prevName}`;
  } else $('avgD').textContent = '';

  const slots = slotsFor(period, offset);
  const possible = period === 'year'
    ? (offset === 0 ? Math.round((today() - new Date(today().getFullYear(), 0, 1)) / 864e5) + 1 : (new Date(today().getFullYear() + offset, 1, 29).getMonth() === 1 ? 366 : 365))
    : slots.filter(s => !s.future).length;
  $('cntV').textContent = cur.length;
  $('cntD').textContent = `из ${possible} ${plural(possible, 'дня', 'дней', 'дней')}`;

  if (period === 'year') {
    const best = slots.filter(s => s.value != null).sort((x, y) => y.value - x.value)[0];
    $('bestT').textContent = 'Лучший';
    $('bestV').textContent = best ? one(best.value) : '–';
    $('bestD').textContent = best ? fmt(best.date, { month: 'long' }) : '';
  } else {
    const best = cur.slice().sort((x, y) => y.v - x.v || y.d - x.d)[0];
    $('bestT').textContent = 'Лучший';
    $('bestV').textContent = best ? best.v : '–';
    $('bestD').textContent = best ? fmt(best.d, { day: 'numeric', month: 'short' }) : '';
  }

  drawChart(slots, a);
  renderEntries(slots);
}

// ---------- график ----------
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };

function barPath(x, w, y0, y1) {
  // столбик от базовой линии, скруглён только сверху (4px)
  const h = y0 - y1, r = Math.min(4, w / 2, h);
  return `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 + r} V${y0} Z`;
}

function drawChart(slots, average) {
  const svg = $('chart');
  svg.innerHTML = '';
  $('tip').classList.add('hide');
  const W = svg.clientWidth || 320, H = 220;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const L = 22, R = 6, T = 10, B = 24;
  const pw = W - L - R, ph = H - T - B;
  const y = v => T + ph - (v / 10) * ph;
  const n = slots.length, slotW = pw / n;
  const barW = Math.max(2, Math.min(n === 7 ? 30 : n === 12 ? 18 : 10, slotW - 2));   // минимум 2px зазора

  // сетка и подписи оси: 0, 5, 10
  [0, 5, 10].forEach(v => {
    svgEl('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: 'var(--grid)', 'stroke-width': 1 }, svg);
    svgEl('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
  });

  const bars = [];
  slots.forEach((s, i) => {
    const cx = L + slotW * i + slotW / 2, x = cx - barW / 2;
    if (s.value != null) {
      const top = Math.min(y(s.value), y(0) - 3);           // оценка 0 — короткий столбик, чтобы отличить от «нет оценки»
      bars.push(svgEl('path', { d: barPath(x, barW, y(0), top), fill: 'var(--accent)' }, svg));
    } else {
      bars.push(null);
      if (!s.future) svgEl('circle', { cx, cy: y(0) - 3, r: 1.6, fill: 'var(--text3)' }, svg);
    }
    if (s.label) {
      const tx = svgEl('text', { x: cx, y: H - 6, 'text-anchor': 'middle' }, svg);
      tx.textContent = s.label;
      if (s.isToday) tx.setAttribute('class', 'today');
    }
  });

  // средняя линия
  if (average != null) {
    svgEl('line', { x1: L, x2: W - R, y1: y(average), y2: y(average), stroke: 'var(--text2)', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
  }

  // область касания: вся высота колонки, шире столбика
  const hit = svgEl('rect', { x: L, y: 0, width: pw, height: H, fill: 'transparent' }, svg);
  let active = -1;
  const pick = ev => {
    const r = svg.getBoundingClientRect();
    const i = Math.floor((ev.clientX - r.left - L * (r.width / W)) / (slotW * (r.width / W)));
    if (i < 0 || i >= n) return;
    if (i !== active) { active = i; showTip(i); }
  };
  const showTip = i => {
    const s = slots[i], tip = $('tip');
    bars.forEach((b, j) => b && b.setAttribute('opacity', j === i ? 1 : .35));
    tip.innerHTML = '';
    let head;
    if (period === 'year') head = fmt(s.date, { month: 'long' });
    else head = fmt(s.date, { weekday: 'short', day: 'numeric', month: 'long' });
    tip.appendChild(el('div', '', head.charAt(0).toUpperCase() + head.slice(1)));
    const v = el('b');
    if (s.value == null) v.textContent = s.future ? 'Ещё впереди' : 'Нет оценки';
    else if (period === 'year') v.textContent = `Среднее ${one(s.value)} · ${s.count} ${plural(s.count, 'день', 'дня', 'дней')}`;
    else v.textContent = `${s.value} · ${LABELS[s.value]}`;
    tip.appendChild(v);
    if (s.note) tip.appendChild(el('div', 'n', s.note));
    tip.classList.remove('hide');
    const box = svg.parentNode.getBoundingClientRect(), r = svg.getBoundingClientRect();
    const cx = (L + slotW * i + slotW / 2) * (r.width / W) + (r.left - box.left);
    const half = tip.offsetWidth / 2;
    tip.style.left = Math.max(half + 4, Math.min(box.width - half - 4, cx)) + 'px';
  };
  const clear = () => { active = -1; bars.forEach(b => b && b.setAttribute('opacity', 1)); $('tip').classList.add('hide'); };
  hit.addEventListener('pointerdown', pick);
  hit.addEventListener('pointermove', pick);
  hit.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') clear(); });
  svg.dataset.bound || document.addEventListener('pointerdown', e => { if (!svg.contains(e.target)) clear(); });
  svg.dataset.bound = 1;
}
addEventListener('resize', () => { if (!$('tab-stats').classList.contains('hide')) renderStats(); });

// ---------- список записей ----------
function renderEntries(slots) {
  const box = $('entries');
  box.innerHTML = '';
  if (period === 'year') {
    $('entriesTitle').textContent = 'По месяцам';
    const rows = slots.filter(s => s.count).reverse();
    if (!rows.length) return box.appendChild(el('div', 'empty', 'За этот год пока нет оценок'));
    rows.forEach(s => {
      const r = el('div', 'row');
      const g = el('div', 'grow'); const m = fmt(s.date, { month: 'long' });
      g.appendChild(el('div', '', m.charAt(0).toUpperCase() + m.slice(1)));
      g.appendChild(el('div', 'sub', `${s.count} ${plural(s.count, 'день', 'дня', 'дней')}`));
      r.appendChild(g); r.appendChild(el('div', 'badge', one(s.value)));
      box.appendChild(r);
    });
    return;
  }
  $('entriesTitle').textContent = 'Записи';
  const rows = slots.filter(s => s.value != null).reverse();
  if (!rows.length) return box.appendChild(el('div', 'empty', 'За этот период пока нет оценок'));
  rows.forEach(s => {
    const r = el('button', 'row');
    const g = el('div', 'grow'); const d = fmt(s.date, { weekday: 'short', day: 'numeric', month: 'long' });
    g.appendChild(el('div', '', d.charAt(0).toUpperCase() + d.slice(1)));
    g.appendChild(el('div', 'sub', s.note || LABELS[s.value]));
    r.appendChild(g); r.appendChild(el('div', 'badge', s.value)); r.appendChild(el('span', 'chev', '›'));
    r.onclick = () => { rateDate = s.key; editing = false; renderToday(); showTab('today'); };
    box.appendChild(r);
  });
}

// ================= Настройки =================
function renderAccount() {
  const a = $('avatar'); a.innerHTML = '';
  if (user.photo) { const img = el('img'); img.src = user.photo; img.referrerPolicy = 'no-referrer'; img.alt = ''; a.appendChild(img); }
  else a.textContent = (user.name || '?').trim().charAt(0).toUpperCase();
  $('userName').textContent = user.name;
  $('userEmail').textContent = user.email;
}
$('signOutBtn').onclick = () => store.signOut();

for (let h = 0; h < 24; h++) $('remHour').appendChild(new Option(`${pad(h)}:00`, h));
$('remHour').value = 21;

const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (isIOS && !standalone) {
  $('installSect').classList.remove('hide'); $('installBox').classList.remove('hide');
  $('installText').textContent = 'Установи на экран «Домой»: «Поделиться» → «На экран Домой». Без этого на iPhone не будут приходить напоминания.';
}

// ---------- напоминания (Web Push через Netlify Functions) ----------
let vapidKey = null;
async function reminderApi(body) {
  if (DEMO) return null;
  try {
    const tok = await store.token();
    if (!tok) return null;
    const r = await fetch('/api/reminder', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok }, body: JSON.stringify(body) });
    return r.ok ? r.json() : null;
  } catch (e) { return null; }
}
function remNote(t) { $('remNote').textContent = t; }
const REM_DEFAULT = 'Придёт уведомление, если ты ещё не оценил день. Это необязательно.';

async function loadReminder() {
  const on = $('remOn'), hour = $('remHour');
  if (DEMO) { on.disabled = hour.disabled = true; return remNote('Напоминания заработают после настройки Firebase и деплоя через Netlify CLI.'); }
  try {
    const r = await fetch('/api/reminder', { cache: 'no-store' });
    const j = r.ok && (r.headers.get('content-type') || '').includes('json') ? await r.json() : null;
    vapidKey = j && j.vapidPublicKey;
  } catch (e) {}
  if (!vapidKey) { on.disabled = hour.disabled = true; return remNote('Сервер напоминаний не настроен. Смотри шаг 4 в инструкции.'); }
  const s = await reminderApi({ action: 'get' });
  if (s) { on.checked = !!s.enabled; hour.value = s.hour; }
  // если на этом устройстве разрешение отозвано — честно показываем выключенным
  if (on.checked && 'Notification' in window && Notification.permission !== 'granted') on.checked = false;
  $('remTest').classList.toggle('hide', !on.checked);
  remNote(REM_DEFAULT);
}

const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)); };

$('remOn').onchange = async () => {
  const on = $('remOn');
  $('remTest').classList.toggle('hide', !on.checked);
  if (!on.checked) { await reminderApi({ action: 'save', enabled: false }); return remNote('Напоминание выключено.'); }
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    on.checked = false;
    return remNote(isIOS && !standalone ? 'Сначала установи приложение на экран «Домой», потом включи напоминание там.' : 'Этот браузер не поддерживает уведомления.');
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { on.checked = false; return remNote('Уведомления запрещены. Разреши их в настройках телефона для этого приложения.'); }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(vapidKey) });
    const r = await reminderApi({ action: 'save', enabled: true, hour: Number($('remHour').value), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, subscription: sub.toJSON() });
    if (!r) throw new Error('server');
    remNote(`Готово. Напомню в ${pad($('remHour').value)}:00, если день ещё не оценён.`);
  } catch (e) { on.checked = false; $('remTest').classList.add('hide'); remNote('Не получилось включить напоминание. Попробуй ещё раз.'); }
};
$('remTest').onclick = async () => {
  const r = await reminderApi({ action: 'test' });
  remNote(r && r.devices ? 'Отправил. Уведомление должно прийти через несколько секунд.' : 'Не получилось отправить. Выключи и снова включи напоминание.');
};
$('remHour').onchange = async () => {
  const r = await reminderApi({ action: 'save', hour: Number($('remHour').value), tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
  if (r && $('remOn').checked) remNote(`Напомню в ${pad($('remHour').value)}:00, если день ещё не оценён.`);
};

// ================= Обновление дат и офлайн =================
// если приложение открыто через полночь — «Сегодня» сдвигается само
let lastDay = iso(today());
setInterval(() => { const t = iso(today()); if (t !== lastDay) { if (rateDate === lastDay) rateDate = t; lastDay = t; renderToday(); renderStats(); } }, 60000);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

// запуск — в самом конце, когда всё объявлено
start();
