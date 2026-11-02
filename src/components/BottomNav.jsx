import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, Truck, Calculator, FolderKanban } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { label: 'Dash', path: '/', icon: LayoutDashboard },
    { label: 'Stock In', path: '/stock-in', icon: PackagePlus },
    { label: 'Stock Out', path: '/stock-out', icon: Truck },
    { label: 'Accounting', path: '/accounting', icon: Calculator },
    { label: 'Masters', path: '/masters', icon: FolderKanban }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-between items-center px-1 pt-1 pb-[calc(env(safe-area-inset-bottom)_+_8px)] shadow-[0_-4px_16px_rgba(11,27,78,0.08)] z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => ` 
              flex flex-col items-center justify-center w-full py-1.5 gap-0.5 text-[10px] font-semibold transition-all
              ${isActive ? 'text-[#1b3280] font-bold' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-700 to-[#1b3280] text-white shadow-sm shadow-blue-900/30 ring-2 ring-amber-400/50' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-100'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={`truncate w-full text-center ${isActive ? 'text-[#1b3280] font-extrabold' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
