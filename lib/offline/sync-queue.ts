/**
 * Offline Sync Queue Manager
 *
 * Handles queuing of mutations when offline and auto-sync when back online.
 * Uses IndexedDB for persistent storage and implements conflict resolution.
 */

interface QueuedMutation {
  id?: number;
  timestamp: number;
  type: "stock-movement" | "sale" | "purchase" | "adjustment";
  action: "create" | "update" | "delete";
  data: any;
  retryCount: number;
  lastError?: string;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ id: number; error: string }>;
}

const DB_NAME = "senada-offline-db";
const DB_VERSION = 1;
const STORE_NAME = "pending-movements";
const MAX_RETRIES = 3;

class SyncQueue {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private listeners: Set<(result: SyncResult) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
    }
  }

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("action", "action", { unique: false });
        }
      };
    });
  }

  /**
   * Setup online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncAll();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    // Register service worker sync
    if ("serviceWorker" in navigator && "sync" in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("sync-stock-movements");
      });
    }
  }

  /**
   * Add a mutation to the queue
   */
  async enqueue(mutation: Omit<QueuedMutation, "id" | "timestamp" | "retryCount">): Promise<number> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const queuedMutation: Omit<QueuedMutation, "id"> = {
      ...mutation,
      timestamp: Date.now(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(queuedMutation);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending mutations
   */
  async getAll(): Promise<QueuedMutation[]> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pending mutations count
   */
  async getCount(): Promise<number> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a mutation from the queue
   */
  async remove(id: number): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a mutation in the queue
   */
  async update(mutation: QueuedMutation): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(mutation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sync a single mutation
   */
  private async syncMutation(mutation: QueuedMutation): Promise<boolean> {
    try {
      const endpoint = this.getEndpoint(mutation.type);
      const method = mutation.action === "delete" ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mutation.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to sync mutation:", error);

      // Update retry count
      mutation.retryCount++;
      mutation.lastError = error instanceof Error ? error.message : "Unknown error";

      if (mutation.retryCount < MAX_RETRIES) {
        await this.update(mutation);
      }

      return false;
    }
  }

  /**
   * Get API endpoint for mutation type
   */
  private getEndpoint(type: QueuedMutation["type"]): string {
    switch (type) {
      case "stock-movement":
        return "/api/stock-movements";
      case "sale":
        return "/api/sales";
      case "purchase":
        return "/api/purchases";
      case "adjustment":
        return "/api/adjustments";
      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }
  }

  /**
   * Sync all pending mutations
   */
  async syncAll(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ id: 0, error: "Device is offline" }],
      };
    }

    if (this.syncInProgress) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ id: 0, error: "Sync already in progress" }],
      };
    }

    this.syncInProgress = true;

    try {
      const mutations = await this.getAll();
      let synced = 0;
      let failed = 0;
      const errors: Array<{ id: number; error: string }> = [];

      for (const mutation of mutations) {
        if (mutation.id === undefined) continue;

        const success = await this.syncMutation(mutation);

        if (success) {
          await this.remove(mutation.id);
          synced++;
        } else if (mutation.retryCount >= MAX_RETRIES) {
          errors.push({
            id: mutation.id,
            error: mutation.lastError || "Max retries exceeded",
          });
          await this.remove(mutation.id);
          failed++;
        } else {
          failed++;
        }
      }

      const result: SyncResult = {
        success: failed === 0,
        synced,
        failed,
        errors,
      };

      // Notify listeners
      this.listeners.forEach((listener) => listener(result));

      return result;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Clear all pending mutations
   */
  async clear(): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Subscribe to sync events
   */
  onSync(listener: (result: SyncResult) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if device is online
   */
  get online(): boolean {
    return this.isOnline;
  }

  /**
   * Check if sync is in progress
   */
  get syncing(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instance
export const syncQueue = new SyncQueue();

// Export types
export type { QueuedMutation, SyncResult };
