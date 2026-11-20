// Firestore rules tests. Run with "npm run test:rules" (starts the emulator; needs Java 11+).
// Every collection must be readable and writable only by its owner, and the validation rules must hold.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

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
  ['habits/h1', { name: 'Run', emoji: '💪', color: 1, freq: { type: 'days', days: [0, 1, 2] }, target: 1, unit: '', archived: false, start: '2026-01-01', created: 1, kind: 'build' }],
  ['logs/h1_2026', { habitId: 'h1', year: 2026, d: { '01-31': 2 }, n: { '01-31': 'felt good' } }],
  ['books/b1', { title: 'Dune', author: 'Frank Herbert', genre: 'Fiction', year: '1965', pages: 412, format: 'Paper', isbn: '9780441172719', cover: 'https://books.google.com/x.jpg', desc: 'Sand.', status: 'done', start: '2026-01-01', end: '2026-01-20', rating: 5, review: 'Great', why: '', order: 10, created: 1, updated: 2, looked: true }],
  ['quotes/q1', { bookId: 'b1', page: '12', text: 'Fear is the mind-killer.', created: 1 }],
  ['spend_categories/c1', { name: 'Food', icon: 'cart', color: '#ff9500', order: 1 }],
  ['spend_expenses/e1', { amount: 23.49, catId: 'c1', date: '2026-01-31', ts: 1, merchant: 'Żabka', source: 'applepay' }],
  ['spend_meta/settings', { budget: 2000, rules: { 'Żabka': 'c1' } }],
  ['routes_places/home', { kind: 'home', name: 'Home', sub: 'Dobra 9', lat: 52.24, lon: 21.03, ts: 1 }],
  ['routes_places/s-1abc', { kind: 'stop', name: 'Dobra', lat: 52.24, lon: 21.03, stopId: 'wa_dobra' }],
  ['routes_meta/settings', { direction: true, rotate: false, live: true, city: 'warszawa', ts: 1 }],
  ['routes_meta/history', { items: [{ name: 'Metro Wilanowska', lat: 52.2, lon: 21, ts: 1 }], ts: 1 }],
  ['digest_weeks/2026-W47', { quotes: 12, removed: 1, ts: 1763913600000 }],
  ['mood_consent/consent', { at: 1763913600000, version: 1 }]
];
// Lightmeter was removed: its collections can still be read and deleted by the owner, but never written
const LEGACY = [
  ['lm_cameras/k1', { name: 'Canon FTb', fastest: 0.001, slowest: 1 }],
  ['lm_lenses/l1', { name: 'Canon FL 50', focal: 50, widest: 1.8, smallest: 16 }],
  ['lm_films/f1', { name: 'Portra 400', iso: 400, exposures: 36 }],
  ['lm_rolls/r1', { filmName: 'Portra 400', iso: 400, exposures: 36, status: 'loaded' }],
  ['lm_frames/x1', { rollId: 'r1', n: 1, aperture: 8, shutter: 0.004, iso: 400, ev: 12 }]
];
const ALL = [...VALID, ...LEGACY];

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

  for (const [path, data] of LEGACY) {
    const name = path.split('/')[0];
    test(`${name} (removed app): the owner can still read and delete, nobody can write`, async () => {
      await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), `users/${OWNER}/${path}`), data));
      await assertSucceeds(getDoc(doc(db(OWNER), `users/${OWNER}/${path}`)));
      await assertSucceeds(getDocs(collection(db(OWNER), `users/${OWNER}/${name}`)));
      await assertFails(setDoc(doc(db(OWNER), `users/${OWNER}/${path}`), data));          // update
      await assertFails(setDoc(doc(db(OWNER), `users/${OWNER}/${name}/new1`), data));     // create
      await assertFails(getDoc(doc(db(OTHER), `users/${OWNER}/${path}`)));
      await assertFails(deleteDoc(doc(db(OTHER), `users/${OWNER}/${path}`)));
      await assertSucceeds(deleteDoc(doc(db(OWNER), `users/${OWNER}/${path}`)));
    });
  }

  test('the profile document is owner-only', async () => {
    await assertSucceeds(setDoc(doc(db(OWNER), `users/${OWNER}`), { share: { on: false } }));
    await assertFails(getDoc(doc(db(OTHER), `users/${OWNER}`)));
    await assertFails(getDoc(doc(db(null), `users/${OWNER}`)));
    await assertFails(setDoc(doc(db(OTHER), `users/${OWNER}`), { share: { on: true } }));
    await assertFails(setDoc(doc(db(null), `users/${OWNER}`), { share: { on: true } }));
  });

  test('nobody can list the users collection', async () => {
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), `users/${OWNER}`), { share: { on: false } }));
    await assertSucceeds(getDoc(doc(db(OWNER), `users/${OWNER}`)));
    await assertFails(getDocs(collection(db(OWNER), 'users')));
    await assertFails(getDocs(collection(db(OTHER), 'users')));
    await assertFails(getDocs(collection(db(null), 'users')));
    await assertFails(getDocs(query(collection(db(OTHER), 'users'), where('share.on', '==', false))));
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
  test('Mood consent: one document called "consent" with a time and a whole version number', async () => {
    const c = { at: 1763913600000, version: 1 };
    await assertSucceeds(put('mood_consent/consent', c));
    await assertFails(put('mood_consent/other', c));
    await assertFails(put('mood_consent/consent', { at: 1763913600000 }));
    await assertFails(put('mood_consent/consent', { version: 1 }));
    await assertFails(put('mood_consent/consent', { ...c, at: 'now' }));
    await assertFails(put('mood_consent/consent', { ...c, version: 1.5 }));
    await assertFails(put('mood_consent/consent', { ...c, version: 0 }));
    await assertFails(put('mood_consent/consent', { ...c, extra: true }));
  });
  test('Habits: known fields only, a name, sensible types', async () => {
    const h = { name: 'Run', emoji: '💪', color: 1, freq: { type: 'weekly', times: 3 }, target: 1, unit: 'km', archived: false, start: '2026-01-01', created: 1, kind: 'quit' };
    await assertSucceeds(put('habits/h1', h));
    await assertSucceeds(put('habits/h2', { name: 'Minimal' }));
    await assertFails(put('habits/h1', { ...h, admin: true }));
    await assertFails(put('habits/h1', { ...h, name: 'x'.repeat(61) }));
    await assertFails(put('habits/h1', { ...h, emoji: 'x'.repeat(33) }));
    await assertFails(put('habits/h1', { ...h, kind: 'other' }));
    await assertFails(put('habits/h1', { ...h, archived: 'no' }));
    await assertFails(put('habits/h1', { ...h, color: 'red' }));
    await assertFails(put('habits/h1', { ...h, freq: { type: 'daily' } }));
    await assertFails(put('habits/h1', { ...h, freq: { type: 'days', days: [0, 1, 2, 3, 4, 5, 6, 7] } }));
    await assertFails(put('habits/h1', { ...h, freq: { type: 'days', extra: 1 } }));
    await assertFails(put('habits/h1', { ...h, freq: 'daily' }));
  });
  test('Habit check-ins: one document per habit and year, known fields, bounded maps; merge writes with deleteField work', async () => {
    const l = { habitId: 'h1', year: 2026, d: { '01-31': 1 }, n: {} };
    await assertSucceeds(put('logs/h1_2026', l));
    await assertSucceeds(put('logs/h1_2026', { habitId: 'h1' }));
    // the app writes with merge and removes a day with deleteField()
    await assertSucceeds(setDoc(doc(db(OWNER), `users/${OWNER}/logs/h1_2026`), { habitId: 'h1', year: 2026, d: { '02-01': 3 }, n: { '02-01': 'note' } }, { merge: true }));
    await assertSucceeds(setDoc(doc(db(OWNER), `users/${OWNER}/logs/h1_2026`), { habitId: 'h1', year: 2026, d: { '02-01': deleteField() }, n: { '02-01': deleteField() } }, { merge: true }));
    await assertFails(put('logs/h1_2026', { year: 2026, d: {} }));
    await assertFails(put('logs/h1_2026', { ...l, habitId: 5 }));
    await assertFails(put('logs/h1_2026', { ...l, year: 2026.5 }));
    await assertFails(put('logs/h1_2026', { ...l, year: 99999 }));
    await assertFails(put('logs/h1_2026', { ...l, d: 'x' }));
    await assertFails(put('logs/h1_2026', { ...l, d: Object.fromEntries(Array.from({ length: 401 }, (_, i) => [`k${i}`, 1])) }));
    await assertFails(put('logs/h1_2026', { ...l, extra: 1 }));
    await assertFails(put(`logs/${'x'.repeat(121)}`, l));
  });
  test('Bookshelf books: title required, known fields, rating 0-5, status from the known set, capped text', async () => {
    const b = { title: 'Dune', author: 'FH', year: 1965, pages: '412', status: 'reading', rating: 0, order: 1, created: 1, updated: 2, looked: false };
    await assertSucceeds(put('books/b1', b));
    await assertSucceeds(put('books/b2', { title: 'Zażółć gęślą jaźń' }));   // the only required field; any language
    // older versions stored Russian format and genre names ("Paper", "Fiction"); the app maps them on read and they must stay writable
    await assertSucceeds(put('books/b3', { title: 'Old book', format: '\u0411\u0443\u043c\u0430\u0433\u0430', genre: '\u0425\u0443\u0434\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f', status: 'dropped' }));
    await assertFails(put('books/b1', { ...b, title: '' }));
    await assertFails(put('books/b1', { ...b, title: 'x'.repeat(301) }));
    await assertFails(put('books/b1', { ...b, owner: 'bob' }));
    await assertFails(put('books/b1', { ...b, rating: 6 }));
    await assertFails(put('books/b1', { ...b, rating: -1 }));
    await assertFails(put('books/b1', { ...b, rating: '5' }));
    await assertFails(put('books/b1', { ...b, status: 'owned' }));
    await assertFails(put('books/b1', { ...b, review: 'x'.repeat(20001) }));
    await assertFails(put('books/b1', { ...b, cover: 'x'.repeat(8001) }));
    await assertFails(put('books/b1', { ...b, pages: 'x'.repeat(21) }));
    await assertFails(put('books/b1', { ...b, pages: true }));
    await assertFails(put('books/b1', { ...b, looked: 'yes' }));
    await assertFails(put('books/b1', { ...b, order: 'first' }));
  });
  test('Bookshelf quotes: known fields, capped text', async () => {
    const q = { bookId: 'b1', page: '12', text: 'Fear', created: 1 };
    await assertSucceeds(put('quotes/q1', q));
    await assertSucceeds(put('quotes/q2', { text: '' }));
    await assertFails(put('quotes/q1', { ...q, text: 'x'.repeat(2001) }));
    await assertFails(put('quotes/q1', { ...q, extra: 1 }));
    await assertFails(put('quotes/q1', { ...q, bookId: 5 }));
    await assertFails(put('quotes/q1', { ...q, page: 'x'.repeat(21) }));
    await assertFails(put('quotes/q1', { bookId: 'b1' }));
  });
  test('Bookshelf profile: only the share settings, with the right types; merge writes work', async () => {
    const prof = uid => doc(db(uid), `users/${uid}`);
    await assertSucceeds(setDoc(prof(OWNER), { share: { on: true, id: 'abc123xy', showR: true, showQ: false } }));
    await assertSucceeds(setDoc(prof(OWNER), { share: { on: false } }, { merge: true }));
    await assertSucceeds(setDoc(prof(OWNER), {}));
    await assertFails(setDoc(prof(OWNER), { share: 'yes' }));
    await assertFails(setDoc(prof(OWNER), { share: { on: 'yes' } }));
    await assertFails(setDoc(prof(OWNER), { share: { id: 'bad id!' } }));
    await assertFails(setDoc(prof(OWNER), { share: { id: 'ab' } }));
    await assertFails(setDoc(prof(OWNER), { share: { id: 'x'.repeat(33) } }));
    await assertFails(setDoc(prof(OWNER), { share: { on: true, a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 } }));
    await assertFails(setDoc(prof(OWNER), Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`f${i}`, 1]))));
  });
  test('updates are validated too', async () => {
    await assertSucceeds(put('days/2026-01-31', { score: 5 }));
    await assertFails(updateDoc(doc(db(OWNER), `users/${OWNER}/days/2026-01-31`), { score: 99 }));
  });
});

describe('public shelves', () => {
  const shelf = (uid, more = {}) => ({ uid, name: 'Fuad', photo: 'https://lh3.googleusercontent.com/a/x=s96-c', showR: true, showQ: true, updated: 1, books: [{ id: 'b1', title: 'Dune' }], quotes: [], ...more });
  const seed = (id, uid) => env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), `public/${id}`), shelf(uid)));

  test('anyone can open a shelf by its exact id, nobody can list them', async () => {
    await seed('abc123', OWNER);
    await assertSucceeds(getDoc(doc(db(null), 'public/abc123')));
    await assertSucceeds(getDoc(doc(db(OTHER), 'public/abc123')));
    await assertFails(getDocs(collection(db(null), 'public')));
    await assertFails(getDocs(collection(db(OTHER), 'public')));
    await assertFails(getDocs(collection(db(OWNER), 'public')));                                   // not even without a filter for the owner
    await assertFails(getDocs(query(collection(db(OTHER), 'public'), where('uid', '==', OWNER))));  // nor somebody else's shelves
    await assertFails(getDocs(query(collection(db(null), 'public'), where('uid', '==', OWNER))));
  });
  test('an owner can list only their own shelves (used to find old shelves when deleting the account)', async () => {
    await seed('mine0001', OWNER); await seed('mine0002', OWNER); await seed('theirs01', OTHER);
    const snap = await assertSucceeds(getDocs(query(collection(db(OWNER), 'public'), where('uid', '==', OWNER))));
    assert.deepEqual(snap.docs.map(d => d.id).sort(), ['mine0001', 'mine0002']);
    await assertFails(getDocs(query(collection(db(OWNER), 'public'), where('uid', '==', OTHER))));
  });
  test('only the owner can create, change or delete their shelf', async () => {
    await assertSucceeds(setDoc(doc(db(OWNER), 'public/abc123'), shelf(OWNER)));
    await assertSucceeds(setDoc(doc(db(OWNER), 'public/abc123'), shelf(OWNER, { updated: 2 })));   // overwrite by the owner
    await assertSucceeds(updateDoc(doc(db(OWNER), 'public/abc123'), { updated: 3 }));
    await assertFails(setDoc(doc(db(OTHER), 'public/zzz123'), shelf(OWNER)));                      // pretending to be the owner
    await assertFails(setDoc(doc(db(null), 'public/zzz123'), shelf(OWNER)));
    await assertFails(updateDoc(doc(db(OTHER), 'public/abc123'), { uid: OTHER }));                 // taking a shelf over
    await assertFails(updateDoc(doc(db(OWNER), 'public/abc123'), { uid: OTHER }));                 // giving it away
    await assertFails(deleteDoc(doc(db(OTHER), 'public/abc123')));
    await assertFails(deleteDoc(doc(db(null), 'public/abc123')));
    await assertSucceeds(deleteDoc(doc(db(OWNER), 'public/abc123')));
  });
  test('deleting a shelf that does not exist is harmless for a signed-in user and still refused for a visitor', async () => {
    await assertSucceeds(deleteDoc(doc(db(OWNER), 'public/neverpublished')));
    await assertFails(deleteDoc(doc(db(null), 'public/neverpublished')));
    await seed('abc123', OWNER);
    await assertFails(deleteDoc(doc(db(OTHER), 'public/abc123')));   // an existing shelf is still only deletable by its owner
  });
  test('somebody else cannot overwrite an existing shelf with setDoc, with their own uid or the owner’s', async () => {
    await seed('abc123', OWNER);
    await assertFails(setDoc(doc(db(OTHER), 'public/abc123'), shelf(OTHER)));
    await assertFails(setDoc(doc(db(OTHER), 'public/abc123'), shelf(OWNER)));
    await assertFails(setDoc(doc(db(OTHER), 'public/abc123'), shelf(OTHER), { merge: true }));
    await assertFails(setDoc(doc(db(null), 'public/abc123'), shelf(OWNER)));
    await env.withSecurityRulesDisabled(async c => {
      const kept = await getDoc(doc(c.firestore(), 'public/abc123'));
      assert.equal(kept.data().uid, OWNER);
      assert.equal(kept.data().name, 'Fuad');
    });
  });
  test('a shelf needs a well-formed id, known fields and bounded sizes', async () => {
    const put = (id, data) => setDoc(doc(db(OWNER), `public/${id}`), data);
    await assertSucceeds(put('Abc123xyz', shelf(OWNER)));
    await assertSucceeds(put('ab12cd34', { uid: OWNER }));                                         // only uid is required
    await assertFails(put('abc', shelf(OWNER)));                                                  // too short
    await assertFails(put('x'.repeat(33), shelf(OWNER)));                                         // too long
    await assertFails(put('has-dash', shelf(OWNER)));
    await assertFails(put('has_under', shelf(OWNER)));
    await assertFails(put('abc12345', { name: 'no uid' }));
    await assertFails(put('abc12345', shelf(OWNER, { admin: true })));
    await assertFails(put('abc12345', shelf(OWNER, { name: 'x'.repeat(101) })));
    await assertFails(put('abc12345', shelf(OWNER, { photo: 'x'.repeat(1001) })));
    await assertFails(put('abc12345', shelf(OWNER, { showR: 'yes' })));
    await assertFails(put('abc12345', shelf(OWNER, { books: 'many' })));
    await assertFails(put('abc12345', shelf(OWNER, { books: Array.from({ length: 5001 }, () => 1) })));
    await assertFails(put('abc12345', shelf(OWNER, { quotes: Array.from({ length: 10001 }, () => 1) })));
    await assertSucceeds(put('abc12345', shelf(OWNER, { books: Array.from({ length: 5000 }, () => 1) })));
  });
});

describe('account deletion: the owner can remove everything', () => {
  test('the owner can empty every collection and the profile; nobody else can', async () => {
    const own = db(OWNER);
    for (const [path, data] of ALL) await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), `users/${OWNER}/${path}`), data));
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), `users/${OWNER}`), { share: { on: true, id: 'abc123' } }));
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'public/abc123'), { uid: OWNER }));
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'public/oldshelf1'), { uid: OWNER }));     // a shelf the profile no longer points to
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'public/someones'), { uid: OTHER }));
    // listing a collection page by page (as the export and delete code does) is allowed for the owner only
    for (const name of new Set(ALL.map(([p]) => p.split('/')[0]))) {
      await assertFails(getDocs(collection(db(OTHER), `users/${OWNER}/${name}`)));
      const snap = await assertSucceeds(getDocs(collection(own, `users/${OWNER}/${name}`)));
      assert.ok(snap.size >= 1, name);
    }
    await assertFails(deleteDoc(doc(db(OTHER), `users/${OWNER}`)));
    await assertFails(deleteDoc(doc(db(null), `users/${OWNER}`)));
    await assertFails(deleteDoc(doc(db(OTHER), 'public/abc123')));
    // the owner deletes the public shelf by the id kept in their own profile, then every document, then the profile
    const profile = await assertSucceeds(getDoc(doc(own, `users/${OWNER}`)));
    await assertSucceeds(deleteDoc(doc(own, 'public', profile.data().share.id)));
    // older shelves are found by owner and deleted too
    const old = await assertSucceeds(getDocs(query(collection(own, 'public'), where('uid', '==', OWNER))));
    assert.deepEqual(old.docs.map(d => d.id), ['oldshelf1']);
    for (const d of old.docs) await assertSucceeds(deleteDoc(d.ref));
    for (const [path] of ALL) await assertSucceeds(deleteDoc(doc(own, `users/${OWNER}/${path}`)));
    await assertSucceeds(deleteDoc(doc(own, `users/${OWNER}`)));
    await env.withSecurityRulesDisabled(async c => {
      for (const [path] of ALL) assert.equal((await getDoc(doc(c.firestore(), `users/${OWNER}/${path}`))).exists(), false, path);
      assert.equal((await getDoc(doc(c.firestore(), 'public/abc123'))).exists(), false);
      assert.equal((await getDoc(doc(c.firestore(), 'public/oldshelf1'))).exists(), false);
      assert.equal((await getDoc(doc(c.firestore(), 'public/someones'))).exists(), true, 'other people’s shelves are untouched');
    });
  });
});
