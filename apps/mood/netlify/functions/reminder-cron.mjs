// Раз в час: всем, у кого сейчас наступил выбранный час и день ещё не оценён, отправляем напоминание.
import { getStore } from '@netlify/blobs';
import { sendTo, localParts, REMINDER } from '../lib/push.mjs';

export default async () => {
  const store = getStore('reminders');
  const { blobs } = await store.list();
  let sent = 0;
  for (const { key } of blobs) {
    const r = await store.get(key, { type: 'json' });
    if (!r || !r.enabled || !r.subs || !r.subs.length) continue;
    const { date, hour } = localParts(r.tz);
    if (hour !== r.hour || r.lastSent === date || r.lastRated === date) continue;
    r.subs = await sendTo(r.subs, REMINDER);
    r.lastSent = date;
    await store.setJSON(key, r);
    sent++;
  }
  return new Response(`sent ${sent}`);
};

export const config = { schedule: '@hourly' };
