import { useState } from 'react';
import { AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { AppControls } from '../components/AppControls';
import { siteCopy } from '../content/siteCopy';
import { useAppSettings } from '../context/AppSettingsContext';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
  const [error, setError] = useState('');
  const { apiUrl, loginUser } = useAuth();
  const { language } = useAppSettings();
  const navigate = useNavigate();
  const copy = siteCopy[language];

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
      setError(err.message || copy.auth.loginFailed);
    }
  };

  return (
    <div className="page-shell auth-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full app-button-secondary px-4 py-2 text-sm font-medium">
          <ArrowLeft size={16} />
          {copy.auth.backHome}
        </Link>
        <AppControls />
      </div>

      <div className="w-full max-w-md">
        <div className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <KeyRound size={26} />
            </div>
            <h2 className="mt-5 text-3xl font-semibold app-text">{copy.auth.signInTitle}</h2>
            <p className="mt-2 text-sm leading-6 app-muted">
              {copy.auth.signInDescription}
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
              onError={() => setError(copy.auth.googleSignInFailed)}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div className="mt-8 text-center text-sm app-muted">
            {copy.auth.noAccount}{' '}
            <Link to="/sign-up" className="font-semibold text-blue-600 hover:text-blue-700">
              {copy.auth.createAccount}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
