'use client';

import React from 'react';
import { Play, Film, ExternalLink } from 'lucide-react';
import {
  isDirectVideoUrl,
  isYouTubeUrl,
  isVimeoUrl,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
} from '@/lib/videoUtils';

interface ToolVideoDemoSectionProps {
  toolName: string;
  videoUrl?: string;
}

export function ToolVideoDemoSection({ toolName, videoUrl }: ToolVideoDemoSectionProps) {
  if (!videoUrl) return null;

  const isYouTube = isYouTubeUrl(videoUrl);
  const isVimeo = isVimeoUrl(videoUrl);
  const isDirect = isDirectVideoUrl(videoUrl);

  const embedUrl = isYouTube
    ? getYouTubeEmbedUrl(videoUrl, false)
    : isVimeo
    ? getVimeoEmbedUrl(videoUrl, false)
    : null;

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8 shadow-2xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/20 text-accent-400">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Official Video Demo & Walkthrough</h2>
            <p className="text-2xs text-zinc-400">
              Watch {toolName} in action, real workflow demonstrations, and key capabilities.
            </p>
          </div>
        </div>

        {isYouTube && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-2xs font-bold text-accent-400 hover:underline"
          >
            Open on YouTube <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black shadow-inner ring-1 ring-white/10">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${toolName} Video Walkthrough`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : isDirect ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-zinc-400">
            <Play className="mb-2 h-8 w-8 text-accent-400" />
            <p className="text-xs">Video Walkthrough available at source.</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black"
            >
              Watch Video Demo <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
