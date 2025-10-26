// Export all stores from a single entry point
export { useNotificationStore } from './notifications';
export type { Notification } from './notifications';

export { useUserPreferencesStore } from './user-preferences';
export type { Language, Currency, DateFormat } from './user-preferences';

export { useAuthStore } from './auth';
export type { User } from './auth';
