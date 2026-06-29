import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  userToken: string;
  username: string;
  userRole: string;
  isAdmin: boolean;
  isUser: boolean;
  loginUser: (url: string, token: string, user: string, role?: string) => void;
  loginAdminFallback: (url: string, key: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [apiUrl, setApiUrlState] = useState(localStorage.getItem('API_URL') || import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [userToken, setUserToken] = useState(localStorage.getItem('USER_TOKEN') || '');
  const [username, setUsername] = useState(localStorage.getItem('USERNAME') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('USER_ROLE') || 'user');

  const isAdmin = userRole === 'admin';
  const isUser = userToken !== '';

  const setApiUrl = (url: string) => {
    const cleanUrl = url.replace(/\/$/, '');
    localStorage.setItem('API_URL', cleanUrl);
    setApiUrlState(cleanUrl);
  };

  const loginUser = (url: string, token: string, user: string, role?: string) => {
    setApiUrl(url);
    localStorage.setItem('USER_TOKEN', token);
    localStorage.setItem('USERNAME', user);
    localStorage.setItem('USER_ROLE', role || 'user');
    setUserToken(token);
    setUsername(user);
    setUserRole(role || 'user');
  };

  const loginAdminFallback = (url: string, key: string) => {
    setApiUrl(url);
    // Store admin key as user token for API calls; set role to admin
    localStorage.setItem('USER_TOKEN', key);
    localStorage.setItem('USERNAME', 'admin');
    localStorage.setItem('USER_ROLE', 'admin');
    setUserToken(key);
    setUsername('admin');
    setUserRole('admin');
  };

  const logout = () => {
    localStorage.removeItem('USER_TOKEN');
    localStorage.removeItem('USERNAME');
    localStorage.removeItem('USER_ROLE');
    localStorage.removeItem('ADMIN_KEY');
    setUserToken('');
    setUsername('');
    setUserRole('user');
  };

  return (
    <AuthContext.Provider value={{
      apiUrl, setApiUrl, userToken, username, userRole, isAdmin, isUser, loginUser, loginAdminFallback, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
