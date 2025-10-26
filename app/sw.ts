/// <reference lib="WebWorker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Cache names
const CACHE_VERSION = "v1";
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const IMAGE_CACHE = `image-cache-${CACHE_VERSION}`;
const OFFLINE_PAGE = "/offline";

// Serwist instance with precaching
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

// Install event - cache offline page
(self as any).addEventListener("install", (event: any) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll([
        OFFLINE_PAGE,
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
      ]);
    })()
  );
});

// Activate event - clean old caches
(self as any).addEventListener("activate", (event: any) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith("api-cache-") ||
              name.startsWith("static-cache-") ||
              name.startsWith("image-cache-")
            ) && name !== API_CACHE && name !== STATIC_CACHE && name !== IMAGE_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })()
  );
});

// Fetch event - offline fallback
(self as any).addEventListener("fetch", (event: any) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          return await fetch(event.request);
        } catch (error) {
          const cache = await caches.open(STATIC_CACHE);
          const cachedResponse = await cache.match(OFFLINE_PAGE);
          return cachedResponse || new Response("Offline");
        }
      })()
    );
  }
});

// Background sync for stock movements
(self as any).addEventListener("sync", (event: any) => {
  if (event.tag === "sync-stock-movements") {
    event.waitUntil(syncStockMovements());
  }
});

async function syncStockMovements() {
  try {
    const db = await openDB();
    const tx = db.transaction("pending-movements", "readonly");
    const store = tx.objectStore("pending-movements");
    const getAllRequest = store.getAll();
    const movements: any[] = await new Promise((resolve) => {
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    });

    for (const movement of movements) {
      try {
        const response = await fetch("/api/stock-movements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movement.data),
        });

        if (response.ok) {
          // Remove from pending queue
          const deleteTx = db.transaction("pending-movements", "readwrite");
          const deleteStore = deleteTx.objectStore("pending-movements");
          await deleteStore.delete(movement.id);
        }
      } catch (error) {
        console.error("Failed to sync movement:", error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("senada-offline-db", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pending-movements")) {
        db.createObjectStore("pending-movements", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

// Push notification event
(self as any).addEventListener("push", (event: any) => {
  if (!event.data) return;

  const data = event.data.json();
  const options: NotificationOptions = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Senada", options)
  );
});

// Notification click event
(self as any).addEventListener("notificationclick", (event: any) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
      (async () => {
        const windowClients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }

        return undefined;
      })()
    );
  }
});

// Message event for client communication
(self as any).addEventListener("message", (event: any) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(event.data.payload);
      })()
    );
  }
});

serwist.addEventListeners();
