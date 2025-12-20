// pages/messages/MessagesPage.tsx
import { useState, useEffect, useRef } from 'react';
import {
    Search,
    Send,
    Paperclip,
    MoreVertical,
    Check,
    CheckCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/common/Spinner';
import { useMessages, useConversation } from '@/hooks/useMessages';

export const MessagesPage = () => {
    const { user } = useAuth();
    const { conversations, isLoading: isLoadingConversations } = useMessages();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading: isLoadingMessages,
        isSending,
        sendMessage,
        markAsRead
    } = useConversation(selectedUserId);

    // Auto-select first conversation
    useEffect(() => {
        if (conversations?.length > 0 && !selectedUserId) {
            setSelectedUserId(conversations[0].user.id);
        }
    }, [conversations, selectedUserId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark as read when opening conversation
    useEffect(() => {
        if (selectedUserId) {
            markAsRead();
        }
    }, [selectedUserId, markAsRead]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedUserId) return;

        await sendMessage(messageText.trim());
        setMessageText('');
    };

    const selectedConvo = conversations?.find(c => c.user.id === selectedUserId);

    const filteredConversations = (conversations || []).filter(c =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-[calc(100vh-120px)] bg-white rounded-xl border border-neutral-200 flex overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-neutral-200 flex flex-col">
                {/* Search Header */}
                <div className="p-4 border-b border-neutral-100">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {isLoadingConversations ? (
                        <div className="p-8 flex justify-center">
                            <Spinner />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            No conversations yet
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => setSelectedUserId(conversation.user.id)}
                                className={`w-full p-4 flex gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 text-left ${selectedUserId === conversation.user.id ? 'bg-primary-50' : ''
                                    }`}
                            >
                                <Avatar
                                    name={conversation.user.name}
                                    isOnline={conversation.user.isOnline}
                                    size="lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-medium text-neutral-900 truncate">
                                            {conversation.user.name}
                                        </h3>
                                        <span className="text-xs text-neutral-400 flex-shrink-0">
                                            {formatTime(conversation.lastMessageAt)}
                                        </span>
                                    </div>
                                    {conversation.projectTitle && (
                                        <p className="text-xs text-primary-600 truncate">
                                            {conversation.projectTitle}
                                        </p>
                                    )}
                                    <p className="text-sm text-neutral-500 truncate mt-0.5">
                                        {conversation.lastMessage}
                                    </p>
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {conversation.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedConvo ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={selectedConvo.user.name}
                                isOnline={selectedConvo.user.isOnline}
                                size="md"
                            />
                            <div>
                                <h3 className="font-medium text-neutral-900">{selectedConvo.user.name}</h3>
                                <p className="text-xs text-neutral-500">
                                    {selectedConvo.user.isOnline ? 'Online' : 'Offline'}
                                    {selectedConvo.projectTitle && ` • ${selectedConvo.projectTitle}`}
                                </p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoadingMessages ? (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-neutral-500 py-8">
                                No messages yet. Start the conversation!
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
            ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-500">
                    {isLoadingConversations ? <Spinner /> : 'Select a conversation to start messaging'}
                </div>
            )}
        </div>
    );
};
