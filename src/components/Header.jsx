import React from 'react';
import { Menu, Clock } from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left section: Mobile menu button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="sm:hidden text-sm font-extrabold text-[#2a4393] uppercase tracking-wide">
          ROYAL ROADLINES
        </h2>

        <div className="hidden sm:block">
          <h2 className="text-sm font-extrabold text-[#2a4393] uppercase tracking-wide">ROYAL ROADLINES</h2>
          <p className="text-[11px] text-slate-500 font-medium">MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Near masjid Bunder Station(W),Near Bhandari Police Chowki, Mumbai-400 003 | MOB: 9850194732 / 9370229449</p>
        </div>
      </div>

      {/* Right status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-medium text-slate-700">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  );
}
