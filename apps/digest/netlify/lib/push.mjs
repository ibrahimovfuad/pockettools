import webpush from 'web-push';

// The push carries no personal numbers: the server never reads the user's data.
export const DIGEST = { title: 'Your week in review is ready', body: 'Mood, habits, spending and reading — tap to open the stories.', url: './?open=stories' };

// Send a notification to all of the user's devices. Returns the subscriptions that are still alive.
export async function sendTo(subs, payload) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const alive = [];
  for (const s of subs) {
    try { await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 6 * 3600 }); alive.push(s); }
    catch (e) { if (e.statusCode !== 404 && e.statusCode !== 410) alive.push(s); }   // 404/410 — the subscription was removed on the device
  }
  return alive;
}

// Current weekday, date and hour in a time zone. The digest is sent on Sunday at 19:00 Europe/Warsaw;
// asking the clock for Warsaw time (instead of a fixed UTC hour) keeps it right across daylight saving changes.
export function localParts(tz, now = new Date()) {
  const opts = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', hourCycle: 'h23' };
  let f;
  try { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: tz }); }
  catch (e) { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: 'UTC' }); }
  const p = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, weekday: p.weekday, hour: Number(p.hour) % 24 };
}
