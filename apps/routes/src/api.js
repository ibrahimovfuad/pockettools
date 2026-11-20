// Client for our own proxy of the Transitous (MOTIS) API — see netlify/functions/transitous.mjs.
import { isTransit, dist } from './util.js';
import { fold } from './cities.js';

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

// ---- journey search ----
// MOTIS only returns Pareto-optimal journeys: a connection that is slower (or has more walking, or the same
// departure with another mode) than another one in the window is dropped, even if it is a perfectly good
// alternative. The default window is 15 minutes and numItineraries is only a minimum. So one request gives 4-5
// options at best. To get the choice other planners show, we ask several slightly different questions in
// parallel and merge the answers (see mergeItineraries):
//   main    all modes, 30 min window, at least 8 options
//   near    only stops within a 5 min walk at both ends (a nearby stop is otherwise dominated by a faster one further away)
//   direct  no changes at all (a direct bus is otherwise dominated by a faster journey with a change)
//   rail    trains only (S/R/KM lines are otherwise dominated by buses and trams)
const WINDOW = 1800;
export function planQueries(mode) {
  const modes = MODE_FILTERS[mode] && MODE_FILTERS[mode].modes || undefined;
  const q = [
    { key: 'main', p: { transitModes: modes, numItineraries: 8, searchWindow: WINDOW } },
    { key: 'near', p: { transitModes: modes, numItineraries: 6, searchWindow: WINDOW, maxPreTransitTime: 300, maxPostTransitTime: 300 } },
    { key: 'direct', p: { transitModes: modes, numItineraries: 6, searchWindow: WINDOW, maxTransfers: 0 } }
  ];
  if (!modes) q.push({ key: 'rail', p: { transitModes: MODE_FILTERS.rail.modes, numItineraries: 4, searchWindow: WINDOW } });
  return q;
}

const tms = t => (t ? new Date(t).getTime() : NaN);
const walkSec = it => (it.legs || []).filter(l => l.mode === 'WALK').reduce((a, l) => a + (l.duration || 0), 0);
// Two itineraries that ride the same vehicles from the same stops are the same option (only the walking may differ)
export function itinKey(it) {
  const parts = (it.legs || []).filter(l => isTransit(l.mode)).map(l => `${l.tripId || `${l.routeShortName || l.displayName || ''}@${l.scheduledStartTime || l.startTime}`}|${l.from && (l.from.stopId || l.from.name)}|${l.to && (l.to.stopId || l.to.name)}`);
  return parts.length ? parts.join('>') : `walk|${it.duration}`;
}
// Merge, de-duplicate (keep the variant with less walking), drop absurdly slow leftovers, sort by departure
export function mergeItineraries(lists) {
  const byKey = new Map();
  for (const it of lists.flat()) {
    if (!it || !Array.isArray(it.legs) || !isFinite(tms(it.startTime)) || !isFinite(tms(it.endTime))) continue;
    const k = itinKey(it), old = byKey.get(k);
    if (!old || walkSec(it) < walkSec(old) || (walkSec(it) === walkSec(old) && tms(it.endTime) < tms(old.endTime))) byKey.set(k, it);
  }
  const all = [...byKey.values()];
  const fastest = Math.min(...all.map(i => i.duration || Infinity));
  const keep = all.filter(i => !isFinite(fastest) || (i.duration || 0) <= fastest * 1.6 + 600);
  return keep.sort((a, b) => tms(a.startTime) - tms(b.startTime) || tms(a.endTime) - tms(b.endTime));
}

// cursors: { main: '…', near: '…' } to load the next page of every query that has one ("Later connections")
export async function plan({ from, to, time, arriveBy, mode, cursors }) {
  const base = {
    fromPlace: placeParam(from), toPlace: placeParam(to),
    time: time ? new Date(time).toISOString() : undefined,
    arriveBy: arriveBy ? 'true' : undefined
  };
  const queries = planQueries(mode).filter(q => !cursors || cursors[q.key]);
  if (!queries.length) return { itineraries: [], cursors: {}, hasMore: false };
  const res = await Promise.allSettled(queries.map(q => get('plan', { ...base, ...q.p, pageCursor: cursors ? cursors[q.key] : undefined }, 30000)));
  const ok = res.map((r, i) => ({ key: queries[i].key, d: r.status === 'fulfilled' ? r.value : null })).filter(x => x.d);
  if (!ok.length) throw res.find(r => r.status === 'rejected').reason;
  const next = {};
  for (const q of queries) { const x = ok.find(o => o.key === q.key); next[q.key] = x && x.d.nextPageCursor ? x.d.nextPageCursor : null; }
  return {
    itineraries: mergeItineraries(ok.map(x => (Array.isArray(x.d.itineraries) ? x.d.itineraries : []))),
    cursors: next, hasMore: Object.values(next).some(Boolean)
  };
}

// ---- places: geocoder results ----
// A search for "Dobra 9" returns several addresses with the same name. The second line says what they are and
// where: kind, street, district/neighbourhood, postcode + city, and the region when the same city repeats.
const KIND_LABEL = { address: 'Address', stop: 'Stop', place: 'Place' };
const same = (a, b) => fold(a) === fold(b);
function matchToPlace(m) {
  const type = m.type === 'STOP' ? 'stop' : m.type === 'ADDRESS' ? 'address' : 'place';
  const areas = (Array.isArray(m.areas) ? m.areas : []).filter(a => a && a.name);
  const house = String(m.houseNumber || '').trim(), street = String(m.street || '').trim();
  let name = String(m.name || '').trim();
  if (type === 'address' && street && house && !name.includes(house)) name = `${street} ${house}`;
  else if (type === 'address' && street && !house && !name) name = street;
  const level = (a, lo, hi) => a.adminLevel >= lo && a.adminLevel <= hi;
  const local = areas.filter(a => level(a, 9, 12) && !same(a.name, name)).sort((x, y) => y.adminLevel - x.adminLevel).map(a => a.name);
  const cityArea = areas.find(a => a.default) || areas.filter(a => level(a, 7, 8)).sort((x, y) => y.adminLevel - x.adminLevel)[0];
  const regionArea = areas.find(a => a.adminLevel === 4);
  return {
    kind: type === 'stop' ? 'stop' : 'place', type, name, lat: m.lat, lon: m.lon,
    stopId: type === 'stop' ? m.id : undefined, sub: KIND_LABEL[type],
    _d: { street: type === 'address' ? '' : street, zip: String(m.zip || '').trim(), local: [...new Set(local)].slice(0, 2), city: cityArea ? cityArea.name : '', region: regionArea ? regionArea.name : '' }
  };
}
const detail = p => { const d = p._d; return (d.zip ? 1 : 0) + (d.street ? 1 : 0) + d.local.length + (d.city ? 1 : 0) + (d.region ? 1 : 0); };
// Fill in the second line for a whole result list (the region only where the same name + city repeats)
export function describePlaces(list) {
  for (const p of list) {
    const d = p._d, twin = list.some(o => o !== p && same(o.name, p.name) && same(o._d.city, d.city));
    const cityLine = [d.zip, d.city].filter(Boolean).join(' ');
    p.sub = [KIND_LABEL[p.type], d.street, d.local.join(', '), cityLine, twin && d.region && !same(d.region, d.city) ? d.region : ''].filter(Boolean).join(' · ');
  }
  return list.map(({ _d, ...p }) => p);
}
// One place per name and spot (within 25 m); the most detailed entry wins
export function dedupePlaces(list) {
  const out = [];
  for (const p of list) {
    const i = out.findIndex(o => o.type === p.type && same(o.name, p.name) && dist(o.lat, o.lon, p.lat, p.lon) < 25);
    if (i < 0) out.push(p); else if (detail(p) > detail(out[i])) out[i] = p;
  }
  return out;
}
// In or near the chosen city first (40 km), the geocoder's own order inside each group
export function rankPlaces(list, bias) {
  if (!bias) return list;
  const near = p => dist(bias.lat, bias.lon, p.lat, p.lon) <= 40000 ? 0 : 1;
  return list.map((p, i) => ({ p, g: near(p), i })).sort((a, b) => a.g - b.g || a.i - b.i).map(x => x.p);
}
const toPlaces = (d, bias, n) => describePlaces(rankPlaces(dedupePlaces((Array.isArray(d) ? d : []).filter(m => m && isFinite(m.lat) && isFinite(m.lon)).map(matchToPlace)), bias).slice(0, n));
export async function geocode(text, bias, n = 6) {
  const d = await get('geocode', { text, place: bias ? `${bias.lat},${bias.lon}` : undefined, placeBias: bias ? 2 : undefined, numResults: n + 6 }, 10000);
  return toPlaces(d, bias, n);
}
export async function reverse(lat, lon, type, n = 1) {
  const d = await get('reverse-geocode', { place: `${lat},${lon}`, type, numResults: n }, 10000);
  return toPlaces(d, null, n);
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
