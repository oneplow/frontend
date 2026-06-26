import { useState, useEffect } from 'react';
import { Users, ShieldAlert, Key, Trash2, Edit2, Mail, RefreshCw, UserRoundCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from './KeysPage';
import { Modal } from '../components/Modal';

interface UserData {
  username: string;
  email: string | null;
  created_at: number;
  key?: string | null;
  rpm_limit?: number | null;
  allowed_models?: string | null;
}

export const UsersPage = () => {
  const { apiUrl, adminKey, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [apiUrl, isAdmin, adminKey]);

  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editRpmLimit, setEditRpmLimit] = useState<string>('');
  const [editExpiresInDays, setEditExpiresInDays] = useState<string>('');
  const [editAllowedModels, setEditAllowedModels] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);

  const openEditModal = (user: UserData) => {
    setEditUser(user);
    setEditRpmLimit(user.rpm_limit ? user.rpm_limit.toString() : '60');
    setEditExpiresInDays(''); // default to empty
    setEditAllowedModels(user.allowed_models || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/users/${editUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          rpm_limit: editRpmLimit ? parseInt(editRpmLimit) : null,
          expires_in_days: editExpiresInDays ? parseInt(editExpiresInDays) : null,
          allowed_models: editAllowedModels.trim() || null
        })
      });
      if (res.ok) {
        setEditUser(null);
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user');
    } finally {
      setEditLoading(false);
    }
  };

  const usersWithKeys = users.filter((user) => user.key).length;

  const handleDeleteUser = async () => {
    if (!deleteUserConfirm) return;
    try {
      const res = await fetch(`${apiUrl}/admin/users/${deleteUserConfirm}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteUserConfirm(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="surface-card flex flex-col items-center justify-center rounded-[32px] p-8 py-20 text-center">
        <ShieldAlert size={48} className="mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="mt-2 text-slate-500">Only administrators can view user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Users</h2>
            <p className="mt-1 text-sm text-slate-500">
              ดูรายชื่อผู้ใช้งานทั้งหมด ติดตามบัญชีที่เปิดใช้งานคีย์ และจัดการข้อมูลจากมุมมองเดียว
            </p>
          </div>
          <button onClick={fetchUsers} className="btn-secondary !py-2 !px-4 text-sm">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">Total Users</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{users.length}</div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <UserRoundCheck size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">Users With Key</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{usersWithKeys}</div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Mail size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">Email Coverage</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">
            {users.length ? `${Math.round((users.filter((user) => user.email).length / users.length) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-[32px]">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table text-left">
              <thead>
                <tr>
                  <th>Username / Email</th>
                  <th>Key Exists</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username}>
                    <td>
                      <div className="font-semibold text-slate-900">{u.username}</div>
                      <div className="mt-1 text-xs text-slate-500">{u.email || 'No email provided'}</div>
                    </td>
                    <td>
                      <span className={u.key ? 'badge-blue' : 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500'}>
                        <Key size={12} />
                        {u.key ? 'Has Key' : 'No Key'}
                      </span>
                    </td>
                    <td className="text-sm text-slate-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                          onClick={() => openEditModal(u)}
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                          onClick={() => setDeleteUserConfirm(u.username)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-10 text-center text-slate-500">No users found.</div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteUserConfirm} onClose={() => setDeleteUserConfirm(null)} title="Delete User">
        <div className="mb-6 text-slate-600">
          Are you sure you want to permanently delete user <strong>{deleteUserConfirm}</strong>? This action cannot be undone.
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteUserConfirm(null)} className="btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button onClick={handleDeleteUser} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            Delete User
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit User: ${editUser?.username}`}>
        {editUser && !editUser.key && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            This user does not have an API key yet. Modifying these settings will generate a new key for them.
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">RPM Limit (max 60)</label>
            <input
              type="number"
              className="input-field"
              value={editRpmLimit}
              onChange={(e) => setEditRpmLimit(e.target.value)}
              min="1"
              max="60"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Expires in Days</label>
            <input
              type="number"
              className="input-field"
              value={editExpiresInDays}
              onChange={(e) => setEditExpiresInDays(e.target.value)}
              min="1"
              placeholder="Leave empty to not change expiry"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Allowed Models</label>
            <input
              type="text"
              className="input-field"
              value={editAllowedModels}
              onChange={(e) => setEditAllowedModels(e.target.value)}
              placeholder="e.g. gpt-4o, gemini-3-pro (leave empty for all)"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setEditUser(null)} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={editLoading} className="btn-primary px-4 py-2 text-sm">
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
