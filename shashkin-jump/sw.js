const CACHE_NAME = 'doodle-jump-v1';
const urlsToCache = [
  '/Users/fortyseventh/experiments/shashkin-jump/index.html',
  '/Users/fortyseventh/experiments/shashkin-jump/animation-demo.html',
  '/Users/fortyseventh/experiments/shashkin-jump/manifest.json',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite_sheet.png',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite/sprite1.png',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite/sprite2.png',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite/sprite3.png',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite/sprite4.png',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite/sprite5.png',
  '/Users/fortyseventh/experiments/shashkin-jump/sprite/sprite6.png'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});