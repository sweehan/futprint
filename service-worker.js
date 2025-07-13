const CACHE_NAME = 'futprint-v2';
const STATIC_CACHE = 'futprint-static-v2';
const DATA_CACHE = 'futprint-data-v2';
const IMAGE_CACHE = 'futprint-images-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/public/css/animations.css',
  '/public/css/help-system.css',
  '/public/js/loading-states.js',
  '/public/js/number-animation.js',
  '/public/js/modal-system.js',
  '/public/js/progressive-disclosure.js',
  '/public/js/help-content.js',
  '/public/js/mobile-help.js',
  '/public/js/tooltip-system.js',
  '/public/js/pwa-app.js',
  '/src/data/carbonData.js',
  '/src/utils/calculator.js',
  '/src/utils/formatters.js',
  '/src/utils/googleSheets.js',
  '/src/components/Calculator.jsx'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      caches.open(DATA_CACHE).then(cache => {
        console.log('Data cache ready');
      }),
      caches.open(IMAGE_CACHE).then(cache => {
        console.log('Image cache ready');
      })
    ])
  );
  // Force service worker to become active
  self.skipWaiting();
});

// Network strategies for different resource types
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle API/data requests (network first, fallback to cache)
  if (url.pathname.includes('/api/') || url.pathname.includes('googleSheets')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(DATA_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Handle images (cache first, then network)
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          const responseToCache = response.clone();
          caches.open(IMAGE_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Handle all other requests (cache first, fallback to network)
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        // Return cached version and update in background
        fetch(request).then(fetchResponse => {
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, fetchResponse);
          });
        });
        return response;
      }
      
      return fetch(request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // Return offline page for navigation requests
      if (request.destination === 'document') {
        return caches.match('/offline.html');
      }
    })
  );
});

// Clean up old caches and take control
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE, DATA_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Handle messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache updates
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    caches.open(STATIC_CACHE).then(cache => {
      cache.addAll(event.data.urls || []);
    });
  }
  
  // Handle offline calculation storage
  if (event.data && event.data.type === 'STORE_CALCULATION') {
    const { calculation } = event.data;
    if (calculation) {
      // Store calculations for offline access
      caches.open(DATA_CACHE).then(cache => {
        const request = new Request('/offline-calculations');
        const response = new Response(JSON.stringify(calculation));
        cache.put(request, response);
      });
    }
  }
});

// Background sync for saved calculations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(
      caches.open(DATA_CACHE).then(cache => {
        return cache.match('/offline-calculations').then(response => {
          if (response) {
            return response.json().then(data => {
              // Send to Google Sheets when back online
              return fetch('/api/submit-calculation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              }).then(() => {
                // Clear the offline storage
                cache.delete('/offline-calculations');
              });
            });
          }
        });
      })
    );
  }
});