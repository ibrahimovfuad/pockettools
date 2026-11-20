// Offline cache. Bump the version whenever files change.
const CACHE = 'lightmeter-v1';
const FILES = ['./', 'index.html', 'app.js', 'onboarding.js', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// App files only (network first, see below).
// Sign-in (/__/auth), the API and Firebase bypass the cache.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const path = url.pathname.replace(/^\//, '') || './';
  if (!FILES.includes(path) && path !== '') return;
  e.respondWith(caches.open(CACHE).then(cache => networkFirst(cache, e.request)));
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
