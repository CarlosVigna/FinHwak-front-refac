import { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import Footer from '../Footer';

export default function AppLayout({ children }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-bg">
            <AppSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col">
                <AppHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
