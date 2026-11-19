// Офлайн-кэш. При изменении файлов увеличь номер версии.
const CACHE = 'polka-v4';
const COVERS = 'polka-covers';
const FILES = ['/', '/index.html', '/app.js', '/config.js', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/zxing_reader.wasm'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== COVERS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Файлы приложения: быстрый запуск из кэша + обновление в фоне.
// Вход (/__/auth), поиск книг и Firebase идут мимо кэша.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // обложки: один раз скачали — дальше показываем мгновенно из кэша
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
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(key);
    const fresh = fetch(nav ? '/index.html' : e.request).then(r => { if (r.ok) cache.put(key, r.clone()); return r; }).catch(() => cached);
    return cached || fresh;
  }));
});
