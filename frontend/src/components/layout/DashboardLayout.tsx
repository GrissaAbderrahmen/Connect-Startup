// components/layout/DashboardLayout.tsx
import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface DashboardLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export const DashboardLayout = ({ children, showSidebar = true }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
            <Header />

            <div className="flex overflow-x-hidden">
                {showSidebar && <Sidebar />}

                {/* Added pb-20 lg:pb-6 to clear mobile bottom nav, overflow-x-hidden for mobile */}
                <main className={`flex-1 min-w-0 overflow-x-hidden ${showSidebar ? 'p-4 pb-20 lg:p-6 lg:pb-6' : 'pb-20 lg:pb-0'}`}>
                    {children}
                </main>
            </div>

            {/* Mobile bottom navigation - only visible on mobile */}
            <MobileNav />
        </div>
    );
};
