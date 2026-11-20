// Unit tests for the push helpers shared by Mood and Weekly Digest (shared/push-core.mjs, copied to apps/*/netlify/lib).
// Run with "npm run test:push". web-push and jose are the apps' own dependencies, so install them first:
//   (cd apps/mood && npm ci --omit=dev --ignore-scripts)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { allowedEndpoint, cleanSubscription, readJson, sendAll, userId, MAX_BODY, MAX_FAILS, localParts } from '../apps/mood/netlify/lib/push-core.mjs';

const webpush = createRequire(new URL('../apps/mood/package.json', import.meta.url))('web-push');
process.env.VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';   // the well-known example key pair from the web-push docs
process.env.VAPID_PRIVATE_KEY = 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';

const KEYS = { p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM', auth: 'tBHItJI5svbpez7KI4CCXg' };
const sub = (host = 'fcm.googleapis.com', path = '/fcm/send/abc') => ({ endpoint: `https://${host}${path}`, keys: { ...KEYS } });

test('only the real push services are accepted as endpoints', () => {
  for (const ok of ['https://fcm.googleapis.com/fcm/send/abc', 'https://web.push.apple.com/Qx1', 'https://updates.push.services.mozilla.com/wpush/v2/x',
    'https://db5p.notify.windows.com/?token=x', 'https://wns2-par02p.wns.windows.com/x', 'https://FCM.googleapis.com/x'])
    assert.equal(allowedEndpoint(ok), true, ok);
  for (const bad of ['http://fcm.googleapis.com/x', 'https://evil.example/x', 'https://fcm.googleapis.com.evil.example/x', 'https://evilfcm.googleapis.com/x',
    'https://push.apple.com.evil.example/', 'https://notify.windows.com/x', 'https://user:pw@fcm.googleapis.com/x', 'https://fcm.googleapis.com:8443/x',
    'https://127.0.0.1/x', 'https://169.254.169.254/latest/meta-data', 'https://localhost/x', 'ftp://fcm.googleapis.com/x', 'not a url', '', null, undefined, 42, {},
    `https://fcm.googleapis.com/${'a'.repeat(600)}`])
    assert.equal(allowedEndpoint(bad), false, String(bad));
});

test('a subscription needs an allowed endpoint and well-formed keys of a sane size', () => {
  assert.deepEqual(cleanSubscription({ ...sub(), expirationTime: null, extra: 1 }), sub());
  assert.equal(cleanSubscription(sub('evil.example')), null);
  assert.equal(cleanSubscription({ endpoint: sub().endpoint }), null);
  assert.equal(cleanSubscription({ endpoint: sub().endpoint, keys: { p256dh: KEYS.p256dh } }), null);
  assert.equal(cleanSubscription({ endpoint: sub().endpoint, keys: { ...KEYS, auth: 'x'.repeat(49) } }), null);
  assert.equal(cleanSubscription({ endpoint: sub().endpoint, keys: { ...KEYS, p256dh: 'x'.repeat(129) } }), null);
  assert.equal(cleanSubscription({ endpoint: sub().endpoint, keys: { ...KEYS, auth: 'has space!!' } }), null);
  assert.equal(cleanSubscription({ endpoint: sub().endpoint, keys: { ...KEYS, auth: { a: 1 } } }), null);
  assert.equal(cleanSubscription(null), null);
  assert.equal(cleanSubscription('x'), null);
  assert.equal(cleanSubscription({ ...sub(), fails: 3 }).fails, 3);
  assert.equal(cleanSubscription({ ...sub(), fails: 'many' }).fails, undefined);
});

test('request bodies are size-limited and must be JSON objects', async () => {
  const req = (body, headers = {}) => new Request('https://x.test/', { method: 'POST', body, headers });
  assert.deepEqual(await readJson(req('{"action":"get"}')), { action: 'get' });
  assert.deepEqual(await readJson(req('[1,2]')), {});
  assert.deepEqual(await readJson(req('nope')), {});
  assert.deepEqual(await readJson(req('')), {});
  assert.deepEqual(await readJson(req(JSON.stringify({ action: 'save', pad: 'x'.repeat(MAX_BODY) }))), {});
  assert.deepEqual(await readJson(req('{}', { 'content-length': String(MAX_BODY + 1) })), {});
});

test('a missing, malformed or unsigned token is not a user', async () => {
  process.env.FIREBASE_PROJECT_ID = 'demo-project';
  const none = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: 'u1', iss: 'https://securetoken.google.com/demo-project', aud: 'demo-project' })).toString('base64url') + '.';
  const hs = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: 'u1' })).toString('base64url') + '.c2ln';
  for (const h of [undefined, '', 'Bearer', 'Bearer abc', `Bearer ${none}`, `Bearer ${hs}`])
    assert.equal(await userId(new Request('https://x.test/', { headers: h === undefined ? {} : { authorization: h } })), null, String(h));
});

// Replace the network call: the behaviour is chosen per endpoint
function fakeSend(behaviour) {
  const calls = [];
  webpush.sendNotification = async (s, body, opts) => { calls.push({ s, body, opts }); return behaviour(s, opts); };
  return calls;
}
const err = statusCode => Object.assign(new Error('push failed'), { statusCode });

test('sendAll: removed devices are dropped, failures are counted, success resets the count, unknown hosts are never contacted', async () => {
  const gone = sub('fcm.googleapis.com', '/gone'), flaky = { ...sub('fcm.googleapis.com', '/flaky'), fails: 2 }, fine = { ...sub('fcm.googleapis.com', '/fine'), fails: 4 };
  const calls = fakeSend(s => { if (s.endpoint.endsWith('/gone')) throw err(410); if (s.endpoint.endsWith('/flaky')) throw err(503); });
  const kept = await sendAll([gone, flaky, fine, sub('evil.example', '/x')], { title: 't' }, { ttl: 60 });
  assert.equal(calls.length, 3, 'the evil host is not called');
  assert.ok(calls.every(c => c.opts.timeout === 5000 && c.opts.TTL === 60), 'every send has a timeout');
  assert.deepEqual(kept.map(k => [k.endpoint.split('/').pop(), k.fails]), [['flaky', 3], ['fine', undefined]]);
});

test('sendAll: a device that keeps failing is dropped after MAX_FAILS failures in a row', async () => {
  fakeSend(() => { throw err(500); });
  let subs = [sub()];
  for (let i = 1; i < MAX_FAILS; i++) { subs = await sendAll(subs, {}); assert.equal(subs.length, 1); assert.equal(subs[0].fails, i); }
  assert.deepEqual(await sendAll(subs, {}), []);
});

test('sendAll: devices are contacted in parallel and a hanging one cannot hold up the rest beyond the time budget', async () => {
  fakeSend(s => (s.endpoint.endsWith('/slow') ? new Promise(() => {}) : undefined));
  const t0 = Date.now();
  const kept = await sendAll([sub('fcm.googleapis.com', '/slow'), sub('fcm.googleapis.com', '/ok')], {}, { budget: 150 });
  assert.ok(Date.now() - t0 < 1000);
  assert.equal(kept.length, 2, 'the unfinished one is kept unchanged, not counted as a failure');
  assert.equal(kept.find(k => k.endpoint.endsWith('/slow')).fails, undefined);
});

test('localParts follows the time zone, with UTC as the fallback', () => {
  const now = new Date('2026-11-22T18:30:00Z');   // Sunday
  assert.deepEqual(localParts('Europe/Warsaw', now), { date: '2026-11-22', weekday: 'Sun', hour: 19 });
  assert.deepEqual(localParts('No/Such_Zone', now), { date: '2026-11-22', weekday: 'Sun', hour: 18 });
});
