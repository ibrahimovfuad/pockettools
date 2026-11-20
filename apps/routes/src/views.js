// HTML builders (pure functions: data in, markup out). Events are bound in main.js with data-act attributes,
// because the Content-Security-Policy forbids inline handlers.
import { esc, clock, dayLabel, dur, until, minsBetween, ms, modeKind, KIND_NAME, isTransit, lineName, fmtDist, walkMin } from './util.js';

const P = {
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>', chevR: '<path d="M9 5l7 7-7 7"/>', back: '<path d="M15 5l-7 7 7 7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  swap: '<path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/>',
  work: '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M9 7V5h6v2"/>',
  stop: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8 17.5V20M16 17.5V20"/>',
  live: '<path d="M5 12a7 7 0 0 1 7-7M8.5 12A3.5 3.5 0 0 1 12 8.5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 3 3v3M9 11l2.5-4 3 2.5 2.5.5M11.5 7L9 13"/>',
  wait: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  nav: '<path d="M12 3l7 17-7-4-7 4z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  dl: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
};
export const ic = (k, s = 18, sw = 2, color) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || ''}</svg>`;

export const footer = () => `<footer>
  Routes: <a href="https://transitous.org" target="_blank" rel="noopener">Transitous</a> · Data: <a href="https://transitous.org/sources/" target="_blank" rel="noopener">sources</a> · Warsaw vehicles: <a href="https://api.um.warszawa.pl" target="_blank" rel="noopener">Miasto Stołeczne Warszawa</a><br>
  <a href="https://www.netlify.com" target="_blank" rel="noopener">This site is powered by Netlify</a> · <a href="https://github.com/ibrahimovfuad/pockettools" target="_blank" rel="noopener">Open source on GitHub</a>
  <div class="app-ver"></div>
</footer>`;

export const chip = (label, kind, big) => `<span class="lc ${modeKind(kind)}${big ? ' lg' : ''}">${esc(label)}</span>`;
const placeIcon = p => ({ home: 'home', work: 'work', stop: 'stop' }[p.kind] || 'pin');

export const placeRow = (p, act, attrs = '') => `<button class="row press" data-act="${act}" ${attrs}>
  <span class="ico">${ic(placeIcon(p), 18)}</span>
  <span class="tx"><span class="t1">${esc(p.name)}</span><span class="t2">${esc(p.sub || '')}</span></span>${ic('chevR', 16, 2.2)}</button>`;

export function home(c) {
  const rows = [];
  for (const k of ['home', 'work']) {
    const p = c.places.find(x => x.kind === k);
    rows.push(p ? placeRow(p, 'pick-saved', `data-id="${esc(p.id)}"`)
      : `<button class="row press link" data-act="set-${k}"><span class="ico">${ic(k, 18)}</span><span class="tx"><span class="t1">Add ${k === 'home' ? 'Home' : 'Work'}</span><span class="t2">Saved on this device only</span></span></button>`);
  }
  for (const p of c.places.filter(x => x.kind === 'stop' || x.kind === 'place')) rows.push(placeRow(p, 'pick-saved', `data-id="${esc(p.id)}"`));
  c.history.slice(0, 5).forEach((h, i) => rows.push(`<button class="row press" data-act="pick-recent" data-i="${i}"><span class="ico">${ic('clock', 18)}</span><span class="tx"><span class="t1">${esc(h.name)}</span><span class="t2">${esc(h.sub || 'Recent search')}</span></span>${ic('chevR', 16, 2.2)}</button>`));
  return `<div class="screen" id="scr">
  <div class="top"><h1>Routes</h1><div style="display:flex;align-items:center;gap:4px">
    <button class="pill press" data-act="city" aria-label="Choose city, now ${esc(c.city.name)}">${ic('pin', 16)}${esc(c.city.name)}${ic('chevD', 14, 2.4)}</button>
    <button class="ib neg press" data-act="settings" aria-label="Settings">${ic('gear', 22)}</button></div></div>
  <div class="sbox rise">
    <div class="gut" aria-hidden="true"><span class="d"></span><span class="l"></span>${ic('pin', 14, 2.6)}</div>
    <div class="fields">
      <label><span class="sr">From</span><input id="from" class="from" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" placeholder="From" value="${esc(c.fromText)}"></label>
      <div class="sep"></div>
      <label><span class="sr">To</span><input id="to" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="Where to?" value="${esc(c.toText)}"></label>
    </div>
    <button class="ib press" data-act="swap" aria-label="Swap from and to">${ic('swap', 20)}</button>
  </div>
  <div class="chips rise">
    <button class="chip press" data-act="when">${ic('clock', 15)}${esc(c.whenLabel)}${ic('chevD', 12, 2.4)}</button>
    <button class="chip press" data-act="modes">${esc(c.modeLabel)}${ic('chevD', 12, 2.4)}</button>
  </div>
  <div id="msg"></div>
  <div id="sugg" hidden></div>
  <div id="main">
    <div class="sec">Saved &amp; recent</div>
    <div class="card">${rows.join('')}</div>
    <div class="sec"><span>Nearby stops</span><span class="live" id="nearlive" hidden>${ic('live', 13, 2.2)}live</span></div>
    <div id="nearby"></div>
  </div>
  ${footer()}</div>`;
}

export const suggestions = (items, fromGps) => `<div class="card" style="margin-top:12px" role="listbox" aria-label="Suggestions">
  ${fromGps ? `<button class="row press link" data-act="use-gps"><span class="ico">${ic('locate', 18)}</span><span class="tx"><span class="t1">Current location</span></span></button>` : ''}
  ${items.map((p, i) => placeRow(p, 'pick-sugg', `data-i="${i}" role="option"`)).join('')}
  ${!items.length && !fromGps ? '<div class="row"><span class="tx"><span class="t2">No places found. Try another spelling.</span></span></div>' : ''}</div>`;

export function nearbyCard(stops) {
  return `<div class="card">${stops.map((s, i) => `<button class="near press" data-act="open-stop" data-i="${i}">
    <div class="hd"><b>${esc(s.name)}</b><span>${esc(s.walk)}</span></div>
    ${s.deps.map(d => `<div class="dep">${chip(d.line, d.mode)}<span class="to">${esc(d.headsign)}</span><span class="when ${d.live ? 'live' : ''}">${d.live ? ic('live', 14, 2.2) : ''}${esc(d.when)}</span></div>`).join('') || '<div class="t2" style="font-size:13px;color:var(--text2);margin-top:6px">No departures soon</div>'}
  </button>`).join('')}</div>`;
}

// ----- results -----
const legChips = itin => itin.legs.map(l => isTransit(l.mode)
  ? chip(lineName(l), l.mode)
  : (l.mode === 'WALK' && Math.round(l.duration / 60) >= 1 ? `<span class="walkc">${ic('walk', 14, 2)}${Math.round(l.duration / 60)}</span>` : '')).filter(Boolean).join('<span class="sepc" aria-hidden="true">›</span>');
export const walkSeconds = itin => itin.legs.filter(l => l.mode === 'WALK').reduce((a, l) => a + l.duration, 0);

export function itinCard(itin, i, now) {
  const first = itin.legs.find(l => isTransit(l.mode));
  const leaves = first ? Math.round((ms(first.startTime) - now) / 60000) : null;
  const n = itin.transfers;
  return `<button class="itin press rise${i === 0 ? ' best' : ''}" data-act="open-itin" data-i="${i}">
    <div class="r1"><span class="a">${clock(itin.startTime)} – ${clock(itin.endTime)}</span><span class="b">${dur(itin.duration)}</span></div>
    <div class="r2">${legChips(itin)}</div>
    <div class="r3"><span class="l">${first ? `${first.realTime ? ic('live', 13, 2.2) : ''}<span>${leaves <= 0 ? 'Leaves now' : leaves < 60 ? `Leaves in ${leaves} min` : `Leaves at ${clock(first.startTime)}`} · ${esc(first.from.name)}</span>` : 'Walk only'}</span><span class="r">${n === 0 ? 'no changes' : n === 1 ? '1 change' : `${n} changes`}</span></div></button>`;
}

// ----- route detail -----
export function delayText(leg) {
  if (leg.cancelled) return { t: 'Cancelled', c: 'var(--red)' };
  if (!leg.realTime) return { t: 'timetable', c: 'var(--text2)' };
  const d = Math.round((ms(leg.startTime) - ms(leg.scheduledStartTime)) / 60000);
  return d <= 0 ? { t: 'live: on time', c: 'var(--green)' } : { t: `live: ${d} min late`, c: '#b45309' };
}
export function legRows(itin) {
  const out = [];
  itin.legs.forEach((l, i) => {
    const next = itin.legs[i + 1];
    const last = i === itin.legs.length - 1;
    const rail = (c, solid) => last ? '' : `<span class="rail${solid ? ' c' : ''}" style="${solid ? `background:${c}` : ''}" aria-hidden="true"></span>`;
    if (isTransit(l.mode)) {
      const kind = modeKind(l.mode), dl = delayText(l);
      const stops = (l.intermediateStops || []);
      out.push(`<div class="leg">${rail(`var(--${kind})`, true)}<div class="m">${chip(lineName(l), l.mode, true)}</div><div class="bd">
        <div class="h"><b>${KIND_NAME[kind]} ${esc(lineName(l))}${l.headsign ? ` → ${esc(l.headsign)}` : ''}</b><span>${clock(l.startTime)}</span></div>
        <div class="s">${esc(l.from.name)} → ${esc(l.to.name)} · ${stops.length + 1} stop${stops.length ? 's' : ''}, ${dur(l.duration)}</div>
        <div class="st" style="color:${dl.c}">${esc(dl.t)}</div>
        ${(l.alerts || []).slice(0, 2).map(a => `<div class="warn">${esc(a.headerText || a.descriptionText || '')}</div>`).join('')}
        ${stops.length ? `<details><summary>Show stops</summary><ul>${[l.from, ...stops, l.to].map(s => `<li><span>${esc(s.name)}</span><span>${clock(s.departure || s.arrival)}</span></li>`).join('')}</ul></details>` : ''}
        ${l.tripId ? `<button class="trackbtn ${kind} press" data-act="track" data-i="${i}">${ic('live', 16, 2.2)}${kind === 'metro' ? `Follow ${esc(lineName(l))} departure` : `Track ${KIND_NAME[kind].toLowerCase()} ${esc(lineName(l))}`}</button>` : ''}
      </div></div>`);
    } else {
      const to = next ? (isTransit(next.mode) ? next.from.name : next.to.name) : l.to.name;
      out.push(`<div class="leg">${rail('', false)}<div class="m">${ic('walk', 22)}</div><div class="bd">
        <div class="h"><b>Walk ${Math.max(1, Math.round(l.duration / 60))} min${l.distance ? ` · ${fmtDist(l.distance)}` : ''}</b><span>${clock(l.startTime)}</span></div>
        <div class="s">to ${esc(to)}</div></div></div>`);
    }
    const gap = next ? minsBetween(l.endTime, next.startTime) : 0;
    if (next && gap >= 2 && (isTransit(next.mode))) {
      out.push(`<div class="leg">${rail('', false)}<div class="m">${ic('wait', 20)}</div><div class="bd"><div class="h"><b>Wait ${gap} min</b><span>${clock(l.endTime)}</span></div><div class="s">at ${esc(next.from.name)}</div></div></div>`);
    }
  });
  return out.join('');
}

// ----- stop departures -----
export function depRows(items, platform, now) {
  const rows = items.filter(s => !platform || (s.place && (s.place.track || s.place.stopCode || '') === platform));
  if (!rows.length) return '<div class="row"><span class="tx"><span class="t2">No departures in the next hours.</span></span></div>';
  return rows.map(s => {
    const t = s.place.departure || s.place.arrival || s.place.scheduledDeparture;
    const when = s.cancelled || s.tripCancelled ? 'cancelled' : until(t, now);
    const live = !!s.realTime && !s.cancelled;
    const late = s.place.scheduledDeparture ? Math.round((ms(t) - ms(s.place.scheduledDeparture)) / 60000) : 0;
    return `<button class="deprow press${s.cancelled || s.tripCancelled ? ' cx' : ''}" data-act="track-dep" data-i="${items.indexOf(s)}">
      ${chip(lineName(s), s.mode, true)}
      <span class="to">${esc(s.headsign || s.tripTo || '')}<small>${clock(t)}${late > 0 ? ` · ${late} min late` : ''}${s.place.track ? ` · platform ${esc(s.place.track)}` : ''}</small></span>
      <span class="w"><b style="color:${live ? 'var(--green)' : 'var(--text)'}">${esc(when)}</b><small style="color:${live ? 'var(--green)' : 'var(--text2)'}">${live ? 'live' : 'timetable'}</small></span></button>`;
  }).join('');
}

// ----- tracking -----
const SOURCE_TEXT = {
  gps: 'Live GPS position',
  realtime: 'Position follows the live timetable (estimated)',
  estimated: 'Estimated from the timetable — no live data for this trip'
};
export function trackSheet(t, vm, err) {
  const kind = t.kind;
  let head, bigHtml = '', small = '';
  if (!vm) {
    head = err ? '' : 'Looking for the vehicle…';
  }
  if (vm) {
    const eta = vm.etaMs == null ? null : Math.max(0, Math.round(vm.etaMs / 60000));
    if (vm.metro) {
      const m = Math.max(0, Math.round(vm.departMs / 60000));
      bigHtml = vm.departMs < -30000 ? `<span style="font-size:20px">left</span>` : m < 1 ? `<span style="font-size:20px">now</span>` : `${m}<small> min</small>`;
      small = `departs ${clock(vm.trip.stops[vm.targetIndex].dep)}`;
    } else if (vm.phase === 'departed') { bigHtml = `<span style="font-size:20px">left</span>`; small = `left ${t.stopName}`; }
    else {
      bigHtml = eta === 0 ? `<span style="font-size:20px">now</span>` : `~${eta}<small> min</small>`;
      small = vm.stopsAway === 0 ? 'at the stop' : vm.stopsAway === 1 ? '1 stop away' : `${vm.stopsAway} stops away`;
    }
  }
  const stops = vm ? vm.trip.stops : [];
  const ti = vm ? vm.targetIndex : 0, ci = vm ? vm.currentIndex : 0;
  // the progress strip: current stop → target stop, up to 4 labels
  let prog = '';
  if (vm && !vm.metro && vm.phase !== 'departed') {
    const lo = Math.min(Math.max(0, ci), ti), hi = Math.max(ci, ti);
    let idx = []; for (let k = lo; k <= hi; k++) idx.push(k);
    if (idx.length > 4) idx = [idx[0], idx[Math.round((idx.length - 1) / 3)], idx[Math.round((idx.length - 1) * 2 / 3)], idx[idx.length - 1]];
    const col = `var(--${kind})`;
    prog = `<div class="prog" aria-hidden="true" style="color:${col}">${idx.map((k, j) => `${j ? `<span class="s" style="background:${k <= ci ? col : 'var(--line)'}"></span>` : ''}<span class="n ${k === ci ? 'cur' : ''} ${k === ti ? 'tg' : ''}" style="border-color:${k === ti ? 'var(--blue)' : col}"></span>`).join('')}</div>
      <div class="plabels"><span>${ci === idx[0] ? 'vehicle' : ''}</span>${idx.slice(1).map(k => `<span${k === ti ? ' style="color:var(--text);font-weight:700"' : ''}>${esc(stops[k].name)}</span>`).join('')}</div>`;
  }
  const upd = vm ? Math.max(0, Math.round((Date.now() - vm.updatedAt) / 1000)) : 0;
  const src = vm ? (vm.metro ? 'Timetable countdown — metro vehicles have no GPS position' : SOURCE_TEXT[vm.source]) : '';
  const delay = vm && !vm.metro && vm.source !== 'estimated' ? (vm.delayMin > 0 ? `${vm.delayMin} min late` : 'on time') : '';
  return `<span class="grab"></span>
  <div style="display:flex;align-items:center;gap:12px">${chip(t.line, kind, true)}
    <div style="flex:1;min-width:0"><div style="font-size:18px;font-weight:800">${t.headsign ? `to ${esc(t.headsign)}` : esc(t.stopName)}</div>
    <div style="font-size:13px;color:var(--text2)">${vm && vm.vehicleId ? `vehicle ${esc(vm.vehicleId)} · ` : ''}${esc(delay || (vm ? KIND_NAME[kind] : ''))}${vm && vm.phase !== 'boarding' && vm.phase ? '' : ` · ${esc(t.stopName)}`}</div></div>
    <div style="text-align:right"><div class="big">${bigHtml}</div><div style="font-size:12px;font-weight:600;color:var(--text2)">${esc(small)}</div></div></div>
  ${prog}
  ${vm && !vm.metro && vm.stopsAway === 1 ? `<div class="note" role="status" style="font-weight:700;color:var(--text)">${vm.phase === 'riding' ? 'Your stop is next.' : 'The vehicle is one stop away.'}</div>` : ''}
  ${vm && vm.cancelled ? '<div class="err">This trip is cancelled.</div>' : ''}
  ${err ? `<div class="err" role="alert">${esc(err)}</div>` : ''}
  ${vm ? `<div class="statusline"><span class="dotg ${vm.source === 'gps' || vm.metro ? 'pulse' : 'est'}"></span><span>${esc(src)}${vm.source === 'gps' ? ` · updated ${upd} s ago` : ''}</span></div>` : ''}
  ${vm && vm.attribution && vm.source === 'gps' ? `<div class="hint" style="margin-top:6px">Vehicle positions: <a href="${esc(vm.attribution.url)}" target="_blank" rel="noopener">${esc(vm.attribution.name)}</a>, downloaded ${new Date(vm.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>` : ''}
  <p class="hint" style="font-size:13px">${vm && vm.metro ? 'Your phone vibrates when the train is about to leave.' : 'Your phone vibrates when the vehicle is one stop away.'} Tracking runs only while the app is open; the screen is kept awake if your browser allows it.</p>
  <button class="btn gray press" data-act="back" style="margin-top:auto">Stop tracking</button>`;
}

// ----- settings -----
export function settings(c) {
  const placeRows = c.places.map(p => `<div class="row"><span class="ico">${ic(placeIcon(p), 18)}</span><span class="tx"><span class="t1">${esc(p.name)}</span><span class="t2">${p.kind === 'stop' ? 'stop · saved' : esc(p.sub || p.kind)}</span></span>
    <button class="ib press" style="width:auto;padding:0 6px;color:var(--red);font-size:14px;font-weight:600" data-act="remove-place" data-id="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">Remove</button></div>`).join('')
    || '<div class="row"><span class="tx"><span class="t2">Nothing saved yet. Add Home or Work on the search screen, or tap the star on a stop.</span></span></div>';
  const sw = (k, label) => `<label class="switch"><span class="t">${label}</span><input type="checkbox" role="switch" data-set="${k}" ${c.settings[k] ? 'checked' : ''}></label>`;
  const a = c.account;
  const account = !c.accountAvailable ? '' : `<div class="sec">Account (optional)</div><div class="card">${a.signedIn ? `
      <div class="row"><span class="tx"><span class="t1">${esc(a.name)}</span><span class="t2">${esc(a.email)} · ${a.sync === 'ok' ? 'synced' : a.sync === 'syncing' ? 'syncing…' : a.sync === 'offline' ? 'offline, will sync later' : ''}</span></span></div>
      <button class="row press link" data-act="signout"><span class="tx"><span class="t1">Sign out</span></span></button>`
    : `<button class="row press link" data-act="signin"><span class="tx"><span class="t1">Sign in with Google</span><span class="t2">Keep saved places and settings in sync between your devices</span></span></button>`}</div>
    ${a.signedIn ? '<div data-pta-host></div>' : ''}
    ${a.error ? `<div class="err" role="alert">${esc(a.error)}</div>` : ''}
    <p class="hint">${a.signedIn ? 'Only what you save here is stored: places, your last 10 searches and these settings. Never your trips or where you have been.' : 'Optional. Routes works fully without an account; signing in only syncs what you save. <a href="https://pockettools2.netlify.app/privacy.html" target="_blank" rel="noopener">Privacy policy</a>'}</p>`;
  return `<div class="screen back-top" id="scr">
  <div class="bar"><button class="ib pos blue press" data-act="back" aria-label="Back">${ic('back', 24, 2.4)}</button></div>
  <h1 class="big">Settings</h1>
  <div class="sec">Saved places</div><div class="card">${placeRows}</div>
  <div class="sec">Map</div><div class="card">
    ${sw('direction', 'Show my direction')}${sw('rotate', 'Rotate map as I turn')}${sw('live', 'Live vehicles on map')}</div>
  <div class="sec">Your data</div><div class="card">
    <button class="row press link" data-act="export"><span class="tx"><span class="t1">Export saved places</span></span>${ic('dl', 18)}</button>
    <button class="row press link" data-act="import"><span class="tx"><span class="t1">Import from a file or link</span></span></button>
    <button class="row press danger" data-act="clear-history"><span class="tx"><span class="t1">Clear search history</span></span></button></div>
  ${account}
  <p class="hint" style="font-size:13px">No ads, no analytics, no tracking. Saved places, history and settings stay on this phone${c.accountAvailable ? ' unless you choose to sign in' : ''}. Only the start and end of a search are sent to the routing service (Transitous) through this app’s own server, which does not log or store them.</p>
  ${footer()}</div>`;
}

export function citySheet(cities, current, query, nearestName) {
  return `<div class="overlay" data-act="close-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="Choose city" data-stop>
    <span class="grab"></span>
    <div class="mh"><h2>City</h2><button class="done press" data-act="close-overlay">Done</button></div>
    <label class="search">${ic('search', 18)}<span class="sr">Search cities</span><input id="cityq" placeholder="Search cities" autocomplete="off" value="${esc(query || '')}"></label>
    <button class="row press link card" data-act="city-gps" style="margin-top:12px;border-radius:14px;min-height:50px"><span class="ico" style="background:transparent">${ic('locate', 20)}</span><span class="tx"><span class="t1">Use my location</span></span><span class="t2" style="font-size:13px;color:var(--text2)">${esc(nearestName || 'finds the nearest city')}</span></button>
    <div class="card" style="margin-top:12px" id="citylist">${cityRows(cities, current)}</div>
    <p class="hint">The city only sets where search and the map start — routes also cross city borders. Coverage depends on the open timetables available through Transitous.</p></div></div>`;
}
export const cityRows = (cities, current) => cities.map(c => `<button class="row press" data-act="pick-city" data-id="${esc(c.id)}"><span class="tx"><span class="t1" style="font-size:17px">${esc(c.name)}</span><span class="t2">${esc(c.sub)}</span></span>${c.id === current ? `<span style="color:var(--blue)">${ic('check', 20, 2.4)}</span>` : ''}</button>`).join('') || '<div class="row"><span class="tx"><span class="t2">No city found.</span></span></div>';

export const dialog = ({ title, body, actions }) => `<div class="overlay" data-act="close-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" data-stop>
  <span class="grab"></span><div class="mh"><h2>${esc(title)}</h2></div>${body}<div style="margin-top:12px">${actions}</div></div></div>`;
