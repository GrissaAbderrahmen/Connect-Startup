// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '@/services/api/notifications';
import { Notification } from '@/types/notification';
import { PaginationParams } from '@/types';

export const useNotifications = (params?: PaginationParams) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await notificationsAPI.getAll(params);
            setNotifications(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch notifications');
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);

    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            await notificationsAPI.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to mark notification as read');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to mark all as read');
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: number) => {
        try {
            // Note: delete endpoint not implemented yet, just remove from local state
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete notification');
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {
        notifications,
        isLoading,
        error,
        pagination,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
    };
};

export const useUnreadNotificationCount = () => {
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCount = useCallback(async () => {
        try {
            const response = await notificationsAPI.getUnreadCount();
            setCount(response.unread_count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCount();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [fetchCount]);

    return { count, isLoading, refetch: fetchCount };
};
