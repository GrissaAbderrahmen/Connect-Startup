// components/layout/Navigation.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    MessageSquare,
    Users,
    Settings,
    User,
    Send,
    FolderOpen,
    Bell
} from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
}

export const Navigation = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const getNavItems = (): NavItem[] => {
        const commonItems: NavItem[] = [
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Projects', path: '/projects', icon: Briefcase },
        ];

        if (user?.role === 'client') {
            return [
                ...commonItems,
                { label: 'My Projects', path: '/my-projects', icon: FolderOpen },
                { label: 'Contracts', path: '/contracts', icon: FileText },
                { label: 'Freelancers', path: '/freelancers', icon: Users },
                { label: 'Messages', path: '/messages', icon: MessageSquare },
                { label: 'Notifications', path: '/notifications', icon: Bell },
                { label: 'Settings', path: '/settings', icon: Settings },
            ];
        }

        if (user?.role === 'freelancer') {
            return [
                ...commonItems,
                { label: 'My Proposals', path: '/proposals/my-proposals', icon: Send },
                { label: 'Contracts', path: '/contracts', icon: FileText },
                { label: 'Messages', path: '/messages', icon: MessageSquare },
                { label: 'Notifications', path: '/notifications', icon: Bell },
                { label: 'Profile', path: '/profile', icon: User },
                { label: 'Settings', path: '/settings', icon: Settings },
            ];
        }

        return commonItems;
    };

    const navItems = getNavItems();

    return (
        <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                >
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary-600' : 'text-neutral-400'
                        }`} />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
};
