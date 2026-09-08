import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Smooth progress counter reaching 100% in 2.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Trigger smooth exit animation
          setIsExiting(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 700);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 75);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#090d1a] via-[#101935] to-[#080c18] text-white select-none overflow-hidden font-sans transition-all duration-700 ease-out ${
      isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
    }`}>
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Corner Badges */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-cyan-400/70">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>ATHAHAR ROADWAYS FLEET OS</span>
      </div>
      <div className="absolute top-6 right-6 text-xs font-mono text-slate-400/60">
        SANGLI-416416
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 text-center space-y-6">
        
        {/* Animated Cargo Truck SVG */}
        <div className="relative w-80 h-44 flex items-center justify-center">
          
          <svg className="w-full h-full overflow-visible" viewBox="0 0 280 150">
            <style>{`
              @keyframes roadDashAnim {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -50; }
              }
              @keyframes truckSuspensionAnim {
                0%, 100% { transform: translateY(0); }
                25% { transform: translateY(-3px); }
                75% { transform: translateY(2px); }
              }
              @keyframes wheelSpinAnim {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes streakFast {
                0% { stroke-dashoffset: 80; opacity: 0; }
                50% { opacity: 0.9; }
                100% { stroke-dashoffset: -80; opacity: 0; }
              }
              @keyframes beamFlicker {
                0%, 100% { opacity: 0.55; }
                50% { opacity: 0.85; }
              }
              @keyframes truckLaunch {
                0% { transform: translateX(0); opacity: 1; }
                20% { transform: translateX(-12px); }
                100% { transform: translateX(380px) scale(0.9); opacity: 0; }
              }
              .truck-launch {
                animation: truckLaunch 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
              }
              .road-markings {
                stroke-dasharray: 20 15;
                animation: roadDashAnim 0.35s linear infinite;
              }
              .truck-chassis {
                animation: truckSuspensionAnim 0.75s ease-in-out infinite;
                transform-origin: bottom center;
              }
              .wheel-front {
                animation: wheelSpinAnim 0.5s linear infinite;
                transform-origin: 205px 105px;
              }
              .wheel-back-1 {
                animation: wheelSpinAnim 0.5s linear infinite;
                transform-origin: 85px 105px;
              }
              .wheel-back-2 {
                animation: wheelSpinAnim 0.5s linear infinite;
                transform-origin: 115px 105px;
              }
              .speed-streak-1 {
                stroke-dasharray: 30 40;
                animation: streakFast 0.9s linear infinite;
              }
              .speed-streak-2 {
                stroke-dasharray: 20 50;
                animation: streakFast 0.7s linear infinite 0.25s;
              }
              .headlight-beam {
                animation: beamFlicker 1.8s ease-in-out infinite;
              }
            `}</style>

            {/* Trailing Wind Speed Streaks */}
            <line x1="260" y1="36" x2="20" y2="36" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="speed-streak-1" />
            <line x1="240" y1="56" x2="10" y2="56" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" className="speed-streak-2" />
            <line x1="270" y1="80" x2="30" y2="80" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" className="speed-streak-1" style={{ animationDelay: '0.4s' }} />

            {/* Asphalt Highway Road */}
            <rect x="0" y="104" width="280" height="14" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            {/* Animated Road Lines */}
            <line x1="5" y1="111" x2="275" y2="111" stroke="#facc15" strokeWidth="3" strokeLinecap="round" className="road-markings" />

            {/* FULL TRUCK ENSEMBLE (Launches on 100% completion) */}
            <g className={isExiting ? "truck-launch" : ""}>
              {/* TRUCK BODY */}
              <g className="truck-chassis">
              {/* Cargo Container */}
              <rect x="55" y="44" width="100" height="54" rx="5" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
              <rect x="60" y="49" width="90" height="44" rx="3" fill="#172554" />
              
              {/* Container Vertical Corrugation Stripes */}
              <line x1="80" y1="49" x2="80" y2="93" stroke="#1e40af" strokeWidth="1.5" />
              <line x1="102" y1="49" x2="102" y2="93" stroke="#1e40af" strokeWidth="1.5" />
              <line x1="125" y1="49" x2="125" y2="93" stroke="#1e40af" strokeWidth="1.5" />

              {/* AR Brand Plaque on Container */}
              <rect x="90" y="58" width="34" height="22" rx="4" fill="#2563eb" stroke="#60a5fa" strokeWidth="1" />
              <text x="107" y="73" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="1">
                AR
              </text>

              {/* Truck Cabin Base */}
              <path d="M 155 58 L 190 58 L 214 76 L 214 98 L 155 98 Z" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
              
              {/* Cabin Windshield */}
              <path d="M 186 63 L 207 77 L 188 77 Z" fill="#93c5fd" opacity="0.9" />
              
              {/* Door Window */}
              <rect x="162" y="63" width="18" height="14" rx="2" fill="#bfdbfe" opacity="0.85" />
              
              {/* Front Chrome Bumper & Grill */}
              <rect x="210" y="84" width="7" height="14" rx="2" fill="#e2e8f0" />
              <line x1="211" y1="87" x2="216" y2="87" stroke="#94a3b8" strokeWidth="1" />
              <line x1="211" y1="91" x2="216" y2="91" stroke="#94a3b8" strokeWidth="1" />
              <line x1="211" y1="95" x2="216" y2="95" stroke="#94a3b8" strokeWidth="1" />

              {/* Headlight & Projected Light Beam */}
              <polygon points="216,88 280,75 280,108 216,96" fill="url(#beamGlow)" className="headlight-beam" />
              <circle cx="214" cy="91" r="3.5" fill="#fef08a" />
              <circle cx="214" cy="91" r="1.5" fill="#ffffff" />

              {/* Exhaust Pipe & Smoke */}
              <rect x="150" y="42" width="4" height="22" rx="1.5" fill="#64748b" />
              <circle cx="147" cy="37" r="3" fill="#94a3b8" opacity="0.5" />
              <circle cx="141" cy="30" r="4" fill="#cbd5e1" opacity="0.3" />
            </g>

            {/* SPINNING WHEELS */}
            {/* Rear Wheel 1 */}
            <g className="wheel-back-1">
              <circle cx="85" cy="105" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
              <circle cx="85" cy="105" r="6" fill="#334155" />
              <line x1="85" y1="93" x2="85" y2="117" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="73" y1="105" x2="97" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
            </g>

            {/* Rear Wheel 2 */}
            <g className="wheel-back-2">
              <circle cx="115" cy="105" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
              <circle cx="115" cy="105" r="6" fill="#334155" />
              <line x1="115" y1="93" x2="115" y2="117" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="103" y1="105" x2="127" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
            </g>

            {/* Front Wheel */}
            <g className="wheel-front">
              <circle cx="205" cy="105" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
              <circle cx="205" cy="105" r="6" fill="#334155" />
              <line x1="205" y1="93" x2="205" y2="117" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="193" y1="105" x2="217" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
            </g>
          </g>

          <defs>
              <linearGradient id="beamGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

        </div>

        {/* Company Title & Brand Presence */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[11px] font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>CONNECTING DISPATCH & LOGISTICS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 uppercase">
            ATHAHAR ROADWAYS
          </h1>

          <p className="text-xs text-slate-300 font-medium">
            NEXT TO PARVATI CRANE, VAKHAR BHAG, SANGLI - 416416
          </p>
          <p className="text-[11px] font-mono text-cyan-400/80">
            MOB NO: 9370000000 / 9850000000
          </p>
        </div>

        {/* Progress Bar & Percentage Counter */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SYSTEM STARTUP</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-150 ease-out shadow-lg shadow-cyan-500/40"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 italic pt-1">
            Loading godown inventory & dispatch records...
          </p>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-500">
        © 2026 ATHAHAR ROADWAYS • Transport Management System
      </div>

    </div>
  );
}
