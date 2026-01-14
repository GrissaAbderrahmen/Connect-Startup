// components/layout/Sidebar.tsx
import { useState } from 'react';
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
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Send,
    Star,
    Bell
} from 'lucide-react';

interface SidebarItem {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: number;
}

export const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    // Menu items based on user role
    const getMenuItems = (): SidebarItem[] => {
        const commonItems: SidebarItem[] = [
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ];

        if (user?.role === 'admin') {
            return [
                { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
                { label: 'Users', path: '/admin/users', icon: Users },
            ];
        }

        if (user?.role === 'client') {
            return [
                ...commonItems,
                { label: 'Browse Projects', path: '/projects', icon: Briefcase },
                { label: 'My Projects', path: '/my-projects', icon: FolderOpen },
                { label: 'Contracts', path: '/contracts', icon: FileText },
                { label: 'Find Freelancers', path: '/freelancers', icon: Users },
                { label: 'Messages', path: '/messages', icon: MessageSquare },
                { label: 'Notifications', path: '/notifications', icon: Bell },
            ];
        }

        if (user?.role === 'freelancer') {
            return [
                ...commonItems,
                { label: 'Browse Projects', path: '/projects', icon: Briefcase },
                { label: 'My Proposals', path: '/proposals/my-proposals', icon: Send },
                { label: 'Contracts', path: '/contracts', icon: FileText },
                { label: 'Messages', path: '/messages', icon: MessageSquare },
                { label: 'Notifications', path: '/notifications', icon: Bell },
                { label: 'My Profile', path: '/profile', icon: User },
                { label: 'Reviews', path: '/reviews', icon: Star },
            ];
        }

        return commonItems;
    };

    const menuItems = getMenuItems();

    const bottomItems: SidebarItem[] = [
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside
            className={`bg-white border-r border-neutral-200 h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Toggle Button */}
                <div className="p-3 flex justify-end">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Main Menu */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'
                                }`} />

                            {!isCollapsed && (
                                <>
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-primary-500 text-white rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}

                            {isCollapsed && item.badge && (
                                <span className="absolute left-10 w-2 h-2 bg-primary-500 rounded-full"></span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Role Badge */}
                {!isCollapsed && (
                    <div className="px-4 py-3 mx-3 mb-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
                        <p className="text-xs text-neutral-500">Signed in as</p>
                        <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full capitalize">
                            {user?.role}
                        </span>
                    </div>
                )}

                {/* Bottom Menu */}
                <div className="px-3 pb-4 border-t border-neutral-100 pt-2">
                    {bottomItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'
                                }`} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
};
