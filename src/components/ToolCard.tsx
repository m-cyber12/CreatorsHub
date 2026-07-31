"use client";

import React, { useState } from 'react';
import { Tool } from '@/data/tools';
import { ExternalLink, Star, Award, Sparkles, Zap } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [logoError, setLogoError] = useState(false);
  const targetUrl = tool.affiliateUrl || tool.url;

  const getPricingBadgeColor = (pricing: Tool['pricing']) => {
    switch (pricing) {
      case 'Free':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Freemium':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Free Trial':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Paid':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="glass-card-3d group relative flex flex-col justify-between rounded-3xl p-5 overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-600/10 blur-2xl transition-all duration-500 group-hover:bg-purple-600/25" />

      {/* Top Section */}
      <div>
        {/* Cinematic 16:9 Visual Preview Image (Inspired by Awwwards & MotionSites.ai) */}
        <div className="relative overflow-hidden rounded-2xl h-44 w-full bg-zinc-950 mb-5 border border-white/5">
          <img
            src={tool.coverImage}
            alt={`${tool.name} preview`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

          {/* Floating Metric Badge in bottom left of image */}
          {tool.metrics && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-zinc-900/90 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>{tool.metrics}</span>
            </div>
          )}

          {/* Pricing tag inside image top right */}
          <div className="absolute top-3 right-3">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-md backdrop-blur-md ${getPricingBadgeColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
          </div>
        </div>

        {/* Header row: Logo, Name, Founder Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 p-1.5 shadow-md">
              {!logoError ? (
                <img
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  onError={() => setLogoError(true)}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-xs font-extrabold text-white">
                  {tool.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </h3>
                {tool.hasFounderBadge && (
                  <span
                    title="Founder Badge Verified — Backlink to CreatorAI Hub"
                    className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 shadow-sm"
                  >
                    <Award className="h-3 w-3 text-purple-400" />
                    Verified
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-zinc-400">
                {tool.category}
              </span>
            </div>
          </div>

          {/* Starting Price */}
          {tool.startingPrice && (
            <span className="text-xs font-semibold text-zinc-400">
              {tool.startingPrice}
            </span>
          )}
        </div>

        {/* Tagline & Description */}
        <div className="mt-4">
          <p className="text-sm font-bold text-purple-300/95 leading-snug">
            {tool.tagline}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-2">
            {tool.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/5 bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-zinc-300 transition-colors group-hover:border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Row: Rating & CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-extrabold text-white">
            {tool.rating.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-zinc-500">
            ({tool.reviewsCount})
          </span>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/30 active:scale-95"
        >
          <span>Visit Tool</span>
          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
};
