// Small helpers shared by the other modules.
export const $ = id => document.getElementById(id);
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pad = n => String(n).padStart(2, '0');
export const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const wdi = d => (d.getDay() + 6) % 7;                 // Mon = 0 … Sun = 6
export const monday = d => addDays(d, -wdi(d));
export const fmt = (d, o) => new Intl.DateTimeFormat('en-GB', o).format(d);
export const plural = (n, one, many) => n === 1 ? one : many;
export const round1 = n => Math.round(n * 10) / 10;
export const round2 = n => Math.round(n * 100) / 100;
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 1234.5 → "1 234,50"; whole numbers without decimals. The space is a no-break space.
export function money(n) {
  const neg = n < 0; n = Math.abs(round2(n));
  const whole = Math.floor(n), cents = Math.round((n - whole) * 100);
  const w = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + (cents ? `${w},${pad(cents)}` : w);
}
export const one = n => (Math.round(n * 10) / 10).toFixed(1);

// ISO 8601 week of the week that starts on this Monday: { year, num, id: "2026-W47" }
export function isoWeek(mon) {
  const thu = addDays(mon, 3);
  const jan1 = new Date(thu.getFullYear(), 0, 1);
  const num = Math.floor((thu - jan1) / 864e5 / 7) + 1;
  return { year: thu.getFullYear(), num, id: `${thu.getFullYear()}-W${pad(num)}` };
}

// "17–23 Nov", "30 Nov – 6 Dec", "29 Dec 2025 – 4 Jan 2026"
export function rangeLabel(mon) {
  const sun = addDays(mon, 6);
  if (mon.getFullYear() !== sun.getFullYear()) return `${fmt(mon, { day: 'numeric', month: 'short', year: 'numeric' })} – ${fmt(sun, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  if (mon.getMonth() !== sun.getMonth()) return `${fmt(mon, { day: 'numeric', month: 'short' })} – ${fmt(sun, { day: 'numeric', month: 'short' })}`;
  return `${mon.getDate()}–${fmt(sun, { day: 'numeric', month: 'short' })}`;
}
