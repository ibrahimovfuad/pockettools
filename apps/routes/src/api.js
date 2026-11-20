// Client for our own proxy of the Transitous (MOTIS) API — see netlify/functions/transitous.mjs.
import { isTransit } from './util.js';

export class ApiError extends Error {
  constructor(kind, status) { super(kind); this.kind = kind; this.status = status; }
}
// A message a person can act on
export function friendly(e) {
  const k = e && e.kind;
  if (k === 'offline') return 'No internet connection. Check your network and try again.';
  if (k === 'timeout') return 'The routing service is slow to answer. Try again in a moment.';
  if (k === 'notfound') return 'No data found for this request.';
  if (k === 'badrequest') return 'The routing service could not understand this request. Try other places or another time.';
  return 'The routing service is not available right now. Try again in a moment.';
}

async function get(endpoint, params, timeoutMs = 20000) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') q.set(k, v);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  let r;
  try { r = await fetch(`/api/transitous/${endpoint}?${q}`, { signal: ctl.signal }); }
  catch (e) { throw new ApiError(ctl.signal.aborted ? 'timeout' : (navigator.onLine === false ? 'offline' : 'network')); }
  finally { clearTimeout(timer); }
  if (!r.ok) throw new ApiError(r.status === 404 ? 'notfound' : r.status >= 400 && r.status < 500 ? 'badrequest' : 'server', r.status);
  try { return await r.json(); } catch (e) { throw new ApiError('server', r.status); }
}

export const MODE_FILTERS = {
  all: { label: 'All modes', modes: '' },
  tram: { label: 'Tram', modes: 'TRAM' },
  bus: { label: 'Bus', modes: 'BUS' },
  metro: { label: 'Metro', modes: 'SUBWAY,METRO' },
  rail: { label: 'Train', modes: 'RAIL,SUBURBAN,REGIONAL_RAIL,REGIONAL_FAST_RAIL,LONG_DISTANCE,HIGHSPEED_RAIL,NIGHT_RAIL' }
};

// A place the user picked → what Transitous wants in fromPlace / toPlace
const placeParam = p => (p.stopId ? p.stopId : `${p.lat},${p.lon}`);

export async function plan({ from, to, time, arriveBy, mode, cursor }) {
  const d = await get('plan', {
    fromPlace: placeParam(from), toPlace: placeParam(to),
    time: time ? new Date(time).toISOString() : undefined,
    arriveBy: arriveBy ? 'true' : undefined,
    transitModes: MODE_FILTERS[mode] && MODE_FILTERS[mode].modes || undefined,
    numItineraries: 6, pageCursor: cursor
  }, 30000);
  return { itineraries: Array.isArray(d.itineraries) ? d.itineraries : [], next: d.nextPageCursor || null, prev: d.previousPageCursor || null };
}

export async function geocode(text, bias, n = 6) {
  const d = await get('geocode', { text, place: bias ? `${bias.lat},${bias.lon}` : undefined, placeBias: bias ? 2 : undefined, numResults: n }, 10000);
  return (Array.isArray(d) ? d : []).filter(m => m && isFinite(m.lat) && isFinite(m.lon)).map(matchToPlace);
}
export async function reverse(lat, lon, type, n = 1) {
  const d = await get('reverse-geocode', { place: `${lat},${lon}`, type, numResults: n }, 10000);
  return (Array.isArray(d) ? d : []).filter(m => m && isFinite(m.lat) && isFinite(m.lon)).map(matchToPlace);
}
function matchToPlace(m) {
  const areas = Array.isArray(m.areas) ? m.areas : [];
  const area = (areas.filter(a => a.default).map(a => a.name).join(', ') || areas.slice(0, 2).map(a => a.name).join(', '));
  const street = [m.street, m.houseNumber].filter(Boolean).join(' ');
  return {
    kind: m.type === 'STOP' ? 'stop' : 'place', name: m.name, lat: m.lat, lon: m.lon,
    stopId: m.type === 'STOP' ? m.id : undefined,
    sub: m.type === 'STOP' ? ['Stop', area].filter(Boolean).join(' · ') : (m.type === 'ADDRESS' && street && !String(m.name).includes(street) ? [street, area] : [area]).flat().filter(Boolean).join(' · ')
  };
}

export async function stoptimes(stopId, n = 24, time) {
  const d = await get('stoptimes', { stopId, n, time: time ? new Date(time).toISOString() : undefined }, 15000);
  return { place: d.place || null, items: Array.isArray(d.stopTimes) ? d.stopTimes : [] };
}

// One trip with all its stops, with real-time delays where the feed has them
export async function trip(tripId) {
  const d = await get('trip', { tripId }, 12000);
  const leg = (d.legs || []).find(l => isTransit(l.mode));
  if (!leg) throw new ApiError('notfound', 404);
  return leg;
}
