// services/api/messages.ts
import apiClient from './client';
import { Message, SendMessageData, Conversation } from '@/types/message';

export const messagesAPI = {
    // GET /api/messages - Get all conversations
    getConversations: async (): Promise<Conversation[]> => {
        const response = await apiClient.get<Conversation[]>('/messages');
        return response.data;
    },

    // GET /api/messages/conversation/:userId - Get conversation with user
    getConversation: async (userId: number): Promise<Message[]> => {
        const response = await apiClient.get<{ data: Message[], pagination: any }>(`/messages/conversation/${userId}`);
        return response.data.data;
    },

    // POST /api/messages - Send a message
    send: async (data: SendMessageData): Promise<Message> => {
        const response = await apiClient.post<Message>('/messages', data);
        return response.data;
    },

    // PUT /api/messages/:id/read - Mark message as read
    markAsRead: async (messageId: number): Promise<{ success: boolean }> => {
        const response = await apiClient.put<{ success: boolean }>(`/messages/${messageId}/read`);
        return response.data;
    },

    // PUT /api/messages/conversation/:userId/read - Mark all messages in conversation as read
    markConversationAsRead: async (userId: number): Promise<{ success: boolean }> => {
        const response = await apiClient.put<{ success: boolean }>(`/messages/conversation/${userId}/read`);
        return response.data;
    },

    // GET /api/messages/unread-count - Get unread message count
    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await apiClient.get<{ count: number }>('/messages/unread-count');
        return response.data;
    },
};
