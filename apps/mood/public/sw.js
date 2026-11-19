// Offline cache and notifications. Bump the version whenever files change.
const CACHE = 'mood-v7';
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

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || 'How was your day?', {
    body: d.body || 'Rate it from 0 to 10 — it takes a couple of seconds.',
    icon: 'icon-192.png', badge: 'icon-192.png', tag: 'daily-mood', data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || './');
  }));
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
