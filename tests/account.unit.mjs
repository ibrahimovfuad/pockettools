// Unit tests for shared/account.js (export and delete logic) with an in-memory database and a fake server.
// Run with "npm run test:account" (not named *.test.mjs, so Playwright ignores it). The Firestore rules themselves are tested in firebase/test/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appIds, collectionsOf, deleteApps, deleteAppData, deleteAccount, exportData, everyCollection } from '../shared/account.js';

const REG = JSON.parse(readFileSync(new URL('../shared/user-data.json', import.meta.url), 'utf8'));

// In-memory stand-in for firestoreAdapter()
function memory(seed = {}, { failOn = null } = {}) {
  const db = { collections: structuredClone(seed.collections || {}), profile: seed.profile ? structuredClone(seed.profile) : null, public: structuredClone(seed.public || {}) };
  return {
    db,
    async page(c, after, size = 400) {
      if (failOn === c) throw Object.assign(new Error('x'), { code: 'unavailable' });
      const ids = Object.keys(db.collections[c] || {}).sort().filter(id => !after || id > after).slice(0, size);
      return ids.map(id => ({ id, data: db.collections[c][id] }));
    },
    async removeMany(c, ids) { ids.forEach(id => delete db.collections[c][id]); },
    async profile() { return db.profile; },
    async removeProfile() { db.profile = null; },
    async publicDoc(c, id) { return db.public[id] || null; },
    async removePublic(c, id) { delete db.public[id]; },
    async publicIdsByOwner() { return Object.keys(db.public).filter(id => db.public[id].uid === 'u1'); }   // the signed-in user in these tests is u1
  };
}

const many = n => Object.fromEntries(Array.from({ length: n }, (_, i) => [`id${String(i).padStart(4, '0')}`, { n: i }]));
const seed = () => ({
  collections: { days: many(3), habits: many(1), logs: many(1), books: many(1000), quotes: many(2), spend_expenses: many(5), digest_weeks: many(2), lm_frames: many(1) },
  profile: { share: { on: true, id: 'abc123' } },
  public: { abc123: { uid: 'u1', books: [] }, other: { uid: 'u2' } }
});

function serverLog() {
  const calls = [];
  globalThis.location = { origin: 'https://moodlog2.netlify.app' };
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url: String(url), action: body.action, auth: init.headers.authorization });
    return { ok: true, status: 200, json: async () => ({ ok: true, enabled: true, devices: 1 }) };
  };
  return calls;
}
const base = adapter => ({ app: 'mood', getUser: () => ({ uid: 'u1', name: 'A', email: 'a@x' }), getFirebase: () => null, adapter, token: async () => 'TOKEN' });

test('registry: every app lists collections, ids are unique, servers have https urls', () => {
  const all = everyCollection();
  assert.equal(new Set(all).size, all.length);
  for (const id of appIds()) assert.ok(collectionsOf(id).length, id);
  for (const a of Object.values(REG.apps)) for (const s of a.server || []) assert.match(s.url, /^https:\/\/.+\/api\/reminder$/);
});

test('export reads every page of every collection of every app, plus profile, public shelf and server stores', async () => {
  const calls = serverLog(), m = memory(seed());
  const rep = await exportData(base(m));
  assert.equal(rep.failed.length, 0);
  assert.equal(Object.keys(rep.data.apps.bookshelf.collections.books).length, 1000);       // more than one page
  assert.equal(Object.keys(rep.data.apps.mood.collections.days).length, 3);
  assert.deepEqual(rep.data.apps.bookshelf.publicShelf, { id: 'abc123', data: { uid: 'u1', books: [] } });
  assert.equal(rep.data.apps.bookshelf.profile.share.id, 'abc123');
  assert.ok(rep.data.apps.lightmeter.collections.lm_frames);                                 // legacy data is included
  assert.equal(rep.data.apps.lightmeter.collections.lm_cameras, undefined);                  // empty legacy collections are not
  assert.equal(rep.data.apps.mood.server.length, 1);
  assert.deepEqual(calls.map(c => c.action), ['export', 'export']);
  assert.equal(calls[0].url, '/api/reminder');                                               // own app: same origin
  assert.equal(calls[1].url, 'https://weeklydigest2.netlify.app/api/reminder');
  assert.equal(calls[0].auth, 'Bearer TOKEN');
  JSON.stringify(rep.data);
  assert.ok(!JSON.stringify(rep.data).includes('TOKEN'));
});

test('export reports a failing collection instead of hiding it', async () => {
  serverLog();
  const rep = await exportData(base(memory(seed(), { failOn: 'quotes' })));
  assert.equal(rep.failed.length, 1);
  assert.equal(rep.data.errors.length, 1);
  assert.match(rep.data.errors[0], /Bookshelf.*no connection/);
  assert.equal(Object.keys(rep.data.apps.mood.collections.days).length, 3);
});

test('delete app data removes only this app, and calls only its own server store', async () => {
  const calls = serverLog(), m = memory(seed());
  const rep = await deleteAppData(base(m));
  assert.equal(rep.failed.length, 0);
  assert.equal(Object.keys(m.db.collections.days).length, 0);
  assert.equal(Object.keys(m.db.collections.habits).length, 1);
  assert.equal(Object.keys(m.db.collections.books).length, 1000);
  assert.deepEqual(calls.map(c => [c.url, c.action]), [['/api/reminder', 'delete']]);
  assert.ok(m.db.profile && m.db.public.abc123);
});

test('delete Bookshelf data removes books, quotes, the profile and the public shelf (but not other shelves)', async () => {
  serverLog();
  const m = memory(seed());
  const rep = await deleteAppData({ ...base(m), app: 'bookshelf' });
  assert.equal(rep.failed.length, 0);
  assert.equal(Object.keys(m.db.collections.books).length, 0);                               // 1000 docs = 3 batches
  assert.equal(m.db.profile, null);
  assert.deepEqual(Object.keys(m.db.public), ['other']);
});

test('delete Bookshelf data also removes older shelves of the same owner that the profile no longer points to', async () => {
  serverLog();
  const m = memory({ ...seed(), public: { abc123: { uid: 'u1' }, old999: { uid: 'u1' }, other: { uid: 'u2' } } });
  const rep = await deleteAppData({ ...base(m), app: 'bookshelf' });
  assert.equal(rep.failed.length, 0);
  assert.deepEqual(Object.keys(m.db.public), ['other']);
});

test('deleting still works when the rules do not allow looking up shelves by owner (only the profile id is used)', async () => {
  serverLog();
  const m = memory(seed());
  m.publicIdsByOwner = async () => []; // what firestoreAdapter returns on permission-denied
  const rep = await deleteAppData({ ...base(m), app: 'bookshelf' });
  assert.equal(rep.failed.length, 0);
  assert.deepEqual(Object.keys(m.db.public), ['other']);
});

test('a failing step is reported, later steps still run, and the profile is kept when the shelf could not be deleted', async () => {
  serverLog();
  const m = memory(seed());
  m.removePublic = async () => { throw Object.assign(new Error('x'), { code: 'permission-denied' }); };
  const rep = await deleteAppData({ ...base(m), app: 'bookshelf' });
  assert.equal(rep.failed.length, 1);
  assert.match(rep.failed[0].detail, /permission denied/);
  assert.equal(Object.keys(m.db.collections.books).length, 0);
  assert.ok(m.db.profile, 'profile (which holds the shelf id) must stay so a retry can find the shelf');
});

test('delete account: all apps, legacy included, every server store, then stops before removing the user if something failed', async () => {
  const calls = serverLog(), m = memory(seed());
  m.removeMany = async () => { throw Object.assign(new Error('x'), { code: 'unavailable' }); };
  const rep = await deleteAccount({ ...base(m), getFirebase: () => ({ auth: { currentUser: { uid: 'u1' } }, db: {} }) });
  assert.equal(rep.accountDeleted, false);
  assert.ok(rep.failed.length > 0);
  assert.ok(!rep.steps.some(s => s.kind === 'auth'), 'the account must not be touched while data is left');
  assert.deepEqual(calls.map(c => c.action), ['delete', 'delete']);
});

test('delete account without a signed-in user fails cleanly', async () => {
  serverLog();
  const rep = await deleteAccount({ ...base(memory(seed())), getFirebase: () => ({ auth: { currentUser: null }, db: {} }) });
  assert.equal(rep.accountDeleted, false);
  assert.equal(rep.failed.at(-1).kind, 'auth');
});

test('a server failure blocks account deletion unless ignoreServerFailures is set', async () => {
  const calls = serverLog(), m = memory(seed());
  globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  const fb = () => ({ auth: { currentUser: null }, db: {} });
  const blocked = await deleteAccount({ ...base(m), getFirebase: fb });
  assert.ok(blocked.failed.every(f => f.kind === 'server'));
  assert.ok(!blocked.steps.some(s => s.kind === 'auth'));
  const forced = await deleteAccount({ ...base(m), getFirebase: fb }, null, { ignoreServerFailures: true });
  assert.equal(forced.failed.at(-1).kind, 'auth');                                           // got as far as the account step (no user in the fake)
  assert.equal(calls.length, 0);
  for (const c of everyCollection()) assert.equal(Object.keys(m.db.collections[c] || {}).length, 0, c);
  assert.equal(m.db.profile, null);
});
