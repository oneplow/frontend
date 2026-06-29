import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AppControls } from './AppControls';
import { siteCopy } from '../content/siteCopy';
import { useAppSettings } from '../context/AppSettingsContext';
import { useNotifications } from '../hooks/useNotifications';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export const Header = ({ onOpenSidebar }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { language } = useAppSettings();
  const copy = siteCopy[language];
  const { notifications, unreadCount, markAllAsRead, readIds } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <header className="sticky top-0 z-40 flex h-[3.5rem] shrink-0 items-center justify-between border-b app-border bg-[var(--app-surface-elevated)]/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-md app-muted hover:bg-[var(--app-surface-muted)] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9.93 2.58 8.84 8.84a2 2 0 0 1 0 2.82l-8.84 8.84a2 2 0 0 1-2.82 0l-4.24-4.24a2 2 0 0 1 0-2.82L10.5 4a2 2 0 0 1 2.83 0z" /></svg>
          </div>
          <span className="text-lg font-black tracking-tight app-text">
            Ai<span className="app-muted">Studio</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              showNotifications
                ? 'bg-[var(--app-surface-muted)] app-text'
                : 'app-muted hover:bg-[var(--app-surface-muted)]'
            }`}
            aria-label={copy.header.notifications}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-[var(--app-surface-elevated)]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="app-panel absolute right-0 z-50 mt-2 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-0 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b app-border p-4 pb-3">
                <h3 className="text-sm font-semibold app-text">{copy.header.notifications}</h3>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="cursor-pointer text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copy.header.markAllRead}
                  </button>
                )}
              </div>
              
              <div className="max-h-[360px] overflow-y-auto overscroll-contain">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm app-muted">
                    {copy.header.noNotifications}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => {
                      const isUnread = !readIds.includes(notif.id);
                      return (
                        <div 
                          key={notif.id} 
                          className={`flex items-start gap-3 border-b app-border p-4 transition-colors last:border-b-0 hover:bg-[var(--app-surface-muted)] ${isUnread ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
                        >
                          <div className={`mt-0.5 flex shrink-0 h-8 w-8 items-center justify-center rounded-full ${
                            notif.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                            notif.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {notif.type === 'error' ? <AlertCircle size={16} /> :
                             notif.type === 'warning' ? <AlertTriangle size={16} /> :
                             <Info size={16} />}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold app-text">{notif.title}</span>
                            <span className="text-xs leading-relaxed app-muted">{notif.message}</span>
                          </div>
                          {isUnread && (
                            <div className="ml-auto mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-5 w-px app-divider sm:block"></div>
        <AppControls compact />
      </div>
    </header>
  );
};
