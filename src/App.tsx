import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import URLScanPage from './pages/URLScanPage';
import EmailScanPage from './pages/EmailScanPage';
import SMSScanPage from './pages/SMSScanPage';
import TextScanPage from './pages/TextScanPage';
import ScreenshotScanPage from './pages/ScreenshotScanPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/scan/url" element={<ProtectedRoute><Layout><URLScanPage /></Layout></ProtectedRoute>} />
      <Route path="/scan/email" element={<ProtectedRoute><Layout><EmailScanPage /></Layout></ProtectedRoute>} />
      <Route path="/scan/sms" element={<ProtectedRoute><Layout><SMSScanPage /></Layout></ProtectedRoute>} />
      <Route path="/scan/text" element={<ProtectedRoute><Layout><TextScanPage /></Layout></ProtectedRoute>} />
      <Route path="/scan/screenshot" element={<ProtectedRoute><Layout><ScreenshotScanPage /></Layout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cybershield_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {}
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScanProvider>
          <AppRoutes />
        </ScanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
