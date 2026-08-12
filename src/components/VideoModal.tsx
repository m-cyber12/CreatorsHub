'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, Film } from 'lucide-react';
import {
  isDirectVideoUrl,
  isYouTubeUrl,
  isVimeoUrl,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
} from '@/lib/videoUtils';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  videoUrl?: string;
  toolUrl?: string;
}

export function VideoModal({
  isOpen,
  onClose,
  toolName,
  videoUrl,
  toolUrl,
}: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const isYouTube = isYouTubeUrl(videoUrl);
  const isVimeo = isVimeoUrl(videoUrl);
  const isDirect = isDirectVideoUrl(videoUrl);

  const embedUrl = isYouTube
    ? getYouTubeEmbedUrl(videoUrl, true)
    : isVimeo
    ? getVimeoEmbedUrl(videoUrl, true)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-surface-1 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/20 text-accent-400">
              <Film className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h3 className="truncate text-base font-bold text-white">
                {toolName} — Video Demo
              </h3>
              <p className="truncate text-2xs text-zinc-400">
                Official video walkthrough & preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toolUrl && (
              <a
                href={toolUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-accent-500 px-3.5 py-1.5 text-2xs font-bold text-black hover:bg-accent-400 transition-colors"
              >
                Visit Site <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-surface-2 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-[16/9] w-full bg-black">
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
              autoPlay
              playsInline
              preload="auto"
              className="h-full w-full object-contain"
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-zinc-400">
              <p className="text-sm">Cannot embed video directly.</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-black"
              >
                Watch on Source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
