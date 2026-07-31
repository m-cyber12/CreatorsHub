"use client";

import React, { useState } from 'react';
import { Tool } from '@/data/tools';
import { ExternalLink, Star, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [logoError, setLogoError] = useState(false);
  const targetUrl = tool.affiliateUrl || tool.url;

  const getPricingBadgeColor = (pricing: Tool['pricing']) => {
    switch (pricing) {
      case 'Free':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Freemium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Free Trial':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Paid':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="card-hover-glow relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm">
      {/* Top Section */}
      <div>
        {/* Header row: Logo, Name, Badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-sm">
              {!logoError ? (
                <img
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  onError={() => setLogoError(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 text-sm font-bold text-white">
                  {tool.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-white">
                  {tool.name}
                </h3>
                {tool.hasFounderBadge && (
                  <span
                    title="Founder Badge Verified — Backlink to CreatorAI Hub"
                    className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-300"
                  >
                    <Award className="h-3 w-3 text-purple-400" />
                    Verified
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-zinc-400">
                {tool.category}
              </span>
            </div>
          </div>

          {/* Pricing tag */}
          <div className="flex flex-col items-end gap-1">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPricingBadgeColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
            {tool.startingPrice && (
              <span className="text-[10px] text-zinc-400">
                {tool.startingPrice}
              </span>
            )}
          </div>
        </div>

        {/* Tagline & Description */}
        <div className="mt-4">
          <p className="text-sm font-medium text-purple-300/90">
            {tool.tagline}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">
            {tool.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800/60 px-2 py-1 text-[11px] font-medium text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Row: Rating & CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-4">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-white">
            {tool.rating.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500">
            ({tool.reviewsCount})
          </span>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 rounded-xl bg-zinc-800/90 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-purple-600 hover:text-white"
        >
          <span>Visit Website</span>
          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
};
