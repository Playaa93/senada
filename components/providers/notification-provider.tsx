"use client";

import { useInitDemoNotifications } from '@/lib/hooks/use-notifications';

/**
 * Provider pour initialiser les notifications de démonstration
 * Peut être désactivé en production
 */
export function NotificationProvider({
  children,
  enableDemo = true,
}: {
  children: React.ReactNode;
  enableDemo?: boolean;
}) {
  // Initialiser les notifications de démo si activé
  if (enableDemo) {
    useInitDemoNotifications();
  }

  return <>{children}</>;
}
