// types/notification.ts

export type NotificationType =
    | 'message'
    | 'proposal'
    | 'public_proposal'
    | 'direct_proposal'
    | 'contract'
    | 'escrow'
    | 'payment'
    | 'review'
    | 'system';

export interface Notification {
    id: number;
    user_id: number;
    type: NotificationType;
    message: string;
    is_read: boolean;
    created_at: string;
    proposal_id: number | null;
    project_id?: number | null;
    contract_id?: number | null;
    link?: string;
}

export interface NotificationPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    proposal_notifications: boolean;
    message_notifications: boolean;
    payment_notifications: boolean;
}
