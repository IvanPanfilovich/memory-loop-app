import React from 'react';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  style?: React.CSSProperties;
  className?: string;
  icon?: React.ReactNode;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  allowFullscreen?: boolean;
}

let notifications: Notification[] = [];
let listeners: (() => void)[] = [];

export const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  notifications.push({ ...notification, id });
  listeners.forEach(listener => listener());
};

export const removeNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
  listeners.forEach(listener => listener());
};

export const useNotifications = () => {
  const [notificationsState, setNotificationsState] = React.useState(notifications);

  React.useEffect(() => {
    const listener = () => setNotificationsState([...notifications]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return { notifications: notificationsState, removeNotification, addNotification };
};

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  const toastOptions = {
    className: 'toast-theme-aware',
    style: {
      background: 'var(--card-foreground)',
      color: 'var(--card)',
      border: '1px solid var(--border)',
    },
  };

  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast.warning(message, toastOptions);
      break;
    default:
      toast.info(message, toastOptions);
  }
};
