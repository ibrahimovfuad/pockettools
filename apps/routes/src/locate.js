// The user's own position (blue dot) and direction (compass beam). Everything stays in the page.
const subs = new Set();
const st = { pos: null, heading: null, watchId: null, users: 0, error: null, compassOn: false };
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
export const compassNeedsTap = () => typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
let smooth = null, lastEmit = 0;
function onOrient(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
  else if (e.absolute === true && typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
  else if (e.type === 'deviceorientationabsolute' && typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
  if (h == null || !isFinite(h)) return;
  // low-pass filter on the circle so the beam does not jitter
  if (smooth == null) smooth = h; else { const d = ((h - smooth + 540) % 360) - 180; smooth = (smooth + d * 0.25 + 360) % 360; }
  const now = Date.now();
  if (now - lastEmit < 80) return;
  lastEmit = now;
  st.heading = smooth; emit();
}
// Returns true if the compass is running. Call from a tap on iOS.
export async function enableCompass() {
  if (st.compassOn) return true;
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  try {
    if (compassNeedsTap()) { if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') return false; }
    if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient, true);
    else window.addEventListener('deviceorientation', onOrient, true);
    st.compassOn = true; return true;
  } catch (e) { return false; }
}
export function disableCompass() {
  window.removeEventListener('deviceorientationabsolute', onOrient, true);
  window.removeEventListener('deviceorientation', onOrient, true);
  st.compassOn = false; st.heading = null; smooth = null; emit();
}
