// Hourly: send a reminder to everyone whose chosen hour is now and whose day is not rated yet.
// Users are handled in small parallel batches and the run stops at a time budget (a scheduled function has 30 seconds),
// so one slow push service can never hold up everybody else.
import { getStore } from '@netlify/blobs';
import { sendTo, localParts, REMINDER } from '../lib/push.mjs';

const BATCH = 10, BUDGET_MS = 22000;

export default async () => {
  const started = Date.now();
  const store = getStore('reminders');
  const { blobs } = await store.list();
  let sent = 0, skipped = 0;
  for (let i = 0; i < blobs.length; i += BATCH) {
    if (Date.now() - started > BUDGET_MS) { skipped = blobs.length - i; console.warn(`reminder-cron: time budget reached, ${skipped} records not checked`); break; }
    const done = await Promise.allSettled(blobs.slice(i, i + BATCH).map(async ({ key }) => {
      const r = await store.get(key, { type: 'json' });
      if (!r || !r.enabled || !r.subs || !r.subs.length) return 0;
      const { date, hour } = localParts(r.tz);
      if (hour !== r.hour || r.lastSent === date || r.lastRated === date) return 0;
      r.subs = await sendTo(r.subs, REMINDER);
      r.lastSent = date;
      // every device was dropped (removed or failing for days): the record is of no use any more
      if (r.subs.length) await store.setJSON(key, r); else await store.delete(key);
      return 1;
    }));
    sent += done.filter(d => d.status === 'fulfilled' && d.value).length;
  }
  return new Response(`sent ${sent}${skipped ? `, not checked ${skipped}` : ''}`);
};

export const config = { schedule: '@hourly' };
