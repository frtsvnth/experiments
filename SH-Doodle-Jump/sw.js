// Service Worker для PWA поддержки
const CACHE_NAME = 'doodle-jump-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Событие установки - кэширование файлов
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Установка...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Ошибка кэширования:', error);
      })
  );
  
  // Немедленная активация нового service worker
  self.skipWaiting();
});

// Событие активации - очистка старых кэшей
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Активация...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Немедленное управление всеми клиентами
  return self.clients.claim();
});

// Событие fetch - cache-first стратегия
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированный ответ, если он есть
        if (response) {
          console.log('[Service Worker] Загрузка из кэша:', event.request.url);
          return response;
        }
        
        // Иначе загружаем из сети
        console.log('[Service Worker] Загрузка из сети:', event.request.url);
        return fetch(event.request).then((response) => {
          // Проверяем валидность ответа
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонируем ответ для кэширования
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Ошибка fetch:', error);
        
        // Можно вернуть fallback страницу здесь
        // return caches.match('./offline.html');
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
