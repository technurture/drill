/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// Use NetworkOnly for Supabase REST API to prevent stale cached responses
// from overwriting optimistic updates when offline.
// The React Query cache will handle offline functionality.
registerRoute(
  ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/v1/'),
  new NetworkOnly()
);

registerRoute(
  ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/auth/'),
  new NetworkOnly()
);

registerRoute(
  ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/storage/'),
  new CacheFirst({
    cacheName: 'supabase-storage-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  /\.(?:woff|woff2|ttf|eot)$/i,
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

registerRoute(
  /\.(?:js|css)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  })
);

registerRoute(
  /\.(?:mp3|wav|ogg)$/i,
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  /\.(?:json)$/i,
  new NetworkFirst({
    cacheName: 'json-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
);

// Background sync event handler
// Notifies the app to sync when connection is restored
self.addEventListener('sync', (event: any) => {
  console.log('[SW] Sync event received:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        console.log('[SW] Notifying clients to sync offline queue');
        clients.forEach(client => {
          client.postMessage({
            type: 'TRIGGER_OFFLINE_SYNC',
            timestamp: Date.now()
          });
        });
      })
    );
  }
});

self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'QUEUE_ACTION') {
    console.log('[SW] Action queued for sync:', event.data.action);
  }
});
