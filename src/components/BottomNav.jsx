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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between items-center px-1 pb-safe shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => ` 
              flex flex-col items-center justify-center w-full py-1.5 gap-0.5 text-[10px] font-semibold transition-colors
              ${isActive ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-transparent text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="truncate w-full text-center">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

