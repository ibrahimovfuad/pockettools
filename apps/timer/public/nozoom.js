// Block page zoom: pinch (Safari gesture events, two-finger touchmove) and double-tap.
// iOS Safari ignores user-scalable=no in the viewport, so it has to be done here.
(function () {
  var stop = function (e) { e.preventDefault(); };
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) { document.addEventListener(n, stop, { passive: false }); });
  document.addEventListener('touchmove', function (e) { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  // a quick second tap zooms on non-interactive areas; buttons and fields keep fast repeated taps
  var last = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now(), quick = now - last < 350;
    last = now;
    if (!quick || e.touches.length) return;
    var t = e.target;
    if (t && t.closest && t.closest('button,a,input,textarea,select,label,[role=button],[contenteditable],.dial')) return;
    e.preventDefault();
  }, { passive: false });
})();
