const CACHE_NAME = 'vibe-oracle-cache-v2'; // Bump version to clear old cache
const API_URL = 'https://generativelanguage.googleapis.com';

// App Shell: Core files needed immediately.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/assets/icon.svg',
  'manifest.json'
];

// All resources to pre-cache for full offline functionality.
const URLS_TO_CACHE = [
  ...APP_SHELL_URLS,
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll with a catch to prevent a single failed asset from breaking the entire SW install.
        return Promise.all(
          URLS_TO_CACHE.map(url => cache.add(new Request(url, {cache: 'reload'})).catch(err => console.warn(`Failed to cache ${url}:`, err)))
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.url.startsWith(API_URL)) {
    return; // Always use network for API calls
  }
  
  // For navigation requests, use Network Falling Back to Cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For all other requests (scripts, styles), use Stale-While-Revalidate.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Network request failed for:', request.url, err);
      });

      return cachedResponse || fetchPromise;
    })
  );
});