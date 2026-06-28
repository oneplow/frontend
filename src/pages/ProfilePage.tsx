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
  Check,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';

interface UserKeyInfo {
  rpm_limit: number | null;
  expires_at: number | null;
}

interface TokenInfo {
  token_limit: number | null;
  tokens_used: number;
  token_reset_period: string;
  token_last_reset: number | null;
}

export const ProfilePage = () => {
  const { username, isAdmin, userToken, apiUrl } = useAuth();
  const [keyInfo, setKeyInfo] = useState<UserKeyInfo | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
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
  const joinDate = 'Unknown';

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (isAdmin || !userToken) {
        setLoading(false);
        return;
      }
      const cleanUrl = apiUrl.replace(/\/$/, '');
      try {
        const [keysRes, tokensRes] = await Promise.all([
          fetch(`${cleanUrl}/user/keys`, { headers: { Authorization: `Bearer ${userToken}` } }),
          fetch(`${cleanUrl}/user/tokens`, { headers: { Authorization: `Bearer ${userToken}` } })
        ]);
        if (!cancelled && keysRes.ok) {
          const data = await keysRes.json();
          setKeyInfo(data.key || null);
        }
        if (!cancelled && tokensRes.ok) {
          const data = await tokensRes.json();
          setTokenInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
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
        try { document.execCommand('copy'); } catch (e) { }
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
    const totalDuration = 30 * 24 * 60 * 60;
    const remaining = Math.max(0, keyInfo.expires_at - now);
    return Math.min(100, (remaining / totalDuration) * 100);
  };

  const getTokenDisplay = () => {
    if (isAdmin) return 'Unlimited';
    if (!tokenInfo || tokenInfo.token_limit === null) return 'Unlimited';
    return `${(tokenInfo.tokens_used || 0).toLocaleString()} / ${tokenInfo.token_limit.toLocaleString()}`;
  };

  const getTokenPercentage = () => {
    if (isAdmin || !tokenInfo || tokenInfo.token_limit === null) return 0;
    return Math.min(100, ((tokenInfo.tokens_used || 0) / tokenInfo.token_limit) * 100);
  };

  const getTokenBarColor = () => {
    const pct = getTokenPercentage();
    if (pct >= 90) return 'bg-red-400';
    if (pct >= 70) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const progressTrackStyle = { backgroundColor: 'var(--app-border)' };

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6 pb-20 space-y-6 w-full">
      {loading && <PageLoader />}
      <div className="mb-2 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 hover:underline transition-colors">Overview</Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">Profile</span>
      </div>
      {/* Header */}
      <div className="surface-card flex items-center gap-3 rounded-xl p-5 shadow-sm">
        <UserCircle2 size={20} className="text-blue-500" />
        <h1 className="text-xl font-bold app-text">My Profile</h1>
      </div>

      {/* Profile Banner */}
      <div className="surface-card rounded-[28px] p-6 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.06) 35%, rgba(139,92,246,0.08) 100%)',
          }}
        ></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div
            className="h-24 w-24 shrink-0 rounded-2xl p-1 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.32), rgba(99,102,241,0.24))',
              border: '1px solid var(--app-border)',
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center rounded-xl text-blue-500 backdrop-blur-sm"
              style={{ backgroundColor: 'color-mix(in srgb, var(--app-surface) 84%, transparent)' }}
            >
              {username ? (
                <span className="text-4xl font-bold">{username.charAt(0).toUpperCase()}</span>
              ) : (
                <UserCircle2 size={48} className="opacity-50" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h2 className="truncate text-2xl font-bold app-text">
                {username || roleName}
              </h2>
              <div
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-500"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.18)' }}
              >
                <CheckCircle2 size={12} />
                ACTIVE
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2 text-[13px] app-muted">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{email}</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs font-medium app-muted">
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
          <div className="mb-4 flex items-center gap-2 text-sm font-bold app-text">
            <Info size={16} className="text-blue-500" />
            Account Config
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest app-muted">
              Your Access Token
            </label>
            <div className="relative">
              <input
                type="text"
                value={userToken || 'Not authenticated'}
                readOnly
                className="app-input-field w-full rounded-xl px-4 py-2.5 pr-10 text-sm font-medium shadow-inner focus:outline-none"
                style={{ backgroundColor: 'var(--app-surface-muted)' }}
              />
              <button
                onClick={handleCopyToken}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg shadow-sm transition-colors app-button-secondary app-muted hover:text-blue-600"
                title="Copy Token"
              >
                {copiedToken ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] app-muted">
              ใช้ Token นี้ในการยืนยันตัวตนสำหรับเรียกใช้งาน API ของ Easy-AI
            </p>
          </div>
        </div>

        {/* Right Column - Quotas */}
        <div className="surface-card rounded-[28px] p-6 lg:col-span-1">
          <div className="mb-6 flex items-center gap-2 text-sm font-bold app-text">
            <Activity size={18} className="text-purple-500" />
            Quotas & Usage
          </div>

          <div className="space-y-6">
            {/* Limit 1 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold app-text">
                    <Zap size={16} className="text-blue-500" />
                    API Requests Limit
                  </div>
                  <div className="mt-0.5 text-[11px] app-muted">ขีดจำกัดคำขอ API ต่อนาที</div>
                </div>
                <div className="text-sm font-bold app-text">
                  {loading ? '...' : getRpmDisplay()}
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={progressTrackStyle}>
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${getRpmPercentage()}%` }}></div>
              </div>
            </div>

            {/* Limit 2 */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold app-text">
                    <Key size={16} className="text-indigo-500" />
                    Key Expiration
                  </div>
                  <div className="mt-0.5 text-[11px] app-muted">วันหมดอายุของคีย์</div>
                </div>
                <div className="text-sm font-bold app-text">
                  {loading ? '...' : getExpirationDisplay()}
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={progressTrackStyle}>
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${getExpirationPercentage()}%` }}></div>
              </div>
            </div>

            {/* Limit 3: Token Quota */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold app-text">
                    <Activity size={16} className="text-emerald-500" />
                    Token Balance
                  </div>
                  <div className="mt-0.5 text-[11px] app-muted">ปริมาณ Token คงเหลือ</div>
                </div>
                <div className="text-sm font-bold app-text">
                  {loading ? '...' : getTokenDisplay()}
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={progressTrackStyle}>
                <div className={`h-full rounded-full transition-all ${getTokenBarColor()}`} style={{ width: `${getTokenPercentage()}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
