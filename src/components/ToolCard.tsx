"use client";

import React, { useState } from 'react';
import { Tool } from '@/data/tools';
import {
  ExternalLink,
  Star,
  Award,
  Zap,
  Video,
  Film,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [logoError, setLogoError] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const affiliateUrl = tool.affiliateUrl || tool.url;

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

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Shorts & Reels Automation':
        return <Video className="h-6 w-6 text-purple-400" />;
      case 'Voice & Multilingual Dubbing':
        return <Mic className="h-6 w-6 text-pink-400" />;
      case 'Thumbnails & Design':
        return <ImageIcon className="h-6 w-6 text-blue-400" />;
      default:
        return <Film className="h-6 w-6 text-indigo-400" />;
    }
  };

  return (
    <div className="cinematic-card group relative flex flex-col justify-between rounded-3xl p-5 overflow-hidden">
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-600/10 blur-2xl transition-all duration-500 group-hover:scale-125" />

      <div>
        {/* Cinematic 16:9 Visual Preview Image linking to dedicated /tool/[slug] */}
        <Link
          href={`/tool/${tool.slug}`}
          className="block relative overflow-hidden rounded-2xl h-44 w-full bg-zinc-950 mb-5 border border-white/5"
        >
          {!coverError ? (
            <img
              src={tool.coverImage}
              alt={`${tool.name} preview`}
              onError={() => setCoverError(true)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-purple-950/40 to-zinc-950 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30 mb-2">
                {getCategoryIcon(tool.category)}
              </div>
              <span className="z-10 text-xs font-extrabold text-white">
                {tool.name} Studio
              </span>
              <span className="z-10 text-[10px] text-purple-300/80">
                {tool.category}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

          {/* Floating Metric Badge */}
          {tool.metrics && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-zinc-900/90 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>{tool.metrics}</span>
            </div>
          )}

          {/* Pricing tag */}
          <div className="absolute top-3 right-3">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-md backdrop-blur-md ${getPricingBadgeColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
          </div>
        </Link>

        {/* Header row: Logo, Name, Founder Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/tool/${tool.slug}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 p-1.5 shadow-md"
            >
              {!logoError ? (
                <img
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  onError={() => setLogoError(true)}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                  {getCategoryIcon(tool.category)}
                </div>
              )}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tool/${tool.slug}`}
                  className="text-base font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors"
                >
                  {tool.name}
                </Link>
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

          {tool.startingPrice && (
            <span className="text-xs font-semibold text-zinc-400">
              {tool.startingPrice}
            </span>
          )}
        </div>

        {/* Tagline & Description */}
        <div className="mt-4">
          <Link href={`/tool/${tool.slug}`}>
            <p className="text-sm font-bold text-purple-300/95 leading-snug hover:underline">
              {tool.tagline}
            </p>
          </Link>
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

      {/* Bottom Row: Rating & CTAs */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-extrabold text-white">
            {tool.rating.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-zinc-500">
            ({tool.reviewsCount} • {tool.ratingLabel || 'Editorial Score'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Action: Go to detailed tool page */}
          <Link
            href={`/tool/${tool.slug}`}
            className="group/btn flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/30 active:scale-95"
          >
            <span>Details &amp; AI</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>

          {/* Quick Direct Affiliate Jump */}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit ${tool.name} Direct Website`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:border-purple-500 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
