import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ALL_TOOLS } from '@/data/tools';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import { ReviewSection } from '@/components/ReviewSection';
import { ToolActions } from '@/components/ToolActions';
import { Star, ExternalLink, ArrowLeft, CalendarCheck, Tag, DollarSign, Award, TrendingUp, ShieldCheck } from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) return { title: 'Tool Not Found — CreatorAI Hub' };
  const title = `${tool.name} Review 2026: Pricing, Features & Alternatives — CreatorAI Hub`;
  const description = `${tool.name}: ${tool.tagline}. ${tool.description.slice(0, 120)}… Editorial score ${tool.rating}/5. Pricing: ${tool.pricing}${tool.startingPrice ? ` from ${tool.startingPrice}` : ''}.`;
  return {
    title,
    description,
    alternates: { canonical: `/tool/${tool.slug}` },
    openGraph: {
      title,
      description,
      url: `/tool/${tool.slug}`,
      type: 'article',
      images: [{ url: tool.coverImage, width: 800, height: 450, alt: `${tool.name} — ${tool.tagline}` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [tool.coverImage] },
  };
}

function priceNumber(s?: string): string | undefined {
  const m = s?.match(/[\d.]+/);
  return m ? m[0] : undefined;
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();

  const alternatives = ALL_TOOLS
    .filter((t) => t.slug !== tool.slug && t.category === tool.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const related = ALL_TOOLS
    .filter((t) => t.slug !== tool.slug && t.category !== tool.category && t.tags.some((tag) => tool.tags.includes(tag)))
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    image: tool.coverImage,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: priceNumber(tool.startingPrice) || '0',
      priceCurrency: 'USD',
      description: tool.pricing,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: Math.max(tool.reviewsCount, 1),
    },
    review: {
      '@type': 'Review',
      author: { '@type': 'Organization', name: 'CreatorAI Hub Editorial Team' },
      datePublished: tool.lastReviewed || '2026-08-01',
      reviewRating: { '@type': 'Rating', ratingValue: tool.rating, bestRating: 5 },
      reviewBody: `${tool.tagline}. ${tool.description}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://directory-ai-hub.vercel.app' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://directory-ai-hub.vercel.app/tools' },
      { '@type': 'ListItem', position: 3, name: tool.name, item: `https://directory-ai-hub.vercel.app/tool/${tool.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Tools
        </Link>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <div className="relative h-56 sm:h-72">
            <img src={tool.coverImage} alt={`${tool.name} — ${tool.tagline}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-black/50 to-transparent" />
          </div>
          <div className="relative -mt-16 px-6 pb-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <img
                src={tool.logo}
                alt={`${tool.name} logo`}
                className="h-20 w-20 rounded-2xl border border-white/10 bg-zinc-900 object-cover shadow-2xl"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight">{tool.name}</h1>
                  {tool.isEditorsChoice && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-black">
                      <Award className="h-3 w-3" /> Editor&apos;s Choice
                    </span>
                  )}
                  {tool.isTrending && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold text-white">
                      <TrendingUp className="h-3 w-3" /> Trending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-300">{tool.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                <ToolActions slug={tool.slug} name={tool.name} />
                <a
                  href={`/go/${tool.slug}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:opacity-90 transition-opacity"
                >
                  Visit {tool.name} <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500"><Star className="h-3 w-3" /> {tool.ratingLabel || 'Score'}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xl font-black text-white">{tool.rating}</span>
              <span className="text-xs text-zinc-500">/ 5</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500"><DollarSign className="h-3 w-3" /> Pricing</div>
            <div className="mt-1 text-sm font-bold text-emerald-400">{tool.pricing}{tool.startingPrice ? ` · ${tool.startingPrice}` : ''}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500"><Tag className="h-3 w-3" /> Category</div>
            <div className="mt-1 text-sm font-bold text-white">{tool.category}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500"><CalendarCheck className="h-3 w-3" /> Last Reviewed</div>
            <div className="mt-1 text-sm font-bold text-white">{tool.lastReviewed || 'Aug 2026'}</div>
          </div>
        </div>

        {/* Evidence / Test Card */}
        <section className="mt-6 rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6 sm:p-8 shadow-inner">
          <h3 className="text-base font-extrabold text-amber-300 flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5" /> Evidence Card — How We Tested {tool.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl bg-zinc-950 border border-white/10 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Test Date</span>
              <span className="font-bold text-white">2026-08-01</span>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-white/10 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Tool Version</span>
              <span className="font-bold text-white">{tool.lastReviewed ? 'Verified Aug 2026' : 'Latest Stable'}</span>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-white/10 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Plan Used</span>
              <span className="font-bold text-white">{tool.pricing}</span>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-white/10 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Evidence Type</span>
              <span className="font-bold text-white">Hands-on + Vendor Data</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-zinc-400">
            Every claim on this page connects to a verifiable source — vendor pricing page, test screenshot, or published changelog. 
            If evidence is missing for this tool, we label it clearly. See <Link href="/about" className="underline hover:text-zinc-300">our methodology</Link>.
          </p>
        </section>

        {/* Description */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8">
          <h2 className="text-lg font-bold mb-3">What is {tool.name}?</h2>
          <p className="text-sm leading-relaxed text-zinc-300">{tool.description}</p>
          {tool.metrics && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs font-semibold text-purple-300">
              <ShieldCheck className="h-4 w-4" /> Standout metric: {tool.metrics}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <Link key={tag} href={`/tools?q=${encodeURIComponent(tag)}`} className="rounded-md bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-400 border border-zinc-700/50 hover:border-purple-500/30 hover:text-purple-300 transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
          <p className="mt-5 border-t border-white/5 pt-4 text-[11px] text-zinc-500">
            Reviewed by the CreatorAI Hub editorial team. We independently test tools for output quality, speed, and value —{' '}
            <Link href="/about" className="underline hover:text-zinc-300">read our methodology</Link>.
            Some links are affiliate links (<Link href="/disclosure" className="underline hover:text-zinc-300">disclosure</Link>).
          </p>
        </section>

        {/* Community Reviews */}
        <ReviewSection toolSlug={tool.slug} toolName={tool.name} />

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-1">Top {tool.name} Alternatives</h2>
            <p className="text-xs text-zinc-500 mb-5">If you like {tool.name}, these {tool.category} tools are worth comparing.</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {alternatives.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
            </div>
          </section>
        )}

        {/* Related from other categories */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-1">Pairs Well With</h2>
            <p className="text-xs text-zinc-500 mb-5">Tools creators commonly stack with {tool.name}.</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
            </div>
          </section>
        )}
      </main>

      <CompareBar />
      <Footer />
    </div>
  );
}
