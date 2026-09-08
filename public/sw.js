// ChronoCircle Progressive Web App Service Worker
const CACHE_NAME = 'chronocircle-v1.2';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// Install event - precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('SW: Gagal cache asset:', asset, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - offline-first with network fallback & dynamic cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET or cross-origin requests that aren't CDNs
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('fonts.googleapis.com') && !url.origin.includes('fonts.gstatic.com')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          // Fallback to cached root
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Offline: ChronoCircle', {
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // Static assets (Next.js chunks, styles, icons, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // offline, ignore background revalidation failure
          });
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
