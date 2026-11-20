// A bottom sheet with three snap points: expanded, half (default) and collapsed to a small peek bar, so the map
// behind it can be seen almost full screen. Drag the head up or down (velocity decides the next snap point), tap
// the peek bar or the toggle button to open or close it. The content scrolls inside the sheet only when expanded;
// when it is expanded and scrolled to the top, pulling down moves the sheet instead of the page.
// Markup: see sheetShell() in views.js. The page itself never scrolls on these screens (see "iOS UI pitfalls" in AGENTS.md).
const ORDER = ['collapsed', 'half', 'expanded'];

export function bottomSheet(root, { initial = 'half', onSnap } = {}) {
  const head = root.querySelector('.bs-head'), body = root.querySelector('.bs-body');
  const tg = root.querySelector('.bs-tg'), lbl = tg.querySelector('.bs-lbl');
  const labels = { open: tg.dataset.open || 'Show', close: tg.dataset.close || 'Hide' };
  let snap = initial, H = 0, cur = 0, drag = null, dead = false;
  const vis = { collapsed: 0, half: 0, expanded: 0 };

  function measure() {
    H = root.offsetHeight;
    const pb = parseFloat(getComputedStyle(root).paddingBottom) || 0;
    vis.collapsed = Math.min(H, Math.round(head.offsetHeight + pb));
    vis.expanded = H;
    vis.half = Math.max(vis.collapsed + 100, Math.min(H, Math.round(window.innerHeight * 0.48)));
  }
  const place = (v, animate) => {
    root.style.transition = animate ? '' : 'none';
    root.style.transform = `translate3d(0,${Math.round(H - v)}px,0)`;
    cur = v;
  };
  function set(name, animate = true) {
    if (dead) return;
    snap = name;
    place(vis[name], animate);
    root.dataset.snap = name;
    const open = name !== 'collapsed';
    tg.setAttribute('aria-expanded', String(open));
    lbl.textContent = open ? labels.close : labels.open;
    body.toggleAttribute('inert', !open);                 // nothing hidden below the screen edge can take focus
    root.classList.toggle('scroll', name === 'expanded');
    if (name !== 'expanded') body.scrollTop = 0;
    if (onSnap) onSnap(name, vis[name]);
  }

  // ---- dragging (shared by the head: pointer events, and the body: touch events) ----
  const clamp = v => (v < vis.collapsed ? vis.collapsed - (vis.collapsed - v) * 0.3 : v > H ? H + (v - H) * 0.15 : v);
  function begin(y) { drag = { y0: y, v0: vis[snap], start: snap, active: false, pts: [{ y, t: performance.now() }] }; }
  function move(y) {
    if (!drag) return false;
    if (!drag.active) { if (Math.abs(y - drag.y0) < 6) return false; drag.active = true; }
    drag.pts.push({ y, t: performance.now() }); if (drag.pts.length > 6) drag.pts.shift();
    place(clamp(drag.v0 - (y - drag.y0)), false);
    return true;
  }
  function end() {
    const d = drag; drag = null;
    if (!d || !d.active) return false;
    const a = d.pts[0], b = d.pts[d.pts.length - 1], dt = Math.max(1, b.t - a.t), vy = (b.y - a.y) / dt;   // px per ms, positive = down
    let i = ORDER.indexOf(d.start);
    if (Math.abs(vy) > 0.4) i = Math.max(0, Math.min(2, i + (vy < 0 ? 1 : -1) * (Math.abs(vy) > 1.6 ? 2 : 1)));
    else i = ORDER.reduce((best, n, k) => (Math.abs(vis[n] - cur) < Math.abs(vis[ORDER[best]] - cur) ? k : best), 0);
    set(ORDER[i]);
    return true;
  }
  const toggle = () => set(snap === 'collapsed' ? 'half' : 'collapsed');

  // The move/up listeners live on the window while a drag runs, so the drag continues when the pointer leaves the bar
  const onMove = e => { if (drag) move(e.clientY); };
  const up = e => {
    window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    if (!drag) return;
    const t = drag.target, wasDrag = drag.active;
    if (!end() && e.type === 'pointerup' && !wasDrag && t && !t.closest('button')) set(snap === 'half' ? 'expanded' : 'half');   // tap on the bar (the button has its own click)
    drag = null;
  };
  head.addEventListener('pointerdown', e => {
    if (e.button) return;
    begin(e.clientY); drag.target = e.target;
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
  tg.addEventListener('click', toggle);

  let touch = null;
  body.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touch = { y: t.clientY, top: body.scrollTop <= 0, active: false };
  }, { passive: true });
  body.addEventListener('touchmove', e => {
    if (!touch) return;
    const y = e.touches[0].clientY;
    if (!touch.active) {
      const dy = y - touch.y;
      const mine = snap !== 'expanded' || (touch.top && body.scrollTop <= 0 && dy > 6);   // the list scrolls itself, except when pulled down from its top
      if (!mine || Math.abs(dy) < 6) return;
      touch.active = true; begin(touch.y);
    }
    if (e.cancelable) e.preventDefault();
    move(y);
  }, { passive: false });
  // keyboard and screen-reader users reach every step: focus moving into the content opens the sheet fully
  body.addEventListener('focusin', e => { if (snap !== 'expanded' && e.target.matches && e.target.matches(':focus-visible')) set('expanded'); });
  const touchEnd = () => { if (touch && touch.active) end(); touch = null; };
  body.addEventListener('touchend', touchEnd);
  body.addEventListener('touchcancel', touchEnd);

  const remeasure = () => { measure(); if (!drag) place(vis[snap], false); if (onSnap) onSnap(snap, vis[snap]); };
  measure(); set(initial, false);
  window.addEventListener('resize', remeasure);
  const vv = window.visualViewport;
  if (vv) vv.addEventListener('resize', remeasure);
  let ro = null;
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (!drag) remeasure(); }); ro.observe(head); }
  return {
    set, get snap() { return snap; }, visible: n => vis[n], height: () => H,
    destroy() { dead = true; window.removeEventListener('resize', remeasure); if (vv) vv.removeEventListener('resize', remeasure); if (ro) ro.disconnect(); }
  };
}
