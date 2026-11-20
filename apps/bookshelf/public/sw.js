// Offline cache. Bump the version whenever files change.
const CACHE = 'polka-v13';
const COVERS = 'polka-covers';
const FILES = ['/', '/index.html', '/app.js', '/nozoom.js', '/onboarding.js', '/config.js', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/zxing_reader.wasm'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== COVERS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// App files (network first, see below).
// Sign-in (/__/auth), book search and Firebase bypass the cache.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // covers: downloaded once, then shown instantly from cache
  if (e.request.destination === 'image' && e.request.mode === 'no-cors' && url.origin !== location.origin) {
    e.respondWith(caches.open(COVERS).then(async cache => {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request);
      if (r.ok || r.type === 'opaque') cache.put(e.request, r.clone());
      return r;
    }));
    return;
  }
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/__/')) return;
  const nav = e.request.mode === 'navigate';
  const key = nav ? '/index.html' : url.pathname;
  if (!nav && !FILES.includes(key)) return;
  e.respondWith(caches.open(CACHE).then(cache => networkFirst(cache, nav ? '/index.html' : e.request, key)));
});

// Network first: an online launch always gets the latest version. The cache is only a fallback
// for offline use or a very slow network (after 4 s), so updates never need a reinstall.
function networkFirst(cache, req, key = req) {
  const fromCache = () => cache.match(key, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r.ok) cache.put(key, r.clone()); return r; });
  const slow = new Promise(res => setTimeout(res, 4000)).then(fromCache).then(c => c || net);
  return Promise.race([net, slow]).catch(() => fromCache().then(c => c || Response.error()));
}

// the page asks for the running version to show it at the bottom of the app
self.addEventListener('message', e => { if (e.data === 'version' && e.ports[0]) e.ports[0].postMessage(CACHE); });
