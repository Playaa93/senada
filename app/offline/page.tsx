"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [cachedData, setCachedData] = useState<any[]>([]);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Load pending sync count
    loadPendingSync();

    // Load cached data
    loadCachedData();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const loadPendingSync = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("pending-movements", "readonly");
      const store = tx.objectStore("pending-movements");
      const countRequest = store.count();
      const count = await new Promise<number>((resolve) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
      });
      setPendingSync(count);
    } catch (error) {
      console.error("Failed to load pending sync:", error);
    }
  };

  const loadCachedData = async () => {
    try {
      const cache = await caches.open("api-cache-v1");
      const keys = await cache.keys();
      const data = await Promise.all(
        keys.slice(0, 5).map(async (request) => {
          const response = await cache.match(request);
          if (response) {
            const json = await response.json();
            return {
              url: request.url,
              data: json,
            };
          }
          return null;
        })
      );
      setCachedData(data.filter(Boolean));
    } catch (error) {
      console.error("Failed to load cached data:", error);
    }
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleSyncNow = async () => {
    if ("serviceWorker" in navigator && "sync" in navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      try {
        await registration.sync.register("sync-stock-movements");
        await loadPendingSync();
      } catch (error) {
        console.error("Failed to register sync:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6">
          <WifiOff className="h-24 w-24 text-muted-foreground mx-auto" />
        </div>

        <h1 className="text-4xl font-bold mb-4">You're Offline</h1>

        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          It looks like you've lost your internet connection. Don't worry, you can still view cached data.
        </p>

        <div className="flex gap-4 mb-8">
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
          {pendingSync > 0 && (
            <Badge variant="outline">
              {pendingSync} pending sync{pendingSync !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex gap-4">
          <Button onClick={handleRetry} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          {pendingSync > 0 && isOnline && (
            <Button onClick={handleSyncNow} variant="outline" size="lg">
              Sync Now
            </Button>
          )}
        </div>

        {cachedData.length > 0 && (
          <Card className="mt-12 w-full">
            <CardHeader>
              <CardTitle>Cached Data Available</CardTitle>
              <CardDescription>
                Here's some data that's available offline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cachedData.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg text-left"
                  >
                    <div className="text-sm font-medium truncate">
                      {new URL(item.url).pathname}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Cached • Available offline
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
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
