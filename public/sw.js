// ChronoCircle Progressive Web App Service Worker
// Engine: Instant-Boot Cache-First Architecture (Sub-10ms PWA Splashscreen Dismissal)
const CACHE_NAME = 'chronocircle-v2.0-instant';

const CORE_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// 1. Install event - Precache core shell immediately and activate without waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache each core asset safely
      await Promise.all(
        CORE_SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('SW Precache error for', asset, err);
          })
        )
      );
    })
  );
  // Force active immediately
  self.skipWaiting();
});

// 2. Activate event - Clean up all legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Menghapus cache usang:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event - Zero-lag dispatching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  // Filter out unsupported third-party schemes/origins (except fonts)
  const isSameOrigin = url.origin === self.location.origin;
  const isFontCdn = url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com');
  if (!isSameOrigin && !isFontCdn) {
    return;
  }

  // STRATEGI A: NAVIGASI DOKUMEN HTML (PWA BOOT & SPLASH SCREEN)
  // KUNCI UTAMA: Langsung kembalikan cache lokal dalam < 5ms agar splash screen browser langsung tertutup seketika!
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        // Cari cache untuk request ini atau root shell ('/')
        const cachedResponse = (await cache.match(request)) || (await cache.match('/'));

        // Background revalidation (Stale-While-Revalidate non-blocking)
        const revalidatePromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              cache.put(request, clone);
              // Pastikan root shell juga tersinkronisasi
              cache.put('/', networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Jika cache sudah ada (kondisi normal PWA), kembalikan SEGERA tanpa menunggu jaringan!
        if (cachedResponse) {
          event.waitUntil(revalidatePromise);
          return cachedResponse;
        }

        // Jika baru pertama kali buka dan belum ada cache (cold start awal), tunggu fetch jaringan
        try {
          const networkResponse = await revalidatePromise;
          if (networkResponse) return networkResponse;
        } catch {
          // offline fallback
        }

        // Fallback darurat jika cache belum ada dan offline
        return (
          (await cache.match('/')) ||
          new Response('<!DOCTYPE html><html><body><h3>ChronoCircle Siap Offline</h3><p>Silakan muat ulang saat terhubung.</p></body></html>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        );
      })()
    );
    return;
  }

  // STRATEGI B: NEXT.JS STATIC CHUNKS (_next/static/**)
  // Berkas ini memiliki hash unik & konten immutable. Gunakan Cache-First murni!
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // STRATEGI C: GOOGLE FONTS & STATIC ASSETS
  // Gunakan Stale-While-Revalidate berkecepatan tinggi
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => null);

      // Jika ada di cache, kirim instan & update background
      if (cached) {
        event.waitUntil(fetchPromise);
        return cached;
      }

      // Jika belum ada di cache, tunggu respon jaringan
      return fetchPromise.then((response) => response || cached);
    })
  );
});
