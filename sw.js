// sw.js — basic offline support for Amira's portfolio
// Caches the core files on first visit so the site still loads with no internet.

const CACHE_NAME = 'amira-portfolio-v1';

// Files that live in the same folder as this service worker.
// Add/remove filenames here to match exactly what you upload to the repo.
const CORE_ASSETS = [
    './',
    './index.html',
    './ux&ui1.png',
    './school2.png',
    './cv.jpg',
    './dash.png',
    './Amira.jpg',
    './Amira-Alattas-CV-English.pdf',
    './Amira-Alattas-CV-Arabic.pdf'
];

// Install: pre-cache the core files. Any file that fails to fetch (e.g. not
// uploaded yet) is skipped instead of blocking the whole install.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                CORE_ASSETS.map((url) =>
                    cache.add(url).catch(() => {
                        console.warn('[sw] Could not cache (skipping):', url);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

// Activate: clean up old cache versions.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: try the network first (so visitors always get the latest version
// when online); if the network fails, fall back to the cached copy.
// Only handles GET requests, and only same-origin requests — form submissions
// (e.g. the contact form to Web3Forms) always go straight to the network.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return networkResponse;
            })
            .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
});
