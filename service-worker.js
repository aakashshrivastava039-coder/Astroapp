const CACHE_NAME = 'vibe-oracle-cache-v7'; // bump when you change cached assets
const API_URL_PREFIX = 'https://generativelanguage.googleapis.com';

// App Shell: Core files needed for the app to run offline.
// Use absolute paths.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/Screenshot(312).png',
  '/assets/Screenshot(313).png',
  '/assets/Screenshot(314).png',
  '/assets/Screenshot(315).png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return Promise.all(
          APP_SHELL_URLS.map(url =>
            cache.add(new Request(url, { cache: 'reload' }))
              .catch(err => {
                console.warn(`Failed to cache ${url}:`, err);
                // continue to attempt caching other assets
              })
          )
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first for API calls
  if (request.url.startsWith(API_URL_PREFIX)) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Cache-first for app shell & static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) return response;
      return fetch(request);
    })
  );
});
