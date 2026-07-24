const CACHE_VERSION = 'chanakya-nav-v2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Core shell — precached on install
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/placeholders/campus-logo.svg',
  '/images/placeholders/building.svg',
];

// Venue images — cached on first access, persisted
const IMAGE_PATHS = [
  '/images/venues/admin-block-new-0.jpeg',
  '/images/venues/admin-block-new-1.jpeg',
  '/images/venues/admin-block-new-2.jpeg',
  '/images/venues/admin-cafeteria-0.jpeg',
  '/images/venues/auditorium-0.jpeg',
  '/images/venues/food-court-0.jpeg',
  '/images/venues/library-0.jpeg',
  '/images/venues/library-1.jpeg',
  '/images/venues/library-2.jpeg',
  '/images/venues/admissions-room-g02.jpg',
  '/images/venues/admissions-entrance.jpg',
  '/images/venues/gate5-entrance-0.jpg',
  '/images/venues/gate5-entrance-1.jpg',
];

// ── Install: cache shell + venue images ─────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {})),
      caches.open(IMAGE_CACHE).then((cache) => cache.addAll(IMAGE_PATHS).catch(() => {})),
    ])
  );
});

// ── Activate: delete old cache versions ─────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: strategy per resource type ───────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass on localhost/dev
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;

  // Skip Google Maps & external API calls — never cache
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('google.com')
  ) return;

  // Strategy: Cache-First for venue images (rarely change)
  if (url.pathname.startsWith('/images/venues/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  // Strategy: Cache-First for static assets
  if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Strategy: Stale-While-Revalidate for API routes (show cached, refresh in background)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE));
    return;
  }

  // Strategy: Network-First for HTML pages, fall back to cached shell
  event.respondWith(networkFirstWithFallback(event.request));
});

// ── Cache strategies ─────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request) || await cache.match('/');
    return cached || new Response('You are offline. Please reconnect to use Chanakya Navigate.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
