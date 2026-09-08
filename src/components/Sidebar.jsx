import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackagePlus, 
  Truck, 
  FolderKanban,
  BarChart3, 
  LogOut,
  Boxes,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Stock In (LR Entry)', path: '/stock-in', icon: PackagePlus },
    { label: 'Stock Out (Memo)', path: '/stock-out', icon: Truck },
    { label: 'Masters (Drop Box)', path: '/masters', icon: FolderKanban },
    { label: 'Reports', path: '/reports', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between
        transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-700/30 font-black text-sm">
                AR
              </div>
              <div className="overflow-hidden">
                <h1 className="font-extrabold text-white tracking-wide text-sm leading-tight truncate">ATHAHAR ROADWAYS</h1>
                <span className="text-[9.5px] text-cyan-400 font-semibold tracking-wider uppercase truncate block">SANGLI-416416</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-700/25 font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer & System Status */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-800/60 rounded-lg p-3 flex items-center justify-between border border-slate-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name || 'Staff User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'staff@transport.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
              {isFirebaseConfigured ? 'Firestore Live' : 'Demo Fleet Mode'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
