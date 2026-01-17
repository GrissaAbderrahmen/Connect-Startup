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
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="flex">
                {showSidebar && <Sidebar />}

                {/* Added pb-20 lg:pb-6 to clear mobile bottom nav */}
                <main className={`flex-1 ${showSidebar ? 'p-4 pb-20 lg:p-6 lg:pb-6' : 'pb-20 lg:pb-0'}`}>
                    {children}
                </main>
            </div>

            {/* Mobile bottom navigation - only visible on mobile */}
            <MobileNav />
        </div>
    );
};
