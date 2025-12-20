// types/message.ts

export interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    project_id: number | null;
    message_text: string;
    is_read: boolean;
    created_at: string;
    sender_name?: string;
    sender?: {
        id: number;
        name: string;
        avatar?: string;
    };
    recipient?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

export interface SendMessageData {
    recipient_id: number;
    message_text: string;
    project_id?: number;
}

export interface Conversation {
    id: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    projectId?: number;
    projectTitle?: string;
}

export interface ConversationWithMessages {
    conversation: Conversation;
    messages: Message[];
}
