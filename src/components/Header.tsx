import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export const Header = ({ onOpenSidebar }: HeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const pageMeta: Record<string, { title: string; description: string }> = {
    '/dashboard': {
      title: 'Dashboard',
      description: 'ภาพรวมระบบและ traffic ของ API'
    },
    '/keys': {
      title: 'API Keys',
      description: 'ตรวจสอบคีย์ สิทธิ์การใช้งาน และสถานะการเข้าถึง'
    },
    '/users': {
      title: 'Users',
      description: 'ดูแลผู้ใช้งานและติดตามการเปิดใช้งานคีย์'
    },
    '/docs': {
      title: 'Documentation',
      description: 'ตัวอย่างการเชื่อมต่อ API และโค้ดพร้อมใช้งาน'
    }
  };

  const meta = pageMeta[location.pathname] ?? pageMeta['/dashboard'];

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{meta.title}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">{meta.description}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
