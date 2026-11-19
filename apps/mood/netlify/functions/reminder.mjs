// /api/reminder — the user's reminder settings.
// GET  → public VAPID key.
// POST (with a Firebase ID token) → get | save | rated | test
import { getStore } from '@netlify/blobs';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { sendTo, REMINDER } from '../lib/push.mjs';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function userId(req) {
  const project = process.env.FIREBASE_PROJECT_ID;
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || !project) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${project}`, audience: project });
    return payload.sub || null;
  } catch (e) { return null; }
}

export default async (req) => {
  if (req.method === 'GET') return json({ vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const uid = await userId(req);
  if (!uid) return json({ error: 'auth' }, 401);
  const body = await req.json().catch(() => ({}));
  const store = getStore('reminders');
  const cur = (await store.get(uid, { type: 'json' })) || { enabled: false, hour: 21, tz: 'UTC', subs: [] };

  switch (body.action) {
    case 'get':
      return json({ enabled: !!cur.enabled, hour: cur.hour });

    case 'save': {
      if (Number.isInteger(body.hour) && body.hour >= 0 && body.hour <= 23) cur.hour = body.hour;
      if (typeof body.tz === 'string' && body.tz.length < 64) cur.tz = body.tz;
      if (typeof body.enabled === 'boolean') cur.enabled = body.enabled;
      const s = body.subscription;
      if (s && typeof s.endpoint === 'string' && s.endpoint.startsWith('https://') && s.keys && s.keys.p256dh && s.keys.auth) {
        cur.subs = (cur.subs || []).filter(x => x.endpoint !== s.endpoint)
          .concat([{ endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } }])
          .slice(-5);   // at most 5 devices
      }
      await store.setJSON(uid, cur);
      return json({ ok: true, enabled: !!cur.enabled, hour: cur.hour });
    }

    case 'rated':   // day rated (or rating deleted: date = null) — no reminder today
      cur.lastRated = typeof body.date === 'string' ? body.date.slice(0, 10) : null;
      await store.setJSON(uid, cur);
      return json({ ok: true });

    case 'test':    // test notification right now
      cur.subs = await sendTo(cur.subs || [], REMINDER);
      await store.setJSON(uid, cur);
      return json({ ok: true, devices: cur.subs.length });

    default:
      return json({ error: 'action' }, 400);
  }
};

export const config = { path: '/api/reminder' };
