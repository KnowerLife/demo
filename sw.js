const CACHE_NAME = 'knower-life-static-v3';
const DYNAMIC_CACHE = 'knower-life-dynamic-v3';
const MAX_CACHE_SIZE = 50;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/icon-192.png',
    '/icon-512.png',
    '/icon-144.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
                return cache.keys().then((keys) => {
                    if (keys.length > MAX_CACHE_SIZE) {
                        return Promise.all(keys.slice(0, keys.length - MAX_CACHE_SIZE).map((key) => cache.delete(key)));
                    }
                });
            });
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.pathname.startsWith('/api')) {
        event.respondWith(fetch(request));
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                event.waitUntil(
                    fetch(request).then((networkResponse) => {
                        return caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    }).catch(() => cachedResponse)
                );
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {
                return caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                if (request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
