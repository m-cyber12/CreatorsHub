import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ALL_TOOLS, hasVerifiedScore } from '@/data/tools';
import { GRAVEYARD } from '@/data/graveyard';
import { REAL_CATEGORIES } from '@/lib/categories';
import { FlaskConical, BadgeDollarSign, ListChecks, User, RefreshCw } from 'lucide-react';

/**
 * Audit fix 1.1 (E-E-A-T).
 *
 * The previous version stated that every tool "passed a manual review" and had
 * "verified pricing and an editorial score", across a catalog that was 77%
 * machine-generated with reviewsCount: 0. That claim is precisely what Google's
 * Quality Rater guidelines and the FTC's endorsement rules are designed to
 * catch, and it was trivially disprovable by anyone reading the repository.
 *
 * This page now describes what the site actually does, including what it does
 * not yet do. Counts are computed from the data so the text cannot drift.
 */

export const metadata: Metadata = {
  title: 'About & Review Methodology',
  description:
    'Who runs CreatorAI Hub, the three verification levels we use, how scoring works, and an honest account of what we have and have not tested.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const testedCount = ALL_TOOLS.filter(hasVerifiedScore).length;
  const pricingVerified = ALL_TOOLS.filter((t) => t.verificationLevel === 'pricing-verified').length;
  const listedOnly = ALL_TOOLS.filter((t) => t.verificationLevel === 'listed-only').length;

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <Header />

      <main id="main" className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="mb-6 text-3xl font-black tracking-tight md:text-4xl">About CreatorAI Hub</h1>

        <p className="mb-4 text-base leading-relaxed text-zinc-300">
          CreatorAI Hub is a specialist directory of AI tools for video creators — YouTubers,
          editors, podcasters and short-form creators. Rather than listing every AI product in
          existence, it goes deep on one vertical:{' '}
          <strong className="text-white">tools that help you make better video, faster</strong>.
        </p>

        <p className="mb-10 text-base leading-relaxed text-zinc-300">
          The directory currently covers{' '}
          <strong className="font-mono tabular-nums text-white">{ALL_TOOLS.length}</strong> tools
          across {REAL_CATEGORIES.length} categories, and tracks{' '}
          <Link href="/graveyard" className="text-accent-400 underline hover:text-accent-300">
            {GRAVEYARD.length} that have shut down
          </Link>
          .
        </p>

        {/* The honesty section */}
        <section className="mb-10 rounded-3xl border border-accent-500/25 bg-accent-500/5 p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-bold">What we claim, and what we don&apos;t</h2>

          <p className="mb-4 text-sm leading-relaxed text-zinc-300">
            Most directories imply every listing has been reviewed. That is almost never true, and
            it is the reason their scores are worthless — when everything rates 4.5 stars, the
            rating tells you nothing. We use three explicit levels instead, and each one is shown on
            the listing itself.
          </p>

          <dl className="space-y-4">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <dt className="flex items-center gap-2 font-bold text-emerald-300">
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Hands-on tested
                <span className="ml-auto font-mono tabular-nums">{testedCount}</span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                We ran the tool ourselves against the{' '}
                <Link href="/benchmark" className="underline hover:text-white">
                  standard brief
                </Link>{' '}
                for its category, on a plan we paid for, and published the output. Only these carry
                a numeric score and an Evidence Card.
              </dd>
            </div>

            <div className="rounded-xl border border-accent-500/25 bg-accent-500/5 p-4">
              <dt className="flex items-center gap-2 font-bold text-accent-300">
                <BadgeDollarSign className="h-4 w-4" aria-hidden="true" />
                Pricing verified
                <span className="ml-auto font-mono tabular-nums">{pricingVerified}</span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                A human opened the vendor&apos;s own pricing page and confirmed the figure on a
                stated date, with a link to the source. We have not run the tool end to end, so we
                publish no score.
              </dd>
            </div>

            <div className="rounded-xl border border-white/10 bg-surface-1 p-4">
              <dt className="flex items-center gap-2 font-bold text-zinc-300">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Listed
                <span className="ml-auto font-mono tabular-nums">{listedOnly}</span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                Catalogued from the vendor&apos;s public documentation so you can find it and
                compare the facts. No test claim, and deliberately no score. Most of the catalog is
                here, and saying so is the point.
              </dd>
            </div>
          </dl>

          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-zinc-400">
            Testing properly takes real time and real subscription money, so the tested column grows
            slowly. We would rather it grow slowly and be true.
          </p>
        </section>

        {/* Editor */}
        <section className="mb-10 rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <User className="h-5 w-5 text-accent-400" aria-hidden="true" /> Who runs this
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">
            CreatorAI Hub is an independent, founder-run project — a solo builder who got tired of
            &ldquo;10,000 AI tools&rdquo; directories where half the links are dead and none of the
            pricing is current. That is why dead tools are removed and buried in a public graveyard
            rather than quietly left in place, and why untested tools are labelled instead of
            padded with invented scores.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Reach us any time through the{' '}
            <Link href="/contact" className="text-accent-400 underline hover:text-accent-300">
              contact page
            </Link>
            . Corrections are welcome and get fixed quickly — if a price is wrong or a tool has
            shut down, tell us.
          </p>
        </section>

        {/* Maintenance */}
        <section className="mb-10 rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <RefreshCw className="h-5 w-5 text-accent-400" aria-hidden="true" /> How the directory
            is maintained
          </h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-zinc-300">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              Every outbound link is checked automatically once a week. Three consecutive failures
              flag a tool for review.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              Confirmed shutdowns are removed from the catalog and documented in the{' '}
              <Link href="/graveyard" className="text-accent-400 underline hover:text-accent-300">
                graveyard
              </Link>{' '}
              with a migration path.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              Verified prices carry the date they were checked. Anything undated has not been
              verified — treat it as indicative.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              Community reviews are moderated before publication, and structured-data ratings are
              only emitted once a tool has at least three genuine approved reviews.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
          <h2 className="mb-3 text-lg font-bold">Money</h2>
          <p className="text-sm leading-relaxed text-zinc-300">
            We are straightforward about this: read the{' '}
            <Link href="/disclosure" className="text-accent-400 underline hover:text-accent-300">
              affiliate disclosure
            </Link>{' '}
            for exactly how the site is funded and what that does — and does not — influence.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
