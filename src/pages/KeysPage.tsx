import { useState, useEffect } from 'react';
import { Copy, Plus, Search, AlertCircle, RefreshCw, Trash2, Edit2, ChevronRight, Clock3, X, ChevronDown, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageLoader } from '../components/PageLoader';

// --- Shared Types & Utils ---
export interface ApiKey {
  key: string;
  name: string | null;
  created_at: number;
  expires_at: number | null;
  rpm_limit: number | null;
  allowed_models: string | null;
  owner_username?: string | null;
  token_limit?: number | null;
  tokens_used?: number | null;
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
  const [loading, setLoading] = useState(true);
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
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editTargetKey, setEditTargetKey] = useState<ApiKey | null>(null);

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
  const panelClass = 'app-panel overflow-hidden rounded-xl';

  // const activeKeys = filteredKeys.filter(k => k.status === 'active').length;
  // const limitedKeys = filteredKeys.filter(k => k.status === 'limited').length;
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

    setModelSearchQuery('');
    setCreateOpen(true);
  };

  const openEditModal = (keyObj: ApiKey) => {
    setEditTargetKey(keyObj);
    setFormName(keyObj.name || '');
    setFormRpmLimit(keyObj.rpm_limit !== null ? String(keyObj.rpm_limit) : '');
    setFormExpiresDays(getRemainingDays(keyObj.expires_at));
    setFormAllowedModels(keyObj.allowed_models || '');
    setEditError('');
    setModelSearchQuery('');
    setEditOpen(true);
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

  const handleEditKey = async () => {
    if (!editTargetKey) return;
    setEditLoading(true);
    setEditError('');

    try {
      const cleanUrl = apiUrl.replace(/\/$/, '');
      const rpmValue = formRpmLimit.trim() === '' ? null : Number(formRpmLimit);
      const expiresValue = formExpiresDays.trim() === '' ? null : Number(formExpiresDays);

      if (rpmValue !== null && Number.isNaN(rpmValue)) {
        throw new Error('RPM limit ไม่ถูกต้อง');
      }
      if (expiresValue !== null && Number.isNaN(expiresValue)) {
        throw new Error('จำนวนวันหมดอายุไม่ถูกต้อง');
      }

      const payload = {
        name: formName.trim() || null,
        rpm_limit: rpmValue,
        expires_in_days: expiresValue,
        allowed_models: formAllowedModels.trim() || null
      };

      const res = await fetch(`${cleanUrl}/admin/keys/${editTargetKey.key}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = 'Failed to edit key';
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = await res.text();
        }
        throw new Error(errorMessage);
      }

      setEditOpen(false);
      await fetchKeys();
    } catch (error: any) {
      setEditError(error.message || 'Failed to edit key');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6 pb-20">
      {loading && <PageLoader />}

      <div className="mb-6 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 hover:underline transition-colors">Overview</Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">API keys</span>
      </div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight app-text">API keys</h1>
          <p className="text-sm app-muted">Create and manage keys for programmatic access to the gateway.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchKeys} className="app-button-secondary inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium">
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={openCreateModal} className="app-button-primary inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium">
            <Plus size={16} />
            {isAdmin ? 'Create key' : hasExistingUserKey ? 'Update key' : 'Create key'}
          </button>
        </div>
      </div>

        <div className={panelClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr
                  className="text-xs font-semibold tracking-wider uppercase app-muted"
                  style={{
                    borderBottom: '1px solid var(--app-border)',
                    backgroundColor: 'var(--app-surface-muted)',
                  }}
                >
                  <th className="px-6 py-4">Name / Owner</th>
                  <th className="px-6 py-4">API Key</th>
                  <th className="px-6 py-4">Models</th>
                  <th className="px-6 py-4">Limit (RPM)</th>
                  <th className="px-6 py-4">Tokens</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--app-surface)' }}>
                {keys.map((k) => {
                  const expired = isExpired(k.expires_at);
                  return (
                    <tr
                      key={k.key}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--app-border)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--app-surface-muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold app-text">{k.name || 'Untitled key'}</div>
                        {isAdmin && (
                          <div className="mt-1 text-xs app-muted">
                            Owner: {k.owner_username || 'Admin'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                          onClick={() => handleCopyKey(k.key)}
                          title="Click to copy"
                          style={{
                            border: '1px solid var(--app-border)',
                            backgroundColor: 'var(--app-surface-muted)',
                            color: 'var(--app-text)',
                          }}
                        >
                          <Copy size={14} />
                          <code className="text-xs">{maskApiKey(k.key)}</code>
                          {copiedKey === k.key && <span className="text-xs text-emerald-600 font-medium">Copied</span>}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm app-muted">
                        {k.allowed_models ? (
                          <div className="flex flex-wrap gap-1">
                            {k.allowed_models.split(',').map((m) => (
                              <span
                                key={m}
                                className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium"
                                style={{
                                  backgroundColor: 'rgba(59, 130, 246, 0.14)',
                                  color: 'var(--app-accent)',
                                  border: '1px solid rgba(59, 130, 246, 0.18)',
                                }}
                              >
                                {m.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="app-muted">All Models</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {k.rpm_limit ? (
                          <div
                            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
                            style={{
                              border: '1px solid var(--app-border)',
                              backgroundColor: 'var(--app-surface-muted)',
                              color: 'var(--app-text)',
                            }}
                          >
                            <Activity size={14} className="app-muted" />
                            {k.rpm_limit} / min
                          </div>
                        ) : (
                          <span className="app-muted">Unlimited</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {k.token_limit !== null && k.token_limit !== undefined ? (
                          <div className="flex flex-col gap-1 w-32">
                            <div className="text-xs font-medium app-text">
                              {(k.tokens_used || 0).toLocaleString()} / {k.token_limit.toLocaleString()}
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--app-surface-muted)' }}>
                              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, ((k.tokens_used || 0) / k.token_limit) * 100)}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="app-muted">Unlimited</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${expired ? 'bg-red-50 text-red-700 ring-red-600/10' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'}`}>
                            {expired ? 'Expired' : 'Active'}
                          </span>
                          {!expired && k.expires_at && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] app-muted">
                              <Clock3 size={12} />
                              {formatDate(k.expires_at)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <button
                              className="app-button-secondary inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium shadow-sm"
                              onClick={() => openEditModal(k)}
                              title="Edit Key"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm"
                            onClick={() => setDeleteKeyConfirm(k.key)}
                            title="Revoke Key"
                            style={{
                              border: '1px solid rgba(248, 113, 113, 0.5)',
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                            }}
                          >
                            <Trash2 size={14} />
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
        </div>
      <Modal isOpen={!!deleteKeyConfirm} onClose={() => setDeleteKeyConfirm(null)} title="Revoke API Key">
        <div className="mb-6 app-muted">
          Are you sure you want to revoke this key? Any applications using it will immediately lose access.
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteKeyConfirm(null)} className="btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button onClick={handleDeleteKey} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
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
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{createError}</span>
            </div>
          )}

          {isAdmin ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                  Custom Key (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Leave empty to auto-generate"
                  value={formCustomKey}
                  onChange={(e) => setFormCustomKey(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                  RPM Limit
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="e.g. 120"
                  value={formRpmLimit}
                  onChange={(e) => setFormRpmLimit(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="Optional"
                  value={formExpiresDays}
                  onChange={(e) => setFormExpiresDays(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
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
                <p className="mt-2 text-xs app-muted">User limit is capped at 60 RPM</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="Optional"
                  value={formExpiresDays}
                  onChange={(e) => setFormExpiresDays(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 relative">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                  Allowed Models
                </label>
                <div
                  className="input-field min-h-[42px] cursor-pointer flex flex-wrap items-center gap-1.5 relative pr-8"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {(!formAllowedModels || formAllowedModels.trim() === '') ? (
                    <span className="app-muted">All models allowed</span>
                  ) : (
                    formAllowedModels.split(',').map(m => m.trim()).filter(Boolean).map(m => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1"
                        style={{ backgroundColor: 'var(--app-surface-muted)', color: 'var(--app-text)' }}
                      >
                        {m}
                        <X size={12} className="cursor-pointer" onClick={(e) => {
                          e.stopPropagation();
                          const updated = formAllowedModels.split(',').map(x => x.trim()).filter(x => x && x !== m);
                          setFormAllowedModels(updated.join(','));
                        }} />
                      </span>
                    ))
                  )}
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 app-muted pointer-events-none" />
                </div>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="app-select-menu absolute top-[70px] left-0 right-0 mt-1 max-h-64 flex flex-col rounded-lg z-50 overflow-hidden">
                      <div className="p-2 shrink-0 relative" style={{ borderBottom: '1px solid var(--app-border)' }}>
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 app-muted" />
                        <input
                          type="text"
                          className="w-full rounded-md pl-9 pr-3 py-1.5 text-sm"
                          style={{
                            backgroundColor: 'var(--app-surface-muted)',
                            color: 'var(--app-text)',
                          }}
                          placeholder="Search models..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="overflow-y-auto p-1">
                        {availableModels.length === 0 ? (
                          <div className="p-3 text-sm app-muted text-center">Loading models...</div>
                        ) : (
                          availableModels.filter(m => m.toLowerCase().includes(modelSearchQuery.toLowerCase())).length === 0 ? (
                            <div className="p-3 text-sm app-muted text-center">No models found</div>
                          ) : (
                            availableModels.filter(m => m.toLowerCase().includes(modelSearchQuery.toLowerCase())).map(model => {
                              const isSelected = formAllowedModels.split(',').map(m => m.trim()).includes(model);
                              return (
                                <label key={model} className="app-select-option rounded-md cursor-pointer">
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
                                    className="rounded text-blue-600 focus:ring-0"
                                  />
                                  <span className="text-sm font-medium app-text">{model}</span>
                                </label>
                              );
                            })
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
                <p className="mt-2 text-xs app-muted">Select allowed models for this key. Leave blank to allow all.</p>
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

      {/* Edit Key Modal (Admin Only) */}
      <Modal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditError('');
        }}
        title="Edit API Key"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {editError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{editError}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
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
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                RPM Limit
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                placeholder="Leave blank for Unlimited"
                value={formRpmLimit}
                onChange={(e) => setFormRpmLimit(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                Expires in (Days)
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                placeholder="Leave blank for no expiry"
                value={formExpiresDays}
                onChange={(e) => setFormExpiresDays(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 relative">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider app-muted">
                Allowed Models
              </label>
              <div
                className="input-field min-h-[42px] cursor-pointer flex flex-wrap items-center gap-1.5 relative pr-8"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {(!formAllowedModels || formAllowedModels.trim() === '') ? (
                  <span className="app-muted">All models allowed</span>
                ) : (
                  formAllowedModels.split(',').map(m => m.trim()).filter(Boolean).map(m => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1"
                      style={{ backgroundColor: 'var(--app-surface-muted)', color: 'var(--app-text)' }}
                    >
                      {m}
                      <X size={12} className="cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        const updated = formAllowedModels.split(',').map(x => x.trim()).filter(x => x && x !== m);
                        setFormAllowedModels(updated.join(','));
                      }} />
                    </span>
                  ))
                )}
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 app-muted pointer-events-none" />
              </div>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="app-select-menu absolute top-[70px] left-0 right-0 mt-1 max-h-64 flex flex-col rounded-lg z-50 overflow-hidden">
                    <div className="p-2 shrink-0 relative" style={{ borderBottom: '1px solid var(--app-border)' }}>
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 app-muted" />
                      <input
                        type="text"
                        className="w-full rounded-md pl-9 pr-3 py-1.5 text-sm"
                        style={{
                          backgroundColor: 'var(--app-surface-muted)',
                          color: 'var(--app-text)',
                        }}
                        placeholder="Search models..."
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="overflow-y-auto p-1">
                      {availableModels.length === 0 ? (
                        <div className="p-3 text-sm app-muted text-center">Loading models...</div>
                      ) : (
                        availableModels.filter(m => m.toLowerCase().includes(modelSearchQuery.toLowerCase())).length === 0 ? (
                          <div className="p-3 text-sm app-muted text-center">No models found</div>
                        ) : (
                          availableModels.filter(m => m.toLowerCase().includes(modelSearchQuery.toLowerCase())).map(model => {
                            const isSelected = formAllowedModels.split(',').map(m => m.trim()).includes(model);
                            return (
                              <label key={model} className="app-select-option rounded-md cursor-pointer">
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
                                  className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="text-sm font-medium app-text">{model}</span>
                              </label>
                            );
                          })
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
              <p className="mt-2 text-xs app-muted">Select allowed models for this key. Leave blank to allow all.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditOpen(false)} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button onClick={handleEditKey} disabled={editLoading} className="btn-primary px-4 py-2 text-sm">
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
