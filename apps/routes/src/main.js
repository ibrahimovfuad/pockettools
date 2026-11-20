// Routes — entry point. Edit the files in src/, then run "npm run build" and commit public/app.js.
import * as store from './store.js';
import * as api from './api.js';
import * as loc from './locate.js';
import { RouteMap } from './map.js';
import { createTracker, snapshot } from './live.js';
import { initAccount, accountAvailable, signIn, signOutUser, exportCloud, deleteMyData, deleteAccount } from './account.js';
import * as V from './views.js';
import { $, esc, clock, dayLabel, until, ms, dist, walkMin, fmtDist, decodePolyline, cumulative, pointAt, modeKind, isTransit, lineName, toLocalInput, MODE_COLOR } from './util.js';
import { CITIES, cityById, fold } from './cities.js';

const app = $('app');
const city = () => cityById(store.get().city);

// ================= state =================
const S = {
  from: { gps: true }, to: null, fromText: 'Current location', toText: '',
  when: { mode: 'now', at: null }, mode: 'all',
  results: null, sort: 'best', itin: null, stop: null, track: null
};
const stack = [{ screen: 'home' }];
let cleanups = [];                       // functions to run when leaving the current screen
let accountState = { signedIn: false, name: '', email: '', sync: 'off', error: '' };
const cleanup = f => cleanups.push(f);
const runCleanups = () => { const c = cleanups; cleanups = []; c.forEach(f => { try { f(); } catch (e) {} }); };

// ================= navigation =================
function go(screen, extra = {}) {
  stack.push({ screen, ...extra });
  try { history.pushState({ d: stack.length }, ''); } catch (e) {}
  show();
}
function back() { if (stack.length > 1) { try { history.back(); } catch (e) { stack.pop(); show(); } } }
window.addEventListener('popstate', () => { if (stack.length > 1) stack.pop(); show(); });
try { history.replaceState({ d: 1 }, ''); } catch (e) {}

function show() {
  runCleanups();
  closeOverlay();
  const cur = stack[stack.length - 1];
  ({ home: showHome, results: showResults, route: showRoute, stop: showStop, track: showTrack, settings: showSettings }[cur.screen] || showHome)(cur);
  window.scrollTo(0, 0);
}
const msg = (html, cls = 'err') => { const m = $('msg'); if (m) m.innerHTML = html ? `<div class="${cls}" role="${cls === 'err' ? 'alert' : 'status'}">${html}</div>` : ''; };

// ================= home =================
const whenLabel = () => S.when.mode === 'now' ? 'Leave now' : `${S.when.mode === 'arr' ? 'Arrive by' : 'Leave'} ${dayLabel(S.when.at)} ${clock(S.when.at)}`;
const modeLabel = () => api.MODE_FILTERS[S.mode].label;
let sugSeq = 0, activeField = 'to', sugItems = [];

function showHome() {
  const d = store.get();
  app.innerHTML = V.home({ city: city(), places: d.places, history: d.history, fromText: S.fromText, toText: S.toText, whenLabel: whenLabel(), modeLabel: modeLabel() });
  loadNearby();
}

async function suggest(field) {
  const input = $(field);
  if (!input) return;
  const q = input.value.trim();
  const seq = ++sugSeq;
  const box = $('sugg'), main = $('main');
  const fromGps = field === 'from';
  if (q.length < 2 || (fromGps && /^current location$/i.test(q))) {
    if (fromGps) {
      sugItems = store.get().places.concat(store.get().history);
      box.innerHTML = V.suggestions(sugItems, true); box.hidden = false; main.hidden = true;
    } else { box.hidden = true; main.hidden = false; }
    return;
  }
  // saved places that match are shown immediately, the rest comes from the geocoder
  const f = fold(q);
  const mine = store.get().places.concat(store.get().history).filter(p => fold(p.name).includes(f)).slice(0, 3);
  sugItems = mine; box.innerHTML = V.suggestions(mine, fromGps); box.hidden = false; main.hidden = true;
  try {
    const found = await api.geocode(q, city());
    if (seq !== sugSeq) return;
    sugItems = mine.concat(found.filter(p => !mine.some(m => m.name === p.name && Math.abs(m.lat - p.lat) < 1e-4)));
    box.innerHTML = V.suggestions(sugItems, fromGps);
  } catch (e) { if (seq === sugSeq) { box.innerHTML = V.suggestions(mine, fromGps); msg(esc(api.friendly(e))); } }
}
let sugTimer = null;
const debouncedSuggest = field => { clearTimeout(sugTimer); sugTimer = setTimeout(() => suggest(field), 250); };

function setField(field, p) {
  if (field === 'from') { S.from = p && p.gps ? { gps: true } : p; S.fromText = p.gps ? 'Current location' : p.name; }
  else { S.to = p; S.toText = p.name; }
  const el = $(field); if (el) el.value = field === 'from' ? S.fromText : S.toText;
  const box = $('sugg'), main = $('main');
  if (box) { box.hidden = true; main.hidden = false; }
}
function afterPick(field) {
  if (field === 'to' || S.to) { search(); return; }
  const t = $('to'); if (t) t.focus();
}

async function search() {
  msg('');
  if (!S.to) { msg('Enter a destination first.'); const t = $('to'); if (t) t.focus(); return; }
  if (S.from.typed) { msg('Pick the starting point from the list, or clear the field to use your current location.'); const f = $('from'); if (f) f.focus(); return; }
  if (S.from.gps) {
    msg('Finding your location…', 'note');
    try { const p = await loc.getPosition(); S.from = { gps: true, lat: p.lat, lon: p.lon, name: 'Current location' }; }
    catch (e) { msg(esc(loc.locError(e))); const f = $('from'); if (f) { f.focus(); f.select(); } return; }
    msg('');
  }
  store.addHistory(S.to);
  S.results = { itins: [], next: null, loading: true, error: '' };
  go('results');
}

// ----- nearby stops (only after the user allows location; one reverse-geocode plus a few departure boards) -----
let nearTok = 0;
async function loadNearby(force) {
  const box = $('nearby'); if (!box) return;
  const tok = ++nearTok;
  const perm = await loc.geoPermission();
  if (tok !== nearTok || !$('nearby')) return;
  if (perm !== 'granted' && !force && !loc.state.pos) {
    box.innerHTML = `<div class="card"><button class="row press link" data-act="nearby"><span class="ico">${V.ic('locate', 18)}</span><span class="tx"><span class="t1">Show stops near me</span><span class="t2">Uses your location once, only on this phone</span></span></button></div>`;
    return;
  }
  box.innerHTML = '<div class="skel"></div>';
  try {
    const pos = await loc.getPosition();
    const stops = (await api.reverse(pos.lat, pos.lon, 'STOP', 3)).filter(s => s.stopId);
    const boards = await Promise.all(stops.map(s => api.stoptimes(s.stopId, 4).catch(() => ({ items: [] }))));
    if (tok !== nearTok || !$('nearby')) return;
    const now = Date.now();
    S.nearby = stops.map((s, i) => ({
      ...s, walk: `${walkMin(dist(pos.lat, pos.lon, s.lat, s.lon))} min walk`,
      deps: boards[i].items.slice(0, 2).map(x => { const t = x.place.departure || x.place.scheduledDeparture; return { line: lineName(x), mode: x.mode, headsign: x.headsign || '', when: until(t, now), live: !!x.realTime }; })
    }));
    box.innerHTML = S.nearby.length ? V.nearbyCard(S.nearby) : '<div class="note">No stops found close to you.</div>';
    const lv = $('nearlive'); if (lv) lv.hidden = !S.nearby.some(s => s.deps.some(d => d.live));
  } catch (e) {
    if (tok !== nearTok || !$('nearby')) return;
    box.innerHTML = `<div class="note">${esc(e && e.code ? loc.locError(e) : e && e.kind ? api.friendly(e) : loc.locError(e))}</div>`;
  }
}

// ================= results =================
function sorted(list) {
  const key = { best: i => [ms(i.endTime), i.transfers], changes: i => [i.transfers, ms(i.endTime)], walk: i => [V.walkSeconds(i), ms(i.endTime)] }[S.sort];
  return list.map((it, i) => ({ it, k: key(it), i })).sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.i - b.i).map(x => x.it);
}
function showResults() {
  const fromName = S.from.gps ? 'Current location' : S.from.name;
  app.innerHTML = `<div class="screen back-top" id="scr">
    <div class="bar"><button class="ib pos blue press" data-act="back" aria-label="Back to search">${V.ic('back', 24, 2.4)}</button>
      <button class="sum press" data-act="back" aria-label="Change places"><div>From <b>${esc(fromName)}</b></div><div>To <b>${esc(S.to.name)}</b></div></button></div>
    <div class="chips"><button class="chip press ${S.when.mode === 'now' ? '' : 'on'}" data-act="when">${esc(whenLabel())}</button>
      <button class="chip press ${S.mode === 'all' ? '' : 'on'}" data-act="modes">${esc(modeLabel())}</button>
      <button class="chip press ${S.sort === 'changes' ? 'on' : ''}" data-act="sort" data-s="changes" aria-pressed="${S.sort === 'changes'}">Fewest changes</button>
      <button class="chip press ${S.sort === 'walk' ? 'on' : ''}" data-act="sort" data-s="walk" aria-pressed="${S.sort === 'walk'}">Less walking</button></div>
    <div id="msg"></div><div id="list" aria-live="polite"></div>
    <div id="more"></div>${V.footer()}</div>`;
  if (S.results && S.results.loading && !S.results.started) loadResults(false);
  else renderList();
}
async function loadResults(more) {
  const R = S.results; R.started = true; R.loading = true; R.error = '';
  renderList();
  try {
    const time = S.when.mode === 'now' ? undefined : S.when.at;
    const r = await api.plan({ from: S.from, to: S.to, time, arriveBy: S.when.mode === 'arr', mode: S.mode, cursor: more ? R.next : undefined });
    R.itins = more ? R.itins.concat(r.itineraries.filter(n => !R.itins.some(o => o.id === n.id))) : r.itineraries;
    R.next = r.next;
  } catch (e) { R.error = api.friendly(e); }
  R.loading = false;
  if (S.results === R) renderList();
}
function renderList() {
  const list = $('list'), R = S.results; if (!list || !R) return;
  const now = Date.now(), items = sorted(R.itins);
  S.shown = items;
  let html = '';
  if (R.error && !items.length) html = `<div class="err" role="alert">${esc(R.error)}</div><button class="linkbtn press" data-act="retry">Try again</button>`;
  else if (R.loading && !items.length) html = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  else if (!items.length) html = '<div class="note">No connections found for this time. Try a later time, other places, or all modes of transport.</div>';
  else html = `<div class="sec" style="margin-top:14px">${S.sort === 'best' ? 'Best' : S.sort === 'changes' ? 'Fewest changes first' : 'Least walking first'}</div>` + items.map((it, i) => V.itinCard(it, i, now)).join('');
  list.innerHTML = html;
  const more = $('more');
  if (more) more.innerHTML = items.length && R.next ? `<button class="linkbtn press" style="width:100%" data-act="later" ${R.loading ? 'disabled' : ''}>${R.loading ? 'Loading…' : 'Later connections'}</button>${R.error ? `<div class="err">${esc(R.error)}</div>` : ''}` : '';
}

// ================= map helpers shared by route and track =================
function mapScreen(html) { app.innerHTML = html; }
function legCoords(leg) { return leg.legGeometry && leg.legGeometry.points ? decodePolyline(leg.legGeometry.points, leg.legGeometry.precision || 5) : [[leg.from.lon, leg.from.lat], [leg.to.lon, leg.to.lat]]; }

// Wire up the user's position, compass, and the map buttons for a map screen
function attachMe(map, mapwrap) {
  const settings = () => store.get().settings;
  let located = false;
  const paint = st => {
    if (st.pos) map.setMe(st.pos, settings().direction);
    map.setBeam(st.heading, settings().direction);
    if (settings().rotate && st.heading != null) map.rotateTo(st.heading);
    else if (map.map && !settings().rotate && Math.abs(map.map.getBearing()) > 0.5 && !located) map.resetNorth();
    located = true;
    const b = $('dirbtn'); if (b) b.innerHTML = dirLabel();
  };
  loc.startWatch();
  const off = loc.onLocation(paint);
  if (loc.state.pos) paint(loc.state);
  // Android and desktop start the compass at once; iOS needs a tap (the direction button)
  if (settings().direction && !loc.compassNeedsTap()) loc.enableCompass();
  cleanup(() => { off(); loc.stopWatch(); if (loc.state.users === 0) loc.disableCompass(); });
  map.onRotate(() => map.setBeam(loc.state.heading, settings().direction));
}
const dirLabel = () => {
  const on = store.get().settings.direction;
  if (on && loc.compassNeedsTap() && !loc.state.compassOn) return `${V.ic('nav', 15, 2.2)}Enable direction`;
  return `${V.ic('nav', 15, 2.2)}Direction ${on ? 'on' : 'off'}`;
};
async function toggleDirection() {
  const on = store.get().settings.direction;
  if (on && loc.compassNeedsTap() && !loc.state.compassOn) { await loc.enableCompass(); }       // the tap itself is the permission gesture
  else if (on) { store.setSettings({ direction: false }); loc.disableCompass(); }
  else { store.setSettings({ direction: true }); await loc.enableCompass(); }
  const b = $('dirbtn'); if (b) b.innerHTML = dirLabel();
  const st = loc.state; if (st.pos) { const m = currentMap; if (m) { m.setMe(st.pos, store.get().settings.direction); m.setBeam(st.heading, store.get().settings.direction); } }
}
let currentMap = null;
const mapButtons = `<button class="mapbtn p press" id="dirbtn" style="top:64px;right:12px" data-act="dir"></button>
  <button class="mapbtn c press" style="top:12px;right:12px" data-act="center-me" aria-label="Show my position">${V.ic('locate', 22)}</button>
  <button class="mapbtn c press" style="top:12px;left:12px" data-act="back" aria-label="Back">${V.ic('back', 22, 2.4)}</button>`;
function makeMap(el, onFail) {
  const map = new RouteMap(el, { center: city(), zoom: 12, onFail: t => { const w = el.parentElement; if (w && !w.querySelector('.mapmsg')) w.insertAdjacentHTML('afterbegin', `<div class="mapmsg" role="status">${esc(t)}</div>`); if (onFail) onFail(t); } });
  currentMap = map;
  cleanup(() => { map.remove(); if (currentMap === map) currentMap = null; });
  return map;
}

// ================= route =================
function showRoute(cur) {
  const it = S.itin = cur.itin;
  const legs = it.legs;
  const walkSec = legs.filter(l => l.mode === 'WALK').reduce((a, l) => a + l.duration, 0);
  mapScreen(`<div class="screen mapscreen">
    <div class="mapwrap"><div class="mapel" id="map"></div>${mapButtons}</div>
    <div class="msheet"><span class="grab"></span>
      <div class="r1"><span class="a">${clock(it.startTime)} – ${clock(it.endTime)}</span><span class="b">${Math.round(it.duration / 60)} min</span></div>
      <div class="sub">${it.transfers === 0 ? 'no changes' : it.transfers === 1 ? '1 change' : `${it.transfers} changes`} · ${Math.round(walkSec / 60)} min walking</div>
      <div style="margin-top:8px">${V.legRows(it)}</div>
      <div class="hint">Map © OpenStreetMap contributors. Times use live data where the transit agency provides it.</div>
      ${V.footer()}</div></div>`);
  const map = makeMap($('map'));
  const all = [], drawn = [], stops = [];
  for (const l of legs) {
    const coords = legCoords(l); all.push(...coords);
    const tr = isTransit(l.mode);
    drawn.push({ coords, color: tr ? MODE_COLOR[modeKind(l.mode)] : '#6b6b70', walk: !tr });
    if (tr) { stops.push({ lon: l.from.lon, lat: l.from.lat, color: MODE_COLOR[modeKind(l.mode)], r: 6 }, { lon: l.to.lon, lat: l.to.lat, color: MODE_COLOR[modeKind(l.mode)], r: 6 }); }
  }
  map.setRoute(drawn, stops);
  map.fit(all, 50);
  attachMe(map);
  $('dirbtn').innerHTML = dirLabel();
  // live vehicles of this journey (only trips that are running now or about to)
  if (store.get().settings.live) {
    const run = async () => {
      const soon = legs.filter(l => isTransit(l.mode) && l.tripId && ms(l.endTime) > Date.now() && ms(l.startTime) < Date.now() + 25 * 60000);
      if (!soon.length || document.visibilityState !== 'visible') return;
      const veh = await snapshot(soon, city());
      if (currentMap === map) map.setVehicles(veh);
    };
    run(); const t = setInterval(run, 15000); cleanup(() => clearInterval(t));
  }
}

// ================= stop departures =================
let stopPoll = null;
function showStop(cur) {
  const st = S.stop = cur.stop;
  const saved = id => store.isSaved(store.placeId({ kind: 'stop', stopId: st.stopId, lat: st.lat, lon: st.lon }));
  app.innerHTML = `<div class="screen back-top" id="scr">
    <div style="display:flex;justify-content:space-between;align-items:center"><button class="ib pos blue press" data-act="back" aria-label="Back">${V.ic('back', 24, 2.4)}</button>
      <button class="ib blue press" data-act="save-stop" id="savebtn" aria-label="${saved() ? 'Remove stop from saved places' : 'Save stop'}" aria-pressed="${saved()}">${V.ic('star', 24, 2, saved() ? 'currentColor' : 'none').replace('fill="none"', saved() ? 'fill="currentColor"' : 'fill="none"')}</button></div>
    <h1 class="big">${esc(st.name)}</h1>
    <div style="font-size:14px;color:var(--text2);margin-top:2px" id="stopsub">${esc(st.sub || 'Stop')}</div>
    <div class="chips" id="plat" hidden></div>
    <div id="msg"></div>
    <div class="card" style="margin-top:14px" id="deps"><div class="skel" style="margin:0"></div></div>
    <div class="hint" style="display:flex;align-items:center;gap:4px"><span class="dotg pulse"></span>Live where the agency shares it · refreshes every 15 s</div>
    ${V.footer()}</div>`;
  S.platform = '';
  const load = async () => {
    try {
      const r = await api.stoptimes(st.stopId, 30);
      S.deps = r.items;
      const plats = [...new Set(r.items.map(s => s.place && (s.place.track || s.place.stopCode)).filter(Boolean))].sort();
      const pc = $('plat');
      if (pc) { pc.hidden = plats.length < 2; pc.innerHTML = plats.length < 2 ? '' : [''].concat(plats).map(p => `<button class="chip press ${S.platform === p ? 'on' : ''}" data-act="platform" data-p="${esc(p)}" aria-pressed="${S.platform === p}">${p ? 'Platform ' + esc(p) : 'All lines'}</button>`).join(''); }
      paintDeps(); msg('');
    } catch (e) { if (!S.deps) { const d = $('deps'); if (d) d.innerHTML = ''; } msg(esc(api.friendly(e))); }
  };
  load();
  const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 15000);
  cleanup(() => { clearInterval(t); S.deps = null; });
}
function paintDeps() { const d = $('deps'); if (d && S.deps) d.innerHTML = V.depRows(S.deps, S.platform, Date.now()); }
const openStop = p => go('stop', { stop: { name: p.name, lat: p.lat, lon: p.lon, stopId: p.stopId, sub: p.sub || 'Stop' } });

// ================= live tracking =================
function showTrack(cur) {
  const t = S.track = cur.target;
  mapScreen(`<div class="screen mapscreen"><div class="mapwrap tall"><div class="mapel" id="map"></div>${mapButtons}</div>
    <div class="msheet" id="tsheet" aria-live="polite"></div></div>`);
  const map = makeMap($('map'));
  attachMe(map);
  $('dirbtn').innerHTML = dirLabel();
  const sheet = $('tsheet');
  sheet.innerHTML = V.trackSheet(t, null, '');
  let fitted = false, vibrated = {}, lastVm = null;
  let lock = null;
  const wake = async () => { try { if (navigator.wakeLock) lock = await navigator.wakeLock.request('screen'); } catch (e) {} };
  wake();
  const onVis = () => { if (document.visibilityState === 'visible') wake(); };
  document.addEventListener('visibilitychange', onVis);
  cleanup(() => { document.removeEventListener('visibilitychange', onVis); try { lock && lock.release(); } catch (e) {} });

  const tracker = createTracker({
    target: t, city: city(),
    onUpdate: vm => {
      lastVm = vm; S.vm = vm;
      sheet.innerHTML = V.trackSheet(t, vm, '');
      const tr = vm.trip, col = MODE_COLOR[tr.kind] || MODE_COLOR.other;
      const tgt = tr.stops[vm.targetIndex];
      // faint full route, solid from the vehicle to the target stop
      const solid = [];
      if (!vm.metro && vm.pos) {
        const ref = tr.stops[Math.max(0, vm.currentIndex)];
        solid.push(vm.pos);
        for (let i = 0; i < tr.coords.length; i++) if (tr.cum[i] > ref.along && tr.cum[i] < tgt.along) solid.push(tr.coords[i]);
        solid.push([tgt.lon, tgt.lat]);
      }
      map.setRoute([{ coords: tr.coords, color: col, opacity: solid.length ? 0.35 : 1 }].concat(solid.length > 1 ? [{ coords: solid, color: col }] : []),
        [{ lon: tgt.lon, lat: tgt.lat, color: '#0a63ce', r: 8 }].concat(tr.stops.filter((s, i) => i !== vm.targetIndex && i > vm.currentIndex && i <= vm.targetIndex).map(s => ({ lon: s.lon, lat: s.lat, color: col, r: 4 }))));
      map.setVehicles(vm.pos ? [{ id: 'v', line: tr.line, kind: tr.kind, pos: vm.pos, source: vm.source }] : []);
      if (!fitted) { fitted = true; map.fit(vm.pos ? [vm.pos, [tgt.lon, tgt.lat]].concat(loc.state.pos ? [[loc.state.pos.lon, loc.state.pos.lat]] : []) : tr.coords, 70); }
      // one stop away → vibrate once (phones without vibration still show the message in the sheet)
      const near = vm.metro ? vm.departMs <= 60000 && vm.departMs > -30000 : vm.stopsAway != null && vm.stopsAway <= 1;
      const key = `${vm.phase}-${vm.targetIndex}`;
      if (near && !vibrated[key]) { vibrated[key] = true; try { navigator.vibrate && navigator.vibrate([250, 120, 250]); } catch (e) {} }
    },
    onError: e => { sheet.innerHTML = V.trackSheet(t, lastVm, api.friendly(e)); }
  });
  tracker.start();
  cleanup(() => tracker.stop());
  const tick = setInterval(() => { if (lastVm && $('tsheet')) sheet.innerHTML = V.trackSheet(t, lastVm, ''); }, 1000);   // "updated 8 s ago"
  cleanup(() => clearInterval(tick));
}

// ================= settings =================
function showSettings() {
  const d = store.get();
  app.innerHTML = V.settings({ places: d.places, settings: d.settings, account: accountState, accountAvailable });
}

// ================= overlays =================
let overlayEl = null, lastFocus = null;
function openOverlay(html) {
  closeOverlay();
  lastFocus = document.activeElement;
  const w = document.createElement('div'); w.innerHTML = html; overlayEl = w.firstElementChild;
  document.body.appendChild(overlayEl);
  const first = overlayEl.querySelector('input,textarea,button.done,button');
  if (first && first.tagName !== 'BUTTON') first.focus();
  return overlayEl;
}
function closeOverlay() { if (overlayEl) { overlayEl.remove(); overlayEl = null; try { lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); } catch (e) {} } }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

function confirmDialog({ title, body, ok, danger = true }) {
  return new Promise(res => {
    const el = openOverlay(V.dialog({ title, body: `<p>${body}</p>`, actions: `<button class="btn ${danger ? 'red' : ''} press" data-x="ok">${esc(ok)}</button><button class="btn gray press" data-x="no">Cancel</button>` }));
    el.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) { closeOverlay(); res(b.dataset.x === 'ok'); } else if (e.target === el) res(false); });
  });
}

function whenSheet() {
  let mode = S.when.mode, at = S.when.at || toLocalInput(new Date(Date.now() + 3600000));
  const el = openOverlay(V.dialog({
    title: 'When', body: `<div class="card">${[['now', 'Leave now'], ['dep', 'Depart at'], ['arr', 'Arrive by']].map(([k, l]) => `<button class="opt press" data-m="${k}" role="radio" aria-checked="${mode === k}">${l}<span class="ck">${mode === k ? V.ic('check', 20, 2.4) : ''}</span></button>`).join('')}</div>
      <label style="display:block;margin-top:10px"><span class="sr">Date and time</span><input class="field" id="whenat" type="datetime-local" value="${esc(S.when.at ? toLocalInput(new Date(S.when.at)) : at)}" ${mode === 'now' ? 'hidden' : ''}></label>`,
    actions: '<button class="btn press" data-x="ok">Done</button>'
  }));
  el.addEventListener('click', e => {
    const m = e.target.closest('[data-m]');
    if (m) { mode = m.dataset.m; el.querySelectorAll('[data-m]').forEach(b => { b.setAttribute('aria-checked', b.dataset.m === mode); b.querySelector('.ck').innerHTML = b.dataset.m === mode ? V.ic('check', 20, 2.4) : ''; }); $('whenat').hidden = mode === 'now'; return; }
    if (e.target.closest('[data-x]')) {
      const v = $('whenat').value;
      S.when = mode === 'now' || !v ? { mode: 'now', at: null } : { mode, at: new Date(v).toISOString() };
      closeOverlay(); whenChanged();
    } else if (e.target === el) closeOverlay();
  });
}
function modesSheet() {
  const el = openOverlay(V.dialog({
    title: 'Transport modes',
    body: `<div class="card">${Object.entries(api.MODE_FILTERS).map(([k, f]) => `<button class="opt press" data-k="${k}" role="radio" aria-checked="${S.mode === k}">${esc(f.label)}<span class="ck">${S.mode === k ? V.ic('check', 20, 2.4) : ''}</span></button>`).join('')}</div>`, actions: ''
  }));
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-k]');
    if (b) { S.mode = b.dataset.k; closeOverlay(); whenChanged(); } else if (e.target === el) closeOverlay();
  });
}
function whenChanged() {
  const cur = stack[stack.length - 1].screen;
  if (cur === 'results') { S.results = { itins: [], next: null, loading: true, error: '' }; show(); }
  else showHome();
}

function cityOverlay() {
  const el = openOverlay(V.citySheet(CITIES, store.get().city, '', ''));
  const list = () => $('citylist');
  el.addEventListener('input', e => { if (e.target.id === 'cityq') { const q = fold(e.target.value); list().innerHTML = V.cityRows(CITIES.filter(c => fold(c.name + ' ' + c.sub).includes(q)), store.get().city); } });
  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'pick-city') { store.setCity(b.dataset.id); closeOverlay(); if (stack[stack.length - 1].screen === 'home') showHome(); }
    if (b.dataset.act === 'city-gps') {
      b.querySelector('.t2:last-child').textContent = 'locating…';
      try {
        const p = await loc.getPosition();
        const near = CITIES.map(c => ({ c, d: dist(p.lat, p.lon, c.lat, c.lon) })).sort((a, b) => a.d - b.d)[0];
        if (near.d > 60000) { b.querySelector('.t2:last-child').textContent = 'no preset city nearby'; return; }
        store.setCity(near.c.id); closeOverlay(); if (stack[stack.length - 1].screen === 'home') showHome();
      } catch (err) { b.querySelector('.t2:last-child').textContent = 'not available'; }
    }
  });
}

// ----- places: Home / Work -----
function placePicker(kind) {
  const label = kind === 'home' ? 'Home' : 'Work';
  const el = openOverlay(V.dialog({
    title: `Set ${label}`, body: `<label class="search">${V.ic('search', 18)}<span class="sr">Address or place</span><input id="pq" placeholder="Address or place" autocomplete="off"></label><div id="pres"></div><p>Saved on this device only${accountAvailable ? ' (and in your account if you sign in)' : ''}.</p>`, actions: '<button class="btn gray press" data-x="no">Cancel</button>'
  }));
  let items = [], seq = 0, timer = null;
  el.addEventListener('input', e => {
    if (e.target.id !== 'pq') return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const q = e.target.value.trim(), my = ++seq;
      if (q.length < 2) { $('pres').innerHTML = ''; return; }
      try { items = await api.geocode(q, city(), 5); if (my === seq) $('pres').innerHTML = `<div class="card" style="margin-top:10px">${items.map((p, i) => V.placeRow(p, 'pick-p', `data-i="${i}"`)).join('')}</div>`; }
      catch (err) { $('pres').innerHTML = `<div class="err">${esc(api.friendly(err))}</div>`; }
    }, 250);
  });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-act="pick-p"]');
    if (b) { const p = items[+b.dataset.i]; store.savePlace({ ...p, kind, name: label, sub: p.name }); closeOverlay(); showHome(); }
    else if (e.target.closest('[data-x]') || e.target === el) closeOverlay();
  });
}

// ----- export / import -----
async function saveJson(name, obj) {
  const text = JSON.stringify(obj, null, 2);
  const file = new File([text], name, { type: 'application/json' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(file), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function exportDialog() {
  const link = store.shareLink(), n = store.get().places.length;
  const el = openOverlay(V.dialog({
    title: 'Export saved places',
    body: n ? `<p>${n} place${n === 1 ? '' : 's'}. The file or link contains only your saved places — import it on another phone or browser.</p><button class="btn press" data-x="file">${V.ic('dl', 18)}Download file</button>
      <label style="display:block;margin-top:12px"><span style="font-size:13px;font-weight:600;color:var(--text2)">Share link</span><textarea class="field" id="lnk" readonly rows="3">${esc(link)}</textarea></label>
      <button class="btn gray press" data-x="copy">Copy link</button>` : '<p>You have no saved places yet.</p>',
    actions: '<button class="btn gray press" data-x="no">Close</button>'
  }));
  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-x]');
    if (!b) { if (e.target === el) closeOverlay(); return; }
    if (b.dataset.x === 'file') saveJson('routes-saved-places.json', store.exportPlaces());
    else if (b.dataset.x === 'copy') {
      try { if (navigator.share && /iPhone|iPad|Android/.test(navigator.userAgent)) { await navigator.share({ url: link }); return; } await navigator.clipboard.writeText(link); b.textContent = 'Copied'; }
      catch (err) { const t = $('lnk'); t.focus(); t.select(); b.textContent = 'Select the link above and copy it'; }
    } else closeOverlay();
  });
}
function importDialog(prefill) {
  const el = openOverlay(V.dialog({
    title: 'Import saved places',
    body: `<p>Choose a file you exported earlier, or paste a share link. Places are added to the ones you already have.</p>
      <label class="btn gray press" style="cursor:pointer">Choose a file<input id="ifile" type="file" accept=".json,application/json" class="sr"></label>
      <label style="display:block;margin-top:12px"><span style="font-size:13px;font-weight:600;color:var(--text2)">Or paste a link</span><textarea class="field" id="itext" rows="3" placeholder="https://…#import=…">${esc(prefill || '')}</textarea></label><div id="imsg"></div>`,
    actions: '<button class="btn press" data-x="go">Import</button><button class="btn gray press" data-x="no">Cancel</button>'
  }));
  const run = text => {
    try {
      const places = store.parseImport(text);
      store.importPlaces(places); closeOverlay();
      if (stack[stack.length - 1].screen === 'settings') showSettings(); else showHome();
    } catch (err) { $('imsg').innerHTML = `<div class="err" role="alert">${esc(err.message)}</div>`; }
  };
  el.addEventListener('change', e => { if (e.target.id === 'ifile' && e.target.files[0]) { const r = new FileReader(); r.onload = () => run(String(r.result)); r.onerror = () => { $('imsg').innerHTML = '<div class="err">Could not read the file.</div>'; }; r.readAsText(e.target.files[0]); } });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-x]');
    if (b && b.dataset.x === 'go') run($('itext').value);
    else if (b || e.target === el) closeOverlay();
  });
}

// ================= actions =================
const A = {
  back, city: cityOverlay, when: whenSheet, modes: modesSheet,
  settings: () => go('settings'),
  swap() {
    let f = S.from;
    if (f.gps) { const p = loc.state.pos; f = p ? { kind: 'place', name: 'Current location', lat: p.lat, lon: p.lon } : null; }
    if (!f || f.typed) { msg('Choose a starting point first.'); return; }
    const t = S.to;
    S.from = t || { gps: true }; S.fromText = t ? t.name : 'Current location';
    S.to = f; S.toText = f.name;
    showHome();
  },
    'set-home': () => placePicker('home'), 'set-work': () => placePicker('work'),
  'use-gps': () => { setField('from', { gps: true }); afterPick('from'); },
  'pick-sugg'(b) { const p = sugItems[+b.dataset.i]; if (!p) return; setField(activeField, p); afterPick(activeField); },
  'pick-saved'(b) { const p = store.get().places.find(x => x.id === b.dataset.id); if (p) { setField('to', p); search(); } },
  'pick-recent'(b) { const p = store.get().history[+b.dataset.i]; if (p) { setField('to', p); search(); } },
  nearby: () => loadNearby(true),
  'open-stop'(b) { const s = S.nearby && S.nearby[+b.dataset.i]; if (s) openStop(s); },
  retry() { S.results = { itins: [], next: null, loading: true, error: '' }; loadResults(false); },
  later() { loadResults(true); },
  sort(b) { S.sort = S.sort === b.dataset.s ? 'best' : b.dataset.s; showResults(); },
  'open-itin'(b) { const it = S.shown[+b.dataset.i]; if (it) go('route', { itin: it }); },
  track(b) {
    const l = S.itin.legs[+b.dataset.i], kind = modeKind(l.mode);
    go('track', { target: { tripId: l.tripId, line: lineName(l), kind, headsign: l.headsign || '', stopId: l.from.stopId, stopName: l.from.name, alightStopId: l.to.stopId } });
  },
  'track-dep'(b) {
    const s = S.deps[+b.dataset.i]; if (!s || !s.tripId || s.cancelled || s.tripCancelled) return;
    go('track', { target: { tripId: s.tripId, line: lineName(s), kind: modeKind(s.mode), headsign: s.headsign || '', stopId: s.place.stopId || S.stop.stopId, stopName: s.place.name || S.stop.name } });
  },
  platform(b) { S.platform = b.dataset.p; document.querySelectorAll('#plat .chip').forEach(c => { const on = c.dataset.p === S.platform; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }); paintDeps(); },
  'save-stop'() {
    const st = S.stop, id = store.placeId({ kind: 'stop', stopId: st.stopId, lat: st.lat, lon: st.lon });
    if (store.isSaved(id)) store.removePlace(id); else store.savePlace({ kind: 'stop', name: st.name, sub: 'Stop', lat: st.lat, lon: st.lon, stopId: st.stopId });
    showStop(stack[stack.length - 1]);
  },
  dir: toggleDirection,
  'center-me'() {
    const p = loc.state.pos;
    if (p && currentMap) currentMap.flyTo(p.lon, p.lat, 15);
    else { const w = document.querySelector('.mapwrap'); if (w && !w.querySelector('.mapmsg')) { w.insertAdjacentHTML('afterbegin', `<div class="mapmsg" role="status" data-act="dismiss">${esc(loc.state.error || 'Waiting for your position…')}</div>`); } }
  },
  dismiss(b) { b.remove(); },
  'close-overlay': closeOverlay,
  'remove-place'(b) { store.removePlace(b.dataset.id); showSettings(); },
  'clear-history': async () => { if (await confirmDialog({ title: 'Clear search history?', body: 'Your recent searches are removed from this phone' + (accountState.signedIn ? ' and from your account.' : '.'), ok: 'Clear history' })) { store.clearHistory(); showSettings(); } },
  export: exportDialog, import: () => importDialog(''),
  'pick-city': () => {}, 'city-gps': () => {}, 'pick-p': () => {},   // handled by their own dialogs
  signin: async () => { try { await signIn(); } catch (e) { accountState = { ...accountState, error: 'Sign-in is not available right now.' }; showSettings(); } },
  signout: async () => { await signOutUser(); showSettings(); },
  'export-cloud': async () => { try { await saveJson('routes-my-data.json', await exportCloud()); } catch (e) { setAccountError('Could not export your data: ' + (e.message || e.code)); } },
  'delete-data': async () => {
    if (!await confirmDialog({ title: 'Delete my Routes data?', body: 'This permanently deletes your saved places, search history and settings from your account and from this phone. Your Google sign-in stays.', ok: 'Delete my data' })) return;
    try { await deleteMyData(); showSettings(); } catch (e) { setAccountError('Could not delete your data: ' + (e.message || e.code)); }
  },
  'delete-account': async () => {
    if (!await confirmDialog({ title: 'Delete account?', body: 'This permanently deletes your Routes data and your sign-in account. You may be asked to sign in with Google once more to confirm. This cannot be undone.', ok: 'Delete account' })) return;
    try { await deleteAccount(); showSettings(); } catch (e) { setAccountError('Could not delete the account: ' + (e.message || e.code)); }
  }
};
function setAccountError(t) { accountState = { ...accountState, error: t }; if (stack[stack.length - 1].screen === 'settings') showSettings(); }

document.addEventListener('click', e => {
  let b = e.target.closest('[data-act]');
  if (!b) return;
  if (b.classList.contains('overlay') && e.target !== b) return;      // a click inside the dialog is not a click on the backdrop
  const f = A[b.dataset.act];
  if (!f) return;
  f(b, e);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'from' || t.id === 'to') { activeField = t.id; if (t.id === 'to') S.toText = t.value; else S.fromText = t.value; if (t.id === 'to') S.to = null; else if (!/^current location$/i.test(t.value.trim())) S.from = { typed: true }; debouncedSuggest(t.id); }
});
document.addEventListener('focusin', e => {
  const t = e.target;
  if (t.id === 'from' || t.id === 'to') { activeField = t.id; if (t.id === 'from') { t.select(); suggest('from'); } }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.target.id === 'to' || e.target.id === 'from')) {
    e.preventDefault();
    if (sugItems.length && e.target.value.trim().length > 1 && !$('sugg').hidden) { const p = sugItems[0]; setField(activeField, p); afterPick(activeField); }
    else if (e.target.id === 'from') $('to').focus();
  }
});
document.addEventListener('change', e => {
  const k = e.target.dataset && e.target.dataset.set;
  if (!k) return;
  store.setSettings({ [k]: e.target.checked });
  if (k === 'direction' && e.target.checked && loc.state.users > 0) loc.enableCompass();
});

// ================= start =================
initAccount(st => {
  accountState = st;
  if (stack[stack.length - 1].screen === 'settings' && !overlayEl) showSettings();
});
show();
// a share link opened on this device: #import=...
if (/^#import=/.test(location.hash)) {
  const text = location.hash;
  try { history.replaceState({ d: 1 }, '', location.pathname + location.search); } catch (e) {}
  try {
    const places = store.parseImport(text);
    confirmDialog({ title: 'Import saved places?', body: `This link contains ${places.length} saved place${places.length === 1 ? '' : 's'}. They are added to the ones on this device.`, ok: 'Import', danger: false })
      .then(ok => { if (ok) { store.importPlaces(places); showHome(); } });
  } catch (e) { importDialog(text); }
}

// Service worker with automatic updates: check for a new version on launch and whenever the app
// returns to the foreground (iOS resumes installed apps without reloading them). When a new
// version takes over, reload once — unless the user is typing; then wait until later.
if ('serviceWorker' in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  let updatePending = false, reloading = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };
  const applyUpdate = () => { if (reloading) return; if (busy()) { updatePending = true; return; } reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) applyUpdate(); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (updatePending) applyUpdate(); else reg.update().catch(() => {});
    });
  }).catch(() => {});
  // show the running version (the service worker's cache name, e.g. "routes-v1" → "v1") at the bottom of the app
  navigator.serviceWorker.ready.then(reg => {
    if (!reg.active) return;
    const ch = new MessageChannel();
    ch.port1.onmessage = e => { const v = String(e.data || '').replace(/^.*-(v\d+)$/, '$1'); if (v) document.documentElement.style.setProperty('--app-ver', JSON.stringify(v)); };
    reg.active.postMessage('version', [ch.port2]);
  }).catch(() => {});
}
