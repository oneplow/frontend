import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, LogOut, ShieldCheck, Activity, RefreshCw, AlertCircle, User, Edit, Users } from 'lucide-react';

interface ApiKey {
  key: string;
  name: string | null;
  expires_at: number | null;
  rpm_limit: number | null;
  created_at: number;
  owner_username?: string | null;
  allowed_models?: string | null;
}

interface UserData {
  username: string;
  email: string | null;
  created_at: number;
}

// Custom Modal Components
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = false }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]" onClick={onCancel}>
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md m-4 animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-slate-600 mt-2 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors" onClick={onCancel}>Cancel</button>
          <button className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20' : 'bg-primary hover:bg-primary-hover shadow-md shadow-primary/20'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const AlertModal = ({ isOpen, title, message, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm m-4 text-center animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-slate-600 mt-2 mb-6">{message}</p>
        <button className="w-full py-2.5 rounded-lg font-medium text-white bg-primary hover:bg-primary-hover transition-colors shadow-md shadow-primary/20" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default function App() {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('API_URL') || 'https://api.mineway.cloud');

  // Auth state
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('ADMIN_KEY'));
  const [isUser, setIsUser] = useState(!!localStorage.getItem('USER_TOKEN'));
  const [adminKey, setAdminKey] = useState(localStorage.getItem('ADMIN_KEY') || '');
  const [userToken, setUserToken] = useState(localStorage.getItem('USER_TOKEN') || '');
  const [username, setUsername] = useState(localStorage.getItem('USERNAME') || '');

  // Portal tabs
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Dashboard Tabs (For Admin)
  const [adminTab, setAdminTab] = useState<'keys' | 'users'>('keys');

  // Form states
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom Modals State
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean, title: string, message: string }>({ isOpen: false, title: '', message: '' });
  const [confirmInfo, setConfirmInfo] = useState<{ isOpen: boolean, title: string, message: string, action: () => void, isDanger?: boolean }>({ isOpen: false, title: '', message: '', action: () => { } });

  // Generation / Edit Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRpm, setNewRpm] = useState('5');
  const [newExpiryDays, setNewExpiryDays] = useState('30');
  const [newModels, setNewModels] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  const showAlert = (title: string, message: string) => setAlertInfo({ isOpen: true, title, message });
  const showConfirm = (title: string, message: string, action: () => void, isDanger = false) => setConfirmInfo({ isOpen: true, title, message, action, isDanger });

  // Check URL hash for admin access
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#/admin') {
        setShowAdminLogin(true);
      } else {
        setShowAdminLogin(false);
      }
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdmin && adminTab === 'users') {
        // Fetch Users
        const res = await fetch(`${apiUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${adminKey}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUsersList(data.users || []);
      } else {
        // Fetch Keys
        const endpoint = isAdmin ? '/admin/keys' : '/user/keys';
        const token = isAdmin ? adminKey : userToken;

        const res = await fetch(`${apiUrl}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        if (isAdmin) {
          setKeys(data.keys || []);
        } else {
          setKeys(data.key ? [data.key] : []);
        }
      }
    } catch (err: any) {
      if (err.message.includes('Invalid') || err.message.includes('Missing') || err.message.includes('Failed to fetch')) {
        handleLogout();
        showAlert('Connection Error', 'Authentication failed or session expired.');
      } else {
        showAlert('Error', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isUser) fetchData();
  }, [isAdmin, isUser, adminTab]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = apiUrl.replace(/\/$/, '');
    localStorage.setItem('ADMIN_KEY', adminKey);
    localStorage.setItem('API_URL', cleanUrl);
    setApiUrl(cleanUrl);
    setIsAdmin(true);
    window.location.hash = ''; // Clear hash on successful login
  };

  const handleUserAuth = async (e: React.FormEvent, isRegister: boolean) => {
    e.preventDefault();
    if (isRegister && authPassword !== authConfirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    const cleanUrl = apiUrl.replace(/\/$/, '');
    setApiUrl(cleanUrl);
    localStorage.setItem('API_URL', cleanUrl);

    try {
      const payload: any = { username: authUsername, password: authPassword };
      if (isRegister && authEmail) payload.email = authEmail;

      const res = await fetch(`${cleanUrl}/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || 'Authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('USER_TOKEN', data.token);
      localStorage.setItem('USERNAME', data.username);
      setUserToken(data.token);
      setUsername(data.username);
      setIsUser(true);
    } catch (err: any) {
      showAlert('Error', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ADMIN_KEY');
    localStorage.removeItem('USER_TOKEN');
    localStorage.removeItem('USERNAME');
    setAdminKey('');
    setUserToken('');
    setUsername('');
    setKeys([]);
    setUsersList([]);
    setIsAdmin(false);
    setIsUser(false);
  };

  const openGenModal = (editKey: ApiKey | null = null) => {
    if (editKey) {
      setIsEditing(true);
      setNewName(editKey.name || '');
      setNewRpm(editKey.rpm_limit?.toString() || '');
      setNewExpiryDays('30');
      setNewModels(editKey.allowed_models || '');
    } else {
      setIsEditing(false);
      setNewName('');
      setNewRpm(isUser ? '60' : ''); // max 60 for user
      setNewExpiryDays('30');
      setNewModels('');
    }
    setGeneratedKey('');
    setShowGenModal(true);
  };

  const handleCreateOrUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedKey('');
    try {
      const payload: any = {};
      if (newName) payload.name = newName;
      if (newRpm) payload.rpm_limit = parseInt(newRpm);
      if (newExpiryDays) payload.expires_in_days = parseInt(newExpiryDays);
      if (newModels) payload.allowed_models = newModels;

      const endpoint = isAdmin ? '/admin/keys' : '/user/keys';
      const token = isAdmin ? adminKey : userToken;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (!isEditing) setGeneratedKey(data.key.key || data.key);
      else {
        setShowGenModal(false);
        showAlert('Success', 'Key updated successfully!');
      }
      fetchData();
    } catch (err: any) {
      showAlert('Operation Failed', err.message);
    }
  };

  const deleteKeyAction = async (key: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/keys/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error(await res.text());
      fetchData();
    } catch (err: any) {
      showAlert('Deletion Failed', err.message);
    }
  };

  const handleDeleteKey = (key: string) => {
    showConfirm('Revoke Key', 'Are you sure you want to permanently revoke this API key? This action cannot be undone.', () => deleteKeyAction(key), true);
  };

  const resetLimitAction = async (key: string) => {
    try {
      const endpoint = isAdmin ? `/admin/keys/${key}/reset` : `/user/keys/reset`;
      const token = isAdmin ? adminKey : userToken;
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      showAlert('Success', 'Rate limit for this key has been instantly reset.');
    } catch (err: any) {
      showAlert('Reset Failed', err.message);
    }
  };

  const handleResetLimit = (key: string) => {
    showConfirm('Reset Rate Limit', 'This will immediately reset the RPM counter for this key, allowing new requests instantly. Continue?', () => resetLimitAction(key));
  };
  
  const deleteUserAction = async (uname: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/users/${uname}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error(await res.text());
      fetchData();
      showAlert('Success', `User ${uname} has been deleted.`);
    } catch (err: any) {
      showAlert('Deletion Failed', err.message);
    }
  };

  const handleDeleteUser = (uname: string) => {
    showConfirm('Delete User', `Are you sure you want to permanently delete user "${uname}"? This will also revoke all their API keys. This action cannot be undone.`, () => deleteUserAction(uname), true);
  };

  const formatDate = (ts: number | null) => {
    if (!ts) return 'Never';
    return new Date(ts * 1000).toLocaleString();
  };

  const isExpired = (ts: number | null) => {
    if (!ts) return false;
    return (Date.now() / 1000) > ts;
  };

  if (!isAdmin && !isUser) {
    return (
      <div className="min-h-[100dvh] sm:min-h-[80vh] flex items-center justify-center p-4 sm:p-6 relative">
        <AlertModal {...alertInfo} onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })} />
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-blue-50 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {showAdminLogin ? <ShieldCheck size={28} className="text-primary sm:w-8 sm:h-8" /> : <User size={28} className="text-primary sm:w-8 sm:h-8" />}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {showAdminLogin ? 'Admin Login' : authTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">Self-service API Key Portal</p>
          </div>

          {!showAdminLogin && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 sm:mb-6">
              <button className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${authTab === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setAuthTab('login')}>Login</button>
              <button className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${authTab === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setAuthTab('register')}>Register</button>
            </div>
          )}

          <form onSubmit={showAdminLogin ? handleAdminLogin : (e) => handleUserAuth(e, authTab === 'register')}>
            <div className="space-y-3 sm:space-y-4">
              {showAdminLogin ? (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Backend URL</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Master ADMIN_KEY</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} required placeholder="Super secret key" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Backend URL</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Username</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required placeholder="johndoe" />
                  </div>
                  {authTab === 'register' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Email Address</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required placeholder="john@example.com" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Password</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required placeholder="••••••••" />
                  </div>
                  {authTab === 'register' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" type="password" value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                  )}
                </>
              )}
            </div>

            <button className="w-full mt-6 sm:mt-8 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-primary/20 text-sm sm:text-base" type="submit">
              {showAdminLogin ? 'Connect Dashboard' : authTab === 'register' ? 'Create Account' : 'Sign In'}
            </button>
            
            {showAdminLogin && (
              <button type="button" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors" onClick={() => { setShowAdminLogin(false); window.location.hash = ''; }}>
                Back to User Portal
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <AlertModal {...alertInfo} onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })} />
      <ConfirmModal
        {...confirmInfo}
        onCancel={() => setConfirmInfo({ ...confirmInfo, isOpen: false })}
        onConfirm={() => { confirmInfo.action(); setConfirmInfo({ ...confirmInfo, isOpen: false }); }}
      />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{isAdmin ? 'Admin Dashboard' : `Welcome, ${username}`}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected to {apiUrl}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {(!isUser || keys.length === 0) && (
            <button className="flex-1 sm:flex-none bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2" onClick={() => openGenModal()}>
              <Plus size={18} /> Generate Key
            </button>
          )}
          <button className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {isAdmin && (
        <div className="flex bg-white rounded-t-2xl border border-slate-200 border-b-0 overflow-hidden text-sm font-medium">
          <button 
            className={`flex-1 py-3 px-6 flex items-center justify-center gap-2 transition-all ${adminTab === 'keys' ? 'bg-primary text-white border-b-2 border-primary-hover' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setAdminTab('keys')}
          >
            <Key size={16} /> Manage API Keys
          </button>
          <button 
            className={`flex-1 py-3 px-6 flex items-center justify-center gap-2 transition-all ${adminTab === 'users' ? 'bg-primary text-white border-b-2 border-primary-hover' : 'text-slate-600 hover:bg-slate-50 border-l border-slate-200'}`}
            onClick={() => setAdminTab('users')}
          >
            <Users size={16} /> Manage Users
          </button>
        </div>
      )}

      <div className={`bg-white shadow-sm border border-slate-200 overflow-hidden ${isAdmin ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading data...</div>
        ) : isAdmin && adminTab === 'users' ? (
          // Users Table
          usersList.length === 0 ? (
            <div className="text-center py-24">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No Users</h3>
              <p className="text-slate-500">No users have registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.username} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{u.username}</td>
                      <td className="px-6 py-4 text-slate-600">{u.email || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(u.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200 flex items-center gap-1.5 ml-auto" onClick={() => handleDeleteUser(u.username)} title="Delete User">
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : keys.length === 0 ? (
          // Empty Keys State
          <div className="text-center py-24">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No API Keys</h3>
            <p className="text-slate-500">You don't have any active API keys right now.</p>
          </div>
        ) : (
          // Keys Table
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name / Owner</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">API Key</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Models</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Limit (RPM)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((k) => {
                  const expired = isExpired(k.expires_at);
                  return (
                    <tr key={k.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{k.name || '—'}</div>
                        {isAdmin && <div className="text-xs text-slate-500 mt-1">Owner: {k.owner_username || 'Admin'}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-sm border border-slate-200">
                          {k.key}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {k.allowed_models ? (
                          <div className="flex flex-wrap gap-1">
                            {k.allowed_models.split(',').map(m => (
                              <span key={m} className="bg-blue-50 text-primary px-2 py-0.5 rounded text-xs border border-blue-100">{m.trim()}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-400">All Models</span>}
                      </td>
                      <td className="px-6 py-4">
                        {k.rpm_limit ? (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <Activity size={14} className="text-primary" /> {k.rpm_limit} / min
                          </div>
                        ) : <span className="text-slate-400 text-sm">Unlimited</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${expired ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                          {expired ? 'Expired' : 'Active'}
                        </span>
                        {!expired && k.expires_at && <div className="text-xs text-slate-500 mt-1">{formatDate(k.expires_at)}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUser && (
                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" onClick={() => openGenModal(k)} title="Edit Key settings">
                              <Edit size={16} />
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" onClick={() => handleResetLimit(k.key)} title="Reset Rate Limit">
                            <RefreshCw size={16} />
                          </button>
                          {isAdmin && (
                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" onClick={() => handleDeleteKey(k.key)} title="Revoke Key">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]" onClick={() => { if (!generatedKey) setShowGenModal(false) }}>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md m-4 animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">{generatedKey ? 'Key Generated!' : isEditing ? 'Edit Key Settings' : 'Generate New Key'}</h2>

            {generatedKey ? (
              <div>
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-sm">
                  Please copy this key now. You won't be able to see it again!
                </div>
                <code className="block bg-slate-100 text-slate-800 p-4 rounded-xl mb-6 break-all border border-slate-200 text-sm">
                  {generatedKey}
                </code>
                <button className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-all shadow-md shadow-primary/20" onClick={() => setShowGenModal(false)}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleCreateOrUpdateKey}>
                <div className="space-y-4 mb-8">
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name / Identifier (Optional)</label>
                      <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" type="text" placeholder="e.g. Alice's Key" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rate Limit (Requests per min)</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" type="number" placeholder="Max 60" value={newRpm} onChange={e => setNewRpm(e.target.value)} min="1" max={isAdmin ? undefined : "60"} required={isUser} />
                    {isUser && <p className="text-xs text-slate-500 mt-1">Maximum allowed for normal users is 60 RPM.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expires In (Days)</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" type="number" placeholder="e.g. 30 (Leave empty for never)" value={newExpiryDays} onChange={e => setNewExpiryDays(e.target.value)} min="1" required={isUser} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Allowed Models (Comma separated)</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" type="text" placeholder="e.g. gpt-5.1, default" value={newModels} onChange={e => setNewModels(e.target.value)} />
                    <p className="text-xs text-slate-500 mt-1">Leave blank to allow all models.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-medium transition-colors" onClick={() => setShowGenModal(false)}>Cancel</button>
                  <button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-primary/20">{isEditing ? 'Save Changes' : 'Generate'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
