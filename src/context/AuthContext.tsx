import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  adminKey: string;
  userToken: string;
  username: string;
  isAdmin: boolean;
  isUser: boolean;
  loginAdmin: (url: string, key: string) => void;
  loginUser: (url: string, token: string, user: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [apiUrl, setApiUrlState] = useState(localStorage.getItem('API_URL') || 'http://localhost:8000');
  const [adminKey, setAdminKey] = useState(localStorage.getItem('ADMIN_KEY') || '');
  const [userToken, setUserToken] = useState(localStorage.getItem('USER_TOKEN') || '');
  const [username, setUsername] = useState(localStorage.getItem('USERNAME') || '');

  const isAdmin = adminKey !== '';
  const isUser = userToken !== '';

  const setApiUrl = (url: string) => {
    const cleanUrl = url.replace(/\/$/, '');
    localStorage.setItem('API_URL', cleanUrl);
    setApiUrlState(cleanUrl);
  };

  const loginAdmin = (url: string, key: string) => {
    setApiUrl(url);
    localStorage.setItem('ADMIN_KEY', key);
    setAdminKey(key);
  };

  const loginUser = (url: string, token: string, user: string) => {
    setApiUrl(url);
    localStorage.setItem('USER_TOKEN', token);
    localStorage.setItem('USERNAME', user);
    setUserToken(token);
    setUsername(user);
  };

  const logout = () => {
    localStorage.removeItem('ADMIN_KEY');
    localStorage.removeItem('USER_TOKEN');
    localStorage.removeItem('USERNAME');
    setAdminKey('');
    setUserToken('');
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{
      apiUrl, setApiUrl, adminKey, userToken, username, isAdmin, isUser, loginAdmin, loginUser, logout
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
