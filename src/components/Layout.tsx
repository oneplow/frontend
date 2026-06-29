import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { isUser } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not logged in at all, redirect to sign-in
  if (!isUser) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return (
    <div className="app-shell flex h-screen w-full flex-col overflow-hidden font-sans">
      <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
