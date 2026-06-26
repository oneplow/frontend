import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { AdminSignIn } from './pages/AdminSignIn';
import { Dashboard } from './pages/Dashboard';
import { KeysPage } from './pages/KeysPage';
import { UsersPage } from './pages/UsersPage';
import { Docs } from './pages/Docs';
import { ProfilePage } from './pages/ProfilePage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/admin" element={<AdminSignIn />} />

      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
