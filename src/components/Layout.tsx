import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { isUser, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not logged in at all, redirect to sign-in
  if (!isUser && !isAdmin) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return (
    <div className="page-shell flex min-h-screen text-slate-900 selection:bg-blue-200">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-72">
        {/* Mobile top bar for sidebar toggle */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-md border-b border-slate-200/60 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <div className="text-sm font-bold text-slate-800">Easy-AI</div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-8">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
