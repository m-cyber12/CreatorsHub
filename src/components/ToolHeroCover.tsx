'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { SmartImage } from '@/components/SmartImage';
import { CoverArt } from '@/components/CoverArt';
import { VideoModal } from '@/components/VideoModal';

export function ToolHeroCover({
  slug,
  name,
  logo,
  coverImage,
  previewVideoUrl,
}: {
  slug: string;
  name: string;
  logo?: string;
  coverImage?: string;
  previewVideoUrl?: string;
}) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <div className="relative aspect-[16/9] w-full max-h-[560px] overflow-hidden rounded-3xl bg-surface-2 ring-1 ring-white/10 shadow-2xl group">
        {coverImage ? (
          <SmartImage
            src={coverImage}
            alt={name}
            fill
            priority
            sizes="100vw"
            label={name}
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <CoverArt slug={slug} title={name} logo={logo} logoSize={72} className="absolute inset-0" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-0 via-black/30 to-transparent" />

        {previewVideoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-full border border-accent-500/50 bg-black/70 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-accent-300 backdrop-blur-md shadow-2xl transition-all hover:scale-110 hover:bg-accent-500 hover:text-black hover:shadow-[0_0_30px_rgba(247,201,72,0.6)]"
            >
              <Play className="h-4 w-4 fill-current text-current" />
              Watch Video Walkthrough
            </button>
          </div>
        )}
      </div>

      {previewVideoUrl && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          toolName={name}
          videoUrl={previewVideoUrl}
        />
      )}
    </>
  );
}
