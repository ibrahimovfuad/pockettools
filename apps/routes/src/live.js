// Where is the vehicle? A "provider chain" per city:
//   1. gps       — the city's own open vehicle API through /api/vehicles/<provider> (Warsaw buses and trams, needs a
//                  server-side key; without it this step is skipped)
//   2. realtime  — Transitous/MOTIS timetable with real-time delays (GTFS-Realtime where a city publishes it);
//                  the position is interpolated along the route from those times
//   3. estimated — the same interpolation from the plain timetable
// Metro and underground have no position: only a countdown to the departure.
// Add a provider for another city by adding an entry to PROVIDERS and a "live" field to the city in cities.js.
import { trip as fetchTrip } from './api.js';
import { decodePolyline, cumulative, project, pointAt, ms, modeKind } from './util.js';

const PROVIDERS = {
  warsaw: {
    attribution: { name: 'Miasto Stołeczne Warszawa', url: 'https://api.um.warszawa.pl' },
    async fetch(line, kind) {
      if (kind !== 'bus' && kind !== 'tram') return null;
      const r = await fetch(`/api/vehicles/warsaw?line=${encodeURIComponent(line)}&type=${kind}`);
      if (!r.ok) return null;                                    // 503 = no API key configured: use the next step
      const d = await r.json();
      return Array.isArray(d.vehicles) ? { vehicles: d.vehicles, at: Date.parse(d.fetchedAt) || Date.now() } : null;
    }
  }
};

// The trip as a list of stops with times (real-time adjusted when the feed has them) and the route line
export function prepareTrip(leg) {
  const places = [leg.from, ...(leg.intermediateStops || []), leg.to].filter(Boolean);
  const coords = leg.legGeometry && leg.legGeometry.points ? decodePolyline(leg.legGeometry.points, leg.legGeometry.precision || 5) : places.map(p => [p.lon, p.lat]);
  const cum = cumulative(coords);
  let prev = 0;
  const stops = places.map((p, i) => {
    const arr = ms(p.arrival || p.departure), dep = ms(p.departure || p.arrival);
    let along = project(coords, cum, p.lat, p.lon).along;
    along = Math.max(prev, along); prev = along;               // distances along the line only ever grow
    return { id: p.stopId, name: p.name, lat: p.lat, lon: p.lon, arr: isFinite(arr) ? arr : dep, dep: isFinite(dep) ? dep : arr, along, i };
  });
  return { stops, coords, cum, realTime: !!leg.realTime, kind: modeKind(leg.mode), mode: leg.mode, line: leg.routeShortName || leg.displayName || '', headsign: leg.headsign || '', cancelled: !!leg.cancelled };
}

// Position, from the timetable, at time t
function atTime(tr, t) {
  const s = tr.stops, n = s.length;
  if (t < s[0].dep) return { k: 0, state: 'waiting', dist: s[0].along };
  if (t >= s[n - 1].arr) return { k: n - 1, state: 'done', dist: s[n - 1].along };
  for (let i = 0; i < n - 1; i++) {
    if (t >= s[i].arr && t < s[i].dep) return { k: i, state: 'stop', dist: s[i].along };
    const a = s[i].dep, b = s[i + 1].arr;
    if (t >= a && t < b) return { k: i, state: 'moving', dist: s[i].along + (s[i + 1].along - s[i].along) * ((t - a) / Math.max(1, b - a)) };
  }
  return { k: n - 1, state: 'done', dist: s[n - 1].along };
}
// The time the timetable has the vehicle at a given distance along the route
function timeAtDist(tr, d) {
  const s = tr.stops;
  for (let i = 0; i < s.length - 1; i++) {
    if (d <= s[i + 1].along) {
      const span = s[i + 1].along - s[i].along;
      const f = span > 0 ? Math.max(0, (d - s[i].along) / span) : 0;
      return s[i].dep + (s[i + 1].arr - s[i].dep) * f;
    }
  }
  return s[s.length - 1].arr;
}
function segmentOf(tr, d) {
  const s = tr.stops;
  let k = 0;
  while (k < s.length - 1 && d >= s[k + 1].along - 1) k++;
  return k;
}

// Pick the vehicle that belongs to this trip among all vehicles of the line: close to the route line and
// closest to where the timetable says the trip is now. Sticks to the vehicle it chose before.
function match(tr, vehicles, expectedDist, lockedId) {
  let best = null;
  for (const v of vehicles) {
    const p = project(tr.coords, tr.cum, v.lat, v.lon);
    if (p.off > 60) continue;
    const gap = Math.abs(p.along - expectedDist) + (v.id === lockedId ? -400 : 0);
    if (!best || gap < best.gap) best = { v, along: p.along, gap };
  }
  return best && Math.abs(best.along - expectedDist) < 4000 ? best : null;
}

// target: { tripId, line, kind, stopId, stopName, alightStopId? }
export function createTracker({ target, city, onUpdate, onError }) {
  let timer = null, stopped = false, lockedId = null, trip = null, inFlight = false;
  const provider = city && city.live ? PROVIDERS[city.live] : null;
  let gpsOk = !!provider;

  async function tick() {
    if (stopped || inFlight) return;
    inFlight = true;
    try {
      const leg = await fetchTrip(target.tripId);
      trip = prepareTrip(leg);
      const now = Date.now();
      const tr = trip;
      // which stop is the target? the boarding stop until the vehicle has left it, then the stop to get off at
      let ti = tr.stops.findIndex(s => s.id === target.stopId);
      if (ti < 0) ti = tr.stops.findIndex(s => s.name === target.stopName);
      if (ti < 0) ti = 0;
      const ai = target.alightStopId ? tr.stops.findIndex(s => s.id === target.alightStopId) : -1;

      const vm = { trip: tr, now, source: 'estimated', pos: null, vehicleId: null, updatedAt: now, attribution: null, metro: tr.kind === 'metro' };
      const exp = atTime(tr, now);
      let cur = exp, delayMs = 0;

      if (!vm.metro && gpsOk) {
        try {
          const r = await provider.fetch(tr.line, tr.kind);
          if (r) {
            const m = match(tr, r.vehicles, exp.dist, lockedId);
            if (m) {
              lockedId = m.v.id;
              vm.source = 'gps'; vm.vehicleId = m.v.id; vm.pos = [m.v.lon, m.v.lat]; vm.updatedAt = r.at; vm.attribution = provider.attribution;
              const k = segmentOf(tr, m.along);
              cur = { k, state: 'moving', dist: m.along };
              delayMs = now - timeAtDist(tr, m.along);      // how far the vehicle is from the (real-time adjusted) timetable
            } else { vm.attribution = provider.attribution; }
          } else gpsOk = false;                           // no key / API down: stop asking this session
        } catch (e) { /* network trouble: fall back to the timetable position */ }
      }
      if (vm.source !== 'gps') {
        vm.source = tr.realTime ? 'realtime' : 'estimated';
        vm.pos = vm.metro ? null : pointAt(tr.coords, tr.cum, cur.dist);
      }

      // passed the boarding stop → follow the alighting stop instead
      let phase = 'boarding';
      if (ti >= 0 && cur.state !== 'waiting' && (cur.k > ti || (cur.k === ti && cur.state === 'moving'))) {
        phase = ai >= 0 ? 'riding' : 'departed';
        if (ai >= 0) ti = ai;
      }
      const away = ti - cur.k;
      vm.targetIndex = ti; vm.phase = phase; vm.currentIndex = cur.k; vm.state = cur.state;
      vm.stopsAway = phase === 'departed' ? null : Math.max(0, away);
      vm.etaMs = phase === 'departed' ? null : Math.max(0, tr.stops[ti].arr + delayMs - now);
      vm.departMs = tr.stops[ti].dep - now;                     // for metro: countdown to departure
      vm.delayMin = Math.round(((tr.stops[0].dep - (leg.scheduledStartTime ? ms(leg.scheduledStartTime) : tr.stops[0].dep)) + delayMs) / 60000);
      vm.cancelled = tr.cancelled;
      if (!stopped) onUpdate(vm);
    } catch (e) { if (!stopped) onError(e); }
    finally { inFlight = false; }
  }
  function schedule() { clearInterval(timer); timer = setInterval(() => { if (document.visibilityState === 'visible') tick(); }, 12000); }
  const onVis = () => { if (document.visibilityState === 'visible') tick(); };
  return {
    start() { tick(); schedule(); document.addEventListener('visibilitychange', onVis); },
    refresh: tick,
    stop() { stopped = true; clearInterval(timer); document.removeEventListener('visibilitychange', onVis); },
    last: () => trip
  };
}

// Positions of the trips of one itinerary (for the "Live vehicles on map" option of the route screen)
export async function snapshot(legs, city) {
  const out = [];
  await Promise.all(legs.map(async leg => {
    try {
      const tr = prepareTrip(await fetchTrip(leg.tripId));
      if (tr.kind === 'metro') return;
      const exp = atTime(tr, Date.now());
      let pos = null, source = tr.realTime ? 'realtime' : 'estimated', id = leg.tripId;
      const prov = city && city.live ? PROVIDERS[city.live] : null;
      if (prov) {
        try {
          const r = await prov.fetch(tr.line, tr.kind);
          const m = r && match(tr, r.vehicles, exp.dist, null);
          if (m) { pos = [m.v.lon, m.v.lat]; source = 'gps'; }
        } catch (e) {}
      }
      if (!pos && exp.state !== 'waiting' && exp.state !== 'done') pos = pointAt(tr.coords, tr.cum, exp.dist);
      if (pos) out.push({ id, line: tr.line, kind: tr.kind, pos, source });
    } catch (e) {}
  }));
  return out;
}
export const providerFor = city => (city && city.live && PROVIDERS[city.live]) || null;
