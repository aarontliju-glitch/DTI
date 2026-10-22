import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types/database';
import { db } from '../lib/databaseService';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshNotifications = () => {
    if (currentUser?.id) {
      const list = db.getUserNotifications(currentUser.id);
      setNotifications(list);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const markAsRead = (id: string) => {
    db.markNotificationRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    if (currentUser?.id) {
      db.markAllNotificationsRead(currentUser.id);
      refreshNotifications();
    }
  };

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
