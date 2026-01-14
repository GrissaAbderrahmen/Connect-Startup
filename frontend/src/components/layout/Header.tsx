// components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { notificationsAPI } from '@/services/api/notifications';
import {
    Menu,
    X,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Briefcase,
    FileText,
    MessageSquare,
    Settings,
    Home,
    Users,
    Check
} from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications and unread count
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isNotificationOpen && isAuthenticated) {
            fetchNotifications();
        }
    }, [isNotificationOpen, isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationsAPI.getUnreadCount();
            setUnreadCount(response.unread_count || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await notificationsAPI.getAll({ limit: 10 });
            setNotifications(response.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await notificationsAPI.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    // Navigation items based on authentication and role
    const getNavItems = () => {
        if (!isAuthenticated) {
            return [
                { label: 'Home', path: '/', icon: Home },
                { label: 'Browse Projects', path: '/projects', icon: Briefcase },
                { label: 'Find Freelancers', path: '/freelancers', icon: Users },
            ];
        }

        const baseItems = [
            { label: 'Dashboard', path: '/dashboard', icon: Home },
            { label: 'Projects', path: '/projects', icon: Briefcase },
        ];

        if (user?.role === 'client') {
            return [
                ...baseItems,
                { label: 'My Projects', path: '/my-projects', icon: FileText },
                { label: 'Contracts', path: '/contracts', icon: FileText },
                { label: 'Messages', path: '/messages', icon: MessageSquare },
            ];
        }

        if (user?.role === 'freelancer') {
            return [
                ...baseItems,
                { label: 'My Proposals', path: '/proposals/my-proposals', icon: FileText },
                { label: 'Contracts', path: '/contracts', icon: FileText },
                { label: 'Messages', path: '/messages', icon: MessageSquare },
            ];
        }

        return baseItems;
    };

    const navItems = getNavItems();

    return (
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className="text-xl font-bold text-neutral-900">Connect</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setIsNotificationOpen(!isNotificationOpen);
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {isNotificationOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsNotificationOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-200 z-20 overflow-hidden">
                                                <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                                                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-xs text-primary-600 hover:text-primary-700"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-8 text-center text-neutral-500">
                                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                            <p className="text-sm">No notifications yet</p>
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`p-4 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer ${!notification.is_read ? 'bg-primary-50/50' : ''
                                                                    }`}
                                                                onClick={() => {
                                                                    if (!notification.is_read) {
                                                                        markAsRead(notification.id);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? 'bg-transparent' : 'bg-primary-500'
                                                                        }`} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm text-neutral-900 line-clamp-2">
                                                                            {notification.message}
                                                                        </p>
                                                                        <p className="text-xs text-neutral-500 mt-1">
                                                                            {formatTimeAgo(notification.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    {!notification.is_read && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                markAsRead(notification.id);
                                                                            }}
                                                                            className="p-1 hover:bg-neutral-100 rounded"
                                                                        >
                                                                            <Check className="w-4 h-4 text-neutral-400" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                <Link
                                                    to="/notifications"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                    className="block p-3 text-center text-sm text-primary-600 hover:bg-neutral-50 border-t border-neutral-100"
                                                >
                                                    View all notifications
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(!isUserMenuOpen);
                                            setIsNotificationOpen(false);
                                        }}
                                        className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-medium text-sm">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-neutral-700">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-20">
                                                <div className="px-4 py-2 border-b border-neutral-100">
                                                    <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                                                    <p className="text-xs text-neutral-500">{user?.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full capitalize">
                                                        {user?.role}
                                                    </span>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </Link>
                                                <hr className="my-2 border-neutral-100" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-neutral-200">
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};
