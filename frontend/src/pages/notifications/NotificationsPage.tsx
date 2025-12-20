// pages/notifications/NotificationsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Bell,
    FileText,
    MessageSquare,
    CreditCard,
    CheckCircle,
    Star,
    Check,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType } from '@/types/notification';

export const NotificationsPage = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const getIcon = (type: NotificationType) => {
        const icons = {
            proposal: FileText,
            public_proposal: FileText,
            direct_proposal: FileText,
            message: MessageSquare,
            payment: CreditCard,
            contract: CheckCircle,
            escrow: CreditCard,
            review: Star,
            rating: Star,
            system: Bell,
        };
        return icons[type] || Bell;
    };

    const getIconColor = (type: NotificationType) => {
        const colors: Record<string, string> = {
            proposal: 'bg-blue-100 text-blue-600',
            public_proposal: 'bg-blue-100 text-blue-600',
            direct_proposal: 'bg-blue-100 text-blue-600',
            message: 'bg-primary-100 text-primary-600',
            payment: 'bg-green-100 text-green-600',
            contract: 'bg-purple-100 text-purple-600',
            escrow: 'bg-green-100 text-green-600',
            review: 'bg-yellow-100 text-yellow-600',
            rating: 'bg-yellow-100 text-yellow-600',
            system: 'bg-neutral-100 text-neutral-600',
        };
        return colors[type] || 'bg-neutral-100 text-neutral-600';
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const handleMarkAsRead = async (id: number) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const handleDelete = async (id: number) => {
        await deleteNotification(id);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
                    <p className="text-neutral-600 mt-1">
                        {isLoading ? 'Loading...' : unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead} className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Mark All Read
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Spinner />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-neutral-600">
                            {filter === 'unread'
                                ? 'You\'re all caught up!'
                                : 'When you receive notifications, they\'ll appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {filteredNotifications.map((notification) => {
                            const Icon = getIcon(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-neutral-50 transition-colors ${!notification.is_read ? 'bg-primary-50/50' : ''
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className={`text-sm ${!notification.is_read ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-neutral-400 mt-1">
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4 text-neutral-500" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="p-1 hover:bg-red-100 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                            {notification.proposal_id && (
                                                <Link
                                                    to={`/proposals/${notification.proposal_id}`}
                                                    className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    View Details →
                                                </Link>
                                            )}
                                        </div>
                                        {!notification.is_read && (
                                            <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
