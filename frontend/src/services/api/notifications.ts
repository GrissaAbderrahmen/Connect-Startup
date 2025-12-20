// services/api/notifications.ts
import apiClient from './client';
import { Notification } from '@/types/notification';
import { PaginatedResponse, PaginationParams } from '@/types';

export const notificationsAPI = {
    // GET /api/notifications - Get all notifications
    getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
        const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', { params });
        return response.data;
    },

    // GET /api/notifications/unread/count - Get unread count
    getUnreadCount: async (): Promise<{ unread_count: number }> => {
        const response = await apiClient.get<{ unread_count: number }>('/notifications/unread/count');
        return response.data;
    },

    // PUT /api/notifications/:id/read - Mark notification as read
    markAsRead: async (notificationId: number): Promise<{ message: string }> => {
        const response = await apiClient.put<{ message: string }>(`/notifications/${notificationId}/read`);
        return response.data;
    },

    // PUT /api/notifications/mark-all-read - Mark all notifications as read
    markAllAsRead: async (): Promise<{ message: string }> => {
        const response = await apiClient.put<{ message: string }>('/notifications/mark-all-read');
        return response.data;
    },
};
