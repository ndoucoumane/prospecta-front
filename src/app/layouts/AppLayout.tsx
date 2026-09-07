import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppHeader } from '../../components/layout/AppHeader';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Determine current page title
  const getPageTitle = (pathname: string) => {
    if (pathname === '/app') return 'Tableau de bord';
    if (pathname.startsWith('/app/prospects')) return 'Prospects';
    if (pathname.startsWith('/app/companies')) return 'Entreprises';
    if (pathname.startsWith('/app/campaigns')) return 'Campagnes';
    if (pathname.startsWith('/app/conversations')) return 'Conversations';
    if (pathname.startsWith('/app/pipeline')) return 'Pipeline commercial';
    if (pathname.startsWith('/app/analytics')) return 'Analyses';
    if (pathname.startsWith('/app/settings')) return 'Paramètres';
    return 'Prospecta';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden md:flex md:flex-shrink-0 h-screen sticky top-0">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/40 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation mobile"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col z-50">
            <AppSidebar isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppHeader
          title={getPageTitle(location.pathname)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
