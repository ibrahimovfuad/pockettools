import webpush from 'web-push';

export const REMINDER = { title: 'How was your day?', body: 'Rate it from 0 to 10 — it takes a couple of seconds.', url: './' };

// Send a notification to all of the user's devices. Returns the subscriptions that are still alive.
export async function sendTo(subs, payload) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const alive = [];
  for (const s of subs) {
    try { await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 3 * 3600 }); alive.push(s); }
    catch (e) { if (e.statusCode !== 404 && e.statusCode !== 410) alive.push(s); }   // 404/410 — the subscription was removed on the device
  }
  return alive;
}

// Current date and hour in the user's time zone
export function localParts(tz) {
  const opts = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' };
  let f;
  try { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: tz }); }
  catch (e) { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: 'UTC' }); }
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
}
