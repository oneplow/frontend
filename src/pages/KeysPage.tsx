import { useState, useEffect } from 'react';
import { Key, Activity, Copy, RefreshCw, Trash2, Clock3, CheckCircle2, Plus, AlertCircle, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

// --- Shared Types & Utils ---
export interface ApiKey {
  key: string;
  name: string | null;
  created_at: number;
  expires_at: number | null;
  rpm_limit: number | null;
  allowed_models: string | null;
  owner_username?: string | null;
}

export const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const isExpired = (expiresAt: number | null) => {
  return expiresAt ? Date.now() / 1000 > expiresAt : false;
};

export const maskApiKey = (key: string) => {
  if (!key) return '';
  if (key.length <= 11) return key;
  return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
};

const getRemainingDays = (expiresAt: number | null) => {
  if (!expiresAt) return '';

  const secondsLeft = expiresAt - Date.now() / 1000;
  if (secondsLeft <= 0) return '';

  return String(Math.ceil(secondsLeft / 86400));
};
// ----------------------------

export const KeysPage = () => {
  const { apiUrl, userToken, adminKey, isAdmin } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formName, setFormName] = useState('');
  const [formCustomKey, setFormCustomKey] = useState('');
  const [formRpmLimit, setFormRpmLimit] = useState('60');
  const [formExpiresDays, setFormExpiresDays] = useState('');
  const [formAllowedModels, setFormAllowedModels] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/v1/models`);
        if (res.ok) {
          const data = await res.json();
          const models = data.data ? data.data.map((m: any) => m.id) : [];
          setAvailableModels(models);
        }
      } catch (e) {
        console.error('Failed to fetch models', e);
      }
    };
    fetchModels();
  }, [apiUrl]);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/admin/keys' : '/user/keys';
      const token = isAdmin ? adminKey : userToken;
      const res = await fetch(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch keys');
      const data = await res.json();
      setKeys(isAdmin ? (data.keys || []) : (data.key ? [data.key] : []));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [apiUrl, isAdmin, adminKey, userToken]);

  const [deleteKeyConfirm, setDeleteKeyConfirm] = useState<string | null>(null);

  const activeKeys = keys.filter((key) => !isExpired(key.expires_at)).length;
  const limitedKeys = keys.filter((key) => key.rpm_limit).length;
  const hasExistingUserKey = !isAdmin && keys.length > 0;

  const openCreateModal = () => {
    setCreateError('');

    if (isAdmin) {
      setFormName('');
      setFormCustomKey('');
      setFormRpmLimit('');
      setFormExpiresDays('');
      setFormAllowedModels('');
    } else {
      const currentKey = keys[0];
      setFormName(currentKey?.name || '');
      setFormCustomKey('');
      setFormRpmLimit(String(currentKey?.rpm_limit ?? 60));
      setFormExpiresDays(getRemainingDays(currentKey?.expires_at ?? null));
      setFormAllowedModels(currentKey?.allowed_models ?? '');
    }

    setCreateOpen(true);
  };

  const handleCopyKey = async (value: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedKey(value);
      window.setTimeout(() => setCopiedKey((current) => (current === value ? null : current)), 1800);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateKey = async () => {
    setCreateLoading(true);
    setCreateError('');

    try {
      const cleanUrl = apiUrl.replace(/\/$/, '');
      const endpoint = isAdmin ? '/admin/keys' : '/user/keys';
      const token = isAdmin ? adminKey : userToken;

      const rpmValue = formRpmLimit.trim() === '' ? undefined : Number(formRpmLimit);
      const expiresValue = formExpiresDays.trim() === '' ? undefined : Number(formExpiresDays);

      if (rpmValue !== undefined && Number.isNaN(rpmValue)) {
        throw new Error('RPM limit ไม่ถูกต้อง');
      }

      if (expiresValue !== undefined && Number.isNaN(expiresValue)) {
        throw new Error('จำนวนวันหมดอายุไม่ถูกต้อง');
      }

      const payload = isAdmin
        ? {
            ...(formName.trim() ? { name: formName.trim() } : {}),
            ...(formCustomKey.trim() ? { key: formCustomKey.trim() } : {}),
            ...(rpmValue !== undefined ? { rpm_limit: rpmValue } : {}),
            ...(expiresValue !== undefined ? { expires_in_days: expiresValue } : {})
          }
        : {
            rpm_limit: rpmValue ?? 60,
            expires_in_days: expiresValue ?? null,
            allowed_models: formAllowedModels.trim() || null
          };

      const res = await fetch(`${cleanUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create key';

        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = await res.text();
        }

        throw new Error(errorMessage);
      }

      setCreateOpen(false);
      await fetchKeys();
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create key');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteKeyConfirm) return;
    try {
      const cleanUrl = apiUrl.replace(/\/$/, '');
      const endpoint = isAdmin ? `/admin/keys/${deleteKeyConfirm}` : `/user/keys`;
      const token = isAdmin ? adminKey : userToken;
      const res = await fetch(`${cleanUrl}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchKeys();
      else console.error("Failed to delete key", await res.text());
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteKeyConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">API Keys</h2>
            <p className="mt-1 text-sm text-slate-500">
              จัดการคีย์การเข้าถึง ดูสถานะการหมดอายุ และตรวจสอบข้อจำกัดการใช้งานในหน้าเดียว
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={openCreateModal} className="btn-primary !py-2 !px-4 text-sm">
              <Plus size={14} />
              {isAdmin ? 'Create Key' : hasExistingUserKey ? 'Update Key' : 'Create Key'}
            </button>
            <button onClick={fetchKeys} className="btn-secondary !py-2 !px-4 text-sm">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Key size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">Total Keys</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{keys.length}</div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">Active Keys</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{activeKeys}</div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Activity size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">Rate Limited</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{limitedKeys}</div>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-[32px]">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Key size={24} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">No API Keys</h3>
            <p className="mt-2 text-slate-500">ยังไม่พบคีย์ที่พร้อมใช้งานในบัญชีนี้</p>
            <button onClick={openCreateModal} className="btn-primary mx-auto mt-6">
              <Plus size={16} />
              {isAdmin ? 'Create First Key' : 'Create Your Key'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table text-left">
              <thead>
                <tr>
                  <th>Name / Owner</th>
                  <th>API Key</th>
                  <th>Models</th>
                  <th>Limit (RPM)</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const expired = isExpired(k.expires_at);
                  return (
                    <tr key={k.key}>
                      <td>
                        <div className="font-semibold text-slate-900">{k.name || 'Untitled key'}</div>
                        {isAdmin && (
                          <div className="mt-1 text-xs text-slate-500">
                            Owner: {k.owner_username || 'Admin'}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                          onClick={() => handleCopyKey(k.key)}
                          title="Click to copy"
                        >
                          <Copy size={14} />
                          {maskApiKey(k.key)}
                          {copiedKey === k.key && <span className="text-xs text-blue-500">Copied</span>}
                        </button>
                      </td>
                      <td className="text-sm text-slate-600">
                        {k.allowed_models ? (
                          <div className="flex flex-wrap gap-1">
                            {k.allowed_models.split(',').map((m) => (
                              <span key={m} className="badge-blue">
                                {m.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">All Models</span>
                        )}
                      </td>
                      <td>
                        {k.rpm_limit ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
                            <Activity size={14} />
                            {k.rpm_limit} / min
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">Unlimited</span>
                        )}
                      </td>
                      <td>
                        <span className={expired ? 'badge-red' : 'badge-green'}>
                          {expired ? 'Expired' : 'Active'}
                        </span>
                        {!expired && k.expires_at && (
                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 size={12} />
                            {formatDate(k.expires_at)}
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                            onClick={() => setDeleteKeyConfirm(k.key)}
                            title="Revoke Key"
                          >
                            <Trash2 size={16} />
                            Revoke
                          </button>
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

      <Modal isOpen={!!deleteKeyConfirm} onClose={() => setDeleteKeyConfirm(null)} title="Revoke API Key">
        <div className="mb-6 text-slate-600">
          Are you sure you want to revoke this key? Any applications using it will immediately lose access.
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteKeyConfirm(null)} className="btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button onClick={handleDeleteKey} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            Revoke Key
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError('');
        }}
        title={isAdmin ? 'Create API Key' : hasExistingUserKey ? 'Update API Key' : 'Create API Key'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {createError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{createError}</span>
            </div>
          )}

          {isAdmin ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Key Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Production Key"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Custom Key (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ปล่อยว่างเพื่อ generate ให้อัตโนมัติ"
                  value={formCustomKey}
                  onChange={(e) => setFormCustomKey(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  RPM Limit
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="เช่น 120"
                  value={formRpmLimit}
                  onChange={(e) => setFormRpmLimit(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="เว้นว่างได้"
                  value={formExpiresDays}
                  onChange={(e) => setFormExpiresDays(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  RPM Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="input-field"
                  value={formRpmLimit}
                  onChange={(e) => setFormRpmLimit(e.target.value)}
                />
                <p className="mt-2 text-xs text-slate-500">สำหรับ user ระบบจะจำกัดไม่เกิน 60 RPM</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="เว้นว่างได้"
                  value={formExpiresDays}
                  onChange={(e) => setFormExpiresDays(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 relative">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Allowed Models
                </label>
                <div 
                  className="input-field min-h-[42px] cursor-pointer flex flex-wrap items-center gap-1.5 relative pr-8"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {(!formAllowedModels || formAllowedModels.trim() === '') ? (
                    <span className="text-slate-400">All models allowed (เว้นว่าง)</span>
                  ) : (
                    formAllowedModels.split(',').map(m => m.trim()).filter(Boolean).map(m => (
                      <span key={m} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                        {m}
                        <X size={12} className="cursor-pointer hover:text-blue-900" onClick={(e) => { 
                          e.stopPropagation(); 
                          const updated = formAllowedModels.split(',').map(x => x.trim()).filter(x => x && x !== m);
                          setFormAllowedModels(updated.join(','));
                        }} />
                      </span>
                    ))
                  )}
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-[70px] left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-50 p-1">
                      {availableModels.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500 text-center">Loading models...</div>
                      ) : (
                        availableModels.map(model => {
                          const isSelected = formAllowedModels.split(',').map(m => m.trim()).includes(model);
                          return (
                            <label key={model} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {
                                  let selected = formAllowedModels.split(',').map(m => m.trim()).filter(Boolean);
                                  if (isSelected) {
                                    selected = selected.filter(m => m !== model);
                                  } else {
                                    selected.push(model);
                                  }
                                  setFormAllowedModels(selected.join(','));
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-slate-700">{model}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
                <p className="mt-2 text-xs text-slate-500">เลือกโมเดลที่ต้องการให้ Key นี้ใช้งานได้ เว้นว่างถ้าต้องการให้ใช้ได้ทั้งหมด</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button onClick={handleCreateKey} disabled={createLoading} className="btn-primary px-4 py-2 text-sm">
              {createLoading ? 'Saving...' : isAdmin ? 'Create Key' : hasExistingUserKey ? 'Update Key' : 'Create Key'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
