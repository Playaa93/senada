/**
 * Service Worker Registration Utility
 *
 * Handles service worker registration, updates, and communication
 */

export interface ServiceWorkerStatus {
  registered: boolean;
  installing: boolean;
  waiting: boolean;
  active: boolean;
  updateAvailable: boolean;
}

class SWRegistrationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private listeners: Set<(status: ServiceWorkerStatus) => void> = new Set();

  /**
   * Register the service worker
   */
  async register(): Promise<SWRegistrationManager | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported");
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered successfully");

      // Setup update listeners
      this.setupUpdateListeners();

      // Check for updates
      this.checkForUpdates();

      // Notify listeners
      this.notifyListeners();

      return this;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  /**
   * Setup service worker update listeners
   */
  private setupUpdateListeners(): void {
    if (!this.registration) return;

    this.registration.addEventListener("updatefound", () => {
      const newWorker = this.registration!.installing;

      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("New service worker available");
            this.notifyListeners();
          }
        });
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("Service worker controller changed");
      this.notifyListeners();
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("Message from service worker:", event.data);
    });
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }

  /**
   * Activate waiting service worker
   */
  async activateWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) return;

    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      if (success) {
        console.log("Service Worker unregistered successfully");
        this.registration = null;
        this.notifyListeners();
      }
      return success;
    } catch (error) {
      console.error("Service Worker unregistration failed:", error);
      return false;
    }
  }

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    if (!this.registration) {
      return {
        registered: false,
        installing: false,
        waiting: false,
        active: false,
        updateAvailable: false,
      };
    }

    return {
      registered: true,
      installing: !!this.registration.installing,
      waiting: !!this.registration.waiting,
      active: !!this.registration.active,
      updateAvailable: !!this.registration.waiting,
    };
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: any): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn("No active service worker to send message to");
      return;
    }

    this.registration.active.postMessage(message);
  }

  /**
   * Cache specific URLs
   */
  async cacheUrls(urls: string[]): Promise<void> {
    await this.sendMessage({
      type: "CACHE_URLS",
      payload: urls,
    });
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(listener: (status: ServiceWorkerStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifications are not supported");
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn("Service worker not registered");
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      console.log("Push subscription created:", subscription);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Export singleton instance
export const swRegistration = new SWRegistrationManager();
