import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import { NewsletterForm } from '@/components/NewsletterForm';
import { HomeSearch } from '@/components/HomeSearch';
import { ALL_TOOLS, hasVerifiedScore } from '@/data/tools';
import { GRAVEYARD } from '@/data/graveyard';
import { BLOG_POSTS } from '@/data/posts';
import { REAL_CATEGORIES, categorySlug, getCategoryTools } from '@/lib/categories';
import { Award, TrendingUp, BookOpen, Skull, FlaskConical, ArrowRight, Layers } from 'lucide-react';

/**
 * Audit fixes 1.1, 5.5.
 *
 * The homepage was `"use client"` with the entire catalog, search engine and
 * filter state running in the browser — a 43KB page chunk plus the full
 * 200-tool dataset. It is now a Server Component; only the search box is a
 * client island.
 *
 * The trust strip previously read "Independently tested · Reviewed Aug 2026 ·
 * Pricing verified" across a catalog that was 77% machine-generated. Those
 * claims are replaced with numbers computed from the data, so they cannot
 * drift away from the truth.
 */

const featuredTools = ALL_TOOLS.filter((t) => t.isFeatured).slice(0, 6);
const trendingTools = ALL_TOOLS.filter((t) => t.isTrending).slice(0, 4);
const newTools = [...ALL_TOOLS]
  .filter((t) => t.launchDate)
  .sort((a, b) => (b.launchDate || '').localeCompare(a.launchDate || ''))
  .slice(0, 4);

const testedCount = ALL_TOOLS.filter(hasVerifiedScore).length;
const freeCount = ALL_TOOLS.filter((t) => t.pricing === 'Free' || t.pricing === 'Freemium').length;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <Header />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-12 pt-16 md:pb-16 md:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              The curated AI toolbox for video creators
            </span>

            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Find the right AI tool
              <span className="block text-accent-400">before you waste a subscription.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
              {ALL_TOOLS.length} tools for YouTubers, editors and podcasters — each labelled with
              exactly how far we have verified it. No invented scores, no dead links.
            </p>

            <HomeSearch />

            {/*
              Audit fix 1.1 — every figure below is computed from the catalog,
              so the homepage cannot claim more than the data supports.
            */}
            <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-2xs">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <dt className="sr-only">Tools listed</dt>
                <dd className="text-zinc-400">
                  <strong className="font-mono tabular-nums text-white">{ALL_TOOLS.length}</strong>{' '}
                  tools listed
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <dt className="sr-only">Hands-on tested</dt>
                <dd className="text-zinc-400">
                  <strong className="font-mono tabular-nums text-white">{testedCount}</strong>{' '}
                  hands-on tested
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Skull className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                <dt className="sr-only">Dead tools removed</dt>
                <dd className="text-zinc-400">
                  <strong className="font-mono tabular-nums text-white">{GRAVEYARD.length}</strong>{' '}
                  dead tools removed
                </dd>
              </div>
              <Link href="/about" className="text-zinc-500 underline hover:text-zinc-300">
                Our methodology →
              </Link>
            </dl>

            {testedCount === 0 && (
              <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-2xs leading-relaxed text-zinc-400">
                <strong className="text-zinc-200">Being straight with you:</strong> our hands-on
                testing programme is just starting. Until a tool has been through it, we label it
                &ldquo;listed&rdquo; and publish no score — rather than inventing one.{' '}
                <Link href="/benchmark" className="text-accent-400 underline hover:text-accent-300">
                  See how testing works
                </Link>
                .
              </p>
            )}
          </div>
        </section>

        {/* Browse by category */}
        <section className="px-4 pb-14">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-5 text-xl font-bold">Browse by category</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {REAL_CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    href={`/category/${categorySlug(c)}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-accent-500/40 hover:text-accent-300"
                  >
                    <span className="truncate">{c}</span>
                    <span className="ml-2 font-mono text-2xs tabular-nums text-zinc-500">
                      {getCategoryTools(c).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Featured */}
        <section className="px-4 pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent-400" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold">Featured tools</h2>
                  <p className="mt-0.5 text-2xs text-zinc-500">
                    Widely used tools in the categories creators ask about most
                  </p>
                </div>
              </div>
              <Link
                href="/tools"
                className="shrink-0 text-2xs font-semibold text-accent-400 hover:text-accent-300"
              >
                View all →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTools.map((tool, i) => (
                <li key={tool.slug}>
                  <ToolCard tool={tool} index={i} priority={i < 3} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Trending */}
        {trendingTools.length > 0 && (
          <section className="px-4 pb-14">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <TrendingUp className="h-5 w-5 text-rose-400" aria-hidden="true" /> Trending now
              </h2>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {trendingTools.map((tool, i) => (
                  <li key={tool.slug}>
                    <ToolCard tool={tool} index={i} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Newest */}
        {newTools.length > 0 && (
          <section className="px-4 pb-14">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-4 text-lg font-bold">Recently launched</h2>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newTools.map((tool, i) => (
                  <li key={tool.slug}>
                    <ToolCard tool={tool} index={i} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Differentiators — surfaces the previously orphaned pages */}
        <section className="px-4 pb-14">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            <Link
              href="/benchmark"
              className="group rounded-2xl border border-white/10 bg-surface-1 p-6 transition-colors hover:border-accent-500/40"
            >
              <FlaskConical className="h-6 w-6 text-accent-400" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold">Benchmark Lab</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                The same brief, run through every tool in a category, with the raw output published
                so you can judge for yourself.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-accent-400">
                See the briefs
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/graveyard"
              className="group rounded-2xl border border-white/10 bg-surface-1 p-6 transition-colors hover:border-rose-500/40"
            >
              <Skull className="h-6 w-6 text-rose-400" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold">The Graveyard</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                We check every outbound link weekly. When a tool dies it leaves the catalog and gets
                a migration path here.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-rose-400">
                {GRAVEYARD.length} tools buried
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/stack-builder"
              className="group rounded-2xl border border-white/10 bg-surface-1 p-6 transition-colors hover:border-emerald-500/40"
            >
              <Layers className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold">Stack Builder</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                Assemble a complete toolchain for your channel and see the real monthly cost before
                you subscribe to anything.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-emerald-400">
                Build a stack
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </section>

        {/* Free tools */}
        <section className="px-4 pb-14">
          <div className="mx-auto max-w-7xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-bold">Working with no budget?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
              {freeCount} of the {ALL_TOOLS.length} tools we list have a free tier or are free
              outright — including several open-source options that match paid products feature for
              feature.
            </p>
            <Link
              href="/tools?pricing=Free"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-2xs font-bold text-black hover:opacity-90"
            >
              Browse free tools
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Blog */}
        {BLOG_POSTS.length > 0 && (
          <section className="px-4 pb-14">
            <div className="mx-auto max-w-7xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <BookOpen className="h-5 w-5 text-accent-400" aria-hidden="true" /> Guides
                </h2>
                <Link href="/blog" className="text-2xs font-semibold text-accent-400 hover:text-accent-300">
                  All guides →
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {BLOG_POSTS.slice(0, 3).map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block h-full rounded-2xl border border-white/10 bg-surface-1 p-5 transition-colors hover:border-accent-500/40"
                    >
                      <span className="text-2xs font-semibold uppercase tracking-wider text-accent-400">
                        {post.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug text-white">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-2xs leading-relaxed text-zinc-400">
                        {post.excerpt}
                      </p>
                      <p className="mt-3 font-mono text-2xs tabular-nums text-zinc-600">
                        {post.date} · {post.readTime}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-surface-1 p-8 text-center">
            <h2 className="text-2xl font-bold">New tools, price changes, shutdowns</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              One email when something actually changes — a tool we have tested, a price increase
              worth knowing about, or a service shutting down. No filler.
            </p>
            <div className="mt-6">
              <NewsletterForm source="homepage" />
            </div>
          </div>
        </section>
      </main>

      <CompareBar />
      <Footer />
    </div>
  );
}
