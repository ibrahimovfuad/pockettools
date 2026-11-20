// Exposure maths in 1/3-stop steps (kept free of the DOM so it can be unit-tested with node).
//   shutter index s: t = 2^(-s/3) seconds       (s = 21 → 1/128 ≈ "1/125")
//   aperture index a: N = 2^(a/6)                (a = 24 → f/16)
//   ISO index i:      ISO = 100 · 2^(i/3)        (i = 6 → 400)
// The exposure is correct when a + s = 3·EV100 + i (the light value at the film's ISO).

const SH_LABELS = ['30"', '25"', '20"', '15"', '13"', '10"', '8"', '6"', '5"', '4"', '3.2"', '2.5"', '2"', '1.6"', '1.3"', '1"', '0.8"', '0.6"', '1/2', '0.4"', '0.3"',
  '1/4', '1/5', '1/6', '1/8', '1/10', '1/13', '1/15', '1/20', '1/25', '1/30', '1/40', '1/50', '1/60', '1/80', '1/100', '1/125', '1/160', '1/200', '1/250',
  '1/320', '1/400', '1/500', '1/640', '1/800', '1/1000', '1/1250', '1/1600', '1/2000', '1/2500', '1/3200', '1/4000', '1/5000', '1/6400', '1/8000'];
export const S_MIN = -15, S_MAX = S_MIN + SH_LABELS.length - 1;          // 30" … 1/8000
const AP_LABELS = [1, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64];
export const A_MIN = 0, A_MAX = AP_LABELS.length - 1;                    // f/1 … f/64
const ISO_LABELS = [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400];
export const I_MIN = -12, I_MAX = I_MIN + ISO_LABELS.length - 1;         // ISO 6 … 6400

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const shutterLabel = s => SH_LABELS[clamp(s, S_MIN, S_MAX) - S_MIN];
export const apertureLabel = a => 'f/' + AP_LABELS[clamp(a, A_MIN, A_MAX) - A_MIN];
export const isoLabel = i => String(ISO_LABELS[clamp(i, I_MIN, I_MAX) - I_MIN]);
export const shutterSeconds = s => Math.pow(2, -s / 3);
export const apertureNumber = a => AP_LABELS[clamp(a, A_MIN, A_MAX) - A_MIN];
export const isoNumber = i => ISO_LABELS[clamp(i, I_MIN, I_MAX) - I_MIN];
export const shutterIndex = sec => clamp(Math.round(-3 * Math.log2(sec)), S_MIN, S_MAX);
export const apertureIndex = n => clamp(Math.round(6 * Math.log2(n)), A_MIN, A_MAX);
export const isoIndex = iso => clamp(Math.round(3 * Math.log2(iso / 100)), I_MIN, I_MAX);

// "12⅓", "−1⅔", "0"
export function thirds(x3) {
  const neg = x3 < 0, n = Math.abs(Math.round(x3)), w = Math.floor(n / 3), f = n % 3;
  return (neg ? '−' : '') + (w || !f ? w : '') + ['', '⅓', '⅔'][f];
}

// Keep the locked values, change the others so that a + s = ev3 + i.
// changed = the parameter the user just turned (it is kept), or null for a new light reading.
// When aperture and shutter are both free, the shutter moves first (aperture priority);
// a value that hits its range limit passes the rest on to the next free parameter.
// dev = remaining error in thirds: > 0 means over-exposed, < 0 under-exposed.
export function solve(v0, ev3, R, locks, changed = null) {
  // values outside the current camera/lens range (e.g. after switching lenses) are pulled back in first
  const v = { i: clamp(v0.i, R.iMin, R.iMax), a: clamp(v0.a, R.aMin, R.aMax), s: clamp(v0.s, R.sMin, R.sMax) };
  let order;
  if (changed === 's') order = ['a', 'i'];
  else if (changed === 'a') order = ['s', 'i'];
  else if (changed === 'i') order = ['s', 'a'];
  else order = ['s', 'a', 'i'];
  order = order.filter(k => !locks[k]);
  for (const k of order) {
    const need = ev3 + v.i - (v.a + v.s);
    if (!need) break;
    if (k === 's') v.s = clamp(v.s + need, R.sMin, R.sMax);
    else if (k === 'a') v.a = clamp(v.a + need, R.aMin, R.aMax);
    else v.i = clamp(v.i - need, R.iMin, R.iMax);
  }
  return { ...v, dev: ev3 + v.i - (v.a + v.s) };
}
export const FULL_RANGE = { sMin: S_MIN, sMax: S_MAX, aMin: A_MIN, aMax: A_MAX, iMin: I_MIN, iMax: I_MAX };
