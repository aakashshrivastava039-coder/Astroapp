const CACHE_NAME = 'vibe-oracle-cache-v12'; // Bump version for new assets/paths
const API_URL_PREFIX = 'https://generativelanguage.googleapis.com';

// App Shell: Core files needed for the app to run offline.
// Use absolute paths to be more robust.
// IMPORTANT: Removed index.tsx as it's a source file not present in the build output.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot1.png',
  '/screenshot2.png'
];

// Install event: Caches the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return Promise.all(
          APP_SHELL_URLS.map(url => cache.add(new Request(url, {cache: 'reload'})).catch(err => console.warn(`Failed to cache ${url}:`, err)))
        );
      })
  );
});

// Activate event: Cleans up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      // Take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// Fetch event: Serves content from cache or network.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For API calls, use a network-first strategy.
  if (request.url.startsWith(API_URL_PREFIX)) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a generic error response if offline.
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // For other requests (app shell), use a cache-first strategy.
  event.respondWith(
    caches.match(request).then((response) => {
      // If we have a cached response, return it.
      if (response) {
        return response;
      }
      // Otherwise, fetch from the network.
      return fetch(request);
    })
  );
});
