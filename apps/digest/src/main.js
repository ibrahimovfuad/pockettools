// Weekly Digest — entry point. Edit this file, then run "npm run build" and commit public/app.js.
// The app only reads what Mood, Habits, Spend and Bookshelf already store (same Firebase project and account).
// Its single write is a tiny weekly snapshot (users/{uid}/digest_weeks) used to count removed quotes.
import { $, esc, iso, today } from './util.js';
import { makeStore, DEMO, authError } from './backend.js';
import { buildContext, digestFor, pastWeeks, removedQuotes, weekAt } from './digest.js';
import { COLORS, LABELS, CLOSE_ICON, storyBody, storyFoot, reportBody } from './views.js';

// ================= Toast =================
let toastId;
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastId); toastId = setTimeout(() => e.classList.remove('show'), 2600); }

const store = makeStore(m => toast(m));

// ================= State =================
const NAMES = ['days', 'habits', 'logs', 'exps', 'cats', 'books', 'quotes', 'snaps', 'meta'];
let user = null, ctx = null, raw = {}, loaded = new Set(), fresh = new Set(), giveUp = false, timer = 0, openedFromPush = false;
const resetData = () => { raw = { days: [], habits: [], logs: [], exps: [], cats: [], books: [], quotes: [], snaps: [], meta: {} }; loaded = new Set(); fresh = new Set(); giveUp = false; ctx = null; };
resetData();
// ready = every collection arrived from the server (or from the offline cache after a few seconds)
const ready = () => NAMES.every(k => loaded.has(k)) && (giveUp || NAMES.every(k => fresh.has(k)));

let pending = 0;
function changed() { clearTimeout(pending); pending = setTimeout(update, 60); }
function update() {
  if (!user || !ready()) { renderHome(); return; }
  ctx = buildContext(raw);
  renderHome();
  syncSnapshot();
  if (openedFromPush) { openedFromPush = false; history.replaceState(null, '', location.pathname); openStories(0); }
}

// ================= Weekly snapshot (for "quotes removed") =================
function syncSnapshot() {
  if (DEMO || !ctx || !fresh.has('quotes') || !fresh.has('snaps')) return;
  const w = weekAt(0), total = raw.quotes.length, cur = ctx.snaps.get(w.id), removed = removedQuotes(ctx, w);
  if (cur && cur.quotes === total && (removed === null || cur.removed === removed)) return;
  store.saveSnapshot(user.uid, w.id, { quotes: total, ts: Date.now(), ...(removed === null ? {} : { removed }) });
}

// ================= Home =================
function renderHome() {
  const home = $('home');
  if (!user) { home.innerHTML = ''; return; }
  const demo = DEMO ? '<div class="demo-banner">Demo mode: this is sample data, not yours. Nothing is stored.</div>' : '';
  let body;
  if (!ctx) {
    body = '<div class="sect">This week</div><div class="empty" role="status">Loading your week…</div>';
  } else {
    const d = digestFor(ctx, 0), past = pastWeeks(ctx);
    const tiles = d.cover.tiles.filter(t => t.k !== 'reading').slice(0, 3);
    const hero = `<button class="hero press" id="heroBtn" aria-label="Open this week’s digest, week ${d.w.num}">
      <span class="k">Week ${d.w.num} · ${esc(d.w.label)}</span>
      <span class="h">${d.anyData ? esc(d.cover.headline) : 'Nothing yet'}</span>
      <span class="p">${d.anyData ? esc(d.cover.lead) : 'Rate a day in Mood, tick a habit, log an expense in Spend or update a book in Bookshelf — your digest fills in as you go.'}</span>
      ${tiles.length ? `<span class="tiles">${tiles.map(t => `<span class="tile t-${t.k}"><span class="n">${esc(t.name)}</span><b>${esc(t.val)}</b><i>${esc(t.unit)}</i></span>`).join('')}</span>` : ''}
      <span class="go">Watch the stories ›</span></button>`;
    const rows = past.length ? `<div class="group">${past.map(({ offset, d: p }) => `<button class="row press" data-wk="${offset}"><span class="grow">Week ${p.w.num} · ${esc(p.w.label)}<span class="small">${esc(p.line || 'Tap to open')}</span></span><svg class="chev" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l6 6-6 6"/></svg></button>`).join('')}</div>`
      : '<div class="empty">Earlier weeks will appear here once you have some data.</div>';
    body = `<div class="sect">This week</div>${hero}<div class="sect">Earlier weeks</div>${rows}`;
  }
  home.innerHTML = `<h1 class="large">Weekly Digest</h1><div class="sub">Your week in review: mood, habits, spending and reading.</div>${demo}${body}
    <div class="sect">Sunday reminder</div>
    <div class="group"><label class="row"><span class="grow">Notify me on Sunday</span><input type="checkbox" class="switch" id="remOn" aria-describedby="remNote"></label>
      <button class="row link hide" id="remTest">Send a test notification</button></div>
    <div class="foot" id="remNote" role="status"></div>
    <div class="sect">Account</div>
    <div class="group"><div class="row"><span class="grow">${esc(user.name)}<span class="small">${esc(user.email)}</span></span></div>
      <button class="row danger press" id="signOut">Sign Out</button></div>
    <footer><a class="nf src" href="https://github.com/ibrahimovfuad/pockettools" target="_blank" rel="noopener">Open source on GitHub</a>
      <a class="nf tight" href="https://www.netlify.com" target="_blank" rel="noopener">This site is powered by Netlify</a><div class="app-ver"></div></footer>`;
  renderRem();
}

$('home').addEventListener('click', e => {
  const t = e.target.closest('#heroBtn,[data-wk],#signOut,#remTest');
  if (!t) return;
  if (t.id === 'heroBtn') openStories(0);
  else if (t.dataset.wk) openStories(+t.dataset.wk);
  else if (t.id === 'signOut') store.signOut().then(() => { if (DEMO) toast('There is nothing to sign out of in demo mode'); });
  else if (t.id === 'remTest') testPush();
});
$('home').addEventListener('change', e => { if (e.target.id === 'remOn') togglePush(); });

// ================= Stories =================
const DUR = 6000;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = { d: null, i: 0, elapsed: 0, paused: false, held: false, swallow: false, raf: 0, last: 0, opener: null, down: null, holdT: 0, car: false };

function openStories(offset) {
  if (!ctx) return;
  S.d = digestFor(ctx, offset); S.i = 0; S.elapsed = 0; S.paused = false; S.held = false; S.last = 0; S.opener = document.activeElement;
  const n = S.d.stories.length;
  $('stories').innerHTML = `<div class="st" id="st">
    <button class="zone prev" id="zPrev" aria-label="Previous story"></button><button class="zone next" id="zNext" aria-label="Next story"></button>
    <div class="ui">
      <div class="sprog" id="sProg" aria-hidden="true">${'<span><i></i></span>'.repeat(n)}</div>
      <div class="shead"><div class="who"><span class="av" aria-hidden="true">PT</span><div><b id="sLabel"></b><small id="sSub"></small></div></div>
        <button class="x press" id="sClose" aria-label="Close">${CLOSE_ICON}</button></div>
      <div class="sbody" id="sBody"><div class="sin" id="sIn"></div></div>
      <div class="sfoot" id="sFoot"></div>
    </div></div>`;
  $('stories').classList.add('open');
  $('app').setAttribute('aria-hidden', 'true');
  show();
  $('sClose').focus({ preventScroll: true });
  cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(tick);
}

function closeStories() {
  if (!$('stories').classList.contains('open')) return;
  cancelAnimationFrame(S.raf); clearTimeout(S.holdT);
  $('stories').classList.remove('open'); $('stories').innerHTML = '';
  $('app').removeAttribute('aria-hidden');
  if (S.opener && S.opener.focus && document.contains(S.opener)) S.opener.focus({ preventScroll: true });
  S.d = null;
}

const autoplay = () => !!S.d && !reduced() && S.i < S.d.stories.length - 1;

function show() {
  const d = S.d, kind = d.stories[S.i], st = $('st');
  st.style.background = COLORS[kind];
  $('sLabel').textContent = LABELS[kind];
  $('sSub').textContent = `Week ${d.w.num} · ${d.w.label}`;
  $('sFoot').textContent = storyFoot(kind);
  const inn = $('sIn');
  inn.style.transform = ''; inn.style.width = '';
  inn.innerHTML = storyBody(d, kind, false);
  // too much content for a small phone: shrink it a little instead of cutting it off
  const k = $('sBody').clientHeight / (inn.scrollHeight || 1);
  if (k < 1) { inn.style.transform = `scale(${k})`; inn.style.width = `${100 / k}%`; }
  const fills = $('sProg').children;
  [...fills].forEach((s, i) => { s.className = i < S.i ? 'done' : ''; s.firstChild.style.transform = ''; });
  progress();
  // the books carousel: dots follow the swipe
  const car = inn.querySelector('.car');
  if (car) car.addEventListener('scroll', () => {
    const dots = inn.querySelectorAll('.cdots i'), first = car.firstElementChild;
    if (!first || !dots.length) return;
    const idx = Math.min(dots.length - 1, Math.round(car.scrollLeft / (first.offsetWidth + 10)));
    dots.forEach((x, i) => x.classList.toggle('on', i === idx));
  }, { passive: true });
}

function progress() {
  const seg = $('sProg') && $('sProg').children[S.i];
  if (!seg) return;
  seg.firstChild.style.transform = autoplay() ? `scaleX(${Math.min(1, S.elapsed / DUR)})` : 'none';
}
function tick(ts) {
  S.raf = requestAnimationFrame(tick);
  const dt = S.last ? Math.min(ts - S.last, 100) : 0; S.last = ts;
  if (!S.d || S.paused || document.hidden || !autoplay()) return;
  S.elapsed += dt; progress();
  if (S.elapsed >= DUR) go(S.i + 1);
}
function go(i) {
  if (!S.d) return;
  if (i < 0) i = 0;
  if (i > S.d.stories.length - 1) return;
  S.i = i; S.elapsed = 0; show();
}

// taps, press-and-hold, swipe down
const stories = $('stories');
stories.addEventListener('pointerdown', e => {
  if (!S.d || e.target.closest('.x,[data-act]')) return;
  if (e.target.closest('.car')) { S.paused = true; S.car = true; return; }
  S.down = { x: e.clientX, y: e.clientY, id: e.pointerId };
  clearTimeout(S.holdT); S.holdT = setTimeout(() => { S.paused = true; S.held = true; }, 250);
});
stories.addEventListener('pointermove', e => {
  if (!S.down) return;
  if (Math.hypot(e.clientX - S.down.x, e.clientY - S.down.y) > 12 && !S.held) clearTimeout(S.holdT);
});
const release = e => {
  clearTimeout(S.holdT);
  if (S.car) { S.car = false; S.paused = false; return; }
  const down = S.down; S.down = null;
  if (!down) return;
  const dy = e.clientY - down.y, dx = e.clientX - down.x;
  S.paused = false;
  if (e.type === 'pointerup' && dy > 90 && dy > Math.abs(dx) * 1.5) { S.swallow = true; setTimeout(() => { S.swallow = false; }, 50); closeStories(); return; }
  if (S.held) { S.held = false; S.swallow = true; setTimeout(() => { S.swallow = false; }, 50); }
};
stories.addEventListener('pointerup', release);
stories.addEventListener('pointercancel', release);
stories.addEventListener('contextmenu', e => e.preventDefault());
stories.addEventListener('click', e => {
  if (S.swallow) return;
  const t = e.target.closest('#zPrev,#zNext,#sClose,[data-act]');
  if (!t) return;
  if (t.id === 'zPrev') go(S.i - 1);
  else if (t.id === 'zNext') go(S.i + 1);
  else if (t.id === 'sClose') closeStories();
  else if (t.dataset.act === 'share') shareDigest(S.d);
  else if (t.dataset.act === 'report') openReport(S.d);
});
document.addEventListener('keydown', e => {
  if ($('report') && !$('report').classList.contains('hide')) { if (e.key === 'Escape') closeReport(); return; }
  if (!S.d || !stories.classList.contains('open')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(S.i + 1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(S.i - 1); }
  else if (e.key === 'Escape') closeStories();
  else if (e.key === 'Tab') {      // keep the focus inside the stories
    const f = [...stories.querySelectorAll('button,a[href],[tabindex="0"]')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
document.addEventListener('visibilitychange', () => { S.last = 0; });

// ================= Share and full report =================
async function shareDigest(d) {
  const text = d.shareText;
  if (navigator.share) {
    try { await navigator.share({ title: 'Weekly Digest', text }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); toast('Summary copied to the clipboard'); return; } catch (e) {}
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove();
  toast(ok ? 'Summary copied to the clipboard' : 'Could not share or copy the summary');
}

let reportOpener = null;
function openReport(d) {
  reportOpener = document.activeElement;
  const r = $('report');
  r.innerHTML = `<div class="rep"><div class="rnav"><button id="repBack" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>Back</button><button id="repShare">Share</button></div>
    <h1 class="large">Week ${d.w.num}</h1><div class="sub">${esc(d.w.label)} · full report</div>${reportBody(d)}</div>`;
  r.classList.remove('hide'); r.scrollTop = 0;
  S.paused = true;
  $('repBack').focus({ preventScroll: true });
  $('repBack').onclick = closeReport;
  $('repShare').onclick = () => shareDigest(d);
}
function closeReport() {
  $('report').classList.add('hide'); $('report').innerHTML = '';
  S.paused = false;
  if (reportOpener && reportOpener.focus && document.contains(reportOpener)) reportOpener.focus({ preventScroll: true });
}

// book covers: a broken or empty (1×1) image is removed, the generated cover stays
document.addEventListener('error', e => { const t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-cov')) t.remove(); }, true);
document.addEventListener('load', e => { const t = e.target; if (t && t.hasAttribute && t.hasAttribute('data-cov') && t.naturalWidth < 5) t.remove(); }, true);

// ================= Sunday reminder (Web Push via Netlify Functions) =================
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const REM_DEFAULT = 'A notification every Sunday at 19:00 (Warsaw time) when your digest is ready. It never contains your numbers. Optional.';
const rem = { on: false, note: REM_DEFAULT, disabled: false, loaded: false, vapid: null };
let vapidKey = null;

async function reminderApi(body) {
  if (DEMO) return null;
  try {
    const tok = await store.token();
    if (!tok) return null;
    const r = await fetch('/api/reminder', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok }, body: JSON.stringify(body) });
    return r.ok ? r.json() : null;
  } catch (e) { return null; }
}
function renderRem() {
  const on = $('remOn'); if (!on) return;
  on.checked = rem.on; on.disabled = rem.disabled;
  $('remTest').classList.toggle('hide', !rem.on);
  $('remNote').textContent = rem.note;
}
const setRem = (patch) => { Object.assign(rem, patch); renderRem(); };

async function loadReminder() {
  if (DEMO) return setRem({ disabled: true, note: 'Reminders work once Firebase is configured and the app is deployed with its functions.' });
  try {
    const r = await fetch('/api/reminder', { cache: 'no-store' });
    const j = r.ok && (r.headers.get('content-type') || '').includes('json') ? await r.json() : null;
    vapidKey = j && j.vapidPublicKey;
  } catch (e) {}
  if (!vapidKey) return setRem({ disabled: true, note: 'The reminder server is not configured. See the README.' });
  const s = await reminderApi({ action: 'get' });
  let on = !!(s && s.enabled);
  // if permission was revoked on this device, honestly show it as off
  if (on && 'Notification' in window && Notification.permission !== 'granted') on = false;
  setRem({ on, note: REM_DEFAULT, loaded: true });
}

const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)); };

async function togglePush() {
  const on = $('remOn').checked;
  setRem({ on });
  if (!on) { await reminderApi({ action: 'save', enabled: false }); return setRem({ note: 'Reminder is off.' }); }
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return setRem({ on: false, note: isIOS && !standalone ? 'First add the app to your Home Screen (Share → Add to Home Screen), then turn on the reminder there.' : 'This browser does not support notifications.' });
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return setRem({ on: false, note: 'Notifications are blocked. Allow them for this app in your phone settings.' });
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(vapidKey) });
    const r = await reminderApi({ action: 'save', enabled: true, subscription: sub.toJSON() });
    if (!r) throw new Error('server');
    setRem({ on: true, note: 'Done. You will get a notification every Sunday at 19:00 (Warsaw time).' });
  } catch (e) { setRem({ on: false, note: 'Could not turn on the reminder. Please try again.' }); }
}
async function testPush() {
  const r = await reminderApi({ action: 'test' });
  setRem({ note: r && r.devices ? 'Sent. The notification should arrive in a few seconds.' : 'Could not send it. Turn the reminder off and on again.' });
}

// ================= Start-up and sign-in =================
function start() {
  openedFromPush = new URLSearchParams(location.search).get('open') === 'stories';
  store.onUser(u => {
    user = u;
    $('login').classList.toggle('hide', !!u);
    $('app').classList.toggle('hide', !u);
    closeStories(); if (!$('report').classList.contains('hide')) closeReport();
    resetData(); clearTimeout(timer);
    if (!u) { renderHome(); return; }
    renderHome();
    store.listen(u.uid, Object.fromEntries(NAMES.map(k => [k, (a, fromCache) => {
      raw[k] = k === 'meta' ? (a || {}) : a; loaded.add(k);
      if (!fromCache) fresh.add(k);
      changed();
    }])));
    timer = setTimeout(() => { giveUp = true; changed(); }, 4000);   // offline: use what the device has stored
    loadReminder();
  });
  $('signInBtn').onclick = () => { $('loginErr').textContent = ''; store.signIn().catch(e => { $('loginErr').textContent = authError(e); }); };
}

// if the app stays open past midnight, the current week moves forward on its own
let lastDay = iso(today());
const rollover = () => { const t = iso(today()); if (t !== lastDay) { lastDay = t; if (user && ready()) update(); } };
setInterval(rollover, 60000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') rollover(); });

// Service worker with automatic updates: check for a new version on launch and whenever the app
// returns to the foreground (iOS resumes installed apps without reloading them). When a new
// version takes over, reload once — unless the user is typing or watching the stories; then wait until later.
if ('serviceWorker' in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  let updatePending = false, reloading = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || stories.classList.contains('open'); };
  const applyUpdate = () => { if (reloading) return; if (busy()) { updatePending = true; return; } reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) applyUpdate(); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (updatePending) applyUpdate(); else reg.update().catch(() => {});
    });
  }).catch(() => {});
  // show the running version (the service worker's cache name, e.g. "digest-v1" → "v1") at the bottom of the app
  navigator.serviceWorker.ready.then(reg => {
    if (!reg.active) return;
    const ch = new MessageChannel();
    ch.port1.onmessage = e => { const v = String(e.data || '').replace(/^.*-(v\d+)$/, '$1'); if (v) document.documentElement.style.setProperty('--app-ver', JSON.stringify(v)); };
    reg.active.postMessage('version', [ch.port2]);
  }).catch(() => {});
}

start();
