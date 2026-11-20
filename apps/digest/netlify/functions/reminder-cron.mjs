// Hourly: on Sunday at 19:00 Europe/Warsaw, tell everyone who turned the reminder on that their digest is ready.
// Running every hour and checking the Warsaw clock (instead of one fixed UTC time) handles daylight saving time.
import { getStore } from '@netlify/blobs';
import { sendTo, localParts, DIGEST } from '../lib/push.mjs';

const SEND_TZ = 'Europe/Warsaw', SEND_DAY = 'Sun', SEND_HOUR = 19;

export default async () => {
  const { date, weekday, hour } = localParts(SEND_TZ);
  if (weekday !== SEND_DAY || hour !== SEND_HOUR) return new Response('not now');
  const store = getStore('digest-reminders');
  const { blobs } = await store.list();
  let sent = 0;
  for (const { key } of blobs) {
    const r = await store.get(key, { type: 'json' });
    if (!r || !r.enabled || !r.subs || !r.subs.length || r.lastSent === date) continue;
    r.subs = await sendTo(r.subs, DIGEST);
    r.lastSent = date;
    await store.setJSON(key, r);
    sent++;
  }
  return new Response(`sent ${sent}`);
};

export const config = { schedule: '@hourly' };
