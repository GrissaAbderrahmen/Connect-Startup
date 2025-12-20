// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { messagesAPI } from '@/services/api/messages';
import { Message, Conversation, SendMessageData } from '@/types/message';

export const useMessages = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await messagesAPI.getConversations();
            setConversations(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch conversations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    return {
        conversations,
        isLoading,
        error,
        refetch: fetchConversations,
    };
};

export const useConversation = (userId: number | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await messagesAPI.getConversation(userId);
            setMessages(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch messages');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const sendMessage = useCallback(async (text: string, projectId?: number) => {
        if (!userId) return null;

        setIsSending(true);
        setError(null);

        try {
            const data: SendMessageData = {
                recipient_id: userId,
                message_text: text,
                project_id: projectId,
            };
            const message = await messagesAPI.send(data);
            setMessages(prev => [...prev, message]);
            return message;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send message');
            return null;
        } finally {
            setIsSending(false);
        }
    }, [userId]);

    const markAsRead = useCallback(async () => {
        if (!userId) return;
        try {
            await messagesAPI.markConversationAsRead(userId);
        } catch (err) {
            console.error('Failed to mark messages as read:', err);
        }
    }, [userId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        isLoading,
        isSending,
        error,
        sendMessage,
        markAsRead,
        refetch: fetchMessages,
    };
};
