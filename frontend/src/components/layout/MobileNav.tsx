// components/layout/MobileNav.tsx
// Bottom navigation bar for mobile users - replaces sidebar functionality on small screens

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    Home,
    Briefcase,
    MessageSquare,
    Bell,
    User,
    LayoutDashboard,
    FolderOpen,
    Send
} from 'lucide-react';

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
}

export const MobileNav = () => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Don't show on auth pages or when not logged in
    if (!isAuthenticated) return null;

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    // Navigation items based on user role
    const getNavItems = (): NavItem[] => {
        if (user?.role === 'admin') {
            return [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
                { icon: User, label: 'Users', path: '/admin/users' },
                { icon: Bell, label: 'Alerts', path: '/notifications' },
            ];
        }

        if (user?.role === 'client') {
            return [
                { icon: Home, label: 'Home', path: '/dashboard' },
                { icon: Briefcase, label: 'Projects', path: '/projects' },
                { icon: FolderOpen, label: 'My Projects', path: '/my-projects' },
                { icon: MessageSquare, label: 'Messages', path: '/messages' },
                { icon: User, label: 'Profile', path: '/profile' },
            ];
        }

        // Freelancer (default)
        return [
            { icon: Home, label: 'Home', path: '/dashboard' },
            { icon: Briefcase, label: 'Projects', path: '/projects' },
            { icon: Send, label: 'Proposals', path: '/proposals/my-proposals' },
            { icon: MessageSquare, label: 'Messages', path: '/messages' },
            { icon: User, label: 'Profile', path: '/profile' },
        ];
    };

    const navItems = getNavItems();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 lg:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-colors ${active
                                    ? 'text-primary-600'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : ''}`} />
                            <span className={`text-xs mt-1 truncate ${active ? 'font-semibold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
