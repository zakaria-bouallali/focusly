import React from 'react'

export default function FocuslyLogo({ size = 34, className = '', showText = false, textClassName = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Geometric SVG Symbol: Target/Focus point + Checkmark + Upward Motion with Electric Blue (#3B82F6), Cyan (#06B6D4), and Violet (#7C3AED) gradient */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-[#0F1115] border border-white/20 shadow-none shrink-0"
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          <defs>
            <linearGradient id="focuslyGradient" x1="4" y1="32" x2="32" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />   {/* Electric Blue */}
              <stop offset="50%" stopColor="#06B6D4" />  {/* Cyan */}
              <stop offset="100%" stopColor="#7C3AED" /> {/* Violet */}
            </linearGradient>
            <linearGradient id="focuslyGlow" x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Outer Precision Target Ticks / Focus Ring */}
          <path
            d="M8 12V8H12 M24 8H28V12 M28 24V28H24 M12 28H8V24"
            stroke="url(#focuslyGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* Core Geometric Symbol: Upward Dynamic Checkmark + Center Focus Target */}
          <path
            d="M11 19L16 24L26 11"
            stroke="url(#focuslyGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Precision Center Focus Node */}
          <circle cx="16" cy="24" r="2.2" fill="#06B6D4" />
          <circle cx="26" cy="11" r="2.2" fill="#7C3AED" />
        </svg>
      </div>

      {showText && (
        <span className={`font-extrabold text-xl uppercase tracking-[-0.04em] text-white font-sans ${textClassName}`}>
          Focusly
        </span>
      )}
    </div>
  )
}
