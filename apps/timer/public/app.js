(function () {
'use strict';
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

// ================= Настройки =================
const DEFAULTS = { buttons: [30, 60, 300], delay: 400, rep: 400, acc: 0, wake: true, sound: true, loop: true };
const STEPS = [5, 10, 15, 20, 30, 45, 60, 120, 180, 300, 600, 900, 1800, 3600];
let S = Object.assign({}, DEFAULTS, store.get('timer-settings', {}));
const saveS = () => store.set('timer-settings', S);
const label = s => s < 60 ? `+${s}с` : s < 3600 ? `+${s / 60}м` : `+${s / 3600}ч`;
const longLabel = s => s < 60 ? `${s} сек` : s < 3600 ? `${s / 60} мин` : `${s / 3600} ч`;

let toastId;
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastId); toastId = setTimeout(() => e.classList.remove('show'), 1600); }

// ================= Удержание кнопки =================
// нажал — +1 раз; держишь дольше «паузы» — добавляется шагами (с ускорением, если включено)
function holdButton(btn, onAdd) {
  let t = null;
  const stop = () => { clearTimeout(t); t = null; btn.classList.remove('on'); };
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { btn.setPointerCapture(e.pointerId); } catch (x) {}
    btn.classList.add('on');
    onAdd();
    let step = S.rep;
    const loop = () => { onAdd(); step = Math.max(60, step * (1 - S.acc / 100)); t = setTimeout(loop, step); };
    t = setTimeout(loop, S.delay);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => btn.addEventListener(n, stop));
}

// ================= Таймер =================
const MAX = 24 * 3600 - 1;
// состояние хранится, чтобы таймер пережил сворачивание и перезапуск приложения
let T = Object.assign({ status: 'idle', left: 0, total: 0, endAt: 0, last: 0 }, store.get('timer-state', {}));
const saveT = () => store.set('timer-state', T);
let tick = null, ringId = null, ringStop = null;

const fmt = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(x); };
const remaining = () => T.status === 'running' ? Math.max(0, (T.endAt - Date.now()) / 1000) : T.left;

function add(sec) {
  if (T.status === 'ringing') stopRing();
  if (T.status === 'running') { T.endAt = Math.min(T.endAt + sec * 1000, Date.now() + MAX * 1000); T.total = Math.min(T.total + sec, MAX); }
  else { T.left = Math.min(T.left + sec, MAX); T.total = T.status === 'paused' ? Math.min(T.total + sec, MAX) : T.left; if (T.status !== 'paused') T.status = T.left ? 'ready' : 'idle'; }
  saveT(); render();
  const el = $('time'); el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 90);
}

function start() {
  if (T.status === 'ringing') { stopRing(); return; }
  if (T.status === 'running') { pause(); return; }
  if (!T.left && T.last) { T.left = T.total = T.last; }       // «Повторить» прошлый таймер
  if (!T.left) { toast('Сначала добавь время'); return; }
  unlockAudio();
  if (T.status !== 'paused') T.total = T.left;
  T.last = T.total;
  T.endAt = Date.now() + T.left * 1000; T.status = 'running';
  saveT(); run(); wakeOn();
}
function pause() { T.left = Math.ceil(remaining()); T.status = 'paused'; saveT(); clearInterval(tick); wakeOff(); render(); }
function reset() {
  if (T.status === 'ringing') stopRing();
  clearInterval(tick); wakeOff();
  // первое нажатие на пустом таймере забывает и «Повторить»
  if (T.status === 'idle' && !T.left) T.last = 0;
  T = { status: 'idle', left: 0, total: 0, endAt: 0, last: T.last };
  saveT(); render();
}
function run() {
  clearInterval(tick);
  tick = setInterval(() => { if (remaining() <= 0) finish(); else render(); }, 200);
  render();
}
function finish() {
  clearInterval(tick);
  T.status = 'ringing'; T.left = 0; saveT(); render();
  ring();
}

// ================= Отрисовка =================
const ARC = 2 * Math.PI * 142;
function render() {
  const r = remaining();
  const t = $('time'); t.textContent = fmt(r); t.classList.toggle('long', r >= 3600);
  const frac = T.total ? Math.min(1, r / T.total) : 0;
  $('arc').style.strokeDashoffset = ARC * (1 - (T.status === 'idle' || T.status === 'ready' ? (T.left ? 1 : 0) : frac));
  $('arc').style.stroke = T.status === 'paused' ? 'var(--pause)' : T.status === 'ringing' ? 'var(--stop)' : 'var(--accent)';
  const st = { idle: T.last ? 'Повторить ' + fmt(T.last) + '?' : 'Добавь время', ready: 'Нажми «Старт»', running: '', paused: 'Пауза', ringing: 'Время вышло' }[T.status];
  $('state').textContent = st;
  if (T.status === 'running') {
    const d = new Date(T.endAt);
    $('ends').innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a.75.75 0 0 1 .75.75v.3a5.25 5.25 0 0 1 4.5 5.2v2.6l1.1 1.6a.6.6 0 0 1-.5.95H2.15a.6.6 0 0 1-.5-.95l1.1-1.6v-2.6a5.25 5.25 0 0 1 4.5-5.2v-.3A.75.75 0 0 1 8 1.5zM6.3 13.6h3.4a1.7 1.7 0 0 1-3.4 0z"/></svg>${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } else $('ends').textContent = '';
  const g = $('goBtn');
  g.className = 'round' + (T.status === 'running' ? ' pause' : T.status === 'ringing' ? ' stop' : '');
  g.textContent = T.status === 'running' ? 'Пауза' : T.status === 'ringing' ? 'Стоп' : T.status === 'paused' ? 'Дальше' : (T.status === 'idle' && T.last ? 'Повтор' : 'Старт');
}

// ================= Звук =================
let ac = null;
function unlockAudio() {      // iPhone разрешает звук только после нажатия — «разогреваем» его на «Старте»
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {}
}
function chime() {
  if (!S.sound || !ac) return;
  const now = ac.currentTime;
  [0, 0.18, 0.36].forEach((t, i) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = i === 2 ? 1175 : 988;
    o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.0001, now + t);
    g.gain.exponentialRampToValueAtTime(0.35, now + t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.16);
    o.start(now + t); o.stop(now + t + 0.18);
  });
}
function ring() {
  unlockAudio(); chime();
  try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (e) {}
  if (S.loop) { ringId = setInterval(() => { chime(); try { navigator.vibrate && navigator.vibrate(300); } catch (e) {} }, 1300); ringStop = setTimeout(stopRing, 60000); }
  else setTimeout(stopRing, 1500);
}
function stopRing() {
  clearInterval(ringId); clearTimeout(ringStop); ringId = ringStop = null;
  if (T.status === 'ringing') { T.status = 'idle'; saveT(); }
  wakeOff(); render();
}

// ================= Экран не гаснет =================
let lock = null;
async function wakeOn() {
  if (!S.wake || !('wakeLock' in navigator) || lock) return;
  try { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } catch (e) { lock = null; }
}
function wakeOff() { if (lock) { lock.release().catch(() => {}); lock = null; } }
// после сворачивания браузер снимает запрет — возвращаем его, если таймер ещё идёт
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (T.status === 'running') { if (remaining() <= 0) finish(); else { run(); wakeOn(); } }
});

// ================= Кнопки таймера =================
function buildAdds() {
  const box = $('adds'); box.innerHTML = '';
  S.buttons.forEach(s => { const b = document.createElement('button'); b.className = 'add'; b.textContent = label(s); b.setAttribute('aria-label', 'Добавить ' + longLabel(s)); holdButton(b, () => add(s)); box.appendChild(b); });
  const tb = $('tryBtns'); tb.innerHTML = '';
  S.buttons.forEach(s => { const b = document.createElement('button'); b.className = 'add'; b.textContent = label(s); holdButton(b, () => tryAdd(s)); tb.appendChild(b); });
}
$('goBtn').onclick = start;
$('resetBtn').onclick = reset;

// ================= Вкладки =================
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#tabbar button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hide', s.id !== 'tab-' + b.dataset.tab));
  scrollTo(0, 0);
});

// ================= Экран настроек =================
let trySec = 0;
function tryAdd(s) { trySec = Math.min(trySec + s, MAX); $('tryV').textContent = fmt(trySec); }
$('tryClear').onclick = () => { trySec = 0; $('tryV').textContent = '00:00'; };

function paintRange(el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
function fillSettings() {
  [0, 1, 2].forEach(i => {
    const sel = $('b' + i); sel.innerHTML = '';
    STEPS.forEach(s => sel.appendChild(new Option(longLabel(s), s)));
    sel.value = S.buttons[i];
    sel.onchange = () => { S.buttons[i] = Number(sel.value); saveS(); buildAdds(); };
  });
  const ranges = { delay: v => v + ' мс', rep: v => v + ' мс', acc: v => Number(v) ? '−' + v + '% за шаг' : 'нет' };
  Object.keys(ranges).forEach(k => {
    const el = $(k); el.value = S[k]; $(k + 'V').textContent = ranges[k](S[k]); paintRange(el);
    el.oninput = () => { S[k] = Number(el.value); $(k + 'V').textContent = ranges[k](el.value); paintRange(el); saveS(); };
  });
  ['wake', 'sound', 'loop'].forEach(k => { $(k).checked = !!S[k]; $(k).onchange = () => { S[k] = $(k).checked; saveS(); if (k === 'wake') { if (S.wake && T.status === 'running') wakeOn(); else wakeOff(); } }; });
  if (!('wakeLock' in navigator)) $('wakeNote').textContent = 'Этот браузер не умеет держать экран включённым. На iPhone нужна iOS 18.4 или новее.';
}
$('testSound').onclick = () => { unlockAudio(); const was = S.sound; S.sound = true; chime(); S.sound = was; if (!was) toast('Звук выключен в настройках выше'); };
$('defaults').onclick = () => { S = Object.assign({}, DEFAULTS, { buttons: DEFAULTS.buttons.slice() }); saveS(); fillSettings(); buildAdds(); toast('Настройки сброшены'); };

// ================= Запуск =================
buildAdds(); fillSettings();
if (T.status === 'running') { if (remaining() <= 0) { T.status = 'idle'; T.left = 0; saveT(); render(); toast('Таймер закончился, пока приложение было закрыто'); } else { run(); wakeOn(); } }
else if (T.status === 'ringing') { T.status = 'idle'; saveT(); render(); }
else render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
