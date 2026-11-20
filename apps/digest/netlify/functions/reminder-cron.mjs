// Hourly: on Sunday at 19:00 Europe/Warsaw, tell everyone who turned the reminder on that their digest is ready.
// Running every hour and checking the Warsaw clock (instead of one fixed UTC time) handles daylight saving time.
// Users are handled in small parallel batches and the run stops at a time budget (a scheduled function has 30 seconds),
// so one slow push service can never hold up everybody else.
import { getStore } from '@netlify/blobs';
import { sendTo, localParts, DIGEST } from '../lib/push.mjs';

const SEND_TZ = 'Europe/Warsaw', SEND_DAY = 'Sun', SEND_HOUR = 19;
const BATCH = 10, BUDGET_MS = 22000;

export default async () => {
  const started = Date.now();
  const { date, weekday, hour } = localParts(SEND_TZ);
  if (weekday !== SEND_DAY || hour !== SEND_HOUR) return new Response('not now');
  const store = getStore('digest-reminders');
  const { blobs } = await store.list();
  let sent = 0, skipped = 0;
  for (let i = 0; i < blobs.length; i += BATCH) {
    if (Date.now() - started > BUDGET_MS) { skipped = blobs.length - i; console.warn(`reminder-cron: time budget reached, ${skipped} records not checked`); break; }
    const done = await Promise.allSettled(blobs.slice(i, i + BATCH).map(async ({ key }) => {
      const r = await store.get(key, { type: 'json' });
      if (!r || !r.enabled || !r.subs || !r.subs.length || r.lastSent === date) return 0;
      r.subs = await sendTo(r.subs, DIGEST);
      r.lastSent = date;
      // every device was dropped (removed or failing for weeks): the record is of no use any more
      if (r.subs.length) await store.setJSON(key, r); else await store.delete(key);
      return 1;
    }));
    sent += done.filter(d => d.status === 'fulfilled' && d.value).length;
  }
  return new Response(`sent ${sent}${skipped ? `, not checked ${skipped}` : ''}`);
};

export const config = { schedule: '@hourly' };
