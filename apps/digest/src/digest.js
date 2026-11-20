// The digest maths: turns the raw documents of Mood, Habits, Spend and Bookshelf into one week's numbers.
// Everything here is read-only and derived from real data; a section without data is reported as null.
import { iso, fromIso, today, addDays, wdi, monday, plural, round1, money, one, isoWeek, rangeLabel, DAY_NAMES, DAY_SHORT } from './util.js';

export const STATUS = { queue: 'Want to read', reading: 'Reading', done: 'Read', dropped: 'Skipped' };   // stored value stays 'dropped'
const DAY_MS = 864e5;

// ---------- context: raw documents → lookups ----------
export function buildContext(raw) {
  const days = new Map();
  (raw.days || []).forEach(d => { if (d && Number.isFinite(d.score)) days.set(d.id, d); });
  // habit logs: one document per habit and year { habitId, year, d: { "MM-DD": count }, n: { "MM-DD": note } }
  const logs = new Map();
  (raw.logs || []).forEach(x => {
    if (!x || !x.habitId) return;
    const hm = logs.get(x.habitId) || new Map(); logs.set(x.habitId, hm);
    const keys = new Set([...Object.keys(x.d || {}), ...Object.keys(x.n || {})]);
    keys.forEach(md => { const c = (x.d || {})[md] || 0, n = (x.n || {})[md] || ''; if (c || n) hm.set(`${x.year}-${md}`, { c, n }); });
  });
  const t = today();
  const ctx = {
    today: t, tIso: iso(t), days, logs, habits: (raw.habits || []).slice().sort((a, b) => (a.created || 0) - (b.created || 0)),
    exps: raw.exps || [], cats: new Map((raw.cats || []).map(c => [c.id, c])), meta: raw.meta || {},
    books: raw.books || [], quotes: raw.quotes || [], snaps: new Map((raw.snaps || []).map(s => [s.id, s])), starts: new Map()
  };
  ctx.habits.forEach(h => {
    let start = h.start || ctx.tIso;
    const m = logs.get(h.id);
    if (m && h.kind !== 'quit') m.forEach((v, k) => { if (k < start && v.c) start = k; });
    ctx.starts.set(h.id, start);
  });
  return ctx;
}

// ---------- habits (same rules as the Habits app) ----------
const isQuit = h => h.kind === 'quit';
const target = h => Math.max(1, h.target || 1);
const count = (ctx, h, d) => { const m = ctx.logs.get(h.id); const e = m && m.get(d); return e ? e.c || 0 : 0; };
const done = (ctx, h, d) => isQuit(h) ? d >= h.start && d <= ctx.tIso && count(ctx, h, d) === 0 : count(ctx, h, d) >= target(h);
const slipped = (ctx, h, d) => isQuit(h) && count(ctx, h, d) > 0;
const isWeekly = h => !isQuit(h) && h.freq && h.freq.type === 'weekly';
const scheduled = (h, d) => isWeekly(h) || !h.freq || (h.freq.days || []).includes(wdi(d));
const weekDone = (ctx, h, mon) => { const out = []; for (let i = 0; i < 7; i++) { const k = iso(addDays(mon, i)); if (done(ctx, h, k)) out.push(k); } return out; };

// expected vs done for one habit on one day (weekly habits count as N/7 "expected" per day); null = not tracked that day
function dayParts(ctx, h, d) {
  const k = iso(d), start = ctx.starts.get(h.id);
  if (!start || k < start || d > ctx.today) return null;
  if (isQuit(h)) return { exp: 1, got: slipped(ctx, h, k) ? 0 : 1 };
  if (isWeekly(h)) {
    const list = weekDone(ctx, h, monday(d));
    return { exp: h.freq.times / 7, got: list.indexOf(k) > -1 && list.indexOf(k) < h.freq.times ? 1 : 0 };
  }
  if (!scheduled(h, d)) return { exp: 0, got: 0 };
  return { exp: 1, got: Math.min(1, count(ctx, h, k) / target(h)) };
}

// the habit's streak on the last day of the week (days, or weeks for "N times a week" habits)
function streakAt(ctx, h, end) {
  const start = ctx.starts.get(h.id), live = iso(end) === ctx.tIso ? ctx.tIso : '';
  if (!start || fromIso(start) > end) return { n: 0, unit: isWeekly(h) ? 'week' : 'day' };
  let cur = 0;
  if (isQuit(h)) {
    for (let d = fromIso(start); d <= end; d = addDays(d, 1)) { if (slipped(ctx, h, iso(d))) cur = 0; else cur++; }
    return { n: cur, unit: 'day' };
  }
  if (isWeekly(h)) {
    for (let w = monday(fromIso(start)); w <= end; w = addDays(w, 7)) {
      const ok = weekDone(ctx, h, w).length >= h.freq.times;
      const now = !!live && iso(w) === iso(monday(end));
      if (ok) cur++; else if (!now) cur = 0;
    }
    return { n: cur, unit: 'week' };
  }
  for (let d = fromIso(start); d <= end; d = addDays(d, 1)) {
    const k = iso(d);
    if (done(ctx, h, k)) cur++;
    else if (scheduled(h, d) && k !== live) cur = 0;   // today is not over yet
  }
  return { n: cur, unit: 'day' };
}

function habitsOf(ctx, w, withStreaks) {
  const rows = [];
  let doneN = 0, ofN = 0;
  ctx.habits.forEach(h => {
    let exp = 0, y = 0, tracked = 0;
    const cells = w.days.map(k => {
      const p = dayParts(ctx, h, fromIso(k));
      if (!p) return 'off';
      exp += p.exp;
      if (isQuit(h)) { tracked++; return p.got ? (y++, 'y') : 'slip'; }
      if (isWeekly(h)) return done(ctx, h, k) ? (y++, 'y') : 'n';
      if (!p.exp) return 'off';
      tracked++;
      return p.got >= 1 ? (y++, 'y') : 'n';
    });
    if (!(exp > 0 || y > 0) || (h.archived && !y)) return;
    const weekly = isWeekly(h);
    const row = { h, name: h.name, emoji: h.emoji || '', cells, y, of: weekly ? h.freq.times : tracked, shown: weekly ? Math.min(y, h.freq.times) : y };
    doneN += row.shown; ofN += row.of;
    if (withStreaks) row.streak = streakAt(ctx, h, w.end);
    rows.push(row);
  });
  // the share is done / expected over the days tracked so far (weekly habits: times done / times a week)
  return { rows, pct: ofN > 0 ? Math.min(1, doneN / ofN) : null, doneN, ofN };
}

// ---------- weeks ----------
export function weekAt(offset, from = today()) {
  const mon = addDays(monday(from), -7 * offset), sun = addDays(mon, 6), t = today();
  const w = isoWeek(mon);
  return { mon, sun, key: iso(mon), sunKey: iso(sun), id: w.id, num: w.num, label: rangeLabel(mon), current: offset === 0 && t <= sun,
    end: sun > t ? t : sun, days: Array.from({ length: 7 }, (_, i) => iso(addDays(mon, i))),
    fromMs: mon.getTime(), toMs: addDays(mon, 7).getTime() };
}

function moodOf(ctx, w) {
  const vals = w.days.map(k => { const e = ctx.days.get(k); return e ? { iso: k, score: e.score, note: String(e.note || '').trim() } : null; });
  const have = vals.filter(Boolean);
  if (!have.length) return null;
  const avg = have.reduce((s, v) => s + v.score, 0) / have.length;
  let best = have[0];
  have.forEach(v => { if (v.score >= best.score) best = v; });
  const bestIdx = w.days.indexOf(best.iso);
  // "your usual": the average of the eight weeks before (needs at least five rated days)
  const before = []; for (let i = 1; i <= 56; i++) { const e = ctx.days.get(iso(addDays(w.mon, -i))); if (e) before.push(e.score); }
  return { vals, count: have.length, avg, best, bestIdx, usual: before.length >= 5 ? before.reduce((a, b) => a + b, 0) / before.length : null };
}
const moodAvg = (ctx, w) => { const m = moodOf(ctx, w); return m ? m.avg : null; };

function spendOf(ctx, w, light) {
  const list = ctx.exps.filter(e => typeof e.date === 'string' && e.date >= w.key && e.date <= w.sunKey && e.amount > 0);
  if (!list.length) return null;
  const total = list.reduce((s, e) => s + e.amount, 0);
  const daily = w.days.map(k => list.filter(e => e.date === k).reduce((s, e) => s + e.amount, 0));
  const maxIdx = daily.indexOf(Math.max(...daily));
  const byCat = new Map();
  list.forEach(e => byCat.set(e.catId || '', (byCat.get(e.catId || '') || 0) + e.amount));
  const prev = light ? null : spendTotals(ctx, weekAt(w.offset + 1));
  const cats = [...byCat.entries()].map(([id, amount]) => {
    const c = ctx.cats.get(id);
    const before = prev ? prev.byCat.get(id) || 0 : 0;
    const pct = prev && before > 0 ? (amount - before) / before : null;
    return { id, name: c ? c.name : 'Uncategorized', amount, pct, diff: amount - before };
  }).sort((a, b) => b.amount - a.amount);
  const mer = new Map();
  list.forEach(e => {
    const name = String(e.merchant || '').trim(); if (!name) return;
    const k = name.toLowerCase(), m = mer.get(k) || { name, n: 0, sum: 0 };
    m.n++; m.sum += e.amount; mer.set(k, m);
  });
  const merchants = [...mer.values()].sort((a, b) => b.n - a.n || b.sum - a.sum);
  return { total, n: list.length, daily, maxIdx, cats, top: merchants[0] && merchants[0].n >= 2 ? merchants[0] : null, merchants,
    prevTotal: prev ? prev.total : null, pct: prev && prev.total > 0 ? (total - prev.total) / prev.total : null,
    budget: +ctx.meta.budget > 0 ? +ctx.meta.budget : null,
    biggest: list.slice().sort((a, b) => b.amount - a.amount).slice(0, 5).map(e => ({ ...e, catName: (ctx.cats.get(e.catId) || {}).name || 'Uncategorized' })) };
}
function spendTotals(ctx, w) {
  const byCat = new Map(); let total = 0;
  ctx.exps.forEach(e => { if (typeof e.date === 'string' && e.date >= w.key && e.date <= w.sunKey && e.amount > 0) { total += e.amount; byCat.set(e.catId || '', (byCat.get(e.catId || '') || 0) + e.amount); } });
  return { total, byCat };
}

const inWeek = (s, w) => typeof s === 'string' && s.length === 10 && s >= w.key && s <= w.sunKey;
const daysBetween = (a, b) => Math.round((fromIso(b) - fromIso(a)) / DAY_MS);

// Quotes removed: deleting leaves no trace, so each visit stores a snapshot { quotes, ts } per week.
// The removed count = quotes at the previous snapshot + quotes created since − quotes now.
export function removedQuotes(ctx, w) {
  if (!w.current) { const s = ctx.snaps.get(w.id); return s && Number.isInteger(s.removed) ? s.removed : null; }
  let prev = null;
  ctx.snaps.forEach(s => { if (s.id < w.id && (!prev || s.id > prev.id)) prev = s; });
  if (!prev || !Number.isFinite(prev.ts) || !Number.isInteger(prev.quotes)) return null;
  const since = ctx.quotes.filter(q => (q.created || 0) > prev.ts).length;
  return Math.max(0, prev.quotes + since - ctx.quotes.length);
}

function readingOf(ctx, w) {
  const B = ctx.books;
  const finished = B.filter(b => b.status === 'done' && inWeek(b.end, w));
  const started = B.filter(b => b.status !== 'queue' && inWeek(b.start, w));
  const added = B.filter(b => b.status === 'queue' && (b.created || 0) >= w.fromMs && (b.created || 0) < w.toMs);
  const skipped = B.filter(b => b.status === 'dropped' && inWeek(b.end, w));
  const ref = w.current ? ctx.tIso : w.sunKey;
  // the books in progress: today = everything with status "reading"; for an older week, rebuilt from the start/finish dates
  const reading = B.filter(b => w.current ? b.status === 'reading'
    : typeof b.start === 'string' && b.start.length === 10 && b.start <= w.sunKey && (b.status === 'reading' || ((b.status === 'done' || b.status === 'dropped') && typeof b.end === 'string' && b.end.length === 10 && b.end > w.sunKey)))
    .map(b => ({ b, days: typeof b.start === 'string' && b.start.length === 10 ? Math.max(0, daysBetween(b.start, ref)) : null,
      quotes: ctx.quotes.filter(q => q.bookId === b.id && (w.current || (q.created || 0) < w.toMs)).length }))
    .sort((a, c) => (c.b.start || '').localeCompare(a.b.start || ''));
  const saved = ctx.quotes.filter(q => (q.created || 0) >= w.fromMs && (q.created || 0) < w.toMs).length;
  const removed = removedQuotes(ctx, w);
  const activity = finished.length + started.length + added.length + skipped.length;
  if (!reading.length && !activity && !saved && !removed) return null;
  return { reading, finished, started, added, skipped, saved, removed, activity };
}

// ---------- one week's digest ----------
export function digestFor(ctx, offset, { light = false } = {}) {
  const w = weekAt(offset); w.offset = offset;
  const prevW = weekAt(offset + 1); prevW.offset = offset + 1;
  const mood = moodOf(ctx, w);
  if (mood) { const pa = moodAvg(ctx, prevW); mood.prevAvg = pa; mood.delta = pa == null ? null : round1(mood.avg - pa); }
  const habits = habitsOf(ctx, w, !light);
  const pHab = habits.rows.length ? habitsOf(ctx, prevW, false) : null;
  const hab = habits.rows.length ? { ...habits, prevPct: pHab && pHab.pct, delta: pHab && pHab.pct != null && habits.pct != null ? Math.round((habits.pct - pHab.pct) * 100) : null } : null;
  const spend = spendOf(ctx, w, light);
  const reading = readingOf(ctx, w);
  const d = { w, mood, habits: hab, spend, reading };
  d.anyData = !!(mood || (hab && hab.rows.some(r => r.y > 0)) || spend || (reading && (reading.activity || reading.saved || reading.removed)));
  d.stories = ['cover', ...(mood ? ['mood'] : []), ...(hab ? ['habits'] : []), ...(spend ? ['spend'] : []), ...(reading ? ['reading'] : []), ...(d.anyData ? ['wrap'] : [])];
  if (!light) { d.cover = coverOf(d); d.highlights = highlightsOf(d); }
  d.line = lineOf(d);
  d.shareText = shareText(d);
  return d;
}

// ---------- wording ----------
const arrow = n => n > 0 ? '▲' : '▼';
export const moodDeltaText = m => m.delta == null ? '' : Math.abs(m.delta) < 0.05 ? 'Same as last week' : `${arrow(m.delta)} ${one(Math.abs(m.delta))} vs last week`;
export const habitsDeltaText = h => h.delta == null ? '' : h.delta === 0 ? 'Same as last week' : `${arrow(h.delta)} ${Math.abs(h.delta)} pts vs last week`;
export const spendDeltaText = s => s.pct == null ? '' : Math.abs(s.pct) < 0.005 ? 'Same as last week' : `${arrow(s.pct)} ${Math.round(Math.abs(s.pct) * 100)}% vs last week`;
export const pctText = x => Math.round(x * 100) + '%';
const watchCat = s => s && s.cats.filter(c => c.pct != null && c.pct >= 0.25 && c.diff >= 20).sort((a, b) => b.diff - a.diff)[0] || null;
export const isNotable = c => c.pct != null && Math.abs(c.pct) >= 0.25 && Math.abs(c.diff) >= 20;

function bestStreak(d) {
  let best = null;
  if (d.habits) d.habits.rows.forEach(r => { if (!r.streak) return; const days = r.streak.n * (r.streak.unit === 'week' ? 7 : 1); if (!best || days > best.days) best = { ...r.streak, name: r.name, days }; });
  return best;
}

function coverOf(d) {
  const tiles = [];
  if (d.mood) tiles.push({ k: 'mood', name: 'Mood', val: one(d.mood.avg), unit: 'avg' });
  if (d.habits && d.habits.pct != null) tiles.push({ k: 'habits', name: 'Habits', val: pctText(d.habits.pct), unit: 'done' });
  if (d.spend) tiles.push({ k: 'spend', name: 'Spent', val: money(d.spend.total), unit: 'zł' });
  if (d.reading) tiles.push({ k: 'reading', name: 'Books', val: String(d.reading.finished.length), unit: 'finished' });
  let headline = 'Your week in review.';
  if (d.mood) { const m = d.mood.avg; headline = m >= 8 ? 'A great week.' : m >= 6.5 ? 'A pretty good week.' : m >= 5 ? 'A mixed week.' : 'A tough week.'; }
  else if (d.habits && d.habits.pct != null && d.habits.pct >= 0.8) headline = 'A steady week.';
  const clauses = [];
  if (d.mood) clauses.push(d.mood.delta == null ? `an average mood of ${one(d.mood.avg)}` : d.mood.delta >= 0.3 ? 'better mood than last week' : d.mood.delta <= -0.3 ? 'lower mood than last week' : 'mood much like last week');
  const st = bestStreak(d);
  if (st && st.n >= (st.unit === 'week' ? 3 : 5)) clauses.push(`a ${st.n}-${st.unit} “${st.name}” streak`);
  const wc = watchCat(d.spend);
  if (wc) clauses.push(`more spent on ${wc.name.toLowerCase()}`);
  else if (d.spend && d.spend.pct != null && d.spend.pct <= -0.15) clauses.push(`${Math.round(-d.spend.pct * 100)}% less spent than last week`);
  if (d.reading && d.reading.finished.length) clauses.push(`${d.reading.finished.length} ${plural(d.reading.finished.length, 'book', 'books')} finished`);
  const c = clauses.slice(0, 3);
  let lead = 'Here is how your week went.';
  if (c.length === 1) lead = c[0];
  else if (c.length === 2) lead = `${c[0]} and ${c[1]}`;
  else if (c.length === 3) lead = `${c[0]}, ${c[1]} — and ${c[2]}`;
  if (c.length) lead = lead[0].toUpperCase() + lead.slice(1) + '.';
  return { tiles, headline, lead };
}

function highlightsOf(d) {
  const out = [];
  if (d.mood) out.push({ label: 'Best day', text: `${DAY_NAMES[d.mood.bestIdx]} · mood ${d.mood.best.score}`, color: '#4f46e5' });
  const st = bestStreak(d);
  if (st && st.n >= 2) out.push({ label: 'Longest streak', text: `${st.name} · ${st.n} ${plural(st.n, st.unit, st.unit + 's')}`, color: '#15803d' });
  const wc = watchCat(d.spend);
  if (wc) out.push({ label: 'Watch out', text: `${wc.name} ▲ ${Math.round(wc.pct * 100)}%`, color: '#c2410c' });
  const r = d.reading;
  if (r && r.reading.length) {
    const longest = Math.max(-1, ...r.reading.map(x => x.days == null ? -1 : x.days));
    out.push({ label: 'Still reading', text: `${r.reading.length} ${plural(r.reading.length, 'book', 'books')}${longest >= 0 ? ` · longest: day ${longest}` : ''}`, color: '#1d4ed8' });
  } else if (r && r.finished.length) out.push({ label: 'Finished', text: r.finished.length === 1 ? r.finished[0].title : `${r.finished.length} books`, color: '#1d4ed8' });
  if (out.length < 3) {
    if (d.habits && d.habits.pct != null && !out.some(x => x.label === 'Longest streak')) out.push({ label: 'Habits done', text: `${pctText(d.habits.pct)} · ${d.habits.doneN} of ${d.habits.ofN}`, color: '#15803d' });
    if (d.spend && !wc) out.push({ label: 'Spent', text: `${money(d.spend.total)} zł`, color: '#c2410c' });
  }
  return out;
}

// one line for the list of weeks
function lineOf(d) {
  const p = [];
  if (d.mood) p.push(`Mood ${one(d.mood.avg)}`);
  if (d.habits && d.habits.pct != null) p.push(`Habits ${pctText(d.habits.pct)}`);
  if (d.spend) p.push(`${money(d.spend.total)} zł`);
  if (d.reading && d.reading.finished.length) p.push(`${d.reading.finished.length} ${plural(d.reading.finished.length, 'book', 'books')} finished`);
  return p.join(' · ');
}

// short text for the Share button
function shareText(d) {
  const L = [`Weekly Digest · Week ${d.w.num} (${d.w.label})`];
  if (d.mood) L.push(`Mood ${one(d.mood.avg)} / 10${moodDeltaText(d.mood) ? ` (${moodDeltaText(d.mood)})` : ''}`);
  if (d.habits && d.habits.pct != null) L.push(`Habits ${pctText(d.habits.pct)} done (${d.habits.doneN} of ${d.habits.ofN})`);
  if (d.spend) L.push(`Spent ${money(d.spend.total)} zł${spendDeltaText(d.spend) ? ` (${spendDeltaText(d.spend)})` : ''}`);
  if (d.reading) {
    const r = d.reading, bits = [];
    if (r.finished.length) bits.push(`${r.finished.length} finished`);
    if (r.reading.length) bits.push(`${r.reading.length} in progress`);
    if (r.saved) bits.push(`${r.saved} ${plural(r.saved, 'quote', 'quotes')} saved`);
    if (bits.length) L.push(`Books: ${bits.join(' · ')}`);
  }
  return L.join('\n');
}

// ---------- the list of earlier weeks ----------
export function pastWeeks(ctx, max = 26) {
  const out = [];
  for (let i = 1; i <= max; i++) { const d = digestFor(ctx, i, { light: true }); if (d.anyData) out.push({ offset: i, d }); }
  return out;
}

export const nextSunday = () => { const t = today(); return addDays(t, 6 - wdi(t)); };
export { DAY_SHORT };
