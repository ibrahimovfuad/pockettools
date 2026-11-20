// HTML for the stories, the full report and the home card. All text is escaped; all charts are inline SVG/DOM
// built from the digest numbers (see digest.js).
import { esc, money, one, plural, fmt, DAY_NAMES, DAY_SHORT, DAY_LETTERS, fromIso } from './util.js';
import { STATUS, moodDeltaText, habitsDeltaText, spendDeltaText, pctText, isNotable, nextSunday } from './digest.js';

export const COLORS = { cover: '#101014', wrap: '#101014', mood: '#4f46e5', habits: '#15803d', spend: '#c2410c', reading: '#1d4ed8' };
export const LABELS = { cover: 'Weekly Digest', mood: 'Mood', habits: 'Habits', spend: 'Spend', reading: 'Reading', wrap: 'Weekly Digest' };

const X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
export const CLOSE_ICON = X;

// two-line headline like "A pretty / good week."
const brk = t => { const w = t.split(' '), k = Math.ceil(w.length / 2); return esc(w.slice(0, k).join(' ')) + '<br>' + esc(w.slice(k).join(' ')); };
const chip = t => t ? `<div class="chip" style="margin-top:10px">${esc(t)}</div>` : '';
const big = (kicker, num, unit, delta) => `<div class="rise" style="margin-top:28px"><div class="kick">${esc(kicker)}</div><div class="big"><b>${esc(num)}</b><span>${esc(unit)}</span></div>${chip(delta)}</div>`;
const card = (inner, cls = 'rise d2', tight, style) => `<div class="card ${tight ? 'tight ' : ''}${cls}"${style ? ` style="${style}"` : ''}>${inner}</div>`;
const dayLabels = hl => `<div class="dl" aria-hidden="true">${DAY_LETTERS.map((d, i) => `<span class="${i === hl ? 'hl' : ''}">${d}</span>`).join('')}</div>`;

// ---------- mood ----------
function moodChart(m) {
  const xs = i => 15 + i * (280 / 6), ys = v => 150 - v * 14;
  let paths = '', run = [];
  const flush = () => { if (run.length > 1) paths += `<path class="draw" d="M${run.map(p => `${p[0].toFixed(1)},${p[1]}`).join(' L')}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`; run = []; };
  m.vals.forEach((v, i) => { if (v) run.push([xs(i), ys(v.score)]); else flush(); });
  flush();
  const dots = m.vals.map((v, i) => v ? `<circle cx="${xs(i).toFixed(1)}" cy="${ys(v.score)}" r="${i === m.bestIdx ? 7 : 4.5}" fill="#fff"/>` : '').join('');
  const usual = m.usual == null ? '' : `<path d="M15,${ys(m.usual).toFixed(1)} L295,${ys(m.usual).toFixed(1)}" stroke="rgba(255,255,255,.45)" stroke-dasharray="4 5"/><text x="295" y="${(ys(m.usual) - 6).toFixed(1)}" fill="#fff" font-size="11" text-anchor="end">${one(m.usual)} = your usual</text>`;
  const label = 'Mood by day: ' + m.vals.map((v, i) => `${DAY_SHORT[i]} ${v ? v.score : 'not rated'}`).join(', ');
  return `<svg class="mchart" viewBox="0 0 310 160" role="img" aria-label="${esc(label)}">${usual}${paths}${dots}</svg>${dayLabels(m.bestIdx)}`;
}
function moodBody(d, full) {
  const m = d.mood;
  const note = m.best.note ? card(`<div class="kick">Best day · ${DAY_NAMES[m.bestIdx]} · ${m.best.score}</div><div class="note">“${esc(m.best.note.length > 140 && !full ? m.best.note.slice(0, 137) + '…' : m.best.note)}”</div>`, 'rise d3', true)
    : card(`<div class="kick">Best day · ${DAY_NAMES[m.bestIdx]} · ${m.best.score}</div>`, 'rise d3', true);
  const rated = `${m.count} of 7 days rated`;
  return big('Average mood', one(m.avg), '/ 10', [moodDeltaText(m), m.count < 7 ? rated : ''].filter(Boolean).join(' · '))
    + card(`<div class="cardt">Day by day</div>${moodChart(m)}`) + note;
}

// ---------- habits ----------
function habitRow(r) {
  const what = r.h.kind === 'quit' ? `${r.shown} clean ${plural(r.shown, 'day', 'days')} of ${r.of}` : `${r.shown} of ${r.of}`;
  const s = r.streak && r.streak.n >= 3 ? `<div class="streak">${r.streak.n}-${r.streak.unit} streak</div>` : '';
  return `<div class="hrow rise"><div class="top"><span>${esc(r.name)}</span><span>${r.shown}/${r.of}</span></div>
<div class="cells" role="img" aria-label="${esc(r.name)}: ${esc(what)}">${r.cells.map(c => `<i class="${c === 'y' ? 'y' : c}"></i>`).join('')}</div>${s}</div>`;
}
function ringSvg(p) {
  const L = 2 * Math.PI * 52;
  return `<svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${pctText(p)} of habits done"><circle cx="64" cy="64" r="52" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="14"/><circle cx="64" cy="64" r="52" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="${(L * p).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 64 64)"/><text x="64" y="72" text-anchor="middle" fill="#fff" font-size="26" font-weight="800">${pctText(p)}</text></svg>`;
}
function habitsBody(d, full) {
  const h = d.habits, rows = full ? h.rows : h.rows.slice(0, 4);
  const head = h.pct == null ? '' : `<div class="ring rise">${ringSvg(h.pct)}<div><div class="kick">Habits done</div><div style="font-size:30px;font-weight:800;letter-spacing:-.5px;line-height:1.1">${h.doneN} of ${h.ofN}</div>${chip(habitsDeltaText(h))}</div></div>`;
  const more = h.rows.length > rows.length ? `<div class="mid">+${h.rows.length - rows.length} more in the full report</div>` : '';
  return head + card(rows.map(habitRow).join('') + dayLabels(-1), 'rise d2', false, 'margin-top:28px') + more;
}

// ---------- spend ----------
function spendBody(d, full) {
  const s = d.spend, max = Math.max(...s.daily, 1);
  const bars = s.daily.map((v, i) => `<span class="grow ${i === s.maxIdx ? 'hl' : ''}" style="height:${Math.max(4, Math.round(96 * v / max))}px;animation-delay:${(i * 0.05).toFixed(2)}s"></span>`).join('');
  const label = 'Spending by day: ' + s.daily.map((v, i) => `${DAY_SHORT[i]} ${money(v)} zł`).join(', ');
  const cats = (full ? s.cats : s.cats.slice(0, 6)).map(c => {
    const note = isNotable(c) ? `<span class="chip sm">${c.pct > 0 ? '▲' : '▼'} ${Math.round(Math.abs(c.pct) * 100)}%</span>` : '';
    return `<div class="cat"><div class="top"><span>${esc(c.name)}${note}</span><span>${money(c.amount)} zł</span></div><div class="bar"><div style="width:${Math.max(2, Math.round(c.amount / s.cats[0].amount * 100))}%"></div></div></div>`;
  }).join('');
  const top = s.top ? `<div class="mid rise d4">Most visited: ${esc(s.top.name)} · ${s.top.n} times · ${money(s.top.sum)} zł</div>` : '';
  const delta = [spendDeltaText(s), s.budget ? `budget ${money(s.budget)} zł/mo` : ''].filter(Boolean).join(' · ');
  return big('Spent this week', money(s.total), 'zł', delta)
    + card(`<div class="cardh"><span>By day</span><span>${DAY_NAMES[s.maxIdx]} ${money(s.daily[s.maxIdx])} zł</span></div><div style="margin-top:12px" class="bars" role="img" aria-label="${esc(label)}">${bars}</div>${dayLabels(s.maxIdx)}`)
    + card(cats, 'rise d3', true) + top;
}

// ---------- reading ----------
const PAL = [['#2F5D62', '#F3EEE3'], ['#D9583B', '#FFF4EC'], ['#3B4A7A', '#EDEBF7'], ['#C9A44B', '#2A2214'], ['#1F2A30', '#E7C77A'], ['#6B4E8C', '#F4EEFB'], ['#5E8C5A', '#F1F7EE'], ['#8FB8C4', '#13313A'], ['#E6C9A8', '#4A2E14'], ['#2B2B2B', '#E9E4D8'], ['#A7A39A', '#24231F'], ['#B03A48', '#FCEFF1']];
const hashOf = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
function cover(b) {
  const [bg, ink] = PAL[hashOf((b.title || '') + (b.author || '')) % PAL.length];
  const img = /^https?:\/\//.test(b.cover || '') ? `<img src="${esc(b.cover)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-cov>` : '';
  return `<span class="cov" style="--cb:${bg};--ci:${ink}" aria-hidden="true"><span class="g"><b>${esc(b.title)}</b></span>${img}</span>`;
}
const shortDate = s => { const dt = fromIso(s); return fmt(dt, { day: 'numeric', month: 'short' }); };
function bookCard(x) {
  const b = x.b, since = x.days == null ? '' : ` · since ${shortDate(b.start)}`;
  const nums = (x.days == null ? '' : `<div><b>${x.days}</b><small>${plural(x.days, 'day', 'days')}${since}</small></div>`) + `<div><b>${x.quotes}</b><small>${plural(x.quotes, 'quote', 'quotes')}</small></div>`;
  return `<div class="bk">${cover(b)}<div class="info"><div class="t">${esc(b.title)}</div><div class="a">${esc(b.author || '')}</div><div class="nums">${nums}</div></div></div>`;
}
// one line per book that moved this week: finished, started, skipped; added books are grouped
function shelfRows(r) {
  const rows = [];
  const add = (act, b) => rows.push({ act, text: b.title, chip: STATUS[b.status] || '' });
  r.finished.forEach(b => add('Finished', b));
  r.started.forEach(b => add('Started', b));
  if (r.added.length === 1) add('Added', r.added[0]); else if (r.added.length > 1) rows.push({ act: 'Added', text: `${r.added.length} books`, chip: STATUS.queue });
  r.skipped.forEach(b => add('Skipped', b));
  return rows;
}
function readingBody(d, full) {
  const r = d.reading, n = r.reading.length;
  const list = n ? `<div class="rise" style="margin-top:22px;display:flex;justify-content:space-between;align-items:baseline"><span class="kick">Still reading</span><span class="kick" style="font-size:13px">${n} ${plural(n, 'book', 'books')}${n > 1 && !full ? ' · swipe' : ''}</span></div>
<div class="car rise d1" role="region" aria-label="Books you are reading" tabindex="0">${r.reading.map(bookCard).join('')}</div>${n > 1 ? `<div class="cdots" aria-hidden="true">${r.reading.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}`
    : card('<div class="cardt">Still reading</div><div class="kick" style="margin-top:4px">Nothing in progress at the end of this week.</div>', 'rise d1');
  const rows = shelfRows(r), shown = full ? rows : rows.slice(0, 4);
  const shelf = card(`<div class="cardt" style="margin-bottom:4px">This week on your shelf</div>${shown.length ? shown.map(x => `<div class="act"><div><small>${x.act}</small><b>${esc(x.text)}</b></div><span class="pill">${esc(x.chip)}</span></div>`).join('') + (rows.length > shown.length ? `<div class="mid">+${rows.length - shown.length} more in the full report</div>` : '') : '<div class="kick" style="margin-top:6px">Nothing changed on your shelf this week.</div>'}`, 'rise d2', false, 'margin-top:14px');
  const q = card(`<div class="qrow"><span class="cardt">Quotes</span><span class="pills"><span class="pill">${r.saved ? `+${r.saved} saved` : 'None saved'}</span>${r.removed == null ? '' : `<span class="pill">${r.removed ? '−' : ''}${r.removed} removed</span>`}</span></div>`, 'rise d3', true);
  return list + shelf + q;
}

// ---------- cover and wrap ----------
function coverBody(d) {
  const c = d.cover;
  if (!d.anyData) return `<div class="rise" style="margin-top:44px"><div class="kick">Your week in review</div><h1 style="margin-top:6px">A quiet<br>week.</h1><p style="margin-top:14px;font-size:17px;line-height:1.45;color:var(--sec)">There is nothing to show for this week yet. Rate a day in Mood, tick a habit, log an expense in Spend or update a book in Bookshelf — it all shows up here.</p></div>`;
  return `<div class="rise" style="margin-top:44px"><div class="kick">Your week in review</div><h1 style="margin-top:6px">${brk(c.headline)}</h1><p style="margin-top:14px;font-size:17px;line-height:1.45;color:var(--sec)">${esc(c.lead)}</p></div>
<div class="tiles2">${c.tiles.map((t, i) => `<div class="tl t-${t.k} rise d${i + 1}"><span>${esc(t.name)}</span><span><b>${esc(t.val)}</b><i>${esc(t.unit)}</i></span></div>`).join('')}</div>`;
}
function wrapBody(d) {
  const next = d.w.current ? `<div class="nx">Next digest: Sunday ${fmt(nextSunday(), { day: 'numeric', month: 'short' })}, 19:00</div>` : '';
  return `<div class="rise" style="margin-top:36px"><div class="kick">That was week ${d.w.num}</div><h2 style="margin-top:6px">Highlights</h2></div>
<div style="margin-top:18px">${d.highlights.map((h, i) => `<div class="hl-row rise d${Math.min(i + 1, 4)}"><span class="dot" style="background:${h.color}" aria-hidden="true"></span><div><small>${esc(h.label)}</small><b>${esc(h.text)}</b></div></div>`).join('')}</div>
<div class="btns"><button class="p press" data-act="share">Share</button><button class="s press" data-act="report">Open full report</button>${next}</div>`;
}

const BODY = { cover: coverBody, mood: moodBody, habits: habitsBody, spend: spendBody, reading: readingBody, wrap: wrapBody };
export const storyBody = (d, kind, full) => BODY[kind](d, full);
export const storyFoot = kind => kind === 'cover' ? 'Tap to start · hold to pause' : kind === 'wrap' ? '' : 'Tap to continue';

// ---------- full report ----------
function dayTable(m) {
  return `<div class="card tight"><table class="dtable">${m.vals.map((v, i) => `<tr><td>${DAY_NAMES[i]}</td>${v ? `<td class="q">${v.note ? esc(v.note) : ''}</td><td class="n">${v.score}</td>` : '<td class="q" style="color:var(--sec)">Not rated</td><td class="n">–</td>'}</tr>`).join('')}</table></div>`;
}
function spendDetails(s) {
  const mer = s.merchants.slice(0, 5), big = s.biggest;
  return (mer.length ? `<div class="card tight"><div class="cardt" style="margin-bottom:6px">Places</div><table class="dtable">${mer.map(m => `<tr><td style="width:auto;color:#fff">${esc(m.name)}</td><td class="r">${m.n}× · ${money(m.sum)} zł</td></tr>`).join('')}</table></div>` : '')
    + `<div class="card tight"><div class="cardt" style="margin-bottom:6px">Biggest expenses</div><table class="dtable">${big.map(e => `<tr><td style="width:auto;color:#fff">${esc(e.merchant || e.catName)}<div style="font-size:12px;color:var(--sec);font-weight:500">${esc(shortDate(e.date))} · ${esc(e.catName)}</div></td><td class="r">${money(e.amount)} zł</td></tr>`).join('')}</table></div>`
    + `<div class="kick" style="margin-top:12px">${s.n} ${plural(s.n, 'expense', 'expenses')} this week.</div>`;
}
function readingDetails(r) {
  const groups = [['Finished', r.finished], ['Started', r.started], ['Added to Want to read', r.added], ['Skipped', r.skipped]].filter(g => g[1].length);
  return groups.length ? `<div class="card tight">${groups.map(([t, bs]) => `<div class="act"><div><small>${t}</small>${bs.map(b => `<b>${esc(b.title)}</b>`).join('')}</div></div>`).join('')}</div>` : '';
}
export function reportBody(d) {
  const panel = (kind, inner) => `<section class="panel" style="background:${COLORS[kind]}" aria-label="${LABELS[kind]}"><h2>${LABELS[kind]}</h2>${inner}</section>`;
  let h = `<section class="panel" style="background:${COLORS.cover}" aria-label="Summary">${coverBody(d)}${d.highlights && d.highlights.length ? `<div style="margin-top:18px">${d.highlights.map(x => `<div class="hl-row"><span class="dot" style="background:${x.color}" aria-hidden="true"></span><div><small>${esc(x.label)}</small><b>${esc(x.text)}</b></div></div>`).join('')}</div>` : ''}</section>`;
  if (d.mood) h += panel('mood', moodBody(d, true) + dayTable(d.mood));
  if (d.habits) h += panel('habits', habitsBody(d, true));
  if (d.spend) h += panel('spend', spendBody(d, true) + spendDetails(d.spend));
  if (d.reading) h += panel('reading', readingBody(d, true) + readingDetails(d.reading));
  return h;
}

// ---------- home ----------
export function heroTiles(d) { return d.cover ? d.cover.tiles.filter(t => t.k !== 'reading').slice(0, 3) : []; }
