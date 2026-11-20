// Push notification helpers shared by the Mood and Weekly Digest reminder functions.
// Edit this file in shared/ and run "npm run sync-shared"; it is copied into each app's netlify/lib/.
//
//   userId(req)                    the Firebase user id of the request (verified ID token), or null
//   readJson(req)                  the request body as an object; {} if it is missing, too big or not JSON
//   cleanSubscription(raw)         a push subscription that is safe to store and send to, or null
//   sendAll(subs, payload, opts)   send to every subscription; returns the subscriptions to keep
//   localParts(tz, now)            date, weekday and hour in a time zone
import webpush from 'web-push';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// ---------------------------------------------------------------- who is calling
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

export async function userId(req) {
  const project = process.env.FIREBASE_PROJECT_ID;
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || !project) return null;
  try {
    // Firebase signs ID tokens with RS256 only; pinning it rules out "alg" confusion
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${project}`, audience: project, algorithms: ['RS256'] });
    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null;
  } catch (e) { return null; }
}

// ---------------------------------------------------------------- request bodies
export const MAX_BODY = 8 * 1024;   // the largest real request (one push subscription) is well under 2 KB

export async function readJson(req) {
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY) return {};
  let text = '';
  try { text = await req.text(); } catch (e) { return {}; }
  if (text.length > MAX_BODY) return {};
  try { const o = JSON.parse(text); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; }
}

// ---------------------------------------------------------------- push subscriptions
// A subscription is a URL on the browser vendor's push service. Accepting any URL would let a signed-in user make our
// server send requests to any host, so only the real push services are allowed.
const HOST_EXACT = new Set(['fcm.googleapis.com', 'updates.push.services.mozilla.com']);
const HOST_SUFFIX = ['.push.apple.com', '.notify.windows.com', '.wns.windows.com'];
const B64URL = /^[A-Za-z0-9_-]+$/;

export function allowedEndpoint(endpoint) {
  if (typeof endpoint !== 'string' || endpoint.length > 600) return false;
  let u;
  try { u = new URL(endpoint); } catch (e) { return false; }
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return false;
  const h = u.hostname.toLowerCase();
  return HOST_EXACT.has(h) || HOST_SUFFIX.some(s => h.endsWith(s) && h.length > s.length);
}

export function cleanSubscription(s) {
  if (!s || typeof s !== 'object' || !s.keys || typeof s.keys !== 'object') return null;
  const { p256dh, auth } = s.keys;
  if (!allowedEndpoint(s.endpoint)) return null;
  if (typeof p256dh !== 'string' || p256dh.length < 20 || p256dh.length > 128 || !B64URL.test(p256dh)) return null;
  if (typeof auth !== 'string' || auth.length < 8 || auth.length > 48 || !B64URL.test(auth)) return null;
  const fails = Number.isInteger(s.fails) && s.fails > 0 ? Math.min(s.fails, 100) : 0;
  return fails ? { endpoint: s.endpoint, keys: { p256dh, auth }, fails } : { endpoint: s.endpoint, keys: { p256dh, auth } };
}

// ---------------------------------------------------------------- sending
export const MAX_FAILS = 5;            // a device that failed this many times in a row is dropped
const SEND_TIMEOUT = 5000;             // per notification, milliseconds
const DEFAULT_BUDGET = 8000;           // for all notifications of one call

// Sends the payload to every subscription at the same time (each with its own timeout, all within a total time budget).
// Returns the subscriptions to keep:
//   - 404 / 410: the device removed the subscription → dropped
//   - other failures (timeout, push service down): counted; dropped after MAX_FAILS failures in a row
//   - success: the failure count is reset
//   - subscriptions that no longer pass cleanSubscription (e.g. a host that is not a push service) → dropped, nothing is sent
export async function sendAll(subs, payload, { ttl = 3 * 3600, budget = DEFAULT_BUDGET } = {}) {
  const list = (subs || []).map(cleanSubscription).filter(Boolean);
  if (!list.length) return [];
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const body = JSON.stringify(payload);
  const keep = list.map(s => ({ ...s }));              // default: unchanged (also what happens to those not finished within the budget)
  const jobs = list.map((s, i) => (async () => {
    const { fails, ...sub } = s;
    try {
      await webpush.sendNotification(sub, body, { TTL: ttl, timeout: SEND_TIMEOUT });
      delete keep[i].fails;
    } catch (e) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) keep[i] = null;
      else {
        const n = (fails || 0) + 1;
        keep[i] = n >= MAX_FAILS ? null : { ...keep[i], fails: n };
      }
    }
  })());
  let timer;
  await Promise.race([Promise.allSettled(jobs), new Promise(res => { timer = setTimeout(res, budget); })]);
  clearTimeout(timer);
  return keep.filter(Boolean);
}

// ---------------------------------------------------------------- time
// Date, weekday and hour in a time zone (an unknown zone falls back to UTC)
export function localParts(tz, now = new Date()) {
  const opts = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', hourCycle: 'h23' };
  let f;
  try { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: tz }); }
  catch (e) { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: 'UTC' }); }
  const p = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, weekday: p.weekday, hour: Number(p.hour) % 24 };
}
