import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Loader from './components/Loader';
import Login from './pages/Login';

// Lazy-loaded routes for performance & fast mobile loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StockIn = lazy(() => import('./pages/StockIn'));
const StockOut = lazy(() => import('./pages/StockOut'));
const Reports = lazy(() => import('./pages/Reports'));
const Accounting = lazy(() => import('./pages/Accounting'));
const Masters = lazy(() => import('./pages/Masters'));
const TransportAgent = lazy(() => import('./pages/TransportAgent'));

// Protected Route Guard: If not authenticated, render Login directly
function AuthenticatedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader fullScreen message="Loading ROYAL ROADLINES..." subMessage="Authenticating operator session" />
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return <MainLayout>{children}</MainLayout>;
}

// App Layout Shell
function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-dvh pb-24 lg:pb-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 pb-4">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <Loader fullScreen={false} message="Loading Section..." subMessage="Fetching ledger & inventory records" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-dvh">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
            <Route path="/dashboard" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
            <Route path="/stock-in" element={<AuthenticatedRoute><StockIn /></AuthenticatedRoute>} />
            <Route path="/stock-out" element={<AuthenticatedRoute><StockOut /></AuthenticatedRoute>} />
            <Route path="/transport-agent" element={<AuthenticatedRoute><TransportAgent /></AuthenticatedRoute>} />
            <Route path="/masters" element={<AuthenticatedRoute><Masters /></AuthenticatedRoute>} />
            <Route path="/reports" element={<AuthenticatedRoute><Reports /></AuthenticatedRoute>} />
            <Route path="/accounting" element={<AuthenticatedRoute><Accounting /></AuthenticatedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}
