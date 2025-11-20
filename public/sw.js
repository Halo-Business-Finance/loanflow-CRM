// Service Worker for LoanFlow CRM
// Provides offline capability and performance improvements with aggressive asset caching

const CACHE_VERSION = 'v2';
const CACHE_NAME = `loanflow-crm-${CACHE_VERSION}`;
const RUNTIME_CACHE = `loanflow-runtime-${CACHE_VERSION}`;
const IMMUTABLE_CACHE = `loanflow-immutable-${CACHE_VERSION}`;

// Critical assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html'
];

// Cache duration for different asset types (in milliseconds)
const CACHE_DURATION = {
  immutable: 365 * 24 * 60 * 60 * 1000, // 1 year for hashed assets
  runtime: 24 * 60 * 60 * 1000 // 1 day for runtime cache
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => !name.includes(CACHE_VERSION))
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if URL is for an immutable asset (has content hash)
function isImmutableAsset(url) {
  // Match patterns like: /assets/index-xr9Opqxz.js or /assets/index-CZTvtEI_.css
  return /\/assets\/[^/]+-[a-zA-Z0-9_-]+\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp)/.test(url.pathname);
}

// Helper: Add timestamp to cached response
function createCachedResponse(response) {
  const clonedResponse = response.clone();
  return clonedResponse.blob().then(body => {
    const headers = new Headers(clonedResponse.headers);
    headers.set('sw-cached-at', Date.now().toString());
    return new Response(body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: headers
    });
  });
}

// Helper: Check if cached response is still valid
function isCacheValid(cachedResponse, maxAge) {
  const cachedAt = cachedResponse.headers.get('sw-cached-at');
  if (!cachedAt) return true; // Assume valid if no timestamp
  
  const age = Date.now() - parseInt(cachedAt);
  return age < maxAge;
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Supabase realtime connections
  if (request.method !== 'GET' || url.href.includes('realtime')) {
    return;
  }

  // Strategy 1: Immutable assets (cache-first, long-term)
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.open(IMMUTABLE_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          // Return cached if available and valid
          if (cachedResponse && isCacheValid(cachedResponse, CACHE_DURATION.immutable)) {
            return cachedResponse;
          }

          // Fetch and cache
          return fetch(request).then(response => {
            if (response && response.status === 200) {
              createCachedResponse(response).then(cachedResp => {
                cache.put(request, cachedResp);
              });
            }
            return response;
          }).catch(() => {
            // Return stale cache if fetch fails
            return cachedResponse || new Response('Network error', { status: 408 });
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Network-first for API calls
  if (url.origin.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache successful responses
          if (response.ok) {
            createCachedResponse(response).then(cachedResp => {
              caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(request, cachedResp);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for offline support
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy 3: Cache-first with revalidation for other static assets
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(cache => {
      return cache.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(response => {
          // Cache successful responses
          if (response && response.status === 200) {
            createCachedResponse(response).then(cachedResp => {
              cache.put(request, cachedResp);
            });
          }
          return response;
        });

        // Return cached response if valid, otherwise wait for fetch
        if (cachedResponse && isCacheValid(cachedResponse, CACHE_DURATION.runtime)) {
          // Return cached immediately, update in background
          fetchPromise.catch(() => {}); // Ignore background fetch errors
          return cachedResponse;
        }

        return fetchPromise.catch(() => {
          // Offline fallback
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return cachedResponse || new Response('Network error', { status: 408 });
        });
      });
    })
  );
});

// Message handler for cache clearing (debugging)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      })
    );
  }
});
