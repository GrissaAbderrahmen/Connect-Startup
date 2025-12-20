// components/layout/DashboardLayout.tsx
import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

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

                <main className={`flex-1 ${showSidebar ? 'p-6' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};
