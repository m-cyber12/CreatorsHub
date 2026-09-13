'use client';

import React from 'react';
import { FlameStone } from './FlameStone';

/**
 * Noxifera wordmark — "NOXIFERA" in the brand serif (Cinzel), with the
 * "NOX" in flame gold and "IFERA" in the foreground colour, exactly like the
 * approved key art. Use <NoxiferaMark /> for the icon+word lockup.
 *
 * `text-white` is intentionally used for the light half: the site's
 * light-mode override (globals.css) inverts it automatically.
 */
export function NoxiferaWordmark({
  className = '',
  showIcon = true,
  tagline = false,
}: {
  className?: string;
  showIcon?: boolean;
  tagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {showIcon && <FlameStone className="h-8 w-8 shrink-0" />}
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-bold tracking-[0.12em] ${
            tagline ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
        >
          <span className="text-accent-400">NOX</span>
          <span className="text-white">IFERA</span>
        </span>
        {tagline && (
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Light in the Darkness
          </span>
        )}
      </span>
    </span>
  );
}
