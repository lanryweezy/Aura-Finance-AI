// Service Worker for Aura Finance AI
const CACHE_NAME = 'aura-finance-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.tsx',
  '/types.ts',
  '/manifest.json',
  'https://cdn.tailwindcss.com/3.4.0.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
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
  self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isSameOrigin = event.request.url.startsWith(self.location.origin);

  // Network-first for navigation requests (ensures updates)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const netResp = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, netResp.clone());
        return netResp;
      } catch {
        const cached = await caches.match(event.request);
        return cached || caches.match('/');
      }
    })());
    return;
  }

  if (!isSameOrigin) return;

  // Cache-first for other resources
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    
    try {
      const netResp = await fetch(event.request);
      if (netResp && netResp.status === 200 && netResp.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, netResp.clone());
      }
      return netResp;
    } catch {
      return cached;
    }
  })());
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data when connection is restored
      syncOfflineData()
    );
  }
});

// Push notifications for important updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New financial update available',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Aura Finance AI', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

async function syncOfflineData() {
  try {
    // Implement offline data synchronization logic here
    console.log('Syncing offline data...');
    
    // Check for pending transactions, invoices, etc.
    const pendingData = await getStoredPendingData();
    
    if (pendingData.length > 0) {
      // Sync with server when online
      await Promise.all(
        pendingData.map(item => syncDataItem(item))
      );
      
      // Clear synced data from local storage
      await clearSyncedData();
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function getStoredPendingData() {
  // Implementation for retrieving pending offline data
  return [];
}

async function syncDataItem(item) {
  // Implementation for syncing individual data items
  console.log('Syncing item:', item);
}

async function clearSyncedData() {
  // Implementation for clearing successfully synced data
  console.log('Clearing synced data');
}