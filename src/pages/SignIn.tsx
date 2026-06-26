import { useState } from 'react';
import { AlertCircle, KeyRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
  const [error, setError] = useState('');
  const { apiUrl, loginUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');

    try {
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      loginUser(apiUrl, data.token, data.username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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

          <div className="flex justify-center mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed')}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            ยังไม่มีบัญชีผู้ใช้?{' '}
            <Link to="/sign-up" className="font-semibold text-blue-600 hover:text-blue-700">
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
