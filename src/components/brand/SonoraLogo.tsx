import React, { useId } from 'react';

interface SonoraLogoProps {
  size?: number;
  className?: string;
  roundedClass?: string;
  animated?: boolean;
}

export const SonoraLogo: React.FC<SonoraLogoProps> = ({
  size = 40,
  className = '',
  roundedClass = 'rounded-2xl',
  animated = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const casingGradId = `walktone-casing-${uid}`;
  const labelGradId = `walktone-label-${uid}`;
  const crimsonGradId = `walktone-crimson-${uid}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-red-950/60 ${roundedClass} ${className}`}
      style={{ width: size, height: size }}
      aria-label="WALKTONE Retro Red & Black Cassette Logo"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        <defs>
          {/* Obsidian Matte Black Brushed Casing */}
          <linearGradient id={casingGradId} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#261D20" />
            <stop offset="55%" stopColor="#140E10" />
            <stop offset="100%" stopColor="#070506" />
          </linearGradient>

          {/* Warm Ivory Cassette Label */}
          <linearGradient id={labelGradId} x1="10" y1="14" x2="54" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAF5F2" />
            <stop offset="100%" stopColor="#E6DADA" />
          </linearGradient>

          {/* 70s Analog Crimson & Ruby Red Racing Stripe */}
          <linearGradient id={crimsonGradId} x1="8" y1="14" x2="56" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>

        {/* Outer Retro Cassette Shell */}
        <rect width="64" height="64" rx="15" fill={`url(#${casingGradId})`} />

        {/* Subtle Crimson Outer Rim */}
        <rect
          x="1.5"
          y="1.5"
          width="61"
          height="61"
          rx="13.5"
          stroke="#EF4444"
          strokeOpacity="0.32"
          strokeWidth="1"
        />

        {/* Retro Cassette Label Card */}
        <rect x="7" y="13" width="50" height="33" rx="5" fill={`url(#${labelGradId})`} />

        {/* Iconic 70s Retro Crimson & Oxblood Racing Stripes */}
        <path d="M 7 18 C 7 15.2 9.2 13 12 13 H 52 C 54.8 13 57 15.2 57 18 V 22 H 7 V 18 Z" fill={`url(#${crimsonGradId})`} />
        <rect x="7" y="22.8" width="50" height="2" fill="#450A0A" fillOpacity="0.9" />

        {/* Stealthy MR SAI Micro-Engraving blended like a vintage cassette serial stamp */}
        <text
          x="32"
          y="20.1"
          textAnchor="middle"
          fill="#450A0A"
          fillOpacity="0.34"
          fontSize="3.2"
          fontWeight="700"
          letterSpacing="1.8"
          fontFamily="Space Mono, monospace"
        >
          MR SAI
        </text>

        {/* Dark Tape Window Cutout */}
        <rect x="11.5" y="27" width="41" height="14.5" rx="7.25" fill="#0B0809" stroke="#7F1D1D" strokeWidth="1" />

        {/* Magnetic Tape Ribbon Across Center */}
        <rect x="24" y="32.2" width="16" height="4" rx="1" fill="#1F1619" />
        <rect x="26.5" y="33.2" width="11" height="2" rx="1" fill="#EF4444" fillOpacity="0.4" />

        {/* Left Tape Spool */}
        <g>
          <circle cx="20.5" cy="34.25" r="5.2" fill="#FAF5F2" stroke="#DC2626" strokeWidth="1" />
          <circle cx="20.5" cy="34.25" r="2.2" fill="#0B0809" />
          <g stroke="#0B0809" strokeWidth="1.2" strokeLinecap="round">
            <line x1="20.5" y1="29.8" x2="20.5" y2="31.5" />
            <line x1="20.5" y1="37" x2="20.5" y2="38.7" />
            <line x1="16.1" y1="34.25" x2="17.8" y2="34.25" />
            <line x1="23.2" y1="34.25" x2="24.9" y2="34.25" />
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 20.5 34.25"
                to="360 20.5 34.25"
                dur="1.6s"
                repeatCount="indefinite"
              />
            )}
          </g>
        </g>

        {/* Right Tape Spool */}
        <g>
          <circle cx="43.5" cy="34.25" r="5.2" fill="#FAF5F2" stroke="#DC2626" strokeWidth="1" />
          <circle cx="43.5" cy="34.25" r="2.2" fill="#0B0809" />
          <g stroke="#0B0809" strokeWidth="1.2" strokeLinecap="round">
            <line x1="43.5" y1="29.8" x2="43.5" y2="31.5" />
            <line x1="43.5" y1="37" x2="43.5" y2="38.7" />
            <line x1="39.1" y1="34.25" x2="40.8" y2="34.25" />
            <line x1="46.2" y1="34.25" x2="47.9" y2="34.25" />
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 43.5 34.25"
                to="360 43.5 34.25"
                dur="1.6s"
                repeatCount="indefinite"
              />
            )}
          </g>
        </g>

        {/* Bottom Trapezoid Cassette Bridge + Micro VU Bars */}
        <path d="M 15 57 L 19 49.5 H 45 L 49 57 Z" fill="#070506" stroke="#EF4444" strokeOpacity="0.28" strokeWidth="0.8" />
        <circle cx="21" cy="53.6" r="1.1" fill="#EF4444" fillOpacity="0.6" />
        <circle cx="43" cy="53.6" r="1.1" fill="#EF4444" fillOpacity="0.6" />

        {/* Subtle Retro Red LED VU Equalizer Bars in Center Bridge */}
        <rect x="27.2" y="52" width="1.6" height="3.2" rx="0.8" fill="#EF4444">
          {animated && <animate attributeName="height" values="2;4.2;2" dur="0.7s" repeatCount="indefinite" />}
        </rect>
        <rect x="30.2" y="51.2" width="1.6" height="4" rx="0.8" fill="#DC2626">
          {animated && <animate attributeName="height" values="4;1.8;4" dur="0.6s" repeatCount="indefinite" />}
        </rect>
        <rect x="33.2" y="51.6" width="1.6" height="3.6" rx="0.8" fill="#F87171">
          {animated && <animate attributeName="height" values="2.2;4.4;2.2" dur="0.8s" repeatCount="indefinite" />}
        </rect>
        <rect x="36.2" y="52.2" width="1.6" height="3" rx="0.8" fill="#DC2626">
          {animated && <animate attributeName="height" values="3.5;1.6;3.5" dur="0.75s" repeatCount="indefinite" />}
        </rect>

        {/* Secondary Faint Watermark on Lower Casing Shadow */}
        <text
          x="32"
          y="61.2"
          textAnchor="middle"
          fill="#FAF5F2"
          fillOpacity="0.08"
          fontSize="2.8"
          fontWeight="700"
          letterSpacing="1.6"
          fontFamily="Space Mono, monospace"
        >
          MR SAI
        </text>
      </svg>
    </div>
  );
};
