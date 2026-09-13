'use client';

import React, { useId } from 'react';

/**
 * Noxifera Flame Stone — the brand mark, as an SVG.
 *
 * A flame trapped inside a stone: a rounded square in the brand gold→ember
 * ramp, a dark teardrop cut, and the inner flame (brown→gold). Recreates
 * `noxifera updates/01_Original_Clean.png` at any size without raster blur.
 *
 * Gradient ids are scoped with useId so multiple instances can share a page.
 */
export function FlameStone({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const stone = `nx-stone-${uid}`;
  const outer = `nx-flame-${uid}`;
  const core = `nx-core-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Noxifera"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={stone} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F8CE63" />
          <stop offset="0.55" stopColor="#EE9B3B" />
          <stop offset="1" stopColor="#E0661F" />
        </linearGradient>
        <linearGradient id={outer} x1="32" y1="24" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8A4A2E" />
          <stop offset="1" stopColor="#C9963C" />
        </linearGradient>
        <linearGradient id={core} x1="32" y1="32" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D9A441" />
          <stop offset="1" stopColor="#F0C457" />
        </linearGradient>
      </defs>
      {/* The stone */}
      <rect x="3" y="3" width="58" height="58" rx="15" fill={`url(#${stone})`} />
      {/* The dark cut */}
      <path
        d="M32 10.5 C 25.5 19.5, 15.5 28.5, 15.5 38.5 A 16.5 16.5 0 1 0 48.5 38.5 C 48.5 28.5, 38.5 19.5, 32 10.5 Z"
        fill="#0F1019"
      />
      {/* Outer flame */}
      <path
        d="M32 23.5 C 28 29, 22.5 34, 22.5 40.5 A 9.5 9.5 0 1 0 41.5 40.5 C 41.5 34, 36 29, 32 23.5 Z"
        fill={`url(#${outer})`}
      />
      {/* Flame core */}
      <path
        d="M32 32 C 30.5 34.5, 28 36.8, 28 40.2 A 4 4 0 1 0 36 40.2 C 36 36.8, 33.5 34.5, 32 32 Z"
        fill={`url(#${core})`}
      />
    </svg>
  );
}
