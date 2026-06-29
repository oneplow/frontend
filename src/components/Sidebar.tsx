import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Key,
  Sparkles,
  UserCircle2,
  X,
  LogOut,
  Activity,
  List,
  ChevronsLeft,
  Search,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';
import { siteCopy } from '../content/siteCopy';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ mobileOpen = false, onClose }: SidebarProps) => {
  const { isAdmin, username, logout } = useAuth();
  const { language } = useAppSettings();
  const copy = siteCopy[language];
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isCollapsed ? 'justify-center px-0' : ''
    } ${isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]'
    }`;

  const NAV_GROUPS = [
    {
      title: copy.sidebar.sections.overview,
      items: [
        { path: '/dashboard', label: copy.sidebar.items.overview, icon: LayoutDashboard },
        { path: '/usage', label: copy.sidebar.items.usage, icon: Activity },
        { path: '/logs', label: copy.sidebar.items.logs, icon: List },
      ]
    },
    {
      title: copy.sidebar.sections.developer,
      items: [
        { path: '/keys', label: copy.sidebar.items.apiKeys, icon: Key },
        { path: '/users', label: copy.sidebar.items.manageUsers, icon: Users, adminOnly: true },
        { path: '/models', label: copy.sidebar.items.models, icon: Cpu },
        { path: '/integrations', label: copy.sidebar.items.integrations, icon: Sparkles },
        { path: '/status', label: copy.sidebar.items.status, icon: Activity }
      ]
    },
    // {
    //   title: 'SUBSCRIPTION',
    //   items: [
    //     { path: '/billing', label: 'Billing', icon: Gem },
    //     { path: '/referral', label: 'Referral', icon: Gift },
    //     { path: '/help', label: 'Help', icon: HelpCircle }
    //   ]
    // },
    // {
    //   title: copy.sidebar.sections.support,
    //   items: [
    //     { path: '/community', label: copy.sidebar.items.community, icon: Users }
    //   ]
    // }
  ];

  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      (!item.adminOnly || isAdmin) &&
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--app-surface)]">
      <div className="flex shrink-0 flex-col gap-2 border-b app-border p-3 pb-2">
        <div className="mb-2 flex items-center justify-between lg:hidden px-1">
          <div className="text-xs font-semibold app-muted">{copy.sidebar.navigation}</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="relative flex items-center flex-1">
              <Search size={16} className="absolute left-2.5 app-muted" />
              <input
                type="search"
                placeholder={copy.sidebar.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="app-input-field w-full rounded-md py-1.5 pl-9 pr-3 text-sm outline-none"
              />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md app-muted transition-colors hover:bg-[var(--app-surface-muted)] lg:flex"
            title={isCollapsed ? copy.sidebar.expandSidebar : copy.sidebar.collapseSidebar}
          >
            {isCollapsed ? <ChevronsLeft size={16} className="rotate-180" /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {filteredGroups.length === 0 && (
          <div className="px-3 py-4 text-center text-sm app-muted">
            {copy.sidebar.noResults}
          </div>
        )}

        {filteredGroups.map((group, gIdx) => (
          <div key={group.title}>
            {!isCollapsed ? (
              <div className={`px-3 pb-2 text-[11px] font-bold uppercase tracking-wider app-muted ${gIdx > 0 ? 'pt-6' : 'pt-1'}`}>
                {group.title}
              </div>
            ) : (
              <div className={`mx-auto w-6 border-t app-border ${gIdx > 0 ? 'mb-2 mt-4' : 'my-2'}`} />
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={navItemClass}
                  onClick={onClose}
                  end={item.path === '/dashboard'}
                  title={isCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-[-12px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-[6px] border-l-[6px] border-l-blue-600 border-t-[6px] border-b-transparent border-t-transparent" />
                      )}
                      <Icon size={18} className={isActive ? 'text-white' : 'app-muted'} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t app-border p-3">
        <div className={`app-panel-subtle flex items-center justify-between rounded-xl border p-2 shadow-sm transition-colors ${isCollapsed ? 'flex-col gap-2' : ''}`}>
          <div className={`flex items-center overflow-hidden ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shadow-sm" title={isCollapsed ? username || copy.sidebar.user : undefined}>
              <UserCircle2 size={20} />
            </div>
            {!isCollapsed && (
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold app-text">
                  {username || copy.sidebar.user}
                </span>
                <span className="truncate text-[11px] font-medium app-muted">
                  {isAdmin ? copy.sidebar.administrator : copy.sidebar.standardUser}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg app-muted transition-all hover:bg-[var(--app-surface)] hover:text-red-600 hover:shadow-sm"
            title={copy.sidebar.logout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/30 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-[76px]' : 'w-[260px]'} transform border-r app-border bg-[var(--app-surface)] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
