// ===== Настройки =====
const TURN_URL = '';      // ссылка на TURN из кабинета Metered (необязательно)
const VIDEO_KBPS = 1500;  // качество при хорошей связи, кбит/с (при плохой снижается автоматически)
const AUDIO_KBPS = 64;    // потолок звука, кбит/с

const $ = id => document.getElementById(id);
const body = document.body, pip = $('pip');
const CAM_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="14" height="12" rx="3.5"/><path d="M17 10.5l5-3v9l-5-3z"/></svg>';
let room = location.hash.slice(1);
let peer, stream, call, iceServers, isHost = false, facing = 'user', timerId, t0, weak = false, hideId, corner = 'tr', drag = null;

const say = t => $('sub').textContent = t;
const hint = t => $('hint').textContent = t;
const linkOf = r => location.origin + location.pathname + '#' + r;
addEventListener('hashchange', () => location.reload());

// ===== Постоянная ссылка: хранится на этом устройстве =====
function newRoomId() {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = 'call-';
  for (let i = 0; i < 10; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
function myRoom(fresh) {
  let r = null;
  try { r = fresh ? null : localStorage.getItem('room'); } catch (e) {}
  if (!r) { r = newRoomId(); try { localStorage.setItem('room', r); } catch (e) {} }
  return r;
}

function home(fresh) {
  const r = myRoom(fresh);
  $('title').textContent = 'Видеозвонок';
  say('Твоя постоянная ссылка:');
  hint(linkOf(r).replace(/^https?:\/\//, ''));
  setMain('Начать звонок', () => { room = r; history.replaceState(null, '', '#' + r); hint(''); setNew(''); $('install').classList.add('hide'); start(); });
  setAlt('Отправить ссылку', () => share(r));
  setNew('Создать новую ссылку', () => { if (confirmNew()) home(true); });
}
function confirmNew() {
  const b = $('newBtn');
  if (b.dataset.sure) return true;
  b.dataset.sure = 1; b.textContent = 'Старая ссылка перестанет работать. Нажми ещё раз';
  setTimeout(() => { delete b.dataset.sure; if (!b.classList.contains('hide')) b.textContent = 'Создать новую ссылку'; }, 4000);
  return false;
}

if (room) { try { localStorage.setItem('room', room); } catch (e) {} }
if (room) { say('Постоянная ссылка для звонка'); setMain('Подключиться', start); setAlt(''); setNew(''); }
else home();

// ===== Кнопки внизу =====
function setMain(text, fn) {
  const b = $('mainBtn');
  b.innerHTML = text ? CAM_ICON + '<span></span>' : '';
  if (text) b.querySelector('span').textContent = text;
  b.onclick = fn;
  b.classList.toggle('hide', !text);
}
function setAlt(text, fn) { const b = $('altBtn'); b.textContent = text || ''; b.onclick = fn; b.classList.toggle('hide', !text); }
function setNew(text, fn) { const b = $('newBtn'); delete b.dataset.sure; b.textContent = text || ''; b.onclick = fn; b.classList.toggle('hide', !text); }

function share(r) {
  const url = linkOf(r);
  if (navigator.share) navigator.share({ title:'Видеозвонок', url }).catch(() => {});
  else navigator.clipboard.writeText(url).then(() => say('Ссылка скопирована'), () => say(url));
}

// ===== Камера =====
function getMedia(video = true, audio = true) {
  return navigator.mediaDevices.getUserMedia({
    video: video && { width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:30,max:30}, facingMode:facing },
    audio: audio && { echoCancellation:true, noiseSuppression:true, autoGainControl:true }
  });
}
function showLocal() {
  stream.getVideoTracks().forEach(t => { try { t.contentHint = 'motion'; } catch (e) {} });
  $('local').srcObject = stream;
  $('local').classList.toggle('mirror', facing === 'user');
}

async function start() {
  setMain(''); setAlt('');
  say('Включаю камеру…');
  try { stream = await getMedia(); }
  catch (e) { say('Нет доступа к камере или микрофону'); return setMain('Попробовать снова', start); }
  showLocal();
  navigator.mediaDevices.enumerateDevices().then(d => {
    if (d.filter(x => x.kind === 'videoinput').length < 2) $('flipBtn').classList.add('hide');
  }).catch(() => {});

  iceServers = [{ urls:'stun:stun.l.google.com:19302' }];
  if (TURN_URL) try { iceServers.push(...await (await fetch(TURN_URL)).json()); } catch (e) {}
  join();
}

// ===== Комната: кто пришёл первым — ждёт, второй — звонит ему =====
function join() {
  setMain(''); setAlt('');
  say('Подключаюсь…');
  if (peer) peer.destroy();
  isHost = false;
  const p = peer = new Peer(room, { config:{ iceServers } });   // пытаемся занять комнату
  p.on('open', () => { isHost = true; idle('Жду собеседника…'); });
  p.on('call', c => { if (call) call.close(); say('Соединяю…'); c.answer(stream); preferH264(c.peerConnection); watch(c); });
  p.on('error', e => {
    if (e.type === 'unavailable-id') { p.destroy(); asGuest(); }   // комната занята → там уже ждут
    else netError(e);
  });
  p.on('disconnected', () => setTimeout(() => peer === p && !p.destroyed && p.reconnect(), 2000));
}

function asGuest() {
  const p = peer = new Peer({ config:{ iceServers } });
  p.on('open', dial);
  p.on('error', e => {
    if (e.type === 'peer-unavailable') { say('Переподключаюсь…'); setTimeout(() => peer === p && join(), 2000); }
    else netError(e);
  });
  p.on('disconnected', () => setTimeout(() => peer === p && !p.destroyed && p.reconnect(), 2000));
}

function netError(e) {
  if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed') say('Нет интернета, пробую ещё…');
  else say('Ошибка: ' + e.type);
  if (!call) setMain('Подключиться снова', join);
}

// Экран, когда звонка нет
function idle(msg) {
  say(msg);
  if (isHost) { setMain(''); setAlt('Отправить ссылку', () => share(room)); }
  else { setMain('Подключиться снова', join); setAlt(''); }
}

function dial() {
  say('Звоню…');
  const c = peer.call(room, stream);
  preferH264(c.peerConnection);
  watch(c);
  setTimeout(() => {
    if (call === c && !body.classList.contains('incall')) {
      call = null; c.close();
      idle('Не удаётся соединиться. Похоже, сеть блокирует прямое подключение');
    }
  }, 25000);
}

function watch(c) {
  call = c;
  const pc = c.peerConnection;
  if (pc) pc.addEventListener('iceconnectionstatechange', () => {
    const st = pc.iceConnectionState;
    if (!body.classList.contains('incall')) {
      if (st === 'checking') say('Соединяю…');
      if (st === 'failed' && call === c) { call = null; idle('Не удаётся соединиться. Похоже, сеть блокирует прямое подключение'); }
      return;
    }
    weak = st === 'disconnected';
    if (st === 'failed' || st === 'closed') ended(c);
    tick();
  });
  c.on('stream', s => {
    $('remote').srcObject = s;
    $('remote').play().catch(() => {});
    enterCall();
    startAdaptive(c.peerConnection);
  });
  c.on('close', () => ended(c));
  c.on('error', () => ended(c));
}

// ===== Адаптивное качество =====
// Каждые 2 секунды смотрим статистику связи. Плохо → быстро спускаемся на ступень ниже,
// стабильно хорошо → осторожно поднимаемся обратно. Каждая сторона управляет своим исходящим видео.
const LADDER = [
  { kbps: VIDEO_KBPS,                     scale: 1,   fps: 30 },  // HD
  { kbps: Math.round(VIDEO_KBPS * 0.6),   scale: 1,   fps: 30 },
  { kbps: Math.round(VIDEO_KBPS * 0.35),  scale: 1.5, fps: 25 },
  { kbps: Math.round(VIDEO_KBPS * 0.2),   scale: 2,   fps: 20 },
  { kbps: Math.round(VIDEO_KBPS * 0.1),   scale: 3,   fps: 15 },  // самый экономный
];
let level = 1, statsId = null, goodRun = 0, cpuRun = 0, started = 0, upNeed = 5, lastUp = 0, lastDown = 0, prev = null;

const senderOf = (pc, kind) => {
  const t = pc && pc.getTransceivers().find(t => (t.sender.track && t.sender.track.kind === kind) || (t.receiver.track && t.receiver.track.kind === kind));
  return t && t.sender;
};

async function setVideo(pc, i) {
  const s = senderOf(pc, 'video'), L = LADDER[i];
  if (!s) return;
  try {
    const p = s.getParameters();
    if (!p.encodings || !p.encodings.length) return;
    Object.assign(p.encodings[0], { maxBitrate: L.kbps * 1000, scaleResolutionDownBy: L.scale, maxFramerate: L.fps });
    await s.setParameters(p);
  } catch (e) {                        // старый Safari может не знать часть полей — ставим хотя бы битрейт
    try { const q = s.getParameters(); q.encodings[0].maxBitrate = L.kbps * 1000; await s.setParameters(q); } catch (e2) {}
  }
}

async function setAudio(pc) {
  const s = senderOf(pc, 'audio');
  if (!s) return;
  try {                                // голос важнее картинки: высокий приоритет в сети
    const p = s.getParameters();
    if (!p.encodings || !p.encodings.length) return;
    Object.assign(p.encodings[0], { maxBitrate: AUDIO_KBPS * 1000, priority: 'high', networkPriority: 'high' });
    await s.setParameters(p);
  } catch (e) {
    try { const q = s.getParameters(); q.encodings[0].maxBitrate = AUDIO_KBPS * 1000; await s.setParameters(q); } catch (e2) {}
  }
}

function startAdaptive(pc) {
  level = 1; goodRun = cpuRun = 0; started = Date.now(); upNeed = 5; lastUp = 0; lastDown = Date.now(); prev = null;
  setVideo(pc, level); setAudio(pc);
  clearInterval(statsId);
  statsId = setInterval(() => sample(pc).catch(() => {}), 2000);
}

async function sample(pc) {
  if (!pc || pc.connectionState === 'closed') return clearInterval(statsId);
  let sent = 0, lost = 0, rtt = null, avail = null, qlr = '';
  (await pc.getStats()).forEach(s => {
    const kind = s.kind || s.mediaType;
    if (s.type === 'outbound-rtp' && kind === 'video') { sent += s.packetsSent || 0; if (s.qualityLimitationReason) qlr = s.qualityLimitationReason; }
    if (s.type === 'remote-inbound-rtp' && kind === 'video') { lost += s.packetsLost || 0; if (s.roundTripTime != null) rtt = s.roundTripTime; }
    if (s.type === 'candidate-pair' && s.state === 'succeeded' && (s.nominated || s.selected)) {
      if (s.availableOutgoingBitrate) avail = s.availableOutgoingBitrate;
      if (rtt == null && s.currentRoundTripTime != null) rtt = s.currentRoundTripTime;
    }
  });
  let loss = null;
  if (prev && sent > prev.sent) loss = Math.max(0, lost - prev.lost) / (sent - prev.sent);
  prev = { sent, lost };

  const now = Date.now(), cur = LADDER[level];
  cpuRun = qlr === 'cpu' ? cpuRun + 1 : 0;              // телефон не успевает кодировать
  const bad = (loss != null && loss > 0.06) || (rtt != null && rtt > 0.5) ||
              (avail != null && now - started > 8000 && avail < cur.kbps * 1000 * 0.7) || cpuRun >= 3;

  if (bad) {
    goodRun = 0;
    const severe = (loss != null && loss > 0.15) || (rtt != null && rtt > 1);
    if (level < LADDER.length - 1 && (severe || now - lastDown > 3000)) {
      if (now - lastUp < 20000) { upNeed = Math.min(upNeed * 2, 15); lastUp = 0; }   // только поднялись и снова плохо → дольше ждать
      level++; lastDown = now; cpuRun = 0;
      setVideo(pc, level); tick();
    }
    return;
  }
  const good = qlr !== 'cpu' && (loss == null || loss < 0.02) && (rtt == null || rtt < 0.3);
  goodRun = good ? goodRun + 1 : 0;
  if (now - lastUp > 120000) upNeed = 5;
  if (level > 0 && goodRun >= upNeed) {
    level--; lastUp = now; goodRun = 0;
    setVideo(pc, level); tick();
  }
}

// H.264 кодируется «железом» почти на всех телефонах (и на iPhone 7) — меньше нагрев и подвисаний
function preferH264(pc) {
  try {
    if (!pc || !window.RTCRtpSender || !RTCRtpSender.getCapabilities) return;
    const caps = RTCRtpSender.getCapabilities('video');
    if (!caps) return;
    const rank = c => /h264/i.test(c.mimeType) ? (/packetization-mode=1/.test(c.sdpFmtpLine || '') ? 0 : 1)
                    : /rtx|red|ulpfec|flexfec/i.test(c.mimeType) ? 3 : 2;
    const codecs = caps.codecs.slice().sort((a, b) => rank(a) - rank(b));
    pc.getTransceivers().forEach(t => {
      const k = (t.sender.track && t.sender.track.kind) || (t.receiver.track && t.receiver.track.kind);
      if (k === 'video' && t.setCodecPreferences) t.setCodecPreferences(codecs);
    });
  } catch (e) {}
}

// ===== Состояние звонка =====
function enterCall() {
  if (body.classList.contains('incall')) return;
  setMain(''); setAlt('');
  body.classList.add('incall');
  placePip();
  t0 = Date.now(); weak = false;
  clearInterval(timerId); timerId = setInterval(tick, 1000); tick();
  wake();
}

function tick() {
  if (!body.classList.contains('incall')) return;
  const s = Math.floor((Date.now() - t0) / 1000);
  const time = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  say(weak ? 'Плохая связь, жду…' : time + (level >= 3 ? ' · слабая связь' : ''));
}

function ended(c) {
  if (c !== call) return;
  call = null;
  clearInterval(timerId); clearTimeout(hideId); clearInterval(statsId);
  body.classList.remove('incall', 'idle');
  pip.style.left = pip.style.top = '';
  $('remote').srcObject = null;
  idle(isHost ? 'Звонок завершён. Жду собеседника…' : 'Звонок завершён');
}

// Кнопки прячутся через 4 секунды, тап по экрану — показывает
function wake() {
  body.classList.remove('idle');
  clearTimeout(hideId);
  hideId = setTimeout(() => body.classList.contains('incall') && body.classList.add('idle'), 4000);
}
$('remote').addEventListener('click', () => body.classList.contains('idle') ? wake() : (clearTimeout(hideId), body.classList.add('idle')));
$('controls').addEventListener('click', wake);

// ===== Кнопки звонка =====
function toggle(kind, btn) {
  const t = stream && stream.getTracks().find(t => t.kind === kind);
  if (!t) return;
  t.enabled = !t.enabled;
  btn.classList.toggle('off', !t.enabled);
  if (kind === 'video') pip.classList.toggle('camoff', !t.enabled);
}
$('micBtn').onclick = e => toggle('audio', e.currentTarget);
$('camBtn').onclick = e => toggle('video', e.currentTarget);
$('endBtn').onclick = () => { if (call) { const c = call; c.close(); ended(c); } };

$('flipBtn').onclick = async () => {
  const old = stream && stream.getVideoTracks()[0];
  if (!old) return;
  const wasOn = old.enabled;
  old.stop(); stream.removeTrack(old);          // iOS не даёт открыть две камеры сразу
  facing = facing === 'user' ? 'environment' : 'user';
  let nt;
  try { nt = (await getMedia(true, false)).getVideoTracks()[0]; }
  catch (e) {
    facing = facing === 'user' ? 'environment' : 'user';
    try { nt = (await getMedia(true, false)).getVideoTracks()[0]; } catch (e2) { return; }
  }
  nt.enabled = wasOn;
  stream.addTrack(nt);
  showLocal();
  const pc = call && call.peerConnection;
  const tr = pc && pc.getTransceivers().find(t => t.receiver.track && t.receiver.track.kind === 'video');
  if (tr) tr.sender.replaceTrack(nt).catch(() => {});
};

// ===== Окошко своего видео: перетаскивание с прилипанием к углу =====
function pipSize() { const w = Math.min(innerWidth * 0.3, 140); return { w, h: w * 4 / 3 }; }
function safe() { const s = getComputedStyle($('safe')); return { t: parseFloat(s.paddingTop) || 0, b: parseFloat(s.paddingBottom) || 0 }; }
function placePip() {
  const m = 14, sa = safe(), { w, h } = pipSize();
  pip.style.left = (corner[1] === 'l' ? m : innerWidth - w - m) + 'px';
  pip.style.top = (corner[0] === 't' ? m + sa.t : innerHeight - h - sa.b - 110) + 'px';
}
pip.addEventListener('pointerdown', e => {
  if (!body.classList.contains('incall')) return;
  drag = { dx: e.clientX - pip.offsetLeft, dy: e.clientY - pip.offsetTop };
  pip.setPointerCapture(e.pointerId);
  pip.classList.add('drag');
});
pip.addEventListener('pointermove', e => {
  if (!drag) return;
  pip.style.left = (e.clientX - drag.dx) + 'px';
  pip.style.top = (e.clientY - drag.dy) + 'px';
});
function drop() {
  if (!drag) return;
  drag = null;
  pip.classList.remove('drag');
  const cx = pip.offsetLeft + pip.offsetWidth / 2, cy = pip.offsetTop + pip.offsetHeight / 2;
  corner = (cy < innerHeight / 2 ? 't' : 'b') + (cx < innerWidth / 2 ? 'l' : 'r');
  placePip();
}
pip.addEventListener('pointerup', drop);
pip.addEventListener('pointercancel', drop);
addEventListener('resize', () => body.classList.contains('incall') && placePip());

// ===== Приложение (PWA) =====
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; showInstall(); });
addEventListener('appinstalled', () => $('install').classList.add('hide'));

function showInstall() {
  const box = $('install');
  if (standalone || room) return box.classList.add('hide');
  if (installEvt) {
    box.innerHTML = '<button>Установить приложение</button>';
    box.firstChild.onclick = () => { installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; box.classList.add('hide'); }); };
  } else if (isIOS) {
    box.textContent = 'Чтобы установить: «Поделиться» → «На экран Домой»';
  } else return box.classList.add('hide');
  box.classList.remove('hide');
}
showInstall();
