import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import Masters from './pages/Masters';
import Login from './pages/Login';
import LRPrintModal from './components/LRPrintModal';
import MemoPrintModal from './components/MemoPrintModal';

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
  const [activeSearchResult, setActiveSearchResult] = useState(null);

  const handleSearchResultSelect = (result) => {
    setActiveSearchResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onSelectSearchResult={handleSearchResultSelect}
        />

        <main className="flex-1 pb-12">
          {children}
        </main>
      </div>

      {/* Global Quick Search Result Modals */}
      {activeSearchResult && activeSearchResult.type === 'LR' && (
        <LRPrintModal lr={activeSearchResult} onClose={() => setActiveSearchResult(null)} />
      )}
      {activeSearchResult && activeSearchResult.type === 'Memo' && (
        <MemoPrintModal memo={activeSearchResult} onClose={() => setActiveSearchResult(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
            <Route path="/dashboard" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
            <Route path="/stock-in" element={<AuthenticatedRoute><StockIn /></AuthenticatedRoute>} />
            <Route path="/stock-out" element={<AuthenticatedRoute><StockOut /></AuthenticatedRoute>} />
            <Route path="/masters" element={<AuthenticatedRoute><Masters /></AuthenticatedRoute>} />
            <Route path="/reports" element={<AuthenticatedRoute><Reports /></AuthenticatedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}
