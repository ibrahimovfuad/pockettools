// Firestore rules tests. Run with "npm run test:rules" (starts the emulator; needs Java 11+).
// Every collection must be readable and writable only by its owner, and the validation rules must hold.
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

let env;
const OWNER = 'alice', OTHER = 'bob';
const db = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-pockettools',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});
after(() => env?.cleanup());
beforeEach(() => env.clearFirestore());

// A valid document for every per-user collection: [path under users/{uid}, data]
const VALID = [
  ['days/2026-01-31', { score: 7, note: 'Good day', updatedAt: 1 }],
  ['habits/h1', { name: 'Run' }],
  ['logs/h1-2026', { habitId: 'h1' }],
  ['books/b1', { title: 'Dune' }],
  ['quotes/q1', { text: 'Fear is the mind-killer.' }],
  ['spend_categories/c1', { name: 'Food', icon: 'cart', color: '#ff9500', order: 1 }],
  ['spend_expenses/e1', { amount: 23.49, catId: 'c1', date: '2026-01-31', ts: 1, merchant: 'Żabka', source: 'applepay' }],
  ['spend_meta/settings', { budget: 2000, rules: { 'Żabka': 'c1' } }],
  ['routes_places/home', { kind: 'home', name: 'Home', sub: 'Dobra 9', lat: 52.24, lon: 21.03, ts: 1 }],
  ['routes_places/s-1abc', { kind: 'stop', name: 'Dobra', lat: 52.24, lon: 21.03, stopId: 'wa_dobra' }],
  ['routes_meta/settings', { direction: true, rotate: false, live: true, city: 'warszawa', ts: 1 }],
  ['routes_meta/history', { items: [{ name: 'Metro Wilanowska', lat: 52.2, lon: 21, ts: 1 }], ts: 1 }],
  ['digest_weeks/2026-W47', { quotes: 12, removed: 1, ts: 1763913600000 }],
  ['lm_cameras/k1', { name: 'Canon FTb', fastest: 0.001, slowest: 1 }],
  ['lm_lenses/l1', { name: 'Canon FL 50', focal: 50, widest: 1.8, smallest: 16 }],
  ['lm_films/f1', { name: 'Portra 400', iso: 400, exposures: 36 }],
  ['lm_rolls/r1', { filmName: 'Portra 400', iso: 400, exposures: 36, status: 'loaded' }],
  ['lm_frames/x1', { rollId: 'r1', n: 1, aperture: 8, shutter: 0.004, iso: 400, ev: 12 }]
];

describe('per-user collections are owner-only', () => {
  for (const [path, data] of VALID) {
    const p = uid => `users/${uid}/${path}`;
    test(`${path.split('/')[0]}: owner can write, read and delete`, async () => {
      await assertSucceeds(setDoc(doc(db(OWNER), p(OWNER)), data));
      await assertSucceeds(getDoc(doc(db(OWNER), p(OWNER))));
      await assertSucceeds(deleteDoc(doc(db(OWNER), p(OWNER))));
    });
    test(`${path.split('/')[0]}: another user and a signed-out visitor get nothing`, async () => {
      await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), p(OWNER)), data));
      await assertFails(getDoc(doc(db(OTHER), p(OWNER))));
      await assertFails(getDoc(doc(db(null), p(OWNER))));
      await assertFails(setDoc(doc(db(OTHER), p(OWNER)), data));
      await assertFails(setDoc(doc(db(null), p(OWNER)), data));
      await assertFails(deleteDoc(doc(db(OTHER), p(OWNER))));
      await assertFails(getDocs(collection(db(OTHER), `users/${OWNER}/${path.split('/')[0]}`)));
    });
  }

  test('the profile document is owner-only', async () => {
    await assertSucceeds(setDoc(doc(db(OWNER), `users/${OWNER}`), { share: { on: false } }));
    await assertFails(getDoc(doc(db(OTHER), `users/${OWNER}`)));
    await assertFails(setDoc(doc(db(OTHER), `users/${OWNER}`), { share: { on: true } }));
  });

  test('collections that no rule mentions are closed, even to the owner', async () => {
    await assertFails(setDoc(doc(db(OWNER), `users/${OWNER}/unknown/x`), { a: 1 }));
    await assertFails(setDoc(doc(db(OWNER), 'anything/x'), { a: 1 }));
  });
});

describe('validation', () => {
  const put = (path, data) => setDoc(doc(db(OWNER), `users/${OWNER}/${path}`), data);
  test('Mood: score 0–10, day id is a date, no extra fields', async () => {
    await assertFails(put('days/2026-01-31', { score: 11 }));
    await assertFails(put('days/yesterday', { score: 5 }));
    await assertFails(put('days/2026-01-31', { score: 5, extra: true }));
  });
  test('Habits and Bookshelf: names and titles are required', async () => {
    await assertFails(put('habits/h1', { name: '' }));
    await assertFails(put('books/b1', { title: '' }));
    await assertFails(put('quotes/q1', { text: 'x'.repeat(2001) }));
  });
  test('Spend: positive amounts, a date, known fields, a single settings document', async () => {
    const e = { amount: 10, catId: 'c1', date: '2026-01-31' };
    await assertSucceeds(put('spend_expenses/e1', e));
    await assertFails(put('spend_expenses/e1', { ...e, amount: -1 }));
    await assertFails(put('spend_expenses/e1', { ...e, date: '31.01.2026' }));
    await assertFails(put('spend_expenses/e1', { ...e, card: '4111' }));
    await assertFails(put('spend_meta/other', { budget: 1 }));
    await assertFails(put('spend_categories/c1', { name: 'x'.repeat(41) }));
  });
  test('Weekly Digest: ISO week id, whole non-negative counts, known fields only', async () => {
    const w = { quotes: 12, ts: 1763913600000 };
    await assertSucceeds(put('digest_weeks/2026-W47', w));
    await assertSucceeds(put('digest_weeks/2026-W47', { ...w, removed: 0 }));
    await assertFails(put('digest_weeks/2026-47', w));
    await assertFails(put('digest_weeks/latest', w));
    await assertFails(put('digest_weeks/2026-W47', { quotes: 12 }));
    await assertFails(put('digest_weeks/2026-W47', { ts: 1 }));
    await assertFails(put('digest_weeks/2026-W47', { ...w, quotes: -1 }));
    await assertFails(put('digest_weeks/2026-W47', { ...w, quotes: 1.5 }));
    await assertFails(put('digest_weeks/2026-W47', { ...w, quotes: '12' }));
    await assertFails(put('digest_weeks/2026-W47', { ...w, removed: -2 }));
    await assertFails(put('digest_weeks/2026-W47', { ...w, removed: 'many' }));
    await assertFails(put('digest_weeks/2026-W47', { ...w, text: 'a quote' }));
  });
  test('Routes: saved places have a kind, a name and coordinates in range; settings and history are fixed documents', async () => {
    const p = { kind: 'stop', name: 'Dobra', lat: 52.24, lon: 21.03, stopId: 'wa_dobra', ts: 1 };
    await assertSucceeds(put('routes_places/s-1abc', p));
    await assertFails(put('routes_places/s-1abc', { ...p, kind: 'trip' }));
    await assertFails(put('routes_places/s-1abc', { ...p, name: '' }));
    await assertFails(put('routes_places/s-1abc', { ...p, name: 'x'.repeat(121) }));
    await assertFails(put('routes_places/s-1abc', { ...p, lat: 91 }));
    await assertFails(put('routes_places/s-1abc', { ...p, lon: '21' }));
    await assertFails(put('routes_places/s-1abc', { kind: 'stop', name: 'Dobra', lat: 52.24 }));
    await assertFails(put('routes_places/s-1abc', { ...p, visited: 12 }));          // no trip or location history fields
    await assertFails(put('routes_places/bad id!', p));
    await assertSucceeds(put('routes_meta/settings', { direction: true, rotate: false, live: true, city: 'warszawa', ts: 1 }));
    await assertFails(put('routes_meta/settings', { direction: 'yes' }));
    await assertFails(put('routes_meta/settings', { direction: true, theme: 'dark' }));
    await assertFails(put('routes_meta/other', { direction: true }));
    await assertSucceeds(put('routes_meta/history', { items: [], ts: 1 }));
    await assertFails(put('routes_meta/history', { items: Array.from({ length: 11 }, () => ({})) }));
    await assertFails(put('routes_meta/history', { items: 'x' }));
    await assertFails(put('routes_meta/history', { ts: 1 }));
    await assertFails(put('routes_meta/history', { items: [], trips: [] }));
  });
  test('updates are validated too', async () => {
    await assertSucceeds(put('days/2026-01-31', { score: 5 }));
    await assertFails(updateDoc(doc(db(OWNER), `users/${OWNER}/days/2026-01-31`), { score: 99 }));
  });
});

describe('public shelves', () => {
  test('anyone can open a shelf by its exact id, nobody can list them', async () => {
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'public/abc123'), { uid: OWNER, books: [] }));
    await assertSucceeds(getDoc(doc(db(null), 'public/abc123')));
    await assertFails(getDocs(collection(db(null), 'public')));
    await assertFails(getDocs(collection(db(OTHER), 'public')));
  });
  test('only the owner can create, change or delete their shelf', async () => {
    await assertSucceeds(setDoc(doc(db(OWNER), 'public/abc123'), { uid: OWNER }));
    await assertFails(setDoc(doc(db(OTHER), 'public/zzz'), { uid: OWNER }));
    await assertFails(setDoc(doc(db(null), 'public/zzz'), { uid: OWNER }));
    await assertFails(updateDoc(doc(db(OTHER), 'public/abc123'), { uid: OTHER }));
    await assertFails(updateDoc(doc(db(OWNER), 'public/abc123'), { uid: OTHER }));
    await assertFails(deleteDoc(doc(db(OTHER), 'public/abc123')));
    await assertSucceeds(deleteDoc(doc(db(OWNER), 'public/abc123')));
  });
});
