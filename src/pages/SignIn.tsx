import React, { useState } from 'react';
import { ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { apiUrl, loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      loginUser(apiUrl, data.token, authUsername);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <KeyRound size={26} />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in เพื่อจัดการ API key และเข้าถึงเอกสารของระบบ
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Username
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="johndoe"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500 text-center">
            ยังไม่มีบัญชี?
            <Link to="/sign-up" className="ml-2 font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
