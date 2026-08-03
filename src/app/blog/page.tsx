import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BLOG_POSTS } from '@/data/posts';
import { BookOpen, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — AI Tool Reviews, Comparisons & Creator Guides',
  description: 'Hands-on AI tool reviews, head-to-head comparisons, and workflow guides for YouTube and video creators. Independently tested, updated for 2026.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-semibold text-purple-300 mb-4">
            <BookOpen className="h-3.5 w-3.5" /> Creator Guides & Reviews
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">The CreatorAI Blog</h1>
          <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
            Hands-on reviews, tool comparisons, and complete AI workflows — written after real testing, not press releases.
          </p>
        </div>

        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group mb-10 grid overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 hover:border-purple-500/30 transition-colors md:grid-cols-2"
        >
          <div className="h-56 md:h-full overflow-hidden">
            <img src={featured.coverImage} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <span className="text-[11px] font-bold text-purple-400">{featured.category}</span>
            <h2 className="mt-2 text-xl md:text-2xl font-black leading-snug group-hover:text-purple-200 transition-colors">{featured.title}</h2>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{featured.excerpt}</p>
            <div className="mt-4 flex items-center gap-4 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {featured.date}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 hover:border-purple-500/30 transition-colors"
            >
              <div className="h-44 overflow-hidden">
                <img src={post.coverImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold text-purple-400">{post.category}</span>
                <h3 className="mt-1.5 text-base font-bold leading-snug line-clamp-2 group-hover:text-purple-200 transition-colors">{post.title}</h3>
                <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-zinc-600">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
