import { useEffect, useState } from 'react';
import { 
  UserCircle2, 
  Mail, 
  Hash, 
  Calendar, 
  CheckCircle2,
  Info,
  Activity,
  Zap,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserKeyInfo {
  rpm_limit: number | null;
  expires_at: number | null;
}

export const ProfilePage = () => {
  const { username, isAdmin, userToken, apiUrl } = useAuth();
  const [keyInfo, setKeyInfo] = useState<UserKeyInfo | null>(null);
  const [loading, setLoading] = useState(!isAdmin);
  const [copiedToken, setCopiedToken] = useState(false);
  
  const email = isAdmin ? 'admin@easy-ai.local' : 'user@easy-ai.local';
  const roleName = isAdmin ? 'Administrator' : 'User';
  const generateId = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const userId = username ? generateId(username) : 'N/A';
  // If we can't get created_at from backend for normal users, we display Not Available
  const joinDate = 'Unknown';

  useEffect(() => {
    let cancelled = false;
    const fetchKeyInfo = async () => {
      if (isAdmin || !userToken) {
        setLoading(false);
        return;
      }
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/user/keys`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setKeyInfo(data.key || null);
        }
      } catch (err) {
        console.error('Failed to fetch key info', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchKeyInfo();
    return () => { cancelled = true; };
  }, [apiUrl, isAdmin, userToken]);

  const handleCopyToken = () => {
    if (userToken) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(userToken);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = userToken;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try { document.execCommand('copy'); } catch(e) {}
        textArea.remove();
      }
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const getRpmDisplay = () => {
    if (isAdmin) return 'Unlimited';
    if (!keyInfo) return 'N/A';
    return keyInfo.rpm_limit ? `${keyInfo.rpm_limit} / min` : 'Unlimited';
  };

  const getRpmPercentage = () => {
    if (isAdmin || !keyInfo || !keyInfo.rpm_limit) return 100;
    // Just a visual representation since we don't have current usage, we show the limit bar
    return 100;
  };

  const getExpirationDisplay = () => {
    if (isAdmin) return 'Never';
    if (!keyInfo) return 'N/A';
    if (!keyInfo.expires_at) return 'Never';
    return new Date(keyInfo.expires_at * 1000).toLocaleDateString();
  };

  const getExpirationPercentage = () => {
    if (isAdmin || !keyInfo || !keyInfo.expires_at) return 100;
    const now = Date.now() / 1000;
    const totalDuration = 30 * 24 * 60 * 60; // Assume 30 days total for visual
    const remaining = Math.max(0, keyInfo.expires_at - now);
    return Math.min(100, (remaining / totalDuration) * 100);
  };

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header */}
      <div className="surface-card rounded-2xl p-4 flex items-center gap-3">
        <UserCircle2 size={20} className="text-blue-500" />
        <h1 className="text-[15px] font-bold text-slate-800">My Profile</h1>
      </div>

      {/* Profile Banner */}
      <div className="surface-card rounded-[28px] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-transparent to-purple-50/20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-24 w-24 shrink-0 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-1 shadow-sm border border-white">
            <div className="h-full w-full rounded-xl bg-white/60 flex items-center justify-center text-blue-500 backdrop-blur-sm">
              {username ? (
                <span className="text-4xl font-bold">{username.charAt(0).toUpperCase()}</span>
              ) : (
                <UserCircle2 size={48} className="opacity-50" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h2 className="text-2xl font-bold text-slate-900 truncate">
                {username || roleName}
              </h2>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200/50 uppercase tracking-wide">
                <CheckCircle2 size={12} />
                ACTIVE
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 text-[13px] mb-3">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-5 text-slate-400 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <Hash size={14} />
                ID: {userId}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined: {joinDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Column - Configs */}
        <div className="surface-card rounded-[24px] p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 text-sm">
            <Info size={16} className="text-blue-500" />
            Account Config
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Your Access Token
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={userToken || 'Not authenticated'} 
                readOnly 
                className="w-full rounded-xl border-none bg-slate-50/80 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-inner focus:outline-none"
              />
              <button 
                onClick={handleCopyToken}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm hover:text-blue-600 transition-colors"
                title="Copy Token"
              >
                {copiedToken ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              ใช้ Token นี้ในการยืนยันตัวตนสำหรับเรียกใช้งาน API ของ Easy-AI
            </p>
          </div>
        </div>

        {/* Right Column - Quotas */}
        <div className="surface-card rounded-[28px] p-6 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-6 text-sm">
            <Activity size={18} className="text-purple-500" />
            Quotas & Usage
          </div>

          <div className="space-y-6">
            {/* Limit 1 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <Zap size={16} className="text-blue-500" />
                    API Requests Limit
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">ขีดจำกัดคำขอ API ต่อนาที</div>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {loading ? '...' : getRpmDisplay()}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${getRpmPercentage()}%` }}></div>
              </div>
            </div>

            {/* Limit 2 */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <Key size={16} className="text-indigo-500" />
                    Key Expiration
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">วันหมดอายุของคีย์</div>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {loading ? '...' : getExpirationDisplay()}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${getExpirationPercentage()}%` }}></div>
              </div>
            </div>

            {/* Limit 3 */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <UserCircle2 size={16} className="text-emerald-500" />
                    Account Role
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">ระดับสิทธิ์ผู้ใช้งานปัจจุบัน</div>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  <span className="text-emerald-600">{roleName}</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
