import { useCallback, useState } from 'react';
import { AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';
import type { TokenResponse } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { AppControls } from '../components/AppControls';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { siteCopy } from '../content/siteCopy';
import { useAppSettings } from '../context/AppSettingsContext';
import { useAuth } from '../context/AuthContext';

export const SignUp = () => {
  const [error, setError] = useState('');
  const { apiUrl, loginUser } = useAuth();
  const { language } = useAppSettings();
  const navigate = useNavigate();
  const copy = siteCopy[language];

  const resolveGoogleErrorMessage = useCallback((message: string, fallback: string) => {
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('not allowed for the given client id') ||
      normalizedMessage.includes('authorized javascript origins') ||
      normalizedMessage.includes('origin') ||
      normalizedMessage.includes('client id')
    ) {
      return copy.auth.googleConfigError;
    }

    if (normalizedMessage.includes('google login is not configured')) {
      return copy.auth.googleBackendConfigError;
    }

    if (normalizedMessage.includes('invalid google token')) {
      return copy.auth.googleInvalidTokenError;
    }

    return message || fallback;
  }, [copy.auth.googleBackendConfigError, copy.auth.googleConfigError, copy.auth.googleInvalidTokenError]);

  const handleGoogleSuccess = useCallback(async (tokenResponse: TokenResponse) => {
    setError('');
    
    try {
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token })
      });
      if (!res.ok) {
        let errorMessage = '';

        try {
          const payload = await res.json();
          errorMessage =
            typeof payload?.detail === 'string'
              ? payload.detail
              : typeof payload?.message === 'string'
                ? payload.message
                : JSON.stringify(payload);
        } catch {
          errorMessage = await res.text();
        }

        throw new Error(resolveGoogleErrorMessage(errorMessage, copy.auth.registrationFailed));
      }
      const data = await res.json();
      
      loginUser(apiUrl, data.token, data.username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(resolveGoogleErrorMessage(err.message || '', copy.auth.registrationFailed));
    }
  }, [apiUrl, copy.auth.registrationFailed, loginUser, navigate, resolveGoogleErrorMessage]);

  const handleGoogleError = useCallback((message?: string) => {
    setError(resolveGoogleErrorMessage(message || '', copy.auth.googleConfigError));
  }, [copy.auth.googleConfigError, resolveGoogleErrorMessage]);

  return (
    <div className="page-shell auth-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full w-full max-w-[1800px] items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full app-button-secondary px-4 py-2 text-sm font-medium">
          <ArrowLeft size={16} />
          {copy.auth.backHome}
        </Link>
        <AppControls />
      </div>

      <div className="w-full max-w-md">
        <div className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="mb-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserPlus size={24} />
            </div>
            <h2 className="mt-5 text-3xl font-semibold app-text">{copy.auth.signUpTitle}</h2>
            <p className="mt-2 text-sm leading-6 app-muted">
              {copy.auth.signUpDescription}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signup_with" />

          <div className="mt-8 text-center text-sm app-muted">
            {copy.auth.alreadyHaveAccount}{' '}
            <Link to="/sign-in" className="font-semibold text-blue-600 hover:text-blue-700">
              {copy.auth.signInLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
