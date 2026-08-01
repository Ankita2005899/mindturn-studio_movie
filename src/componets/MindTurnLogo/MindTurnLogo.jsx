import React from "react";

// A theme-matched, animated logo built with SVG so it's crisp at any size
// and its colors exactly match the site (red-600 / yellow-500 / black).
function MindTurnLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 mindturn-logo-wrap ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="mindturn-logo-icon w-10 h-10 sm:w-12 sm:h-12"
      >
        <defs>
          <linearGradient id="mtRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>

        {/* Rotating outer ring (film-reel style, dashed) */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#mtRing)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="10 9"
          className="mindturn-logo-ring"
        />

        {/* Static inner circle */}
        <circle cx="50" cy="50" r="30" fill="#0a0a0a" stroke="#eab308" strokeWidth="2" />

        {/* Play triangle */}
        <path d="M42 34 L70 50 L42 66 Z" fill="#facc15" className="mindturn-logo-play" />
      </svg>

      <div className="leading-tight select-none">
        <span className="block text-xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          MindTurn
        </span>
        <span className="block text-[9px] sm:text-xs tracking-[0.35em] text-yellow-500 font-semibold -mt-1">
          STUDIO
        </span>
      </div>
    </div>
  );
}

export default MindTurnLogo;
