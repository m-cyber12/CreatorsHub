"use client";

import React from 'react';
import { Sparkles, Zap, Award, Film, Video, Mic, Image as ImageIcon } from 'lucide-react';

const BRAND_ITEMS = [
  { name: 'OpusClip AI', icon: Video, tag: 'Viral Shorts' },
  { name: 'ElevenLabs', icon: Mic, tag: 'Voice Cloning' },
  { name: 'Midjourney v6', icon: ImageIcon, tag: 'Thumbnails' },
  { name: 'Descript Studio', icon: Film, tag: 'Text Editing' },
  { name: 'Runway Gen-3', icon: Video, tag: 'AI VFX' },
  { name: 'Submagic', icon: Zap, tag: 'Hormozi Captions' },
  { name: 'HeyGen Avatars', icon: Video, tag: '40+ Languages' },
  { name: 'VidIQ Copilot', icon: Sparkles, tag: 'YouTube SEO' },
  { name: 'Adobe Firefly', icon: ImageIcon, tag: 'Generative Fill' },
];

export const ScrollMarquee: React.FC = () => {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-zinc-950/60 py-5 backdrop-blur-md">
      {/* Edge Gradients to soften scroll ends */}
      <div className="absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-[#030305] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-[#030305] to-transparent pointer-events-none" />

      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 pr-6">
          {/* We repeat BRAND_ITEMS twice to make an infinite seamless loop */}
          {[...BRAND_ITEMS, ...BRAND_ITEMS, ...BRAND_ITEMS].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={`${item.name}-${idx}`}
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/70 px-4 py-2 text-xs font-bold text-zinc-300 backdrop-blur-md transition-all hover:border-purple-500/50 hover:bg-zinc-900 hover:text-white"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <span>{item.name}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 group-hover:text-purple-300">
                  {item.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
