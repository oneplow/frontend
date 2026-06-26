import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Key,
  BookOpen,
  Sparkles,
  Gauge,
  UserCircle2,
  Globe,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarKeyInfo {
  rpm_limit: number | null;
  expires_at: number | null;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ mobileOpen = false, onClose }: SidebarProps) => {
  const { isAdmin, apiUrl, userToken, username, logout } = useAuth();
  const navigate = useNavigate();
  const [keyInfo, setKeyInfo] = useState<SidebarKeyInfo | null>(null);
  const [healthStatus, setHealthStatus] = useState('Checking');

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${isActive
      ? 'bg-blue-600 !text-white shadow-md shadow-blue-600/25 [&>span]:!text-white [&>svg]:!text-white'
      : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'
    }`;

  useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      const cleanUrl = apiUrl.replace(/\/$/, '');

      try {
        const res = await fetch(`${cleanUrl}/health`);
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            const statusMap: Record<string, string> = {
              ok: 'Healthy',
              warning: 'Degraded',
              critical: 'Critical'
            };
            setHealthStatus(statusMap[data.status] || 'Online');
          } else {
            setHealthStatus('Unreachable');
          }
        }
      } catch {
        if (!cancelled) {
          setHealthStatus('Unreachable');
        }
      }

      if (isAdmin || !userToken) {
        if (!cancelled) {
          setKeyInfo(null);
        }
        return;
      }

      try {
        const res = await fetch(`${cleanUrl}/user/keys`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setKeyInfo(data.key || null);
          } else {
            setKeyInfo(null);
          }
        }
      } catch {
        if (!cancelled) {
          setKeyInfo(null);
        }
      }
    };

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, isAdmin, userToken]);

  const cleanApiUrl = apiUrl.replace(/^https?:\/\//, '');
  const environment = /localhost|127\.0\.0\.1/i.test(cleanApiUrl) ? 'Sandbox' : 'Production';

  const getKeyStatus = () => {
    if (isAdmin) return 'Admin';
    if (!keyInfo) return 'No key';
    if (!keyInfo.expires_at) return 'Active';

    const secondsLeft = keyInfo.expires_at - Date.now() / 1000;
    if (secondsLeft <= 0) return 'Expired';

    return `${Math.ceil(secondsLeft / 86400)}d left`;
  };

  const apiLimit = isAdmin
    ? 'Per key'
    : keyInfo?.rpm_limit
      ? `${keyInfo.rpm_limit}/min`
      : keyInfo
        ? '∞'
        : 'N/A';

  const statusDot = (status: string) => {
    if (status === 'Healthy' || status === 'Active' || status === 'Admin') return 'bg-emerald-400';
    if (status === 'Degraded') return 'bg-amber-400';
    return 'bg-slate-300';
  };

  const sidebarContent = (
    <div className="sidebar-card flex h-full flex-col rounded-[28px] p-4 overflow-hidden">
      {/* Mobile close button */}
      <div className="mb-2 flex items-center justify-between lg:hidden px-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
          Menu
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100"
        >
          <X size={14} />
        </button>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 px-1 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25 shrink-0">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-slate-800 leading-tight">Easy-AI</div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            Control Portal
          </div>
        </div>
      </div>

      {/* Navigation - fills remaining space */}
      <div className="mt-4 flex-1 min-h-0 flex flex-col">
        <div className="px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400 shrink-0">
          Navigation
        </div>
        <nav className="mt-2 space-y-0.5 flex-1">
          <NavLink to="/dashboard" end className={navItemClass} onClick={onClose}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/keys" className={navItemClass} onClick={onClose}>
            <Key size={16} />
            <span>API Keys</span>
          </NavLink>
          <NavLink to="/docs" className={navItemClass} onClick={onClose}>
            <BookOpen size={16} />
            <span>Documentation</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/users" className={navItemClass} onClick={onClose}>
              <Users size={16} />
              <span>Users</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Workspace Status - compact single card */}
      <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100/80 p-3 shrink-0">
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-400 mb-2.5">
          Workspace Status
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <div className={`h-1.5 w-1.5 rounded-full ${statusDot(healthStatus)}`} />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">API</span>
            </div>
            <div className="text-[12px] font-bold text-slate-700 leading-tight">{healthStatus}</div>
          </div>
          <div className="text-center border-x border-blue-100/80">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Gauge size={8} className="text-slate-400" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Limit</span>
            </div>
            <div className="text-[12px] font-bold text-slate-700 leading-tight">{apiLimit}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <div className={`h-1.5 w-1.5 rounded-full ${statusDot(getKeyStatus())}`} />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Key</span>
            </div>
            <div className="text-[12px] font-bold text-slate-700 leading-tight">{getKeyStatus()}</div>
          </div>
        </div>
      </div>

      {/* Connection info + User profile - pinned to bottom */}
      <div className="mt-4 shrink-0">
        {/* <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 mb-3">
          <Globe size={10} className="shrink-0 text-blue-400" />
          <span className="shrink-0">{environment}</span>
          <span className="text-blue-200">·</span>
          <span className="truncate">{cleanApiUrl}</span>
        </div> */}

        <div className="flex items-center justify-between rounded-[20px] bg-white border border-blue-100/60 px-2.5 py-2.5 shadow-[0_2px_12px_-4px_rgba(37,99,235,0.1)]">
          <Link to="/profile" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              {username ? username.charAt(0).toUpperCase() : <UserCircle2 size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-700 leading-tight truncate">
                {username || (isAdmin ? 'Administrator' : 'User')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                {isAdmin ? 'admin@easy-ai.local' : 'user@easy-ai.local'}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors ml-1"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72 lg:px-5 lg:py-5 z-40">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,20rem)] p-3">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
