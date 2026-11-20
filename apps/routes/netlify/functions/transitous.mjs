// /api/transitous/<endpoint> — a thin proxy to the public Transitous (MOTIS 2) API, https://transitous.org/api/
//
// Why it exists: the Transitous usage policy asks every client to identify itself with a User-Agent header
// (name, version and a contact), which browsers cannot set. The proxy also only lets the endpoints and
// parameters the app uses through, and adds short cache headers so many users share one upstream request.
// It forwards nothing about the visitor (no IP address, cookies or headers) and never logs or stores queries.
const UPSTREAM = 'https://api.transitous.org/api';
const USER_AGENT = 'PocketRoutes/1.0 (+https://github.com/ibrahimovfuad/pockettools)';

// endpoint → [path on Transitous (newest API version first), allowed query parameters, cache seconds]
const ENDPOINTS = {
  plan: [['v6/plan', 'v5/plan'], ['fromPlace', 'toPlace', 'time', 'arriveBy', 'transitModes', 'numItineraries', 'pageCursor', 'maxTransfers', 'searchWindow', 'maxPreTransitTime', 'maxPostTransitTime', 'detailedTransfers', 'language', 'timetableView', 'withScheduledSkippedStops'], 30],
  geocode: [['v1/geocode'], ['text', 'place', 'placeBias', 'numResults', 'type', 'language', 'mode'], 3600],
  'reverse-geocode': [['v1/reverse-geocode'], ['place', 'type', 'numResults'], 3600],
  stoptimes: [['v6/stoptimes', 'v5/stoptimes'], ['stopId', 'time', 'n', 'arriveBy', 'window', 'mode', 'language', 'pageCursor', 'direction', 'radius'], 10],
  trip: [['v6/trip', 'v5/trip'], ['tripId', 'language', 'withScheduledSkippedStops'], 8]
};
const json = (o, status, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', ...extra } });

// the API version that worked last time (module state lives as long as the function instance)
const version = {};

async function call(paths, qs, key) {
  let last = null;
  const order = version[key] != null ? [paths[version[key]], ...paths.filter((_, i) => i !== version[key])] : paths;
  for (let i = 0; i < order.length; i++) {
    const p = order[i];
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      const r = await fetch(`${UPSTREAM}/${p}?${qs}`, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' }, signal: ctl.signal });
      if (r.status === 404 && i < order.length - 1) { last = r; continue; }   // older API version?
      version[key] = paths.indexOf(p);
      return r;
    } finally { clearTimeout(timer); }
  }
  return last;
}

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method' }, 405);
  const name = new URL(req.url).pathname.replace(/^.*\/api\/transitous\//, '').replace(/\/+$/, '');
  const ep = ENDPOINTS[name];
  if (!ep) return json({ error: 'unknown endpoint' }, 404);
  const [paths, allowed, ttl] = ep;

  const src = new URL(req.url).searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of src) if (allowed.includes(k) && v.length <= 500) qs.append(k, v);
  if (!qs.toString()) return json({ error: 'missing parameters' }, 400);

  try {
    const r = await call(paths, qs.toString(), name);
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') || 'application/json',
        // browsers keep it very briefly; Netlify's CDN shares it between users
        'cache-control': r.ok ? `public, max-age=${Math.min(ttl, 10)}` : 'no-store',
        ...(r.ok ? { 'netlify-cdn-cache-control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}` } : {})
      }
    });
  } catch (e) {
    return json({ error: 'The routing service did not answer.' }, 502, { 'cache-control': 'no-store' });
  }
};

export const config = { path: '/api/transitous/*' };
