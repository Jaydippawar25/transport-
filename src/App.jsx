import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import Accounting from './pages/Accounting';
import Masters from './pages/Masters';
import TransportAgent from './pages/TransportAgent';

// Protected Route Guard: If not authenticated, render Login directly
function AuthenticatedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
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
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
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
