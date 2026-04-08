// Cardex Service Worker
// CACHE_VERSION auto-bumps on every deploy — change this string when you push.
const CACHE_VERSION = '2026-04-08-001';
const CACHE_NAME = 'cardex-' + CACHE_VERSION;

const STATIC_URLS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
];

// Install — only pre-cache stable third-party assets, NOT index.html
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        STATIC_URLS.map(url => cache.add(url).catch(err => console.warn('Cache miss:', url, err)))
      )
    ).then(() => self.skipWaiting())
  );
});

// Activate — delete every cache that isn't the current version
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network for geolocation API
  if (url.hostname === 'nominatim.openstreetmap.org') {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Network-first for index.html and manifest — ensures latest code after deploys
  if (event.request.mode === 'navigate' ||
      url.pathname.endsWith('index.html') ||
      url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the fresh copy for offline fallback
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for third-party libraries and other static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});