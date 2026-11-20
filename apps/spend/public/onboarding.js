// Onboarding slides on the sign-in screen: swipe or tap "Continue"; the last slide shows the sign-in button.
// Kept as a separate file (not inline) so it works with the Content-Security-Policy in _headers.
(() => {
  const L = document.getElementById('login'), T = document.getElementById('obTrack');
  if (!L || !T) return;
  const slides = T.children, n = slides.length;
  const dots = document.getElementById('obDots'), next = document.getElementById('obNext'), skip = document.getElementById('obSkip');
  dots.innerHTML = Array.from(slides, (_, i) => `<i role="button" tabindex="0" aria-label="Slide ${i + 1}"></i>`).join('');
  const cur = () => Math.max(0, Math.min(n - 1, Math.round(T.scrollLeft / (T.clientWidth || 1))));
  const go = i => T.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * T.clientWidth, behavior: 'smooth' });
  const update = () => {
    const i = cur();
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
    L.classList.toggle('notlast', i < n - 1);
  };
  let raf = 0;
  T.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  next.onclick = () => go(cur() + 1);
  skip.onclick = () => go(n - 1);
  dots.onclick = e => { const i = [...dots.children].indexOf(e.target); if (i >= 0) go(i); };
  addEventListener('resize', update);
  update();
})();
