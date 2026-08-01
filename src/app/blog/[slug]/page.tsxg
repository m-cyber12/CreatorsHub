"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { BLOG_POSTS } from '@/data/posts';
import { INITIAL_TOOLS } from '@/data/tools';
import { Header } from '@/components/Header';
import { Calendar, Clock, ArrowLeft, ExternalLink, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BlogPostDetail() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const tool = INITIAL_TOOLS.find((t) => t.slug === post?.featuredToolSlug);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <Link href="/blog" className="mt-4 text-purple-400 underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header
          onOpenSubmitModal={() => {}}
          searchQuery=""
          onSearchChange={() => {}}
        />

        <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-purple-400 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-bold text-purple-400 mb-4">
            <span className="rounded-full bg-purple-500/20 px-3 py-1">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Calendar className="h-3.5 w-3.5" /> {post.date}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="h-3.5 w-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            {post.title}
          </h1>

          <div className="mt-8 overflow-hidden rounded-3xl h-72 sm:h-96 w-full bg-zinc-950 border border-white/10">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Affiliate Tool Spotlight Banner */}
          {tool && (
            <div className="mt-10 rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-zinc-900/90 p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      FEATURED TOOL IN THIS GUIDE
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      ★ {tool.rating}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {tool.name} — {tool.tagline}
                  </h3>
                </div>
              </div>

              <a
                href={tool.affiliateUrl || tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:from-purple-500 hover:to-pink-500"
              >
                <span>Try {tool.name} Now</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Markdown-style rendered prose */}
          <div className="mt-10 prose prose-invert max-w-none text-zinc-300 space-y-6 leading-relaxed">
            {post.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h2 key={idx} className="text-2xl font-extrabold text-white pt-4">
                    {paragraph.replace('# ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={idx} className="text-xl font-bold text-purple-400 pt-2">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={idx} className="text-base font-bold text-white">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              return (
                <p key={idx} className="text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub Editorial Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
