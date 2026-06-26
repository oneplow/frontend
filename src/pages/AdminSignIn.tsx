import React, { useState } from 'react';
import { ArrowRight, Shield, AlertCircle, LockKeyhole } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminSignIn = () => {
  const [adminUrl, setAdminUrl] = useState('https://api.mineway.cloud');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanUrl = adminUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/admin/keys`, {
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error('Invalid Admin Key');

      loginAdmin(cleanUrl, adminKey);
      navigate('/dashboard/keys');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="surface-card hidden rounded-[36px] p-8 lg:block">
          <div className="badge-blue mb-5">
            <LockKeyhole size={12} />
            Admin Access
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            พื้นที่สำหรับผู้ดูแลระบบที่คงโทนคลีนแบบเดียวกับทั้งพอร์ทัล
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
            ใช้ admin key เพื่อเข้าสู่ระบบและจัดการผู้ใช้งานหรือคีย์ทั้งหมดในมุมมองที่เป็นระเบียบขึ้น
          </p>

          <div className="mt-8 grid gap-4">
            <div className="surface-card-soft rounded-[24px] p-5">
              <div className="text-sm font-semibold text-slate-900">Centralized control</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                ดูข้อมูลผู้ใช้และ API keys ในโครงสร้างเดียวกันกับหน้า user
              </p>
            </div>
            <div className="surface-card-soft rounded-[24px] p-5">
              <div className="text-sm font-semibold text-slate-900">Calm visual hierarchy</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                ใช้สีน้ำเงิน-ขาวเป็นหลัก พร้อมเน้นจุดสำคัญด้วย contrast ที่ชัดเจนแต่ไม่หนักตา
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Shield size={26} />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">Admin portal</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Authenticate ด้วย admin key เพื่อเข้าถึงหน้าจัดการระบบ
            </p>
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
                API URL
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
                Admin Key
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter master key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 border-t border-blue-100 pt-5">
            <Link to="/sign-in" className="text-sm font-medium text-slate-500 transition-colors hover:text-blue-600">
              Return to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
