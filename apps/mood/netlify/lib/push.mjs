import webpush from 'web-push';

export const REMINDER = { title: 'Как прошёл день?', body: 'Оцени его от 0 до 10 — займёт пару секунд.', url: './' };

// Отправить уведомление на все устройства пользователя. Возвращает подписки, которые ещё живы.
export async function sendTo(subs, payload) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const alive = [];
  for (const s of subs) {
    try { await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 3 * 3600 }); alive.push(s); }
    catch (e) { if (e.statusCode !== 404 && e.statusCode !== 410) alive.push(s); }   // 404/410 — подписка удалена на устройстве
  }
  return alive;
}

// Текущие дата и час в часовом поясе пользователя
export function localParts(tz) {
  const opts = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' };
  let f;
  try { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: tz }); }
  catch (e) { f = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone: 'UTC' }); }
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
}
