// Small helpers: DOM, formatting, geometry, transport modes.
export const $ = id => document.getElementById(id);
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---- time (all supported cities are in Poland) ----
const TZ = 'Europe/Warsaw';
const clockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ });
const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
export const clock = t => { try { return clockFmt.format(new Date(t)); } catch (e) { return '–'; } };
export const dayLabel = t => dayFmt.format(new Date(t));
export const ms = t => (t ? new Date(t).getTime() : NaN);
export const minsBetween = (a, b) => Math.round((ms(b) - ms(a)) / 60000);
export function dur(sec) {
  const m = Math.max(1, Math.round(sec / 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`;
}
// "now", "6 min", or the clock time when it is more than an hour away
export function until(t, now = Date.now()) {
  const m = Math.round((ms(t) - now) / 60000);
  return m <= 0 ? 'now' : m < 60 ? `${m} min` : clock(t);
}
export const toLocalInput = d => {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// ---- geometry ----
const R = 6371000, rad = x => x * Math.PI / 180;
export function dist(lat1, lon1, lat2, lon2) {
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}
export const walkMin = m => Math.max(1, Math.round(m * 1.25 / 80));      // ~80 m per minute, a little detour allowance
export const fmtDist = m => (m < 950 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);

// Google encoded polyline → [[lon, lat], ...]
export function decodePolyline(str, precision = 5) {
  const f = 10 ** precision, out = [];
  let i = 0, lat = 0, lon = 0;
  while (i < str.length) {
    for (let k = 0; k < 2; k++) {
      let shift = 0, result = 0, b;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 31) << shift; shift += 5; } while (b >= 32 && i < str.length + 1);
      const d = result & 1 ? ~(result >> 1) : result >> 1;
      if (k === 0) lat += d; else lon += d;
    }
    out.push([lon / f, lat / f]);
  }
  return out;
}
export function cumulative(coords) {
  const c = [0];
  for (let i = 1; i < coords.length; i++) c.push(c[i - 1] + dist(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]));
  return c;
}
// Nearest point of a polyline: distance travelled along it and the distance away from it, in metres
export function project(coords, cum, lat, lon) {
  let best = { along: 0, off: Infinity };
  if (coords.length < 2) return best;
  const kx = Math.cos(rad(lat)) * 111320, ky = 110540;
  for (let i = 0; i < coords.length - 1; i++) {
    const ax = (coords[i][0] - lon) * kx, ay = (coords[i][1] - lat) * ky;
    const bx = (coords[i + 1][0] - lon) * kx, by = (coords[i + 1][1] - lat) * ky;
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
    const off = Math.hypot(ax + t * dx, ay + t * dy);
    if (off < best.off) best = { along: cum[i] + t * (cum[i + 1] - cum[i]), off };
  }
  return best;
}
export function pointAt(coords, cum, d) {
  if (!coords.length) return null;
  if (d <= 0) return coords[0];
  const last = cum[cum.length - 1];
  if (d >= last) return coords[coords.length - 1];
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
  return [coords[i - 1][0] + t * (coords[i][0] - coords[i - 1][0]), coords[i - 1][1] + t * (coords[i][1] - coords[i - 1][1])];
}
// polygon approximating a circle (for the GPS accuracy)
export function circle(lat, lon, r, n = 48) {
  const kx = Math.cos(rad(lat)) * 111320, ky = 110540, ring = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * 2 * Math.PI; ring.push([lon + Math.cos(a) * r / kx, lat + Math.sin(a) * r / ky]); }
  return ring;
}

// ---- transport modes ----
export const MODE_COLOR = { tram: '#c62828', bus: '#6d28d9', metro: '#1d4ed8', rail: '#15803d', other: '#475569' };
export function modeKind(mode) {
  switch (String(mode || '').toUpperCase()) {
    case 'TRAM': case 'CABLE_CAR': return 'tram';
    case 'BUS': case 'COACH': case 'TROLLEYBUS': return 'bus';
    case 'SUBWAY': case 'METRO': return 'metro';
    case 'RAIL': case 'HIGHSPEED_RAIL': case 'LONG_DISTANCE': case 'NIGHT_RAIL': case 'REGIONAL_FAST_RAIL': case 'REGIONAL_RAIL': case 'SUBURBAN': return 'rail';
    default: return 'other';
  }
}
export const KIND_NAME = { tram: 'Tram', bus: 'Bus', metro: 'Metro', rail: 'Train', other: 'Line' };
export const isTransit = mode => !!mode && !['WALK', 'BIKE', 'CAR', 'RENTAL', 'CAR_PARKING', 'CAR_DROPOFF', 'FLEX', 'ODM', 'RIDE_SHARING'].includes(String(mode).toUpperCase());
export const lineName = o => String(o.routeShortName || o.displayName || o.tripShortName || o.routeLongName || '?');
