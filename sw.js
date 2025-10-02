const CACHE_NAME = 'knower-life-v4';
const STATIC_CACHE = 'knower-life-static-v4';
const DYNAMIC_CACHE = 'knower-life-dynamic-v4';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/icon-144.png',
    '/offline.html'
];

const API_ENDPOINTS = [
    '/api/chat',
    '/api/analyze'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => console.log('Static assets cached'))
            .catch(error => console.error('Cache installation failed:', error))
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Пропускаем неподдерживаемые схемы
    if (request.url.startsWith('chrome-extension://') || 
        request.url.includes('extension')) {
        return;
    }

    // Стратегия кэширования для API
    if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Стратегия кэширования для статических ресурсов
    if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
        event.respondWith(cacheFirstStrategy(request));
        return;
    }

    // Стратегия по умолчанию
    event.respondWith(networkFirstStrategy(request));
});

// Стратегия "Сеть сначала"
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Кэшируем успешные ответы
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Пробуем получить из кэша
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        // Для навигационных запросов показываем offline страницу
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }

        return new Response('Network error', { 
            status: 408, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    }
}

// Стратегия "Кэш сначала"
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return new Response('Cache error', { 
            status: 500, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    }
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('Performing background sync');
    // Здесь можно добавить логику фоновой синхронизации
}

// Push уведомления
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Новое уведомление от KNOWER LIFE',
        icon: '/icon-192.png',
        badge: '/icon-144.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Открыть'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'KNOWER LIFE', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});
