// pages/messages/ConversationPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/common/Spinner';
import { useConversation } from '@/hooks/useMessages';
import apiClient from '@/services/api/client';

export const ConversationPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const recipientId = userId ? parseInt(userId) : null;
    const [recipient, setRecipient] = useState<{ id: number; name: string; email: string } | null>(null);
    const [messageText, setMessageText] = useState('');
    const [recipientLoading, setRecipientLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading: isLoadingMessages,
        isSending,
        sendMessage,
        markAsRead
    } = useConversation(recipientId);

    // Fetch recipient info
    useEffect(() => {
        const fetchRecipient = async () => {
            if (!recipientId) return;
            try {
                // Try to get user info - could be freelancer or client
                const response = await apiClient.get(`/freelancers/${recipientId}`);
                setRecipient({
                    id: recipientId,
                    name: response.data.name,
                    email: response.data.email || ''
                });
            } catch {
                // If not a freelancer, try to get from users
                try {
                    const response = await apiClient.get(`/clients/profile`);
                    // Fallback - just show placeholder
                    setRecipient({
                        id: recipientId,
                        name: 'User',
                        email: ''
                    });
                } catch {
                    setRecipient({
                        id: recipientId,
                        name: 'User',
                        email: ''
                    });
                }
            } finally {
                setRecipientLoading(false);
            }
        };
        fetchRecipient();
    }, [recipientId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark as read when opening conversation
    useEffect(() => {
        if (recipientId) {
            markAsRead();
        }
    }, [recipientId, markAsRead]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !recipientId) return;
        await sendMessage(messageText.trim());
        setMessageText('');
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    if (!recipientId) {
        return (
            <div className="h-[calc(100vh-120px)] bg-white rounded-xl border border-neutral-200 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-neutral-500 mb-4">Invalid conversation</p>
                    <Link to="/messages" className="text-primary-600 hover:text-primary-700">
                        ← Back to Messages
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] bg-white rounded-xl border border-neutral-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center gap-4">
                <Link to="/messages" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-neutral-600" />
                </Link>
                {recipientLoading ? (
                    <Spinner />
                ) : (
                    <div className="flex items-center gap-3">
                        <Avatar name={recipient?.name || 'User'} size="md" />
                        <div>
                            <h3 className="font-medium text-neutral-900">{recipient?.name || 'User'}</h3>
                            <p className="text-xs text-neutral-500">Click to view profile</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-neutral-500 py-8">
                        <p className="mb-2">No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwnMessage = message.sender_id === user?.id;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${isOwnMessage
                                        ? 'bg-primary-500 text-white rounded-br-md'
                                        : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm">{message.message_text}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? 'text-primary-200' : 'text-neutral-400'
                                        }`}>
                                        <span className="text-xs">{formatTime(message.created_at)}</span>
                                        {isOwnMessage && (
                                            message.is_read ? (
                                                <CheckCheck className="w-3 h-3" />
                                            ) : (
                                                <Check className="w-3 h-3" />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-neutral-200">
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5 text-neutral-500" />
                    </button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || isSending}
                        isLoading={isSending}
                        className="px-4"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
