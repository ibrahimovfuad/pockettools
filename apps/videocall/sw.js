// Offline cache of the app shell. Bump the version whenever files change.
const CACHE = 'videocall-v6';
const FILES = ['./', 'index.html', 'app.js', 'peerjs.min.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// App files (network first, see below)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(cache => networkFirst(cache, req)));
});

// Network first: an online launch always gets the latest version. The cache is only a fallback
// for offline use or a very slow network (after 4 s), so updates never need a reinstall.
function networkFirst(cache, req, key = req) {
  const fromCache = () => cache.match(key, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r.ok) cache.put(key, r.clone()); return r; });
  const slow = new Promise(res => setTimeout(res, 4000)).then(fromCache).then(c => c || net);
  return Promise.race([net, slow]).catch(() => fromCache().then(c => c || Response.error()));
}
