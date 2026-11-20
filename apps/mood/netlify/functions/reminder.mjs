// /api/reminder — the user's reminder settings.
// GET  → public VAPID key.
// POST (with a Firebase ID token) → get | save | rated | test | export | delete
import { getStore } from '@netlify/blobs';
import { userId, readJson, cleanSubscription } from '../lib/push-core.mjs';
import { sendTo, REMINDER } from '../lib/push.mjs';

const MAX_DEVICES = 5;
const TEST_EVERY_MS = 30 * 1000;   // one test notification per 30 seconds per user
// The other Pocket Tools apps call this endpoint from their own domains to export or delete a user's stored data
// (Account & data → Delete account in any app). It is safe to allow any origin: every POST needs the user's own
// Firebase ID token in the Authorization header, and no cookies are used.
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-max-age': '86400' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS } });

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method === 'GET') return json({ vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const uid = await userId(req);
  if (!uid) return json({ error: 'auth' }, 401);
  const body = await readJson(req);
  const store = getStore('reminders');
  const cur = (await store.get(uid, { type: 'json' })) || { enabled: false, hour: 21, tz: 'UTC', subs: [] };

  switch (body.action) {
    case 'get':
      return json({ enabled: !!cur.enabled, hour: cur.hour });

    case 'save': {
      if (Number.isInteger(body.hour) && body.hour >= 0 && body.hour <= 23) cur.hour = body.hour;
      if (typeof body.tz === 'string' && body.tz.length < 64) cur.tz = body.tz;
      if (typeof body.enabled === 'boolean') cur.enabled = body.enabled;
      if (body.subscription !== undefined) {
        // only real push-service endpoints with well-formed keys are stored (see push-core.mjs)
        const s = cleanSubscription(body.subscription);
        if (!s) return json({ error: 'subscription' }, 400);
        cur.subs = (cur.subs || []).filter(x => x.endpoint !== s.endpoint).concat([s]).slice(-MAX_DEVICES);
      }
      await store.setJSON(uid, cur);
      return json({ ok: true, enabled: !!cur.enabled, hour: cur.hour });
    }

    case 'rated':   // day rated (or rating deleted: date = null) — no reminder today
      cur.lastRated = typeof body.date === 'string' ? body.date.slice(0, 10) : null;
      await store.setJSON(uid, cur);
      return json({ ok: true });

    case 'test':    // test notification right now
      if (Date.now() - (cur.lastTest || 0) < TEST_EVERY_MS) return json({ error: 'throttled' }, 429);
      cur.lastTest = Date.now();
      cur.subs = await sendTo(cur.subs || [], REMINDER);
      await store.setJSON(uid, cur);
      return json({ ok: true, devices: cur.subs.length });

    case 'export':  // everything stored about the user, without the push keys
      return json({ ...Object.fromEntries(Object.entries(cur).filter(([k]) => k !== 'subs')), devices: (cur.subs || []).length,
        pushEndpointHosts: [...new Set((cur.subs || []).map(x => { try { return new URL(x.endpoint).host; } catch (e) { return ''; } }))] });

    case 'delete':  // remove the user's whole record: settings and push subscriptions
      await store.delete(uid);
      return json({ ok: true });

    default:
      return json({ error: 'action' }, 400);
  }
};

export const config = { path: '/api/reminder' };
