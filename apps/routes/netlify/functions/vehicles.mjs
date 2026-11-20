// /api/vehicles/<provider>?line=<number>&type=bus|tram — live vehicle positions from a city's own open API.
// One provider per city so more can be added later (add an entry to PROVIDERS).
//
// warsaw — Miasto Stołeczne Warszawa, https://api.um.warszawa.pl (buses and trams, GPS positions).
//   Needs a free API key in the Netlify environment variable UM_WARSAW_API_KEY; without it the function answers
//   503 {"error":"not-configured"} and the app falls back to timetable-based positions.
//   Terms: show "Miasto Stołeczne Warszawa", the download time and a link to https://api.um.warszawa.pl.
const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'x-content-type-options': 'nosniff', 'cache-control': 'no-store', ...extra } });

const PROVIDERS = {
  async warsaw(line, type) {
    const key = process.env.UM_WARSAW_API_KEY;
    if (!key) return { status: 503, body: { error: 'not-configured' } };
    const u = new URL('https://api.um.warszawa.pl/api/action/busestrams_get/');
    u.searchParams.set('resource_id', 'f2e5503e-927d-4ad3-9500-4ab9e55deb59');
    u.searchParams.set('apikey', key);
    u.searchParams.set('type', type === 'tram' ? '2' : '1');
    u.searchParams.set('line', line);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(u, { signal: ctl.signal, headers: { accept: 'application/json', 'user-agent': 'PocketRoutes/1.0 (+https://github.com/ibrahimovfuad/pockettools)' } });
      const d = await r.json();
      // on errors the API answers with a text message instead of a list
      if (!Array.isArray(d.result)) return { status: 502, body: { error: 'upstream' } };
      const vehicles = d.result
        .filter(v => v && typeof v.Lat === 'number' && typeof v.Lon === 'number')
        .map(v => ({ id: String(v.VehicleNumber || ''), line: String(v.Lines || line), brigade: String(v.Brigade || ''), lat: v.Lat, lon: v.Lon, time: v.Time || null }));
      return {
        status: 200,
        body: { provider: 'warsaw', fetchedAt: new Date().toISOString(), attribution: { name: 'Miasto Stołeczne Warszawa', url: 'https://api.um.warszawa.pl' }, vehicles },
        headers: { 'cache-control': 'public, max-age=3', 'netlify-cdn-cache-control': 'public, s-maxage=5, stale-while-revalidate=5' }
      };
    } finally { clearTimeout(timer); }
  }
};

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method' }, 405);
  const url = new URL(req.url);
  const name = url.pathname.replace(/^.*\/api\/vehicles\//, '').replace(/\/+$/, '');
  const provider = Object.hasOwn(PROVIDERS, name) ? PROVIDERS[name] : null;
  if (!provider) return json({ error: 'unknown provider' }, 404);
  const line = (url.searchParams.get('line') || '').trim();
  const type = url.searchParams.get('type') === 'tram' ? 'tram' : 'bus';
  if (!/^[A-Za-z0-9]{1,6}$/.test(line)) return json({ error: 'bad line' }, 400);
  try {
    const r = await provider(line, type);
    return json(r.body, r.status, r.headers || {});
  } catch (e) { return json({ error: 'upstream' }, 502); }
};

// Netlify rate limit per visitor (IP address). The app polls a line every 12 seconds while vehicles are followed,
// so 60 a minute leaves room for several lines; beyond that the answer is 429.
export const config = {
  path: '/api/vehicles/:provider',
  rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 60 }
};
