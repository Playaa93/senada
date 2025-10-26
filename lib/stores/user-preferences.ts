import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'fr' | 'en';
export type Currency = 'EUR' | 'USD' | 'GBP';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

interface NotificationPreferences {
  stockAlerts: boolean;
  restockPredictions: boolean;
  criticalAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface DisplayPreferences {
  compactMode: boolean;
  showStockIndicators: boolean;
  highlightLowStock: boolean;
}

interface UserPreferencesState {
  // Préférences générales
  language: Language;
  currency: Currency;
  dateFormat: DateFormat;

  // Préférences de notification
  notifications: NotificationPreferences;

  // Préférences d'affichage
  display: DisplayPreferences;

  // Seuils d'alerte
  lowStockThreshold: number;
  criticalStockThreshold: number;

  // Actions
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  setDateFormat: (format: DateFormat) => void;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateDisplayPreferences: (preferences: Partial<DisplayPreferences>) => void;
  setLowStockThreshold: (threshold: number) => void;
  setCriticalStockThreshold: (threshold: number) => void;
  resetToDefaults: () => void;
}

const defaultPreferences = {
  language: 'fr' as Language,
  currency: 'EUR' as Currency,
  dateFormat: 'DD/MM/YYYY' as DateFormat,
  notifications: {
    stockAlerts: true,
    restockPredictions: true,
    criticalAlerts: true,
    emailNotifications: false,
    pushNotifications: true,
  },
  display: {
    compactMode: false,
    showStockIndicators: true,
    highlightLowStock: true,
  },
  lowStockThreshold: 10,
  criticalStockThreshold: 5,
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setLanguage: (language) => set({ language }),

      setCurrency: (currency) => set({ currency }),

      setDateFormat: (dateFormat) => set({ dateFormat }),

      updateNotificationPreferences: (preferences) =>
        set((state) => ({
          notifications: { ...state.notifications, ...preferences },
        })),

      updateDisplayPreferences: (preferences) =>
        set((state) => ({
          display: { ...state.display, ...preferences },
        })),

      setLowStockThreshold: (threshold) =>
        set({ lowStockThreshold: Math.max(0, threshold) }),

      setCriticalStockThreshold: (threshold) =>
        set({ criticalStockThreshold: Math.max(0, threshold) }),

      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'senada-user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
