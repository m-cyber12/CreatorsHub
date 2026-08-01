"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { INITIAL_TOOLS } from '@/data/tools';
import { Header } from '@/components/Header';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { Star, ExternalLink, ArrowLeft, Award, Zap, Repeat, Bot } from 'lucide-react';
import Link from 'next/link';

export default function ToolDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const tool = INITIAL_TOOLS.find((t) => t.slug === slug) || INITIAL_TOOLS[0];
  const affiliateUrl = tool.affiliateUrl || tool.url;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-purple-400">
            <ArrowLeft className="h-4 w-4" /> <span>Back to All AI Tools</span>
          </Link>
        </div>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="cinematic-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <img src={tool.logo} alt={tool.name} className="h-16 w-16 rounded-2xl object-cover border border-white/10 bg-zinc-950 p-2" />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{tool.name}</h1>
                    {tool.hasFounderBadge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs font-bold text-purple-300">
                        <Award className="h-3.5 w-3.5 text-purple-400" /> Verified Founder
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-purple-400">{tool.category} • {tool.pricing} ({tool.startingPrice || 'Free'})</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 text-sm font-extrabold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> <span>{tool.rating}</span>
                <span className="text-xs text-zinc-500 font-normal">({tool.reviewsCount} reviews)</span>
              </div>
            </div>

            <div className="mt-8 relative overflow-hidden rounded-3xl h-64 sm:h-96 w-full bg-zinc-950 border border-white/5">
              <img src={tool.coverImage} alt={`${tool.name} Cover`} className="h-full w-full object-cover" />
              {tool.metrics && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-zinc-900/90 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                  <Zap className="h-4 w-4 text-amber-400" /> <span>{tool.metrics} Core Speed</span>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{tool.tagline}</h2>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-300">{tool.description}</p>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                Whether you are automating YouTube Shorts, dubbing videos in 29+ languages, or designing high-CTR thumbnails, <strong>{tool.name}</strong> provides a streamlined workflow designed for high retention and speed.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {tool.tags.map((tag) => (
                <span key={tag} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-zinc-300">#{tag}</span>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-white/10 pt-8">
              <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl hover:scale-102">
                <span>Try {tool.name} Now</span> <ExternalLink className="h-4 w-4" />
              </a>

              <Link href="/compare" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4 text-sm font-bold text-zinc-200 hover:border-purple-500">
                <Repeat className="h-4 w-4 text-purple-400" /> <span>Compare {tool.name}</span>
              </Link>

              <Link href="/" className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 py-4 text-sm font-bold text-purple-300 hover:bg-purple-500/20">
                <Bot className="h-4 w-4 text-purple-400" /> <span>Ask AI About {tool.name}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. The Bold AI Studio for Video Creators.</p>
      </footer>
      <AIChatAssistant tools={INITIAL_TOOLS} />
    </div>
  );
                        }
