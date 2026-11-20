// Everything the app remembers lives here, on this device only (localStorage). It is optionally mirrored to the
// user's own Firestore documents when they sign in (see account.js) — nothing else is ever stored.
const KEY = 'routes.v1';
export const DEFAULTS = () => ({ city: 'warszawa', places: [], history: [], settings: { direction: true, rotate: false, live: true }, syncUid: null, ts: { settings: 0, history: 0 } });
let data = load();
const listeners = new Set();

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && typeof d === 'object') {
      const base = DEFAULTS();
      return { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) }, ts: { ...base.ts, ...(d.ts || {}) }, places: Array.isArray(d.places) ? d.places : [], history: Array.isArray(d.history) ? d.history : [] };
    }
  } catch (e) {}
  return DEFAULTS();
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
// source: "local" for the user's own changes (these get synced when signed in), "remote" for changes coming from the cloud
function changed(source = 'local') { persist(); listeners.forEach(f => { try { f(source); } catch (e) {} }); }

export const get = () => data;
export const onChange = f => { listeners.add(f); return () => listeners.delete(f); };

// ---- saved places ----
// kind: home | work | stop | place. Ids are safe to use as Firestore document ids.
export const KINDS = ['home', 'work', 'stop', 'place'];
export const hash36 = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
export const placeId = p => (p.kind === 'home' || p.kind === 'work' ? p.kind : (p.kind === 'stop' ? 's-' : 'p-') + hash36(p.stopId || `${p.lat.toFixed(4)},${p.lon.toFixed(4)}`));
export const isSaved = id => data.places.some(p => p.id === id);
export function savePlace(p) {
  const rec = cleanPlace({ ...p, ts: Date.now() });
  if (!rec) return null;
  rec.id = placeId(rec);
  data.places = data.places.filter(x => x.id !== rec.id).concat(rec);
  changed();
  return rec;
}
export function removePlace(id) { data.places = data.places.filter(p => p.id !== id); changed(); }
export function cleanPlace(p) {
  if (!p || typeof p !== 'object') return null;
  const lat = Number(p.lat), lon = Number(p.lon), name = String(p.name || '').trim().slice(0, 120);
  if (!name || !isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const kind = KINDS.includes(p.kind) ? p.kind : 'place';
  const out = { kind, name, lat: Math.round(lat * 1e6) / 1e6, lon: Math.round(lon * 1e6) / 1e6, ts: Number(p.ts) || Date.now() };
  if (p.sub) out.sub = String(p.sub).slice(0, 200);
  if (p.stopId) out.stopId = String(p.stopId).slice(0, 200);
  if (p.id) out.id = String(p.id);
  return out;
}

// ---- search history: the last 10 places searched for ----
export function addHistory(p) {
  const rec = cleanPlace({ ...p, kind: p.stopId ? 'stop' : 'place', ts: Date.now() });
  if (!rec) return;
  const key = x => x.stopId || `${x.lat.toFixed(4)},${x.lon.toFixed(4)}`;
  data.history = [rec, ...data.history.filter(x => key(x) !== key(rec))].slice(0, 10);
  data.ts.history = Date.now();
  changed();
}
export function clearHistory() { data.history = []; data.ts.history = Date.now(); changed(); }

// ---- settings ----
export function setSettings(patch) { data.settings = { ...data.settings, ...patch }; data.ts.settings = Date.now(); changed(); }
export function setCity(id) { data.city = id; data.ts.settings = Date.now(); changed(); }

// ---- used by the account sync ----
export function replaceAll(next, source = 'remote') { data = { ...data, ...next }; changed(source); }
export function wipe() { const uid = data.syncUid; data = DEFAULTS(); data.syncUid = uid; changed('local'); }
export function setSyncUid(uid) { data.syncUid = uid; persist(); }

// ---- export / import of saved places (file or share link) ----
export function exportPlaces() {
  return { app: 'routes', version: 1, exportedAt: new Date().toISOString(), places: data.places.map(({ id, ...p }) => p) };
}
const b64u = {
  enc: s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)))
};
export const shareLink = () => `${location.origin}${location.pathname}#import=${b64u.enc(JSON.stringify(exportPlaces().places))}`;
// Accepts a file's text, a whole share link or just the part after "#import="; returns clean places or throws
export function parseImport(text) {
  text = String(text || '').trim();
  let obj;
  const m = text.match(/#?import=([A-Za-z0-9_-]+)/);
  try { obj = JSON.parse(m ? b64u.dec(m[1]) : text); } catch (e) { throw new Error('This is not a Routes export.'); }
  const arr = Array.isArray(obj) ? obj : obj && Array.isArray(obj.places) ? obj.places : null;
  if (!arr) throw new Error('This is not a Routes export.');
  const places = arr.slice(0, 200).map(cleanPlace).filter(Boolean);
  if (!places.length) throw new Error('No places found in it.');
  return places;
}
export function importPlaces(places) {
  for (const p of places) {
    const rec = { ...p, ts: Date.now() }; rec.id = placeId(rec);
    data.places = data.places.filter(x => x.id !== rec.id).concat(rec);
  }
  changed();
}
