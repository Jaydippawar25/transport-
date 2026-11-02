import React from 'react';
import { Menu, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'short',
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <header className="sticky top-0 z-30 bg-white shadow-xs">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left section: Mobile menu button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-[#1b3280] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Logo on smaller screens */}
          <div className="flex items-center gap-2.5 sm:hidden shrink-0">
            <img 
              src="/logo.png" 
              alt="Royal Roadlines Logo" 
              className="h-9 w-auto object-contain drop-shadow-xs" 
            />
            <div className="leading-tight">
              <h2 className="text-xs font-black text-[#1b3280] uppercase tracking-wide">
                ROYAL ROADLINES
              </h2>
              <span className="text-[9px] font-bold text-amber-600 tracking-wider uppercase block">
                RELIABLE • SAFE • ON TIME
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Header Branding */}
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <img 
              src="/logo.png" 
              alt="Royal Roadlines Logo" 
              className="h-10 w-auto object-contain drop-shadow-xs shrink-0 lg:hidden"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#1b3280] uppercase tracking-wider">
                  ROYAL ROADLINES
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-bold text-amber-800">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  RELIABLE • SAFE • ON TIME
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium truncate max-w-xl">
                MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Mumbai-400 003 | MOB: 9850194732 / 9370229449
              </p>
            </div>
          </div>
        </div>

        {/* Right status section */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* System Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TERMINAL ACTIVE</span>
          </div>

          {/* Date Clock Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/90 text-xs shadow-2xs transition-colors">
            <Clock className="w-3.5 h-3.5 text-[#1b3280]" />
            <span className="font-semibold text-slate-700 font-mono text-[11.5px]">
              {currentDate}
            </span>
          </div>
        </div>
      </div>

      {/* Royal Gold & Navy Brand Border Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#1b3280] via-amber-400 to-[#1b3280]" />
    </header>
  );
}
