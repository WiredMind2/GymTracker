// Enhanced Service Worker for Gym Tracker PWA - iOS Compatible
const CACHE_NAME = 'gym-tracker-v1.0.0-ios';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './db.js',
    './exercises.js',
    './manifest.json',
    // External resources with fallbacks
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js',
    // Icon fallbacks (will be created as SVG fallbacks)
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMyNTYzZWIiLz4KPHRleHQgeD0iOTYiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFwcGxlLVN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2VndWUgVUknLCBSb2JvdG8iIGZvbnQtc2l6ZT0iODAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SkPC90ZXh0Pgo8L3N2Zz4K',
    // SVG fallback for icons
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiByeD0iNjQiIGZpbGw9IiMyNTYzZWIiLz4KPHRleHQgeD0iMjU2IiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcHBsZS1TeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvIiBmb250LXNpemU9IjIwMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkqE8L3RleHQ+Cjwvc3ZnPgo='
];

// Install event - cache resources with enhanced error handling
self.addEventListener('install', (event) => {
    console.log('Service Worker installing (iOS compatible)...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell for offline use');
                
                // Cache resources with individual error handling
                const cachePromises = urlsToCache.map(url => {
                    return cache.add(url).catch(error => {
                        console.warn(`Failed to cache ${url}:`, error);
                        // Continue with other resources even if one fails
                        return Promise.resolve();
                    });
                });
                
                return Promise.all(cachePromises);
            })
            .then(() => {
                console.log('All resources cached successfully');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache resources:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating (iOS compatible)...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            ).then(() => {
                // Take control of all pages immediately
                return self.clients.claim();
            });
        })
    );
});

// Enhanced fetch event with better iOS support
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }
                
                console.log('Fetching from network:', event.request.url);
                
                // Clone the request because it's a one-time use stream
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Don't cache external resources to avoid CORS issues
                        const isExternalResource = !event.request.url.startsWith(self.location.origin);
                        if (!isExternalResource) {
                            // Clone the response because it's a one-time use stream
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log('Caching new resource:', event.request.url);
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(error => {
                                    console.warn('Failed to cache resource:', error);
                                });
                        }
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        // Return a basic offline response for other requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for when connectivity is restored
self.addEventListener('sync', (event) => {
    console.log('Background sync event:', event.tag);
    
    if (event.tag === 'background-sync-workouts') {
        event.waitUntil(syncWorkouts());
    }
});

// Enhanced push notifications (for future features)
self.addEventListener('push', (event) => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Time to work out! 💪',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMyNTYzZWIiLz4KPHRleHQgeD0iOTYiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFwcGxlLVN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2VndWUgVUknLCBSb2JvdG8iIGZvbnQtc2l6ZT0iODAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SkPC90ZXh0Pgo8L3N2Zz4K',
        badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiByeD0iMTIiIGZpbGw9IiMyNTYzZWIiLz4KPHRleHQgeD0iMzYiIHk9IjQwIiBmb250LWZhbWlseT0iQXBwbGUtU3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdveSBVScsgUm9ib3RvIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4pySPC90ZXh0Pgo8L3N2Zz4K',
        vibrate: [200, 100, 200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            offline: true
        },
        actions: [
            {
                action: 'start-workout',
                title: 'Start Workout',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMTYiIGZpbGw9IiMxMGI5ODEiLz4KPHRleHQgeD0iNDgiIHk9IjU0IiBmb250LWZhbWlseT0iQXBwbGUtU3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdveSBVScsgUm9ib3RvIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4p2J4pySPC90ZXh0Pgo8L3N2Zz4K'
            },
            {
                action: 'view-progress',
                title: 'View Progress',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMTYiIGZpbGw9IiNmNTllMGIiLz4KPHRleHQgeD0iNDgiIHk9IjU0IiBmb250LWZhbWlseT0iQXBwbGUtU3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdveSBVScsgUm9ib3RvIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4p2E4pySPC90ZXh0Pgo8L3N2Zz4K'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMTYiIGZpbGw9IiNlZjQ0NDQiLz4KPHRleHQgeD0iNDgiIHk9IjU0IiBmb250LWZhbWlseT0iQXBwbGUtU3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdveSBVScsgUm9ib3RvIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4p2K4pySPC90ZXh0Pgo8L3N2Zz4K'
            }
        ],
        requireInteraction: false,
        silent: false,
        timestamp: Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification('Gym Tracker 💪', options)
    );
});

// Handle notification clicks with enhanced iOS support
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);
    event.notification.close();
    
    const actionHandlers = {
        'start-workout': () => {
            event.waitUntil(
                clients.openWindow('./?action=start-workout')
            );
        },
        'view-progress': () => {
            event.waitUntil(
                clients.openWindow('./?action=view-progress')
            );
        },
        'dismiss': () => {
            // Just close the notification
            return;
        }
    };
    
    if (actionHandlers[event.action]) {
        actionHandlers[event.action]();
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
    console.log('SW received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// Enhanced offline detection
self.addEventListener('online', () => {
    console.log('Connection restored - syncing data');
    // Notify main app that we're back online
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'ONLINE',
                timestamp: Date.now()
            });
        });
    });
});

self.addEventListener('offline', () => {
    console.log('Connection lost - working offline');
    // Notify main app that we're offline
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'OFFLINE',
                timestamp: Date.now()
            });
        });
    });
});

// Function to sync workouts when back online
function syncWorkouts() {
    return new Promise((resolve, reject) => {
        console.log('Background sync: syncing workouts');
        
        // This would sync with a backend API when available
        // For now, just resolve since we use local storage
        setTimeout(() => {
            console.log('Background sync completed');
            resolve();
        }, 1000);
    });
}

// Cache management utilities
function getCacheSize() {
    return caches.open(CACHE_NAME).then(cache => {
        return cache.keys().then(requests => {
            return requests.length;
        });
    });
}

function clearOldCaches() {
    return caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    console.log('Deleting old cache:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        );
    });
}

// Periodic cleanup (runs every 24 hours)
setInterval(() => {
    clearOldCaches().catch(error => {
        console.warn('Cache cleanup failed:', error);
    });
}, 24 * 60 * 60 * 1000);

console.log('Gym Tracker Service Worker loaded (iOS compatible)');