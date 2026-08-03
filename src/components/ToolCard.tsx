"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Tool } from '@/data/tools';
import { Star, ExternalLink, Bookmark, TrendingUp, Award, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const [logoError, setLogoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const affiliateUrl = tool.affiliateUrl || tool.url;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Video Repurposing': '✂️',
      'Video Editing & VFX': '🎬',
      'Voice & Audio': '🎙️',
      'AI Avatars': '👤',
      'Thumbnails & Design': '🎨',
      'Scripting & Writing': '✍️',
      'Automation': '⚡',
    };
    return icons[category] || '🚀';
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Freemium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Paid': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Free Trial': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    }
  };

  return (
    <div
      className="group relative cinematic-card rounded-2xl overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
        {tool.isEditorsChoice && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black shadow-lg">
            <Award className="h-3 w-3" /> Editor&apos;s Choice
          </span>
        )}
        {tool.isTrending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
            <TrendingUp className="h-3 w-3" /> Trending
          </span>
        )}
        {tool.isNew && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-black shadow-lg">
            <Sparkles className="h-3 w-3" /> New
          </span>
        )}
      </div>

      {/* Bookmark button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsBookmarked(!isBookmarked);
        }}
        className={`absolute top-3 right-3 z-20 rounded-full p-1.5 transition-all ${
          isBookmarked
            ? 'bg-purple-500 text-white'
            : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
        }`}
      >
        <Bookmark className="h-3.5 w-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>

      {/* Cover Image with hover zoom */}
      <Link href={`/tool/${tool.slug}`} className="block relative h-40 overflow-hidden">
        <img
          src={tool.coverImage}
          alt={`${tool.name} screenshot`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Floating Metric Badge */}
        {tool.metrics && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white border border-white/10">
              {tool.metrics}
            </span>
          </div>
        )}

        {/* Pricing tag */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-bold backdrop-blur-md ${getPricingColor(tool.pricing)}`}>
            {tool.pricing}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Header row: Logo, Name, Founder Badges */}
        <div className="flex items-start gap-3 mb-2">
          <Link href={`/tool/${tool.slug}`} className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-white/10">
            {!logoError ? (
              <img
                src={tool.logo}
                alt={`${tool.name} logo`}
                onError={() => setLogoError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg">
                {getCategoryIcon(tool.category)}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/tool/${tool.slug}`} className="group/name flex items-center gap-1.5">
              <h3 className="truncate text-sm font-bold text-white group-hover/name:text-purple-300 transition-colors">
                {tool.name}
              </h3>
              {tool.hasFounderBadge && (
                <span className="inline-flex items-center rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-500/20 whitespace-nowrap">
                  Verified
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-zinc-400">{tool.category}</span>
              {tool.startingPrice && (
                <span className="text-[10px] font-medium text-emerald-400">{tool.startingPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= Math.round(tool.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-600'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-white">{tool.rating}</span>
          <span className="text-[10px] text-zinc-500">({tool.reviewsCount.toLocaleString()} reviews)</span>
          {tool.ratingLabel && (
            <span className="ml-auto text-[9px] text-zinc-500 italic">{tool.ratingLabel}</span>
          )}
        </div>

        {/* Tagline & Description */}
        <Link href={`/tool/${tool.slug}`} className="block">
          <p className="mb-1 text-sm font-semibold text-zinc-100 group-hover:text-purple-200 transition-colors">
            {tool.tagline}
          </p>
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {tool.description}
          </p>
        </Link>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {tool.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/50 hover:border-purple-500/30 hover:text-purple-300 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA Row */}
        <div className="mt-4 flex items-center gap-2">
          <a
            href={`/go/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            Try {tool.name.split(' ')[0]}
            <ExternalLink className="h-3 w-3" />
          </a>
          <Link
            href={`/tool/${tool.slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
