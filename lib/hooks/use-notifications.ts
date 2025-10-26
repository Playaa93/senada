import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/stores';

/**
 * Hook pour initialiser des notifications de démonstration
 * Utilisé uniquement en développement pour montrer le système de notifications
 */
export function useInitDemoNotifications() {
  const { addNotification, notifications } = useNotificationStore();

  useEffect(() => {
    // N'ajouter les notifications de démo que si le store est vide
    if (notifications.length === 0) {
      // Stock faible
      addNotification({
        type: 'stock',
        title: 'Stock faible',
        message: 'Chanel No. 5 EDP 100ml - Stock: 5 unités',
      });

      // Prédiction réappro
      setTimeout(() => {
        addNotification({
          type: 'restock',
          title: 'Prédiction réappro',
          message: 'Recommandation: Commander 25 unités de Chanel No. 5',
        });
      }, 1000);

      // Alerte critique
      setTimeout(() => {
        addNotification({
          type: 'alert',
          title: 'Alerte critique',
          message: 'Hermès Terre d\'Hermès 75ml - Stock critique: 2 unités',
        });
      }, 2000);

      // Stock mis à jour (lu)
      setTimeout(() => {
        const notifId = Date.now().toString();
        addNotification({
          type: 'success',
          title: 'Stock mis à jour',
          message: 'Dior Sauvage EDT 60ml - 10 unités ajoutées',
        });
      }, 3000);
    }
  }, []); // Exécuter une seule fois au montage
}

/**
 * Hook pour ajouter une notification facilement
 */
export function useAddNotification() {
  const { addNotification } = useNotificationStore();

  return {
    notifyStockLow: (productName: string, quantity: number) => {
      addNotification({
        type: 'stock',
        title: 'Stock faible',
        message: `${productName} - Stock: ${quantity} unité${quantity > 1 ? 's' : ''}`,
      });
    },

    notifyStockCritical: (productName: string, quantity: number) => {
      addNotification({
        type: 'alert',
        title: 'Alerte critique',
        message: `${productName} - Stock critique: ${quantity} unité${quantity > 1 ? 's' : ''}`,
      });
    },

    notifyRestockSuggestion: (productName: string, quantity: number) => {
      addNotification({
        type: 'restock',
        title: 'Prédiction réappro',
        message: `Recommandation: Commander ${quantity} unités de ${productName}`,
      });
    },

    notifySuccess: (title: string, message: string) => {
      addNotification({
        type: 'success',
        title,
        message,
      });
    },

    notifyError: (title: string, message: string) => {
      addNotification({
        type: 'error',
        title,
        message,
      });
    },

    notifyInfo: (title: string, message: string) => {
      addNotification({
        type: 'info',
        title,
        message,
      });
    },

    notifyWarning: (title: string, message: string) => {
      addNotification({
        type: 'warning',
        title,
        message,
      });
    },
  };
}
