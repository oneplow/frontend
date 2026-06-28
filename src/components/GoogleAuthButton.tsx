import { memo, useCallback } from 'react';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import { useAppSettings } from '../context/AppSettingsContext';

type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with';

interface GoogleAuthButtonProps {
  onSuccess: (response: TokenResponse) => void;
  onError: (message?: string) => void;
  text?: GoogleButtonText;
}

const buttonLabel = {
  th: {
    signin_with: 'ลงชื่อเข้าใช้ด้วย Google',
    signup_with: 'สมัครด้วย Google',
    continue_with: 'ไปต่อด้วย Google',
  },
  en: {
    signin_with: 'Sign in with Google',
    signup_with: 'Sign up with Google',
    continue_with: 'Continue with Google',
  },
};

export const GoogleAuthButton = memo(({ onSuccess, onError, text = 'signin_with' }: GoogleAuthButtonProps) => {
  const { language } = useAppSettings();
  const login = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess,
    onError: () => onError(),
    onNonOAuthError: (error) => onError(error.type),
  });

  const handleClick = useCallback(() => {
    login();
  }, [login]);

  return (
    <div className="mt-6 w-full">
      <button
        type="button"
        onClick={handleClick}
        className="app-google-button group flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium cursor-pointer"
        aria-label={buttonLabel[language][text]}
      >
        <span className="app-google-badge flex h-10 w-10 items-center justify-center rounded-xl">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.52 5.52 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.55-5.18 3.55-8.67Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.01c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.95H1.3v3.1A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.29A7.2 7.2 0 0 1 4.93 12c0-.79.14-1.56.37-2.29V6.6H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.4l4-3.11Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.95 1.16 15.23 0 12 0A12 12 0 0 0 1.3 6.6l4 3.11c.94-2.84 3.58-4.94 6.7-4.94Z"
            />
          </svg>
        </span>
        <span>{buttonLabel[language][text]}</span>
      </button>
    </div>
  );
});
