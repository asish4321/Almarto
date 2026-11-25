'use client';

import React from 'react';

interface ToyLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function ToyLoader({ size = 'md', text = 'Loading...' }: ToyLoaderProps) {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1;

  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none">
      {/* Toy figure SVG */}
      <div
        className="toy-loader-figure"
        style={{ transform: `scale(${scale})` }}
      >
        <svg
          width="80"
          height="100"
          viewBox="0 0 80 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="toy-body"
        >
          {/* Shadow on the floor */}
          <ellipse cx="40" cy="97" rx="18" ry="4" fill="#2E4A3E" opacity="0.15" className="toy-shadow" />

          {/* Legs */}
          <rect x="27" y="68" width="10" height="20" rx="5" fill="#527863" className="toy-leg-left" />
          <rect x="43" y="68" width="10" height="20" rx="5" fill="#3E5C4B" className="toy-leg-right" />

          {/* Shoes */}
          <rect x="24" y="82" width="14" height="8" rx="4" fill="#1B2721" className="toy-shoe-left" />
          <rect x="42" y="82" width="14" height="8" rx="4" fill="#1B2721" className="toy-shoe-right" />

          {/* Body */}
          <rect x="22" y="38" width="36" height="34" rx="10" fill="#527863" />
          {/* Belly patch */}
          <rect x="29" y="44" width="22" height="20" rx="6" fill="#A3B18A" opacity="0.5" />
          {/* Star on chest */}
          <text x="40" y="57" textAnchor="middle" fontSize="12" fill="#FAF6F0">★</text>

          {/* Arms */}
          <rect x="8" y="40" width="16" height="9" rx="4.5" fill="#3E5C4B" className="toy-arm-left" />
          <rect x="56" y="40" width="16" height="9" rx="4.5" fill="#3E5C4B" className="toy-arm-right" />

          {/* Hands */}
          <circle cx="12" cy="44" r="6" fill="#527863" className="toy-hand-left" />
          <circle cx="68" cy="44" r="6" fill="#527863" className="toy-hand-right" />

          {/* Neck */}
          <rect x="34" y="30" width="12" height="10" rx="4" fill="#3E5C4B" />

          {/* Head */}
          <rect x="18" y="8" width="44" height="38" rx="16" fill="#527863" />

          {/* Face highlight */}
          <rect x="22" y="12" width="36" height="28" rx="12" fill="#A3B18A" opacity="0.3" />

          {/* Eyes */}
          <circle cx="31" cy="24" r="5" fill="#FAF6F0" />
          <circle cx="49" cy="24" r="5" fill="#FAF6F0" />
          {/* Pupils */}
          <circle cx="32" cy="25" r="2.5" fill="#1B2721" className="toy-pupil-left" />
          <circle cx="50" cy="25" r="2.5" fill="#1B2721" className="toy-pupil-right" />
          {/* Eye shine */}
          <circle cx="33" cy="24" r="1" fill="white" />
          <circle cx="51" cy="24" r="1" fill="white" />

          {/* Smile */}
          <path d="M 32 32 Q 40 38 48 32" stroke="#FAF6F0" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Ears */}
          <circle cx="18" cy="22" r="6" fill="#3E5C4B" />
          <circle cx="62" cy="22" r="6" fill="#3E5C4B" />
          <circle cx="18" cy="22" r="3" fill="#A3B18A" opacity="0.5" />
          <circle cx="62" cy="22" r="3" fill="#A3B18A" opacity="0.5" />

          {/* Antenna */}
          <line x1="40" y1="8" x2="40" y2="0" stroke="#2E4A3E" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="0" r="3.5" fill="#527863" stroke="#2E4A3E" strokeWidth="1.5" className="toy-antenna-ball" />
        </svg>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="toy-dot w-2 h-2 rounded-full bg-[#527863]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {text && (
        <p className="text-xs font-bold text-[#527863] tracking-wide">{text}</p>
      )}

      <style>{`
        /* Full body bounce + sway */
        .toy-body {
          animation: toyBounce 1s ease-in-out infinite;
          transform-origin: center bottom;
        }

        @keyframes toyBounce {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          25%       { transform: translateY(-10px) rotate(2deg); }
          50%       { transform: translateY(-14px) rotate(-1deg); }
          75%       { transform: translateY(-6px) rotate(3deg); }
        }

        /* Shadow shrinks when toy goes up */
        .toy-shadow {
          animation: shadowPulse 1s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes shadowPulse {
          0%, 100% { rx: 18; opacity: 0.15; }
          50%       { rx: 10; opacity: 0.07; }
        }

        /* Legs swing alternately */
        .toy-leg-left {
          animation: legLeft 1s ease-in-out infinite;
          transform-origin: 32px 68px;
        }
        .toy-leg-right {
          animation: legRight 1s ease-in-out infinite;
          transform-origin: 48px 68px;
        }
        .toy-shoe-left {
          animation: legLeft 1s ease-in-out infinite;
          transform-origin: 32px 82px;
        }
        .toy-shoe-right {
          animation: legRight 1s ease-in-out infinite;
          transform-origin: 48px 82px;
        }

        @keyframes legLeft {
          0%, 100% { transform: rotate(8deg); }
          50%       { transform: rotate(-8deg); }
        }
        @keyframes legRight {
          0%, 100% { transform: rotate(-8deg); }
          50%       { transform: rotate(8deg); }
        }

        /* Arms swing opposite to legs */
        .toy-arm-left {
          animation: armLeft 1s ease-in-out infinite;
          transform-origin: 24px 44px;
        }
        .toy-arm-right {
          animation: armRight 1s ease-in-out infinite;
          transform-origin: 56px 44px;
        }
        .toy-hand-left {
          animation: armLeft 1s ease-in-out infinite;
          transform-origin: 24px 44px;
        }
        .toy-hand-right {
          animation: armRight 1s ease-in-out infinite;
          transform-origin: 56px 44px;
        }

        @keyframes armLeft {
          0%, 100% { transform: rotate(-10deg); }
          50%       { transform: rotate(10deg); }
        }
        @keyframes armRight {
          0%, 100% { transform: rotate(10deg); }
          50%       { transform: rotate(-10deg); }
        }

        /* Antenna ball pulses */
        .toy-antenna-ball {
          animation: antennaPulse 1s ease-in-out infinite;
        }
        @keyframes antennaPulse {
          0%, 100% { r: 3.5; opacity: 1; }
          50%       { r: 5;   opacity: 0.7; }
        }

        /* Pupils look side to side */
        .toy-pupil-left, .toy-pupil-right {
          animation: eyeShift 2s ease-in-out infinite;
        }
        @keyframes eyeShift {
          0%, 100% { transform: translateX(0); }
          40%       { transform: translateX(-1.5px); }
          60%       { transform: translateX(1.5px); }
        }

        /* Loading dots */
        .toy-dot {
          animation: dotBounce 0.6s ease-in-out infinite alternate;
        }
        @keyframes dotBounce {
          from { transform: translateY(0); opacity: 0.4; }
          to   { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
