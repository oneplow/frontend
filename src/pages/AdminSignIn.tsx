import React, { useState } from 'react';
import { ArrowRight, Shield, AlertCircle, Info } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';

export const AdminSignIn = () => {
  const [adminUrl, setAdminUrl] = useState('https://api.mineway.cloud');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdminFallback } = useAuth();
  const { language } = useAppSettings();
  const navigate = useNavigate();
  const copy =
    language === 'th'
      ? {
          title: 'พอร์ทัลผู้ดูแลระบบ (Fallback)',
          description: 'ใช้ ADMIN_KEY เพื่อเข้าสู่ระบบแบบเดิม (สำหรับย้อนกลับ)',
          notice: 'ถ้า email ของคุณถูกตั้งเป็น admin ในระบบแล้ว ให้เข้าสู่ระบบผ่าน Google Sign-In ปกติที่หน้าเข้าสู่ระบบ',
          invalidKey: 'Admin Key ไม่ถูกต้อง',
          loginFailed: 'เข้าสู่ระบบไม่สำเร็จ',
          apiUrl: 'API URL',
          adminKey: 'Admin Key (Fallback)',
          adminKeyPlaceholder: 'กรอก ADMIN_KEY',
          authenticating: 'กำลังยืนยันตัวตน...',
          accessPanel: 'เข้าสู่แผงผู้ดูแลระบบ',
          returnToUser: 'กลับไปหน้าเข้าสู่ระบบปกติ',
          goToSignIn: 'เข้าสู่ระบบด้วย Google',
        }
      : {
          title: 'Admin Portal (Fallback)',
          description: 'Use ADMIN_KEY for legacy admin access.',
          notice: 'If your email is configured as an admin, just sign in with Google on the normal sign-in page.',
          invalidKey: 'Invalid Admin Key',
          loginFailed: 'Login failed',
          apiUrl: 'API URL',
          adminKey: 'Admin Key (Fallback)',
          adminKeyPlaceholder: 'Enter ADMIN_KEY',
          authenticating: 'Authenticating...',
          accessPanel: 'Access Admin Panel',
          returnToUser: 'Return to User Login',
          goToSignIn: 'Sign in with Google',
        };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanUrl = adminUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/admin/keys`, {
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error(copy.invalidKey);

      loginAdminFallback(cleanUrl, adminKey);
      navigate('/dashboard/keys');
    } catch (err: any) {
      setError(err.message || copy.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell auth-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-100 p-3.5 flex items-start gap-3">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[13px] leading-relaxed text-blue-700">{copy.notice}</p>
          </div>

          <div className="mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Shield size={26} />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{copy.description}</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {copy.apiUrl}
              </label>
              <input
                type="url"
                className="input-field"
                value={adminUrl}
                onChange={(e) => setAdminUrl(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {copy.adminKey}
              </label>
              <input
                type="password"
                className="input-field"
                placeholder={copy.adminKeyPlaceholder}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? copy.authenticating : copy.accessPanel}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 border-t border-blue-100 pt-5 flex flex-col items-center gap-3">
            <Link to="/sign-in" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {copy.goToSignIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
