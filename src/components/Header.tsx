import { useEffect, useRef, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { AppControls } from './AppControls';
import { siteCopy } from '../content/siteCopy';
import { useAppSettings } from '../context/AppSettingsContext';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export const Header = ({ onOpenSidebar }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { language } = useAppSettings();
  const copy = siteCopy[language];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showNotifications && (
            <div className="app-panel absolute right-0 z-50 mt-2 flex w-80 flex-col gap-3 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between border-b app-border pb-2">
                <h3 className="text-sm font-semibold app-text">{copy.header.notifications}</h3>
                <span className="cursor-pointer text-[11px] font-medium text-blue-600">{copy.header.markAllRead}</span>
              </div>
              <div className="py-6 text-center text-sm app-muted">
                {copy.header.noNotifications}
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
