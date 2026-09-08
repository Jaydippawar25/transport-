import React from 'react';

export default function Loader({ 
  fullScreen = false, 
  message = "Loading ATHAHAR ROADWAYS Platform...", 
  subMessage = "Syncing fleet dispatch, lorry receipts & godown inventory"
}) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in duration-300">
      
      {/* Animated Truck & Road Illustration */}
      <div className="relative w-64 h-36 flex items-center justify-center">
        
        {/* Glowing Background Aura */}
        <div className="absolute inset-0 bg-blue-600/15 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* Speed Streaks behind the truck */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 256 144">
          <style>{`
            @keyframes speedStreak1 {
              0% { stroke-dashoffset: 60; opacity: 0; }
              40% { opacity: 0.8; }
              100% { stroke-dashoffset: -60; opacity: 0; }
            }
            @keyframes speedStreak2 {
              0% { stroke-dashoffset: 80; opacity: 0; }
              50% { opacity: 0.9; }
              100% { stroke-dashoffset: -80; opacity: 0; }
            }
            @keyframes roadDash {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -48; }
            }
            @keyframes truckSuspension {
              0%, 100% { transform: translateY(0px); }
              25% { transform: translateY(-2px); }
              75% { transform: translateY(1.5px); }
            }
            @keyframes wheelRotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes boxFloat {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-4px) rotate(-2deg); }
            }
            @keyframes progressSweep {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
            .streak-1 {
              stroke-dasharray: 25 35;
              animation: speedStreak1 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .streak-2 {
              stroke-dasharray: 18 40;
              animation: speedStreak2 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .truck-body {
              animation: truckSuspension 0.8s ease-in-out infinite;
              transform-origin: bottom center;
            }
            .wheel-spin-front {
              animation: wheelRotate 0.6s linear infinite;
              transform-origin: 182px 98px;
            }
            .wheel-spin-back1 {
              animation: wheelRotate 0.6s linear infinite;
              transform-origin: 78px 98px;
            }
            .wheel-spin-back2 {
              animation: wheelRotate 0.6s linear infinite;
              transform-origin: 104px 98px;
            }
            .cargo-badge {
              animation: boxFloat 1.8s ease-in-out infinite;
            }
            .road-line {
              stroke-dasharray: 16 12;
              animation: roadDash 0.45s linear infinite;
            }
            .progress-bar-sweep {
              animation: progressSweep 1.5s ease-in-out infinite;
            }
          `}</style>

          {/* Wind Speed Lines */}
          <line x1="230" y1="38" x2="30" y2="38" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="streak-1" />
          <line x1="220" y1="58" x2="20" y2="58" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" className="streak-2" style={{ animationDelay: '0.3s' }} />
          <line x1="240" y1="78" x2="40" y2="78" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" className="streak-1" style={{ animationDelay: '0.6s' }} />

          {/* Asphalt Road Base */}
          <rect x="10" y="97" width="236" height="12" rx="3" fill="#1e293b" />
          {/* Animated Center Road Markings */}
          <line x1="16" y1="103" x2="240" y2="103" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" className="road-line" />

          {/* TRUCK GROUP */}
          <g className="truck-body">
            {/* Cargo Trailer Body */}
            <rect x="52" y="44" width="86" height="46" rx="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
            <rect x="56" y="48" width="78" height="38" rx="2" fill="#172554" />
            
            {/* Trailer Stripes */}
            <line x1="72" y1="48" x2="72" y2="86" stroke="#1e40af" strokeWidth="1.5" />
            <line x1="92" y1="48" x2="92" y2="86" stroke="#1e40af" strokeWidth="1.5" />
            <line x1="112" y1="48" x2="112" y2="86" stroke="#1e40af" strokeWidth="1.5" />

            {/* Branded "AR" on trailer */}
            <rect x="80" y="56" width="28" height="18" rx="3" fill="#2563eb" />
            <text x="94" y="69" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              AR
            </text>

            {/* Truck Cabin Base */}
            <path d="M 138 56 L 168 56 L 188 72 L 188 90 L 138 90 Z" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
            
            {/* Windshield */}
            <path d="M 164 60 L 182 72 L 166 72 Z" fill="#93c5fd" opacity="0.85" />
            
            {/* Driver Door Window */}
            <rect x="144" y="60" width="16" height="12" rx="2" fill="#bfdbfe" opacity="0.8" />
            
            {/* Front Grill & Bumper */}
            <rect x="184" y="78" width="6" height="12" rx="1.5" fill="#e2e8f0" />
            
            {/* Bright Headlight Beam */}
            <polygon points="190,82 245,74 245,96 190,88" fill="url(#headlightGlow)" opacity="0.6" />
            <circle cx="188" cy="84" r="3" fill="#fef08a" />

            {/* Exhaust Pipe & Smoke */}
            <rect x="134" y="42" width="4" height="20" rx="1" fill="#64748b" />
            <circle cx="132" cy="38" r="2.5" fill="#94a3b8" opacity="0.6" />
            <circle cx="127" cy="33" r="3.5" fill="#cbd5e1" opacity="0.4" />
          </g>

          {/* ROTATING WHEELS */}
          {/* Back Wheel 1 */}
          <g className="wheel-spin-back1">
            <circle cx="78" cy="98" r="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="78" cy="98" r="5" fill="#64748b" />
            <line x1="78" y1="88" x2="78" y2="108" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="68" y1="98" x2="88" y2="98" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Back Wheel 2 */}
          <g className="wheel-spin-back2">
            <circle cx="104" cy="98" r="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="104" cy="98" r="5" fill="#64748b" />
            <line x1="104" y1="88" x2="104" y2="108" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="94" y1="98" x2="114" y2="98" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Front Wheel */}
          <g className="wheel-spin-front">
            <circle cx="182" cy="98" r="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="182" cy="98" r="5" fill="#64748b" />
            <line x1="182" y1="88" x2="182" y2="108" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="172" y1="98" x2="192" y2="98" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="headlightGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

      </div>

      {/* Brand Title & Loading Text */}
      <div className="space-y-1.5 mt-4 max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <h3 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
            ATHAHAR ROADWAYS
          </h3>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        <p className="text-xs font-semibold text-blue-700 tracking-wide">
          {message}
        </p>

        {subMessage && (
          <p className="text-[11px] text-slate-400 font-medium">
            {subMessage}
          </p>
        )}
      </div>

      {/* Modern High-Tech Progress Shimmer Bar */}
      <div className="w-56 h-1.5 bg-slate-200 rounded-full mt-5 overflow-hidden relative shadow-inner">
        <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-blue-600 to-cyan-400 rounded-full progress-bar-sweep" />
      </div>

    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white/95 rounded-3xl shadow-2xl border border-slate-100 p-4 max-w-md w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[300px] w-full bg-white/60 rounded-2xl border border-slate-100/80 shadow-xs">
      {content}
    </div>
  );
}
