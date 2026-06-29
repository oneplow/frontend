import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  date: number;
}

export function useNotifications() {
  const { apiUrl, userToken } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load read state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_read_notifications');
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse read notifications from local storage', e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userToken) {
      setLoading(false);
      return;
    }

    try {
      const cleanUrl = apiUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, userToken]);

  useEffect(() => {
    fetchNotifications();
    // Optionally poll every 60 seconds
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('ai_read_notifications', JSON.stringify(allIds));
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return {
    notifications,
    readIds,
    unreadCount,
    loading,
    markAllAsRead,
    refresh: fetchNotifications
  };
}
