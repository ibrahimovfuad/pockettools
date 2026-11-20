// The user's own position (blue dot) and direction (compass beam). Everything stays in the page.
const subs = new Set();
const st = { pos: null, heading: null, headingLow: false, watchId: null, users: 0, error: null, compassOn: false };
const emit = () => subs.forEach(f => { try { f(st); } catch (e) {} });
export const onLocation = f => { subs.add(f); return () => subs.delete(f); };
export const state = st;

export const canLocate = () => 'geolocation' in navigator;
export async function geoPermission() {
  try { if (navigator.permissions) return (await navigator.permissions.query({ name: 'geolocation' })).state; } catch (e) {}
  return 'unknown';
}
export function locError(e) {
  if (e && e.code === 1) return 'Location access is off. Allow it in your browser or iPhone settings, or type a starting point.';
  if (e && e.code === 3) return 'Could not get your location in time. Try again.';
  return 'Your location is not available right now.';
}

// One-off position (asks for permission on first use)
export function getPosition(maxAgeMs = 60000) {
  if (st.pos && Date.now() - st.pos.ts < maxAgeMs) return Promise.resolve(st.pos);
  return new Promise((res, rej) => {
    if (!canLocate()) return rej({ code: 2 });
    navigator.geolocation.getCurrentPosition(p => { setPos(p); res(st.pos); }, rej, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  });
}
function setPos(p) { st.pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy || 50, ts: Date.now() }; st.error = null; emit(); }

// Follow the position while a map is visible (counted, so two screens can share it)
export function startWatch() {
  st.users++;
  if (st.watchId != null || !canLocate()) return;
  try {
    st.watchId = navigator.geolocation.watchPosition(setPos, e => { st.error = locError(e); emit(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 });
  } catch (e) { st.error = locError(e); }
}
export function stopWatch() {
  st.users = Math.max(0, st.users - 1);
  if (st.users === 0 && st.watchId != null) { navigator.geolocation.clearWatch(st.watchId); st.watchId = null; }
}

// ---- compass ----
// iOS: DeviceOrientationEvent.requestPermission() must be called from a tap; the heading is webkitCompassHeading.
// Android: the "deviceorientationabsolute" event; alpha is counter-clockwise from north.
// The outcome of the permission question is remembered on this device ("granted" / "denied") so a refusal is not
// asked again and again; the Settings screen offers an explicit "Try again" (see compassDenied / retry).
const COMPASS_KEY = 'routes.compass';
const compassMemo = () => { try { return localStorage.getItem(COMPASS_KEY) || ''; } catch (e) { return ''; } };
const remember = v => { try { localStorage.setItem(COMPASS_KEY, v); } catch (e) {} };
export const compassNeedsTap = () => typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
let permitted = false;                    // iOS: the user allowed motion access in this session
export const compassDenied = () => compassNeedsTap() && !permitted && compassMemo() === 'denied';
// true while a tap should try to start the compass (iOS only, setting on, not running, not refused before)
export const compassWantsTap = () => compassNeedsTap() && !permitted && !st.compassOn && compassMemo() !== 'denied';

// Low-pass filter on the circle plus a dead band, so the beam neither jitters nor jumps.
let smooth = null, shown = null, lastEmit = 0;
const angDiff = (a, b) => ((a - b + 540) % 360) - 180;
function onOrient(e) {
  let h = null, acc = null;
  if (typeof e.webkitCompassHeading === 'number') {
    h = e.webkitCompassHeading;
    if (typeof e.webkitCompassAccuracy === 'number') acc = e.webkitCompassAccuracy;   // degrees; negative = not calibrated
  } else if (typeof e.alpha === 'number' && (e.absolute === true || e.type === 'deviceorientationabsolute')) h = (360 - e.alpha) % 360;
  if (h == null || !isFinite(h) || (acc != null && acc < 0)) return;
  const low = acc != null && acc > 35;
  if (smooth == null) smooth = h;
  else {
    const d = angDiff(h, smooth);
    if (Math.abs(d) < 1.5) return;                                  // sensor noise
    const gain = low ? 0.06 : Math.abs(d) > 40 ? 0.4 : 0.15;         // slow when unsure, quick for a real turn
    smooth = (smooth + d * gain + 360) % 360;
  }
  const now = Date.now();
  if (now - lastEmit < 100) return;
  if (shown != null && Math.abs(angDiff(smooth, shown)) < 2 && st.headingLow === low) return;
  lastEmit = now; shown = smooth;
  st.heading = smooth; st.headingLow = low; emit();
}
let asking = null, offTimer = null;
function listen() {
  if (st.compassOn) return;
  if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient, true);
  else window.addEventListener('deviceorientation', onOrient, true);
  st.compassOn = true;
}
// Returns true if the compass is running. On iOS the permission question needs { gesture: true } (a tap);
// { gesture: 'retry' } asks again even after a refusal (the explicit button in Settings).
export async function enableCompass({ gesture = false } = {}) {
  clearTimeout(offTimer);
  if (st.compassOn) return true;
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  if (compassNeedsTap() && !permitted) {
    if (!gesture || (compassMemo() === 'denied' && gesture !== 'retry')) return false;
    if (!asking) {
      asking = (async () => {
        try {
          const r = await DeviceOrientationEvent.requestPermission();
          if (r === 'granted') { permitted = true; remember('granted'); } else remember('denied');
        } catch (e) { /* not from a tap, or no sensor: not a refusal */ }
        asking = null;
      })();
    }
    await asking;
    if (!permitted) { emit(); return false; }
  }
  listen(); emit();
  return true;
}
export function disableCompass() {
  clearTimeout(offTimer);
  window.removeEventListener('deviceorientationabsolute', onOrient, true);
  window.removeEventListener('deviceorientation', onOrient, true);
  st.compassOn = false; st.heading = null; st.headingLow = false; smooth = null; shown = null; emit();
}
// Leaving a map screen: keep the compass (and its smoothed value) alive for a few seconds, because the next map
// screen usually starts right away and should not start from scratch.
export function releaseCompass() { clearTimeout(offTimer); offTimer = setTimeout(() => { if (st.users === 0) disableCompass(); }, 5000); }
