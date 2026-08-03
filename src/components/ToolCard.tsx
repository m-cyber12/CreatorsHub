'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, BadgeCheck } from 'lucide-react';
import { hasVerifiedScore, computeOverall, type Tool } from '@/data/tools';
import { VerificationBadge } from '@/components/VerificationBadge';
import { SmartImage } from '@/components/SmartImage';

interface ToolCardProps {
  tool: Tool;
  index?: number;
  /** LCP hint: pass true for the first few cards above the fold. */
  priority?: boolean;
}

function pricingClass(pricing: Tool['pricing']) {
  switch (pricing) {
    case 'Free':
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300';
    case 'Freemium':
      return 'border-sky-500/30 bg-sky-500/15 text-sky-300';
    case 'Free Trial':
      return 'border-accent-500/30 bg-accent-500/15 text-accent-300';
    default:
      return 'border-zinc-500/30 bg-zinc-500/15 text-zinc-300';
  }
}

function scoreColor(v: number) {
  if (v >= 8) return 'text-emerald-400';
  if (v >= 6) return 'text-accent-400';
  if (v >= 4) return 'text-orange-400';
  return 'text-rose-400';
}

export function ToolCard({ tool, index = 0, priority = false }: ToolCardProps) {
  const tested = hasVerifiedScore(tool);
  const overall = tested && tool.scores ? computeOverall(tool.scores) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-1 transition-colors hover:border-accent-500/30">
      {/* Cover */}
      <Link
        href={`/tool/${tool.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-surface-2"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/*
          Audit fix 5.1 — was a raw <img> with no width/height (layout shift),
          no responsive srcset and no modern format. next/image fixes all three.
          Decorative here: the accessible name comes from the heading link.
        */}
        <SmartImage
          src={tool.coverImage}
          alt=""
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/20 to-transparent" />

        <span
          className={`absolute bottom-3 right-3 inline-flex rounded-lg border px-2 py-0.5 text-2xs font-bold backdrop-blur-md ${pricingClass(
            tool.pricing
          )}`}
        >
          {tool.pricing}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start gap-3">
          <SmartImage
            src={tool.logo}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 flex-shrink-0 rounded-xl bg-surface-2 object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 truncate text-base font-bold text-white">
              <Link
                href={`/tool/${tool.slug}`}
                className="truncate transition-colors after:absolute after:inset-0 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {tool.name}
              </Link>
              {tool.hasFounderBadge && (
                <BadgeCheck
                  className="h-3.5 w-3.5 flex-shrink-0 text-accent-400"
                  aria-label="Verified by the tool's founder"
                />
              )}
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-2xs text-zinc-400">{tool.category}</span>
              {tool.startingPrice && (
                <span className="font-mono text-2xs font-medium tabular-nums text-emerald-400">
                  {tool.startingPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/*
          Audit fix 2.1 — five stars used to render for every tool, where all
          ratings sat between 4.1 and 4.9. Stars cannot resolve that range, so
          every card looked identical. Now: a real score when we have tested
          the tool, and an honest label when we have not.
        */}
        <div className="mb-2 flex items-center gap-2">
          {overall !== null ? (
            <>
              <span className={`font-mono text-lg font-black tabular-nums ${scoreColor(overall)}`}>
                {overall.toFixed(1)}
              </span>
              <span className="text-2xs text-zinc-500">/10 tested</span>
            </>
          ) : (
            <VerificationBadge level={tool.verificationLevel} compact />
          )}
        </div>

        <p className="mb-1 text-sm font-semibold text-zinc-100">{tool.tagline}</p>
        <p className="line-clamp-2 text-2xs leading-relaxed text-zinc-400">{tool.description}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-surface-2 px-2 py-0.5 text-2xs text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA row — relative z-10 keeps these clickable above the card overlay link. */}
        <div className="relative z-10 mt-4 flex items-center gap-2 pt-1">
          <a
            href={`/go/${tool.slug}`}
            target="_blank"
            rel={
              tool.affiliateProgram
                ? 'noopener noreferrer nofollow sponsored'
                : 'noopener noreferrer nofollow'
            }
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-3 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
          >
            Visit site
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">{tool.name} (opens in a new tab)</span>
          </a>
          <Link
            href={`/tool/${tool.slug}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-2xs font-semibold text-zinc-300 transition-colors hover:text-white"
          >
            Details
            <span className="sr-only"> about {tool.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Compact row view (audit fix 4.3).
 *
 * The grid showed only ~8 tools per desktop screen, each dominated by a
 * repeated Unsplash stock photo carrying no information. Top competitors use
 * dense rows and fit ~20. This is offered as the list-mode alternative.
 */
export function ToolRow({ tool }: { tool: Tool }) {
  const tested = hasVerifiedScore(tool);
  const overall = tested && tool.scores ? computeOverall(tool.scores) : null;

  return (
    <article className="group relative flex items-center gap-4 border-b border-white/5 px-3 py-3 transition-colors hover:bg-surface-1">
      <SmartImage
        src={tool.logo}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        className="h-10 w-10 flex-shrink-0 rounded-lg bg-surface-2 object-cover ring-1 ring-white/10"
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-white">
          <Link
            href={`/tool/${tool.slug}`}
            className="after:absolute after:inset-0 hover:text-accent-300"
          >
            {tool.name}
          </Link>
        </h3>
        <p className="truncate text-2xs text-zinc-400">{tool.tagline}</p>
      </div>

      <span className="hidden w-40 shrink-0 truncate text-2xs text-zinc-500 md:block">
        {tool.category}
      </span>

      <span className="hidden w-24 shrink-0 font-mono text-2xs tabular-nums text-emerald-400 sm:block">
        {tool.startingPrice ?? tool.pricing}
      </span>

      <span className="w-20 shrink-0 text-right">
        {overall !== null ? (
          <span className={`font-mono text-sm font-bold tabular-nums ${scoreColor(overall)}`}>
            {overall.toFixed(1)}
          </span>
        ) : (
          <span className="text-2xs text-zinc-600">—</span>
        )}
      </span>
    </article>
  );
}
