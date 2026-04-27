import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Assign from './pages/Assign';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import SlaTracking from './pages/SlaTracking';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// A temporary placeholder page for incomplete routes
const TempPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-dark-hover flex items-center justify-center border border-dark-border mb-4">
      <span className="text-2xl text-ui-muted">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-ui-text mb-2">{title}</h2>
    <p className="text-ui-muted text-sm max-w-md">Halaman ini sedang dalam tahap pengembangan. Navigasi dan komponen dasar sudah siap digunakan.</p>
  </div>
);

export default function App() {
  useEffect(() => {
    // Check local storage for theme preference
    const isDarkGlobal = localStorage.getItem('theme') !== 'light';
    if (isDarkGlobal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="assign" element={<Assign />} />
          <Route path="sla" element={<SlaTracking />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<TempPage title="Pengaturan Sistem" />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
