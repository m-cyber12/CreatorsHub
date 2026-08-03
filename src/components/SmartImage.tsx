'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/**
 * next/image wrapper with a graceful fallback.
 *
 * Audit fix 5.1 — the codebase used 15 raw <img> tags and zero next/image, so
 * there was no AVIF/WebP, no responsive srcset, no intrinsic width/height
 * (causing layout shift), and Unsplash covers were fetched at w=800 to fill a
 * 300px card. Favicon services also 404 regularly, which previously left
 * broken image icons on cards.
 */
type SmartImageProps = Omit<ImageProps, 'onError'> & {
  fallback?: React.ReactNode;
};

export function SmartImage({ fallback, alt, className, ...props }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <>
        {fallback ?? (
          <div
            className={`flex items-center justify-center bg-surface-2 text-zinc-600 ${className ?? ''}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-1/3 w-1/3 max-h-8 max-w-8">
              <path
                d="M4 16l4.5-6 3.5 4.5 2.5-3L20 16M4 5h16v14H4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
