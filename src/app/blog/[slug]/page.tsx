import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '@/data/posts';
import { ALL_TOOLS } from '@/data/tools';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calendar, Clock, ArrowLeft, ExternalLink } from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.isoDate,
      url: `/blog/${post.slug}`,
      images: [{ url: post.coverImage, width: 800, height: 450, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [post.coverImage] },
  };
}

export default async function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const tool = ALL_TOOLS.find((t) => t.slug === post.featuredToolSlug);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    author: { '@type': 'Organization', name: 'CreatorAI Hub Editorial Team', url: 'https://directory-ai-hub.vercel.app/about' },
    publisher: { '@type': 'Organization', name: 'CreatorAI Hub', logo: { '@type': 'ImageObject', url: 'https://directory-ai-hub.vercel.app/logo.svg' } },
    mainEntityOfPage: `https://directory-ai-hub.vercel.app/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col justify-between">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <div>
        <Header />

        <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-purple-400 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-purple-400 mb-4">
            <span className="rounded-full bg-purple-500/20 px-3 py-1">{post.category}</span>
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
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          </div>

          {tool && (
            <div className="mt-10 rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-zinc-900/90 p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src={tool.logo} alt={tool.name} className="h-14 w-14 rounded-2xl object-cover border border-white/10" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      FEATURED TOOL IN THIS GUIDE
                    </span>
                    <span className="text-xs text-amber-400 font-bold">★ {tool.rating}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {tool.name} — {tool.tagline}
                  </h3>
                  <Link href={`/tool/${tool.slug}`} className="text-[11px] text-purple-300 underline hover:text-purple-200">
                    Read our full {tool.name} review →
                  </Link>
                </div>
              </div>
              <a
                href={`/go/${tool.slug}`}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="shrink-0 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:from-purple-500 hover:to-pink-500"
              >
                <span>Try {tool.name} Now</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Rendered prose */}
          <div className="mt-10 prose prose-invert max-w-none text-zinc-300 space-y-6 leading-relaxed">
            {post.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return <h4 key={idx} className="text-base font-bold text-white">{paragraph.replace('### ', '')}</h4>;
              }
              if (paragraph.startsWith('## ')) {
                return <h3 key={idx} className="text-xl font-bold text-purple-400 pt-2">{paragraph.replace('## ', '')}</h3>;
              }
              if (paragraph.startsWith('# ')) {
                return <h2 key={idx} className="text-2xl font-extrabold text-white pt-4">{paragraph.replace('# ', '')}</h2>;
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1 text-sm sm:text-base">
                    {paragraph.split('\n').map((li, i) => <li key={i}>{li.replace(/^- /, '')}</li>)}
                  </ul>
                );
              }
              return <p key={idx} className="text-sm sm:text-base leading-relaxed">{paragraph}</p>;
            })}
          </div>

          <p className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 text-[11px] leading-relaxed text-zinc-500">
            <span className="font-bold text-zinc-400">Editorial note:</span> Written by the CreatorAI Hub editorial team after hands-on testing.
            Some links in this article are affiliate links — we may earn a commission at no extra cost to you, and it never influences our verdicts.{' '}
            <Link href="/disclosure" className="underline hover:text-zinc-300">Full disclosure</Link> ·{' '}
            <Link href="/about" className="underline hover:text-zinc-300">Our methodology</Link>
          </p>
        </article>
      </div>

      <Footer />
    </div>
  );
}
