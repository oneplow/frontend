import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { AdminSignIn } from './pages/AdminSignIn';
import { Dashboard } from './pages/Dashboard';
import { KeysPage } from './pages/KeysPage';
import { LogsPage } from './pages/LogsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { ModelsPage } from './pages/ModelsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { IntegrationSetupPage } from './pages/IntegrationSetupPage';
import { StatusPage } from './pages/StatusPage';
import { UsagePage } from './pages/UsagePage';
import { CommunityPage } from './pages/CommunityPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/admin" element={<AdminSignIn />} />

      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/integrations/:id" element={<IntegrationSetupPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </AppSettingsProvider>
  );
}

export default App;
