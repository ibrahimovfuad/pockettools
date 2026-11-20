import * as E from '../src/exposure.js';
import assert from 'node:assert/strict';
const R = E.FULL_RANGE;
// EV 15, ISO 100 locked, f/16 locked → 1/125
let r = E.solve({ i: E.isoIndex(100), a: E.apertureIndex(16), s: 0 }, 45, R, { i: true, a: true, s: false });
assert.equal(E.shutterLabel(r.s), '1/125'); assert.equal(r.dev, 0);
// shutter 1/1000 locked, ISO 400, EV 12 → f/4 (EV 14 at ISO 400 = f/4 @ 1/1000)
r = E.solve({ i: E.isoIndex(400), a: E.apertureIndex(8), s: E.shutterIndex(1/1000) }, 36, R, { i: true, s: true, a: false });
assert.equal(E.apertureLabel(r.a), 'f/4'); assert.equal(r.dev, 0);
// out of range: ISO 400, EV 15, f/2 locked, camera max 1/1000 → clamped, +5 EV over
const cam = { ...R, sMax: E.shutterIndex(1/1000) };
r = E.solve({ i: E.isoIndex(400), a: E.apertureIndex(2), s: 0 }, 45, cam, { i: true, a: true, s: false });
assert.equal(E.shutterLabel(r.s), '1/1000'); assert.equal(r.dev, 15); assert.equal(E.thirds(r.dev), '5');
// cascade: shutter limited, aperture free → aperture closes to compensate
r = E.solve({ i: E.isoIndex(400), a: E.apertureIndex(2), s: 0 }, 45, cam, { i: true, a: false, s: false });
assert.equal(E.shutterLabel(r.s), '1/1000'); assert.equal(E.apertureLabel(r.a), 'f/11'); assert.equal(r.dev, 0);
// user turns aperture by hand → shutter compensates
r = E.solve({ i: 0, a: E.apertureIndex(8), s: E.shutterIndex(1/500) }, 39, R, { i: true }, 'a');
assert.equal(E.apertureLabel(r.a), 'f/8'); assert.equal(E.shutterLabel(r.s), '1/125');
// everything locked → only the deviation
r = E.solve({ i: 0, a: 18, s: 21 }, 40, R, { i: true, a: true, s: true });
assert.equal(r.dev, 1); assert.equal(E.thirds(r.dev), '⅓');
assert.equal(E.thirds(37), '12⅓'); assert.equal(E.thirds(-5), '−1⅔');
// a value outside a new lens range is clamped even when the exposure was already correct
const lens = { ...R, aMin: E.apertureIndex(2), aMax: E.apertureIndex(16) };
r = E.solve({ i: E.isoIndex(400), a: E.apertureIndex(40), s: E.shutterIndex(1/80) }, 45, lens, { i: true, s: true, a: false });
assert.equal(E.apertureLabel(r.a), 'f/16'); assert.equal(E.thirds(r.dev), '2⅔');
console.log('exposure tests passed');
