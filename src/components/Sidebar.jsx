import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Receipt, 
  PackagePlus, 
  Truck, 
  FolderKanban,
  BarChart3, 
  LogOut,
  X,
  Calculator,
  Users,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Stock In (LR Entry)', path: '/stock-in', icon: PackagePlus },
    { label: 'Stock Out (Memo)', path: '/stock-out', icon: Truck },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Transport Agent', path: '/transport-agent', icon: Users },
    { label: 'Masters (Drop Box)', path: '/masters', icon: FolderKanban },
    { label: 'Accounting', path: '/accounting', icon: Calculator },
    { label: 'Reports', path: '/reports', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-gradient-to-b from-[#070d21] via-[#0c1636] to-[#050917] text-slate-200 flex flex-col justify-between
        border-r border-slate-800/80 shadow-2xl
        transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-20 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#060b1c]/60 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Royal Roadlines Logo" 
                className="h-10 w-auto max-w-[68px] object-contain shrink-0" 
              />
              <div className="overflow-hidden leading-tight">
                <h1 className="font-black text-white tracking-wider text-sm truncate uppercase">
                  ROYAL ROADLINES
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-amber-400 font-extrabold tracking-wider uppercase truncate block">
                    RELIABLE • SAFE • ON TIME
                  </span>
                </div>
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
          <nav className="p-3.5 space-y-1.5 overflow-y-auto flex-1">
            <div className="px-3 pt-2 pb-1.5 text-[10.5px] font-bold text-amber-400/80 uppercase tracking-widest flex items-center justify-between">
              <span>Operations Fleet</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-700 to-[#1b3280] text-white font-bold border-l-4 border-amber-400 shadow-md shadow-blue-950/60' 
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer & System Status */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#050917]/70 space-y-2.5">
          <div className="bg-[#0c1636]/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-700/60 shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-sm border border-amber-300">
                {currentUser?.name?.[0]?.toUpperCase() || 'R'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Staff User'}</p>
                <p className="text-[10px] text-amber-300/80 font-medium truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Dispatcher
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-1 text-center">
            <span className="text-[9.5px] font-mono text-slate-500 block">
              ROYAL ROADLINES FLEET OS v2.4
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
