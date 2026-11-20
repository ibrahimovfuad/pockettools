// Sample data for demo mode (placeholder Firebase config, or "#demo" in the address). It is generated fresh on every
// start, clearly labelled in the UI, and never stored. It only exists so the app can be tried and tested without an account.
import { iso, today, addDays, monday } from './util.js';

export function demoData() {
  const t = today(), mon = monday(t), ms = d => d.getTime() + 12 * 36e5;
  const days = [], exps = [], quotes = [], snaps = [];
  const moods = [6, 7, 5, 8, 8, 9, 7, 6, 6, 7, 4, 5, 7, 8, 6, 7, 8, 6, 7, 5, 6, 7];
  moods.forEach((s, i) => { const d = addDays(mon, i - 14 + 0); if (d <= t) days.push({ id: iso(d), score: s, note: s >= 8 ? 'A really good day.' : '' }); });
  const cats = [['c1', 'Groceries'], ['c2', 'Eating out'], ['c3', 'Coffee'], ['c4', 'Transport'], ['c5', 'Fun']].map(([id, name], i) => ({ id, name, icon: 'dots', color: '#8E8E93', order: i }));
  for (let i = -14; i < 7; i++) {
    const d = addDays(mon, i); if (d > t) break;
    exps.push({ id: 'e' + i + 'a', amount: 20 + (((i * 37) % 60) + 60) % 60, catId: 'c1', date: iso(d), merchant: 'Corner shop' });
    if (i % 2 === 0) exps.push({ id: 'e' + i + 'b', amount: 25 + ((((i * 11) % 40) + 40) % 40) + (i >= 0 ? 15 : 0), catId: 'c2', date: iso(d) });
    if (i % 3 === 0) exps.push({ id: 'e' + i + 'c', amount: 12, catId: 'c3', date: iso(d), merchant: 'Cafe' });
  }
  const habits = [
    { id: 'h1', name: 'Read 30 min', emoji: '📚', created: 1, start: iso(addDays(mon, -40)) },
    { id: 'h2', name: 'Walk 10k steps', emoji: '🚶', created: 2, start: iso(addDays(mon, -40)) },
    { id: 'h3', name: 'No sugar', emoji: '🍎', created: 3, kind: 'quit', start: iso(addDays(mon, -10)) }
  ];
  const d = {}, dn = {};
  for (let i = -40; i <= 6; i++) {
    const x = addDays(mon, i); if (x > t) break;
    const md = iso(x).slice(5), y = iso(x).slice(0, 4);
    (d[y] = d[y] || { h1: {}, h2: {} }).h1[md] = 1;
    if ((i + 40) % 3 !== 0) d[y].h2[md] = 1;
  }
  const logs = [];
  Object.entries(d).forEach(([y, o]) => Object.entries(o).forEach(([hid, m]) => logs.push({ id: `${hid}_${y}`, habitId: hid, year: +y, d: m, n: {} })));
  const books = [
    { id: 'b1', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', status: 'reading', start: iso(addDays(t, -18)), created: ms(addDays(t, -30)) },
    { id: 'b2', title: 'Piranesi', author: 'Susanna Clarke', status: 'reading', start: iso(addDays(t, -6)), created: ms(addDays(t, -20)) },
    { id: 'b3', title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', status: 'done', start: iso(addDays(t, -25)), end: iso(addDays(mon, 1)), created: ms(addDays(t, -40)) },
    { id: 'b4', title: 'Solaris', author: 'Stanislaw Lem', status: 'queue', created: ms(addDays(mon, 2)) }
  ];
  [0, 1, 2].forEach(i => quotes.push({ id: 'q' + i, bookId: 'b1', text: 'Sample quote', created: ms(addDays(mon, i)) }));
  quotes.push({ id: 'q9', bookId: 'b2', text: 'Sample quote', created: ms(addDays(t, -9)) });
  snaps.push({ id: '2000-W01', quotes: 1, ts: 1 });
  return { days, habits, logs, exps, cats, books, quotes, snaps, meta: { budget: 2000 } };
}
