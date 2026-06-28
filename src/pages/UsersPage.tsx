import { useState, useEffect } from 'react';
import { Trash2, Edit2, Key, ChevronRight, ChevronLeft, Users, ShieldAlert, Mail, RefreshCw, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from './KeysPage';
import { Modal } from '../components/Modal';
import { PageLoader } from '../components/PageLoader';
import { Select } from '../components/Select';
import { useAppSettings } from '../context/AppSettingsContext';

interface UserData {
  username: string;
  email: string | null;
  created_at: number;
  key?: string | null;
  rpm_limit?: number | null;
  allowed_models?: string | null;
  token_limit?: number | null;
  tokens_used?: number | null;
  token_reset_period?: string | null;
}

export const UsersPage = () => {
  const { apiUrl, adminKey, isAdmin } = useAuth();
  const { language } = useAppSettings();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const copy =
    language === 'th'
      ? {
          overview: 'ภาพรวม',
          title: 'ผู้ใช้งาน',
          description: 'ดูรายชื่อผู้ใช้งานทั้งหมด ติดตามบัญชีที่เปิดใช้งานคีย์ และจัดการข้อมูลจากมุมมองเดียว',
          refresh: 'รีเฟรช',
          stats: {
            totalUsers: 'ผู้ใช้ทั้งหมด',
            usersWithKey: 'ผู้ใช้ที่มีคีย์',
            emailCoverage: 'สัดส่วนอีเมล',
          },
          table: {
            usernameEmail: 'ชื่อผู้ใช้ / อีเมล',
            keyExists: 'มีคีย์หรือไม่',
            tokens: 'โทเคน',
            joined: 'วันที่เข้าร่วม',
            actions: 'การกระทำ',
          },
          keyStatus: {
            hasKey: 'มีคีย์',
            noKey: 'ไม่มีคีย์',
          },
          noEmail: 'ไม่มีอีเมล',
          unlimited: 'ไม่จำกัด',
          edit: 'แก้ไข',
          delete: 'ลบ',
          noUsers: 'ไม่พบผู้ใช้',
          accessDenied: 'ไม่มีสิทธิ์เข้าถึง',
          adminOnly: 'เฉพาะผู้ดูแลระบบเท่านั้นที่ดูหน้าจัดการผู้ใช้ได้',
          deleteTitle: 'ลบผู้ใช้',
          deleteConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้',
          deleteWarning: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
          cancel: 'ยกเลิก',
          deleteUser: 'ลบผู้ใช้',
          editTitle: 'แก้ไขผู้ใช้',
          noApiKeyWarning: 'ผู้ใช้นี้ยังไม่มี API key การแก้ไขค่าด้านล่างจะสร้างคีย์ใหม่ให้ผู้ใช้',
          fields: {
            rpmLimit: 'RPM Limit (สูงสุด 60)',
            expiresInDays: 'จำนวนวันก่อนหมดอายุ',
            allowedModels: 'โมเดลที่อนุญาต',
            tokenQuota: 'โควตาโทเคน',
            tokenLimit: 'Token Limit',
            resetPeriod: 'รอบการรีเซ็ต',
          },
          placeholders: {
            expiresInDays: 'เว้นว่างไว้หากไม่ต้องการเปลี่ยนวันหมดอายุ',
            allowedModels: 'เช่น gpt-4o, gemini-3-pro (เว้นว่างไว้เพื่ออนุญาตทั้งหมด)',
            tokenLimit: 'เว้นว่างไว้หากต้องการไม่จำกัด',
          },
          periods: {
            daily: 'รายวัน',
            weekly: 'รายสัปดาห์',
            biweekly: 'ทุก 2 สัปดาห์',
            monthly: 'รายเดือน',
            never: 'ไม่รีเซ็ต',
          },
          resetNow: 'รีเซ็ตการใช้โทเคนเป็น 0 ทันที',
          saving: 'กำลังบันทึก...',
          saveChanges: 'บันทึกการเปลี่ยนแปลง',
        }
      : {
          overview: 'Overview',
          title: 'Users',
          description: 'View all users, track accounts with active keys, and manage details from one place.',
          refresh: 'Refresh',
          stats: {
            totalUsers: 'Total Users',
            usersWithKey: 'Users With Key',
            emailCoverage: 'Email Coverage',
          },
          table: {
            usernameEmail: 'Username / Email',
            keyExists: 'Key Exists',
            tokens: 'Tokens',
            joined: 'Joined',
            actions: 'Actions',
          },
          keyStatus: {
            hasKey: 'Has Key',
            noKey: 'No Key',
          },
          noEmail: 'No email provided',
          unlimited: 'Unlimited',
          edit: 'Edit',
          delete: 'Delete',
          noUsers: 'No users found.',
          accessDenied: 'Access Denied',
          adminOnly: 'Only administrators can view user management.',
          deleteTitle: 'Delete User',
          deleteConfirm: 'Are you sure you want to permanently delete user',
          deleteWarning: 'This action cannot be undone.',
          cancel: 'Cancel',
          deleteUser: 'Delete User',
          editTitle: 'Edit User',
          noApiKeyWarning: 'This user does not have an API key yet. Modifying these settings will generate a new key for them.',
          fields: {
            rpmLimit: 'RPM Limit (max 60)',
            expiresInDays: 'Expires in Days',
            allowedModels: 'Allowed Models',
            tokenQuota: 'Token Quota',
            tokenLimit: 'Token Limit',
            resetPeriod: 'Reset Period',
          },
          placeholders: {
            expiresInDays: 'Leave empty to not change expiry',
            allowedModels: 'e.g. gpt-4o, gemini-3-pro (leave empty for all)',
            tokenLimit: 'Leave empty for unlimited',
          },
          periods: {
            daily: 'Daily',
            weekly: 'Weekly',
            biweekly: 'Bi-weekly',
            monthly: 'Monthly',
            never: 'Never',
          },
          resetNow: 'Reset token usage to 0 now',
          saving: 'Saving...',
          saveChanges: 'Save Changes',
        };

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
  const [editTokenLimit, setEditTokenLimit] = useState<string>('');
  const [editTokenResetPeriod, setEditTokenResetPeriod] = useState<string>('weekly');
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const openEditModal = (user: UserData) => {
    setEditUser(user);
    setEditRpmLimit(user.rpm_limit ? user.rpm_limit.toString() : '60');
    setEditExpiresInDays(''); // default to empty
    setEditAllowedModels(user.allowed_models || '');
    setEditTokenLimit(user.token_limit !== null && user.token_limit !== undefined ? user.token_limit.toString() : '');
    setEditTokenResetPeriod(user.token_reset_period || 'weekly');
  };

  const handleResetTokens = async () => {
    if (!editUser) return;
    try {
      const res = await fetch(`${apiUrl}/admin/users/${editUser.username}/tokens/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (res.ok) {
        alert('Tokens reset successfully');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert('Error resetting tokens');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      const token_limit = editTokenLimit.trim() === '' ? null : parseInt(editTokenLimit);
      const res = await fetch(`${apiUrl}/admin/users/${editUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          rpm_limit: editRpmLimit ? parseInt(editRpmLimit) : null,
          expires_in_days: editExpiresInDays ? parseInt(editExpiresInDays) : null,
          allowed_models: editAllowedModels.trim() || null,
          token_limit: token_limit,
          token_reset_period: editTokenResetPeriod
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
        <h2 className="text-xl font-bold text-slate-900">{copy.accessDenied}</h2>
        <p className="mt-2 text-slate-500">{copy.adminOnly}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] p-4 lg:p-6 pb-20 space-y-6">
      <div className="mb-2 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">{copy.overview}</Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">{copy.title}</span>
      </div>
      <div className="surface-card rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{copy.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
          </div>
          <button onClick={fetchUsers} className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <RefreshCw size={14} />
            {copy.refresh}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">{copy.stats.totalUsers}</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{users.length}</div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <UserRoundCheck size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">{copy.stats.usersWithKey}</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{usersWithKeys}</div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Mail size={18} />
          </div>
          <div className="mt-4 text-sm text-slate-500">{copy.stats.emailCoverage}</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">
            {users.length ? `${Math.round((users.filter((user) => user.email).length / users.length) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-[32px]">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="data-table text-left">
              <thead>
                <tr>
                  <th>{copy.table.usernameEmail}</th>
                  <th>{copy.table.keyExists}</th>
                  <th>{copy.table.tokens}</th>
                  <th>{copy.table.joined}</th>
                  <th className="text-right">{copy.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.slice((currentPage - 1) * 10, currentPage * 10).map((u) => (
                  <tr key={u.username}>
                    <td>
                      <div className="font-semibold text-slate-900">{u.username}</div>
                      <div className="mt-1 text-xs text-slate-500">{u.email || copy.noEmail}</div>
                    </td>
                    <td>
                      <span className={u.key ? 'badge-blue' : 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500'}>
                        <Key size={12} />
                        {u.key ? copy.keyStatus.hasKey : copy.keyStatus.noKey}
                      </span>
                    </td>
                    <td>
                      {u.token_limit !== null && u.token_limit !== undefined ? (
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-slate-700">
                            {(u.tokens_used || 0).toLocaleString()} / {u.token_limit.toLocaleString()}
                          </div>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, ((u.tokens_used || 0) / u.token_limit) * 100)}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">{copy.unlimited}</span>
                      )}
                    </td>
                    <td className="text-sm text-slate-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                          onClick={() => openEditModal(u)}
                          title={copy.edit}
                        >
                          <Edit2 size={14} />
                          {copy.edit}
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                          onClick={() => setDeleteUserConfirm(u.username)}
                          title={copy.delete}
                        >
                          <Trash2 size={14} />
                          {copy.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-10 text-center text-slate-500">{copy.noUsers}</div>
            )}
          </div>
          {users.length > 10 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4">
              <div className="text-sm text-slate-500">
                {language === 'th' ? `แสดง ${(currentPage - 1) * 10 + 1} ถึง ${Math.min(currentPage * 10, users.length)} จาก ${users.length}` : `Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(currentPage * 10, users.length)} of ${users.length}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-slate-700 mx-2">
                  {currentPage} / {Math.ceil(users.length / 10)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(users.length / 10), p + 1))}
                  disabled={currentPage === Math.ceil(users.length / 10)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      <Modal isOpen={!!deleteUserConfirm} onClose={() => setDeleteUserConfirm(null)} title={copy.deleteTitle}>
        <div className="mb-6 text-slate-600">
          {copy.deleteConfirm} <strong>{deleteUserConfirm}</strong>? {copy.deleteWarning}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteUserConfirm(null)} className="btn-secondary px-4 py-2 text-sm">
            {copy.cancel}
          </button>
          <button onClick={handleDeleteUser} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            {copy.deleteUser}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`${copy.editTitle}: ${editUser?.username || ''}`}>
        {editUser && !editUser.key && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            {copy.noApiKeyWarning}
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{copy.fields.rpmLimit}</label>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">{copy.fields.expiresInDays}</label>
            <input
              type="number"
              className="input-field"
              value={editExpiresInDays}
              onChange={(e) => setEditExpiresInDays(e.target.value)}
              min="1"
              placeholder={copy.placeholders.expiresInDays}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{copy.fields.allowedModels}</label>
            <input
              type="text"
              className="input-field"
              value={editAllowedModels}
              onChange={(e) => setEditAllowedModels(e.target.value)}
              placeholder={copy.placeholders.allowedModels}
            />
          </div>
          
          <div className="my-4 border-t border-slate-200 pt-4">
            <h3 className="mb-4 text-sm font-bold text-slate-900">{copy.fields.tokenQuota}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.fields.tokenLimit}</label>
                <input
                  type="number"
                  className="input-field"
                  value={editTokenLimit}
                  onChange={(e) => setEditTokenLimit(e.target.value)}
                  placeholder={copy.placeholders.tokenLimit}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.fields.resetPeriod}</label>
                <Select
                  value={editTokenResetPeriod}
                  onChange={setEditTokenResetPeriod}
                  options={[
                    { value: 'daily', label: copy.periods.daily },
                    { value: 'weekly', label: copy.periods.weekly },
                    { value: 'biweekly', label: copy.periods.biweekly },
                    { value: 'monthly', label: copy.periods.monthly },
                    { value: 'never', label: copy.periods.never },
                  ]}
                />
              </div>
            </div>
            {editUser?.key && (
              <div className="mt-3">
                <button type="button" onClick={handleResetTokens} className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline">
                  {copy.resetNow}
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setEditUser(null)} className="btn-secondary px-4 py-2 text-sm">
              {copy.cancel}
            </button>
            <button type="submit" disabled={editLoading} className="btn-primary px-4 py-2 text-sm">
              {editLoading ? copy.saving : copy.saveChanges}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
