import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentSingleTabManager,
  collection, doc, setDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import * as X from './exposure.js';

// ================= Utilities =================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtD = (d, o) => new Intl.DateTimeFormat('en-US', o).format(d);
const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const load = (k, d) => { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') }; } catch (e) { return { ...d }; } };
const keep = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const CHEV = '<svg class="chev" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5l6 6-6 6"/></svg>';
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
const LOCK = on => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/>${on ? '<path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>' : '<path d="M8 11V7.5a4 4 0 0 1 7.6-1.7"/>'}</svg>`;
const shLabel = sec => X.shutterLabel(X.shutterIndex(sec));
const apLabel = n => X.apertureLabel(X.apertureIndex(n));

let toastT;
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.remove('hide', 'show'); void e.offsetWidth; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.add('hide'), 2600); }

// ================= Storage: Firebase or demo =================
const CFG = (window.MOOD_CONFIG && window.MOOD_CONFIG.firebase) || {};
const DEMO = !CFG.apiKey || /^PASTE/.test(CFG.apiKey) || location.hash === '#demo';
const COLLS = ['lm_cameras', 'lm_lenses', 'lm_films', 'lm_rolls', 'lm_frames'];

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
      onAuthStateChanged(auth, u => cb(u && { uid: u.uid, name: u.displayName || 'No name', email: u.email || '' }));
    },
    signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithRedirect(auth, p); },
    signOut() { subs.forEach(f => f()); subs = []; return signOut(auth); },
    listen(uid, cb) {
      subs.forEach(f => f());
      subs = COLLS.map(name => onSnapshot(collection(db, 'users', uid, name), s => { const a = []; s.forEach(d => a.push({ ...d.data(), id: d.id })); cb(name, a, s.metadata.fromCache); }, fail('Loading error')));
    },
    // no await: on a bad connection the write goes to the local cache first and syncs later
    put(uid, coll, id, data) { setDoc(doc(db, 'users', uid, coll, id), data).catch(fail('Not saved')); },
    del(uid, coll, id) { deleteDoc(doc(db, 'users', uid, coll, id)).catch(fail('Not deleted')); }
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
  const read = k => { try { return JSON.parse(localStorage.getItem('lm-demo-' + k) || '{}'); } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem('lm-demo-' + k, JSON.stringify(v)); } catch (e) {} };
  let cb = null;
  const emit = k => { if (cb) (k ? [k] : COLLS).forEach(n => cb(n, Object.values(read(n)), false)); };
  return {
    onUser(f) { f({ uid: 'demo', name: 'Demo', email: 'Data stays on this device only' }); },
    signIn() { return Promise.resolve(); }, signOut() { toast('There is nothing to sign out of in demo mode'); return Promise.resolve(); },
    listen(uid, f) { cb = f; emit(); },
    put(uid, coll, id, data) { const a = read(coll); a[id] = { ...data, id }; write(coll, a); emit(coll); },
    del(uid, coll, id) { const a = read(coll); delete a[id]; write(coll, a); emit(coll); }
  };
}
const store = DEMO ? demoBackend() : firebaseBackend();

// ================= State =================
let user = null;
const D = { lm_cameras: [], lm_lenses: [], lm_films: [], lm_rolls: [], lm_frames: [] };
let seeded = false;
const sel = load('lm-sel', { cameraId: '', lensId: '', rollId: '' });
const cal = load('lm-cal', { relOffset: 9, absCorr: 0, phoneN: 1.8 });
const prefs = load('lm-prefs', { locks: { i: true, a: false, s: false }, v: { i: 6, a: 18, s: 24 }, location: false, manualEv3: 36 });
// the value the user turned last stays put when the light changes (aperture → aperture priority, shutter → shutter priority)
if (!prefs.keep) prefs.keep = 'a';
let v = { ...prefs.v };                    // current ISO / aperture / shutter indexes
let ev3 = null, dev = 0;                   // metered light (EV100 × 3, rounded) and the remaining error
let mode = 'start', hold = false, manual = false, spot = null, smooth = null, rawEv = null;
const camera = () => D.lm_cameras.find(c => c.id === sel.cameraId) || null;
const lens = () => D.lm_lenses.find(l => l.id === sel.lensId) || null;
const roll = () => D.lm_rolls.find(r => r.id === sel.rollId) || null;
const saveSel = () => keep('lm-sel', sel);
const savePrefs = () => { prefs.v = v; keep('lm-prefs', prefs); };

function ranges() {
  const c = camera(), l = lens(), R = { ...X.FULL_RANGE };
  if (c) { R.sMax = X.shutterIndex(c.fastest); R.sMin = X.shutterIndex(c.slowest); }
  if (l) { R.aMin = X.apertureIndex(l.widest); R.aMax = X.apertureIndex(l.smallest); }
  if (R.sMin > R.sMax) [R.sMin, R.sMax] = [R.sMax, R.sMin];
  if (R.aMin > R.aMax) [R.aMin, R.aMax] = [R.aMax, R.aMin];
  return R;
}

// ================= Dials =================
const E3_MIN = -18, E3_MAX = 66;           // EV −6 … 22 for the manual EV dial
const DIALS = {
  i: { from: () => X.I_MIN, to: () => X.I_MAX, label: X.isoLabel },
  a: { from: () => ranges().aMin, to: () => ranges().aMax, label: a => X.apertureLabel(a).slice(2) },
  s: { from: () => ranges().sMin, to: () => ranges().sMax, label: X.shutterLabel },
  e: { from: () => E3_MIN, to: () => E3_MAX, label: X.thirds }
};
// ---------- haptics ----------
// Android: the Vibration API. iPhone (iOS 17.4+/18): Safari has no vibration API, but a native
// <input type=checkbox switch> gives a system haptic when its label is clicked. Safari only plays it
// for user-initiated events, so on iPhone the reliable tick is the one when the finger lifts.
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// Same technique as the ios-haptics library: a fresh hidden switch, clicked and removed.
function tick() {
  if (!IS_IOS && navigator.vibrate) { try { navigator.vibrate(7); } catch (e) {} return; }
  if (!IS_IOS) return;
  try {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const sw = document.createElement('input');
    sw.type = 'checkbox'; sw.setAttribute('switch', '');
    label.appendChild(sw); document.head.appendChild(label);
    label.click();
    document.head.removeChild(label);
  } catch (e) {}
}

function nearestButton(el) {
  const mid = el.scrollLeft + el.clientWidth / 2;
  let best = null, bd = 1e9;
  el.querySelectorAll('button').forEach(b => { const c = b.offsetLeft + b.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = b; } });
  return best;
}
function buildDial(k) {
  const el = $('dial-' + k), d = DIALS[k], out = [];
  for (let x = d.from(); x <= d.to(); x++) out.push(`<button data-v="${x}">${esc(d.label(x))}</button>`);
  el.innerHTML = '<span class="pad"></span>' + out.join('') + '<span class="pad"></span>';
  el._val = null;
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const x = +b.dataset.v;
    // a tap is not a turn: cancel the pending settle (it would snap back to the old centre) and scroll to the tapped value
    clearTimeout(el._settleT); el._touching = false; el._userUntil = 0;
    if (x !== el._val) tick();
    scrollDial(k, x, true); onDial(k, x);
  }));
  if (!el._bound) {
    el._bound = true;
    let raf = 0, lastTick = null;
    const userActive = () => el._touching || performance.now() < (el._userUntil || 0);
    // magnet: once the user's scroll has stopped, settle exactly on the nearest value
    const settle = () => {
      if (el._touching) return;                    // finger still down: wait for it to lift
      const b = nearestButton(el); if (!b) return;
      const x = +b.dataset.v;
      const changed = x !== el._val;               // check before scrollDial(), which records the value
      el._userUntil = 0;
      scrollDial(k, x, true);
      if (changed) onDial(k, x);
    };
    el.addEventListener('touchstart', () => { el._touching = true; el._userUntil = 0; clearTimeout(el._settleT); }, { passive: true });
    ['pointerdown', 'wheel'].forEach(n => el.addEventListener(n, () => { el._userUntil = performance.now() + 1500; }, { passive: true }));
    const lift = () => {
      if (!el._touching) return;
      el._touching = false;
      el._userUntil = performance.now() + 1500;    // the dial may keep coasting after a flick
      clearTimeout(el._settleT); el._settleT = setTimeout(settle, 160); // no momentum: settle now; momentum: scroll events push this back
    };
    el.addEventListener('touchend', lift, { passive: true });
    el.addEventListener('touchcancel', lift, { passive: true });
    el.addEventListener('scroll', () => {
      if (!userActive()) return;                   // programmatic scroll (a new light reading): ignore
      el._userUntil = Math.max(el._userUntil || 0, performance.now() + 300);
      // live "ratchet": highlight and tick on every step while the user turns the dial
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = nearestButton(el); if (!b) return;
        const x = +b.dataset.v;
        if (x !== lastTick) {
          if (lastTick !== null) tick();
          lastTick = x;
          el.querySelectorAll('button.cur').forEach(o => o.classList.remove('cur')); b.classList.add('cur');
        }
      });
      clearTimeout(el._settleT);
      el._settleT = setTimeout(settle, 140);
    }, { passive: true });
  }
}
function scrollDial(k, x, smoothScroll) {
  const el = $('dial-' + k), b = el.querySelector(`button[data-v="${x}"]`);
  el._val = x;
  el.querySelectorAll('button.cur').forEach(o => o.classList.remove('cur'));
  if (!b) return;
  b.classList.add('cur');
  // never move a dial under the user's finger (or while it coasts): a new light reading used to
  // scroll it mid-gesture, which is why values could be dragged off-centre and never snapped
  if (el._touching || performance.now() < (el._userUntil || 0)) return;
  const left = b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2;
  if (Math.abs(el.scrollLeft - left) < 1) return;
  el.scrollTo({ left, behavior: smoothScroll ? 'smooth' : 'auto' });
}
function buildAll() { ['i', 'a', 's', 'e'].forEach(buildDial); }

// the user turned a dial: keep it, let the other free values follow
function onDial(k, x) {
  if (k === 'e') { prefs.manualEv3 = x; $('dial-e')._val = x; markCur('e', x); newReading(x, true); return; }
  v[k] = x; prefs.keep = k;
  if (ev3 != null) { const r = X.solve(v, ev3, ranges(), prefs.locks, k); v = { i: r.i, a: r.a, s: r.s }; dev = r.dev; }
  markCur(k, x); savePrefs(); renderMeter(k);
}
function markCur(k, x) { const el = $('dial-' + k); el._val = x; el.querySelectorAll('button').forEach(b => b.classList.toggle('cur', +b.dataset.v === x)); }

// a new light reading: keep the locked values, solve the free ones
function newReading(e3, force) {
  if (e3 === ev3 && !force) return;
  ev3 = e3;
  const r = X.solve(v, ev3, ranges(), prefs.locks, prefs.keep);
  v = { i: r.i, a: r.a, s: r.s }; dev = r.dev;
  savePrefs(); renderMeter();
}
function resolveNow() { if (ev3 != null) { const r = X.solve(v, ev3, ranges(), prefs.locks, prefs.keep); v = { i: r.i, a: r.a, s: r.s }; dev = r.dev; } else { const R = ranges(); v = { i: clamp(v.i, R.iMin, R.iMax), a: clamp(v.a, R.aMin, R.aMax), s: clamp(v.s, R.sMin, R.sMax) }; } }

function renderMeter(skip) {
  ['i', 'a', 's'].forEach(k => {
    if (k !== skip) scrollDial(k, v[k], true);
    const lk = document.querySelector(`[data-lock="${k}"]`); lk.innerHTML = LOCK(prefs.locks[k]); lk.classList.toggle('on', !!prefs.locks[k]);
    $('dial-' + k).classList.toggle('locked', !!prefs.locks[k]);
  });
  $('evText').innerHTML = `<small>EV</small>${ev3 == null ? '–' : esc(X.thirds(ev3))}`;
  const d = $('dev');
  if (ev3 == null) { d.textContent = ''; }
  else if (!dev) { d.textContent = 'Correct exposure'; d.classList.remove('off'); }
  else { d.textContent = `${X.thirds(Math.abs(dev))} EV ${dev > 0 ? 'over' : 'under'} — out of range`; d.classList.add('off'); }
  const m = $('modeBadge'), labels = { abs: 'Camera data', rel: 'Relative — calibrate', manual: 'Manual EV', start: 'Starting…', off: 'Camera off' };
  $('modeText').textContent = hold && !manual ? 'Hold · ' + labels[mode] : labels[mode];
  m.classList.toggle('warn', mode === 'rel' || hold);
  $('holdBtn').classList.toggle('on', hold); $('manualBtn').classList.toggle('on', manual);
  $('row-e').classList.toggle('hide', !manual);
  const r = roll(), l = lens(), c = camera();
  const n = r ? nextFrame(r) : 0;
  $('rollInfo').innerHTML = r ? `<b>${esc(r.filmName)}</b> · ${n <= r.exposures ? `${n}/${r.exposures}` : `${n} (extra)`}${r.cameraName ? ' · ' + esc(r.cameraName) : ''}${l ? ' · ' + esc(l.name) : ''}`
    : `<b>No film loaded</b> — tap to load${c ? ' · ' + esc(c.name) : ''}${l ? ' · ' + esc(l.name) : ''}`;
}
document.querySelectorAll('[data-lock]').forEach(b => b.onclick = () => {
  const k = b.dataset.lock; prefs.locks[k] = !prefs.locks[k];
  if (!prefs.locks.i && !prefs.locks.a && !prefs.locks.s) prefs.locks.i = true;   // keep one fixed, otherwise every reading would move everything
  savePrefs(); renderMeter();
  toast(prefs.locks[k] ? `${{ i: 'ISO', a: 'Aperture', s: 'Shutter speed' }[k]} locked` : `${{ i: 'ISO', a: 'Aperture', s: 'Shutter speed' }[k]} follows the light`);
});

// ================= Camera metering =================
const vid = $('vid'), cvs = document.createElement('canvas'), ctx = cvs.getContext('2d', { willReadFrequently: true });
const LIN = new Float32Array(256).map((_, i) => { const c = i / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
let stream = null, track = null, loopT = null;

// iPhone Home Screen apps ask for the camera again whenever a stream is requested anew, so the
// stream is kept for the whole session: leaving the meter only pauses it (track disabled, no metering).
async function startCamera() {
  if (manual) return;
  if (stream && track && track.readyState === 'live') {
    track.enabled = true; await vid.play().catch(() => {});
    clearInterval(loopT); loopT = setInterval(meter, 250);
    return;
  }
  if (stream) stopCamera();                      // the system ended it (e.g. a phone call): ask again
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { camFailed('This browser cannot use the camera.'); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    track = stream.getVideoTracks()[0];
    vid.srcObject = stream; await vid.play().catch(() => {});
    $('noCam').classList.add('hide');
    smooth = null; mode = 'start'; renderMeter();
    clearInterval(loopT); loopT = setInterval(meter, 250);
  } catch (e) {
    stream = null;
    camFailed(e && e.name === 'NotAllowedError' ? 'Camera access was denied. Allow it in your browser settings, or use Manual.' : 'The camera could not start. You can still use Manual.');
  }
}
function pauseCamera() { clearInterval(loopT); loopT = null; if (track) track.enabled = false; }
function stopCamera() { clearInterval(loopT); loopT = null; if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; track = null; vid.srcObject = null; }
function camFailed(text) { mode = 'off'; $('noCamText').textContent = text; $('noCam').classList.remove('hide'); renderMeter(); }
$('camRetry').onclick = () => { stopCamera(); startCamera(); };

function meter() {
  if (manual || !track || vid.readyState < 2 || !vid.videoWidth) return;
  // the part of the video that is visible on screen (object-fit: cover)
  const W = innerWidth, H = innerHeight, vw = vid.videoWidth, vh = vid.videoHeight;
  const sc = Math.max(W / vw, H / vh), cw = W / sc, ch = H / sc, ox = (vw - cw) / 2, oy = (vh - ch) / 2;
  const w = 64, h = Math.max(8, Math.round(64 * H / W));
  cvs.width = w; cvs.height = h;
  ctx.drawImage(vid, ox, oy, cw, ch, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  let sum = 0, wsum = 0;
  if (spot) {
    const r = Math.max(2, Math.round(38 / W * w)), cx = Math.round(spot.x / W * w), cy = Math.round(spot.y / H * h);
    for (let y = Math.max(0, cy - r); y < Math.min(h, cy + r); y++) for (let x = Math.max(0, cx - r); x < Math.min(w, cx + r); x++) {
      const p = (y * w + x) * 4; sum += 0.2126 * LIN[px[p]] + 0.7152 * LIN[px[p + 1]] + 0.0722 * LIN[px[p + 2]]; wsum++;
    }
  } else {
    const s2 = 2 * Math.pow(0.35 * Math.hypot(w, h) / 2, 2);   // centre-weighted average
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4, dx = x - w / 2, dy = y - h / 2, wt = Math.exp(-(dx * dx + dy * dy) / s2);
      sum += wt * (0.2126 * LIN[px[p]] + 0.7152 * LIN[px[p + 1]] + 0.0722 * LIN[px[p + 2]]); wsum += wt;
    }
  }
  const L = Math.max(1e-4, sum / wsum);
  const st = track.getSettings ? track.getSettings() : {};
  let ev;
  if (typeof st.exposureTime === 'number' && st.exposureTime > 0 && typeof st.iso === 'number' && st.iso > 0) {
    // the phone tells us its own exposure (exposureTime is in 100 µs units)
    mode = 'abs';
    const t = st.exposureTime * 1e-4;
    ev = Math.log2(cal.phoneN * cal.phoneN / t) - Math.log2(st.iso / 100) + Math.log2(L / 0.18) + cal.absCorr;
  } else {
    // no exposure data: brightness only, shifted by the user's calibration
    mode = 'rel';
    ev = Math.log2(L / 0.18) + cal.relOffset;
  }
  rawEv = ev;
  smooth = smooth == null ? ev : smooth + 0.35 * (ev - smooth);
  if (hold) { renderBadgeOnly(); return; }
  newReading(Math.round(smooth * 3));
  if ($('calLive')) $('calLive').textContent = X.thirds(Math.round(smooth * 3));
}
function renderBadgeOnly() { const labels = { abs: 'Camera data', rel: 'Relative — calibrate' }; $('modeText').textContent = 'Hold · ' + (labels[mode] || ''); }

// tap = spot reading there, double-tap = whole frame
let lastTap = 0, tapTimer = null;
$('viewer').addEventListener('click', e => {
  if (manual || e.target.closest('button')) return;
  const now = performance.now(), x = e.clientX, y = e.clientY;
  if (now - lastTap < 300) { clearTimeout(tapTimer); lastTap = 0; spot = null; $('reticle').classList.add('hide'); smooth = null; toast('Average metering'); hint(); return; }
  lastTap = now;
  tapTimer = setTimeout(() => {
    spot = { x, y }; smooth = null;
    const r = $('reticle'); r.style.left = x + 'px'; r.style.top = y + 'px'; r.classList.remove('hide', 'pop'); void r.offsetWidth; r.classList.add('pop');
    hint();
  }, 260);
});
function hint() { $('modeHint').style.opacity = '0'; }

$('holdBtn').onclick = () => { if (manual) return; hold = !hold; renderMeter(); toast(hold ? 'Reading held' : 'Live reading'); };
$('manualBtn').onclick = () => {
  manual = !manual; hold = false;
  if (manual) { pauseCamera(); mode = 'manual'; $('noCam').classList.add('hide'); $('reticle').classList.add('hide'); spot = null; scrollDial('e', prefs.manualEv3); newReading(prefs.manualEv3, true); }
  else { mode = 'start'; startCamera(); }
  renderMeter();
};
document.addEventListener('visibilitychange', () => {
  if (!user) return;
  if (document.visibilityState === 'hidden') pauseCamera(); else if (!manual && view === 'meter') startCamera();
});
$('modeBadge').onclick = openCalibration;

// ================= Calibration =================
function openCalibration() {
  let target = ev3 != null ? ev3 : 36;
  const draw = () => openSheet(`<div class="shead"><button id="kClose">Close</button><b>Calibrate</b><span style="width:48px"></span></div>
    <div class="group"><div class="row"><span class="grow">Phone reads now</span><span class="val">EV <b id="calLive" style="color:var(--yellow)">${ev3 == null ? '–' : esc(X.thirds(ev3))}</b></span></div>
    <div class="row"><span class="grow">Mode</span><span class="val">${{ abs: 'Camera data', rel: 'Relative', manual: 'Manual', start: '…', off: 'Camera off' }[mode]}</span></div></div>
    <div class="foot">${manual ? 'Turn Manual off and point the camera at the scene to calibrate.' : mode === 'abs' ? 'Your browser reports the phone camera’s own exposure, so readings are absolute. A small correction can still match them to your meter.' : 'Your browser does not report the phone camera’s exposure, so the phone measures brightness only. Calibrate once against a real meter (or Sunny 16) and the readings follow from there.'}</div>
    <div class="sect">Point at the same scene as your reference</div>
    <div class="group"><div class="row"><span class="grow">Reference says EV</span><span class="stepper"><button id="kMinus" aria-label="Lower">−</button><b id="kVal">${esc(X.thirds(target))}</b><button id="kPlus" aria-label="Higher">+</button></span></div>
      <button class="row link press" id="kSun">Sunny 16: bright sun, sharp shadows (EV 15)</button></div>
    <div style="margin-top:16px"><button class="btn press" id="kApply">Match the reference</button></div>
    <div class="group" style="margin-top:20px"><button class="row danger press" id="kReset">Reset calibration</button></div>
    ${mode === 'abs' ? `<div class="sect">Phone lens aperture</div><div class="group"><div class="row"><span class="grow">f-number</span><span class="stepper"><button id="nMinus">−</button><b>f/${cal.phoneN.toFixed(1)}</b><button id="nPlus">+</button></span></div></div>` : ''}`, s => {
      s.querySelector('#kClose').onclick = closeSheet;
      s.querySelector('#kMinus').onclick = () => { target--; s.querySelector('#kVal').textContent = X.thirds(target); };
      s.querySelector('#kPlus').onclick = () => { target++; s.querySelector('#kVal').textContent = X.thirds(target); };
      s.querySelector('#kSun').onclick = () => { target = 45; s.querySelector('#kVal').textContent = X.thirds(target); };
      s.querySelector('#kApply').onclick = () => {
        if (rawEv == null || manual) { toast('Turn the camera on first'); return; }
        const diff = target / 3 - (smooth != null ? smooth : rawEv);
        if (mode === 'abs') cal.absCorr += diff; else cal.relOffset += diff;
        keep('lm-cal', cal); smooth = null; toast('Calibrated'); closeSheet();
      };
      s.querySelector('#kReset').onclick = () => { cal.relOffset = 9; cal.absCorr = 0; cal.phoneN = 1.8; keep('lm-cal', cal); smooth = null; toast('Calibration reset'); closeSheet(); };
      const nm = s.querySelector('#nMinus'), np = s.querySelector('#nPlus');
      if (nm) nm.onclick = () => { cal.phoneN = Math.max(1, +(cal.phoneN - 0.1).toFixed(1)); keep('lm-cal', cal); draw(); };
      if (np) np.onclick = () => { cal.phoneN = Math.min(4, +(cal.phoneN + 0.1).toFixed(1)); keep('lm-cal', cal); draw(); };
    });
  draw();
}

// ================= Shots and rolls =================
const framesOf = rid => D.lm_frames.filter(f => f.rollId === rid).sort((a, b) => a.n - b.n || a.ts - b.ts);
const nextFrame = r => framesOf(r.id).reduce((m, f) => Math.max(m, f.n), 0) + 1;
$('shot').onclick = () => {
  if (ev3 == null) { toast('No reading yet'); return; }
  const r = roll();
  if (!r || r.status === 'finished') { openLoadFilm(true); return; }
  const n = nextFrame(r), id = uid8();
  const data = { rollId: r.id, n, aperture: X.apertureNumber(v.a), shutter: X.shutterSeconds(v.s), iso: X.isoNumber(v.i), ev: Math.round(ev3) / 3, ts: Date.now() };
  if (sel.lensId) data.lensId = sel.lensId;
  if (dev) data.dev = dev / 3;
  store.put(user.uid, 'lm_frames', id, data);
  const f = $('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  if (navigator.vibrate) navigator.vibrate(15);
  toast(`Frame ${n}${n > r.exposures ? ' (extra)' : ''} · ${X.apertureLabel(v.a)} · ${X.shutterLabel(v.s)}`);
  if (prefs.location && navigator.geolocation) navigator.geolocation.getCurrentPosition(p => {
    store.put(user.uid, 'lm_frames', id, { ...data, lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) });
  }, () => {}, { timeout: 8000, maximumAge: 60000 });
};
$('rollInfo').onclick = () => openQuick();

function openQuick() {
  const r = roll();
  openSheet(`<div class="shead"><span style="width:60px"></span><b>Camera bag</b><button id="qDone">Done</button></div>
    <div class="sect">Film</div><div class="group">
      ${r ? `<div class="row"><span class="grow">${esc(r.filmName)}<span class="small">${esc(r.cameraName || '')} · ISO ${r.iso} · ${framesOf(r.id).length}/${r.exposures} frames</span></span></div>
      <button class="row link press" id="qFinish">Finish this roll</button>` : ''}
      <button class="row link press" id="qLoad">Load new film</button></div>
    <div class="sect">Lens</div><div class="group">
      ${D.lm_lenses.map(l => `<button class="row press" data-lens="${esc(l.id)}"><span class="grow">${esc(l.name)}<span class="small">${l.focal ? l.focal + ' mm · ' : ''}${apLabel(l.widest)}–${apLabel(l.smallest)}</span></span>${l.id === sel.lensId ? '<span style="color:var(--yellow)">✓</span>' : ''}</button>`).join('')}
      <button class="row press" data-lens=""><span class="grow">No lens limits</span>${!sel.lensId ? '<span style="color:var(--yellow)">✓</span>' : ''}</button></div>
    <div class="foot">Lens and camera limits narrow the aperture and shutter dials. Edit them in Gear.</div>`, s => {
      s.querySelector('#qDone').onclick = closeSheet;
      s.querySelector('#qLoad').onclick = () => openLoadFilm(false);
      const fin = s.querySelector('#qFinish'); if (fin) fin.onclick = () => { finishRoll(r); closeSheet(); };
      s.querySelectorAll('[data-lens]').forEach(b => b.onclick = () => { sel.lensId = b.dataset.lens; saveSel(); buildAll(); resolveNow(); renderMeter(); closeSheet(); });
    });
}
function finishRoll(r) { store.put(user.uid, 'lm_rolls', r.id, { ...strip(r), status: 'finished', finished: iso(new Date()) }); if (sel.rollId === r.id) { sel.rollId = ''; saveSel(); } toast('Roll finished'); renderMeter(); }
const strip = o => { const { id, ...rest } = o; return rest; };

function openLoadFilm(thenShoot) {
  let filmId = (D.lm_films[0] || {}).id || '', camId = sel.cameraId || (D.lm_cameras[0] || {}).id || '';
  const draw = () => openSheet(`<div class="shead"><button id="lCancel">Cancel</button><b>Load Film</b><button id="lGo" style="font-weight:600">Load</button></div>
    ${D.lm_films.length ? '' : '<div class="empty">Add a film in Gear first.</div>'}
    <div class="sect">Film</div><div class="group">${D.lm_films.map(f => `<button class="row press" data-f="${esc(f.id)}"><span class="grow">${esc(f.name)}<span class="small">ISO ${f.iso} · ${f.exposures} exposures</span></span>${f.id === filmId ? '<span style="color:var(--yellow)">✓</span>' : ''}</button>`).join('')}</div>
    <div class="sect">Camera</div><div class="group">${D.lm_cameras.map(c => `<button class="row press" data-c="${esc(c.id)}"><span class="grow">${esc(c.name)}<span class="small">${shLabel(c.slowest)} – ${shLabel(c.fastest)}</span></span>${c.id === camId ? '<span style="color:var(--yellow)">✓</span>' : ''}</button>`).join('')}
      <button class="row press" data-c=""><span class="grow">Any camera</span>${!camId ? '<span style="color:var(--yellow)">✓</span>' : ''}</button></div>`, s => {
      s.querySelector('#lCancel').onclick = closeSheet;
      s.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filmId = b.dataset.f; draw(); });
      s.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { camId = b.dataset.c; draw(); });
      s.querySelector('#lGo').onclick = () => {
        const f = D.lm_films.find(x => x.id === filmId); if (!f) { toast('Pick a film'); return; }
        const c = D.lm_cameras.find(x => x.id === camId);
        const id = uid8(), data = { filmId: f.id, filmName: f.name, iso: f.iso, exposures: f.exposures, started: iso(new Date()), status: 'loaded', ts: Date.now() };
        if (c) { data.cameraId = c.id; data.cameraName = c.name; }
        store.put(user.uid, 'lm_rolls', id, data);
        sel.rollId = id; sel.cameraId = c ? c.id : ''; saveSel();
        v.i = X.isoIndex(f.iso); prefs.locks.i = true; buildAll(); resolveNow(); savePrefs(); renderMeter();
        closeSheet(); toast(`${f.name} loaded`);
        if (thenShoot) setTimeout(() => $('shot').click(), 350);
      };
    });
  draw();
}

// ================= Screens =================
let view = 'meter';
function go(to) {
  view = to;
  ['scrJournal', 'scrRoll', 'scrGear'].forEach(id => $(id).classList.add('hide'));
  if (to === 'meter') { if (!manual) startCamera(); renderMeter(); return; }
  pauseCamera();
  const el = $({ journal: 'scrJournal', roll: 'scrRoll', gear: 'scrGear' }[to]);
  el.classList.remove('hide', 'push-in'); void el.offsetWidth; el.classList.add('push-in'); el.scrollTop = 0;
  renderScreen();
}
function renderScreen() { if (view === 'journal') renderJournal(); if (view === 'roll') renderRoll(); if (view === 'gear') renderGear(); }
$('openJournal').onclick = () => go('journal');
$('openGear').onclick = () => go('gear');

let openRollId = null;
function renderJournal() {
  const rolls = D.lm_rolls.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  $('scrJournal').innerHTML = `<div class="nav"><button class="back press" id="jBack">${BACK}Meter</button><button class="act press" id="jLoad">Load Film</button></div>
    <h1 class="large">Journal</h1>
    ${rolls.length ? `<div class="group" style="margin-top:12px">${rolls.map(r => `<button class="row press" data-r="${esc(r.id)}"><span class="grow">${esc(r.filmName)}<span class="small">${esc(r.cameraName || 'Any camera')} · ${esc(fmtD(new Date(r.ts || Date.now()), { month: 'short', day: 'numeric', year: 'numeric' }))} · ${framesOf(r.id).length}/${r.exposures}${r.status === 'loaded' ? ' · in camera' : ''}</span></span>${CHEV}</button>`).join('')}</div>`
      : '<div class="empty">No rolls yet. Load a film and press the shutter button on the meter to log frames.</div>'}`;
  $('jBack').onclick = () => go('meter');
  $('jLoad').onclick = () => openLoadFilm(false);
  $('scrJournal').querySelectorAll('[data-r]').forEach(b => b.onclick = () => { openRollId = b.dataset.r; go('roll'); });
}
function renderRoll() {
  const r = D.lm_rolls.find(x => x.id === openRollId); if (!r) { go('journal'); return; }
  const fr = framesOf(r.id); let armed = false;
  const lensName = id => { const l = D.lm_lenses.find(x => x.id === id); return l ? l.name : ''; };
  $('scrRoll').innerHTML = `<div class="nav"><button class="back press" id="rBack">${BACK}Journal</button></div>
    <h1 class="large">${esc(r.filmName)}</h1>
    <div class="sub">${esc(r.cameraName || 'Any camera')} · ISO ${r.iso} · loaded ${esc(fmtD(new Date(r.ts || Date.now()), { month: 'short', day: 'numeric' }))}${r.status === 'finished' ? ' · finished' : ''}</div>
    ${fr.length ? `<div class="group" style="margin-top:12px">${fr.map(f => `<button class="row press" data-f="${esc(f.id)}"><span class="num">${f.n}</span><span class="grow">${esc(apLabel(f.aperture))} · ${esc(shLabel(f.shutter))} · ISO ${f.iso}<span class="small">EV ${esc(X.thirds(Math.round(f.ev * 3)))}${f.lensId ? ' · ' + esc(lensName(f.lensId)) : ''} · ${esc(fmtD(new Date(f.ts), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}${f.note ? ' · ' + esc(f.note) : ''}</span></span>${CHEV}</button>`).join('')}</div>`
      : '<div class="empty">No frames on this roll yet.</div>'}
    <div class="group" style="margin-top:24px">
      ${r.status === 'loaded' ? '<button class="row link press" id="rFinish">Finish Roll</button>' : '<button class="row link press" id="rReopen">Load It Again</button>'}
      <button class="row danger press" id="rDel">Delete Roll</button></div>`;
  $('rBack').onclick = () => go('journal');
  const fin = $('rFinish'); if (fin) fin.onclick = () => { finishRoll(r); renderRoll(); };
  const re = $('rReopen'); if (re) re.onclick = () => { store.put(user.uid, 'lm_rolls', r.id, { ...strip(r), status: 'loaded' }); sel.rollId = r.id; if (r.cameraId) sel.cameraId = r.cameraId; saveSel(); v.i = X.isoIndex(r.iso); buildAll(); resolveNow(); toast('Roll is in the camera again'); };
  $('rDel').onclick = () => {
    if (!armed) { armed = true; $('rDel').textContent = `Tap again — deletes ${fr.length} ${fr.length === 1 ? 'frame' : 'frames'} too`; setTimeout(() => { armed = false; const b = $('rDel'); if (b) b.textContent = 'Delete Roll'; }, 3500); return; }
    fr.forEach(f => store.del(user.uid, 'lm_frames', f.id)); store.del(user.uid, 'lm_rolls', r.id);
    if (sel.rollId === r.id) { sel.rollId = ''; saveSel(); }
    go('journal');
  };
  $('scrRoll').querySelectorAll('[data-f]').forEach(b => b.onclick = () => openFrame(D.lm_frames.find(f => f.id === b.dataset.f)));
}
function openFrame(f) {
  if (!f) return; let armed = false;
  openSheet(`<div class="shead"><button id="fCancel">Cancel</button><b>Frame ${f.n}</b><button id="fSave" style="font-weight:600">Save</button></div>
    <div class="group"><div class="row"><span class="grow">Exposure</span><span class="val">${esc(apLabel(f.aperture))} · ${esc(shLabel(f.shutter))} · ISO ${f.iso}</span></div>
    <div class="row"><span class="grow">Metered</span><span class="val">EV ${esc(X.thirds(Math.round(f.ev * 3)))}${f.dev ? ` · ${esc(X.thirds(Math.round(Math.abs(f.dev) * 3)))} ${f.dev > 0 ? 'over' : 'under'}` : ''}</span></div>
    ${f.lat != null ? `<div class="row"><span class="grow">Place</span><a class="val" href="https://maps.apple.com/?ll=${f.lat},${f.lng}" target="_blank" rel="noopener" style="color:var(--yellow)">${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}</a></div>` : ''}
    <label class="row"><span style="width:60px">Note</span><input class="inl" id="fNote" maxlength="300" placeholder="Subject, filter, idea…" value="${esc(f.note || '')}" style="text-align:left"></label></div>
    <div class="group" style="margin-top:24px"><button class="row danger press" id="fDel">Delete Frame</button></div>`, s => {
      s.querySelector('#fCancel').onclick = closeSheet;
      s.querySelector('#fSave').onclick = () => { const note = s.querySelector('#fNote').value.trim(), d = strip(f); if (note) d.note = note; else delete d.note; store.put(user.uid, 'lm_frames', f.id, d); closeSheet(); };
      s.querySelector('#fDel').onclick = () => { if (!armed) { armed = true; s.querySelector('#fDel').textContent = 'Tap again to delete'; return; } store.del(user.uid, 'lm_frames', f.id); closeSheet(); };
    });
}

// ================= Gear =================
function renderGear() {
  $('scrGear').innerHTML = `<div class="nav"><button class="back press" id="gBack">${BACK}Meter</button></div>
    <h1 class="large">Gear</h1>
    <div class="sect">Cameras</div><div class="group">${D.lm_cameras.map(c => `<button class="row press" data-cam="${esc(c.id)}"><span class="grow">${esc(c.name)}<span class="small">Shutter ${shLabel(c.slowest)} – ${shLabel(c.fastest)}</span></span>${CHEV}</button>`).join('')}<button class="row link press" id="addCam">Add Camera</button></div>
    <div class="sect">Lenses</div><div class="group">${D.lm_lenses.map(l => `<button class="row press" data-lens="${esc(l.id)}"><span class="grow">${esc(l.name)}<span class="small">${l.focal ? l.focal + ' mm · ' : ''}${apLabel(l.widest)} – ${apLabel(l.smallest)}</span></span>${CHEV}</button>`).join('')}<button class="row link press" id="addLens">Add Lens</button></div>
    <div class="sect">Films</div><div class="group">${D.lm_films.map(f => `<button class="row press" data-film="${esc(f.id)}"><span class="grow">${esc(f.name)}<span class="small">ISO ${f.iso} · ${f.exposures} exposures</span></span>${CHEV}</button>`).join('')}<button class="row link press" id="addFilm">Add Film</button></div>
    <div class="sect">Meter</div><div class="group"><button class="row press" id="gCal"><span class="grow">Calibration<span class="small">${{ abs: 'Uses the phone’s exposure data', rel: 'Relative — match it to a real meter once', manual: 'Manual EV', start: '', off: 'Camera off' }[mode] || ''}</span></span>${CHEV}</button>
      <label class="row"><span class="grow">Save location with frames</span><input type="checkbox" class="switch" id="gLoc" ${prefs.location ? 'checked' : ''}></label></div>
    <div class="foot">Location is asked for only when you log a frame and stays in your journal.</div>
    <div class="sect">Account</div><div class="group"><div class="row"><span class="grow">${esc(user.name)}<span class="small">${esc(user.email)}</span></span></div><button class="row danger press" id="gOut">Sign Out</button></div>
    <a class="nf src" href="https://github.com/ibrahimovfuad/pockettools" target="_blank" rel="noopener">Open source on GitHub</a>
    <a class="nf tight" href="https://www.netlify.com" target="_blank" rel="noopener">This site is powered by Netlify</a>
    <div class="app-ver"></div><div style="height:24px"></div>`;
  $('gBack').onclick = () => go('meter');
  $('addCam').onclick = () => editCamera(null); $('addLens').onclick = () => editLens(null); $('addFilm').onclick = () => editFilm(null);
  $('scrGear').querySelectorAll('[data-cam]').forEach(b => b.onclick = () => editCamera(D.lm_cameras.find(x => x.id === b.dataset.cam)));
  $('scrGear').querySelectorAll('[data-lens]').forEach(b => b.onclick = () => editLens(D.lm_lenses.find(x => x.id === b.dataset.lens)));
  $('scrGear').querySelectorAll('[data-film]').forEach(b => b.onclick = () => editFilm(D.lm_films.find(x => x.id === b.dataset.film)));
  $('gCal').onclick = openCalibration;
  $('gLoc').onchange = e => { prefs.location = e.target.checked; savePrefs(); if (prefs.location && navigator.geolocation) navigator.geolocation.getCurrentPosition(() => {}, () => { toast('Location is not allowed'); }); };
  $('gOut').onclick = () => { stopCamera(); store.signOut(); };
}
const options = (from, to, label, cur) => { const o = []; for (let x = from; x <= to; x++) o.push(`<option value="${x}" ${x === cur ? 'selected' : ''}>${esc(label(x))}</option>`); return o.join(''); };
function editor(title, isNew, body, onSave, onDelete) {
  let armed = false;
  openSheet(`<div class="shead"><button id="xCancel">Cancel</button><b>${title}</b><button id="xSave" style="font-weight:600">${isNew ? 'Add' : 'Done'}</button></div>${body}
    ${isNew ? '' : '<div class="group" style="margin-top:24px"><button class="row danger press" id="xDel">Delete</button></div>'}`, s => {
      s.querySelector('#xCancel').onclick = closeSheet;
      s.querySelector('#xSave').onclick = () => { if (onSave(s) !== false) closeSheet(); };
      const d = s.querySelector('#xDel'); if (d) d.onclick = () => { if (!armed) { armed = true; d.textContent = 'Tap again to delete'; return; } onDelete(); closeSheet(); };
    });
}
const nameRow = (v, ph) => `<label class="row"><span style="width:90px">Name</span><input class="inl" id="xName" maxlength="40" placeholder="${ph}" value="${esc(v || '')}" style="text-align:left"></label>`;
const getName = s => { const n = s.querySelector('#xName').value.trim(); if (!n) { s.querySelector('#xName').focus(); return null; } return n.slice(0, 40); };
function editCamera(c) {
  const fast = c ? X.shutterIndex(c.fastest) : X.shutterIndex(1 / 1000), slow = c ? X.shutterIndex(c.slowest) : X.shutterIndex(1);
  editor(c ? 'Camera' : 'New Camera', !c, `<div class="group">${nameRow(c && c.name, 'e.g. Nikon FM2')}
    <label class="row"><span class="grow">Fastest shutter</span><select class="inl" id="xFast">${options(X.S_MIN, X.S_MAX, X.shutterLabel, fast)}</select></label>
    <label class="row"><span class="grow">Slowest shutter</span><select class="inl" id="xSlow">${options(X.S_MIN, X.S_MAX, X.shutterLabel, slow)}</select></label></div>
    <div class="foot">Bulb is not included — the meter suggests timed speeds only.</div>`, s => {
      const name = getName(s); if (!name) return false;
      let f = +s.querySelector('#xFast').value, sl = +s.querySelector('#xSlow').value; if (f < sl) [f, sl] = [sl, f];
      const id = c ? c.id : uid8();
      store.put(user.uid, 'lm_cameras', id, { name, fastest: X.shutterSeconds(f), slowest: X.shutterSeconds(sl) });
      if (!c && !sel.cameraId) { sel.cameraId = id; saveSel(); }
      setTimeout(() => { buildAll(); resolveNow(); renderMeter(); }, 50);
    }, () => { store.del(user.uid, 'lm_cameras', c.id); if (sel.cameraId === c.id) { sel.cameraId = ''; saveSel(); } });
}
function editLens(l) {
  const w = l ? X.apertureIndex(l.widest) : X.apertureIndex(1.8), sm = l ? X.apertureIndex(l.smallest) : X.apertureIndex(22);
  editor(l ? 'Lens' : 'New Lens', !l, `<div class="group">${nameRow(l && l.name, 'e.g. 50mm f/1.8')}
    <label class="row"><span class="grow">Focal length, mm</span><input class="inl" id="xFocal" inputmode="numeric" maxlength="4" value="${l && l.focal ? l.focal : ''}" placeholder="50"></label>
    <label class="row"><span class="grow">Widest aperture</span><select class="inl" id="xWide">${options(X.A_MIN, X.A_MAX, X.apertureLabel, w)}</select></label>
    <label class="row"><span class="grow">Smallest aperture</span><select class="inl" id="xSmall">${options(X.A_MIN, X.A_MAX, X.apertureLabel, sm)}</select></label></div>`, s => {
      const name = getName(s); if (!name) return false;
      let a = +s.querySelector('#xWide').value, b = +s.querySelector('#xSmall').value; if (a > b) [a, b] = [b, a];
      const focal = parseInt(s.querySelector('#xFocal').value, 10), id = l ? l.id : uid8();
      const data = { name, widest: X.apertureNumber(a), smallest: X.apertureNumber(b) }; if (focal > 0 && focal < 5000) data.focal = focal;
      store.put(user.uid, 'lm_lenses', id, data);
      if (!l && !sel.lensId) { sel.lensId = id; saveSel(); }
      setTimeout(() => { buildAll(); resolveNow(); renderMeter(); }, 50);
    }, () => { store.del(user.uid, 'lm_lenses', l.id); if (sel.lensId === l.id) { sel.lensId = ''; saveSel(); } });
}
function editFilm(f) {
  editor(f ? 'Film' : 'New Film', !f, `<div class="group">${nameRow(f && f.name, 'e.g. Portra 400')}
    <label class="row"><span class="grow">ISO</span><select class="inl" id="xIso">${options(X.I_MIN, X.I_MAX, X.isoLabel, f ? X.isoIndex(f.iso) : 6)}</select></label>
    <label class="row"><span class="grow">Exposures</span><input class="inl" id="xExp" inputmode="numeric" maxlength="3" value="${f ? f.exposures : 36}"></label></div>`, s => {
      const name = getName(s); if (!name) return false;
      const exposures = clamp(parseInt(s.querySelector('#xExp').value, 10) || 36, 1, 999);
      store.put(user.uid, 'lm_films', f ? f.id : uid8(), { name, iso: X.isoNumber(+s.querySelector('#xIso').value), exposures });
    }, () => store.del(user.uid, 'lm_films', f.id));
}

// ================= Sheet =================
function openSheet(html, bind) { const s = $('sheet'); s.innerHTML = '<div class="grab"></div>' + html; bind(s); $('sheetBg').classList.add('open'); s.classList.add('open'); }
function closeSheet() { $('sheet').classList.remove('open'); $('sheetBg').classList.remove('open'); }
$('sheetBg').onclick = closeSheet;

// ================= Start-up and sign-in =================
function seed() {
  if (seeded) return; seeded = true;
  [['Kodak Portra 400', 400, 36], ['Ilford HP5 Plus', 400, 36], ['Kodak Ektar 100', 100, 36]].forEach(([name, iso, exposures], k) => store.put(user.uid, 'lm_films', uid8() + k, { name, iso, exposures }));
}
function start() {
  store.onUser(u => {
    user = u;
    $('login').classList.toggle('hide', !!u);
    $('app').classList.toggle('hide', !u);
    if (!u) { stopCamera(); return; }
    buildAll(); renderMeter();
    store.listen(u.uid, (name, arr, fromCache) => {
      D[name] = arr;
      if (name === 'lm_films' && !fromCache && !arr.length) seed();
      if (name === 'lm_cameras' || name === 'lm_lenses') { buildAll(); resolveNow(); }
      if (name === 'lm_rolls') { const r = roll(); if (sel.rollId && !r && !fromCache) { sel.rollId = ''; saveSel(); } }
      renderMeter(); renderScreen();
    });
    if (!manual) startCamera();
  });
  $('signInBtn').onclick = () => { $('loginErr').textContent = ''; store.signIn().catch(e => { $('loginErr').textContent = authError(e); }); };
}
addEventListener('resize', () => { if (user) renderMeter(); });

// Service worker with automatic updates: check for a new version on launch and whenever the app
// returns to the foreground (iOS resumes installed apps without reloading them). When a new
// version takes over, reload once — unless the user is typing; then wait until later.
if ('serviceWorker' in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  let updatePending = false, reloading = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || hold; };
  const applyUpdate = () => { if (reloading) return; if (busy()) { updatePending = true; return; } reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) applyUpdate(); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (updatePending) applyUpdate(); else reg.update().catch(() => {});
    });
  }).catch(() => {});
  // show the running version (the service worker's cache name, e.g. "lightmeter-v1" → "v1") at the bottom of the app
  navigator.serviceWorker.ready.then(reg => {
    if (!reg.active) return;
    const ch = new MessageChannel();
    ch.port1.onmessage = e => { const v = String(e.data || '').replace(/^.*-(v\d+)$/, '$1'); if (v) document.documentElement.style.setProperty('--app-ver', JSON.stringify(v)); };
    reg.active.postMessage('version', [ch.port2]);
  }).catch(() => {});
}

start();
