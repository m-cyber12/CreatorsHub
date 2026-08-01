"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { BLOG_POSTS } from '@/data/posts';
import { Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CreatorAI Hub Editorial Blog</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              AI Video &amp; YouTube <span className="text-cinematic-neon">Growth Strategies</span>
            </h1>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="cinematic-card group flex flex-col justify-between rounded-3xl overflow-hidden p-5 transition-all"
              >
                <div>
                  <div className="relative overflow-hidden rounded-2xl h-48 w-full bg-zinc-950 mb-5">
                    <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-3 left-3 rounded-full bg-purple-600/90 px-3 py-1 text-[11px] font-bold text-white">{post.category}</div>
                  </div>
                  <h2 className="text-lg font-extrabold text-white group-hover:text-purple-400 transition-colors">{post.title}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-3">{post.excerpt}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                  </div>
                  <span className="flex items-center gap-1 font-bold text-purple-400">Read <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub Editorial Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
