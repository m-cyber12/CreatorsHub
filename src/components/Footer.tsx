import Link from 'next/link';
import { ALL_TOOLS, hasVerifiedScore } from '@/data/tools';
import { SITE_NAME } from '@/config/site';
import { REAL_CATEGORIES, categorySlug, getCategoryTools } from '@/lib/categories';

/**
 * Audit fixes 1.1, 1.6, 3.3.
 *
 * - The old footer claimed "Listings independently reviewed — last audit:
 *   August 2026" across a catalog that was 77% machine-generated.
 * - It asserted an affiliate relationship that did not exist for any tool.
 *   The disclosure is now conditional on there actually being one.
 * - /benchmark and /graveyard were unreachable from the footer; both are now
 *   linked, along with the new category hub.
 */
export function Footer() {
  const testedCount = ALL_TOOLS.filter(hasVerifiedScore).length;
  const hasAffiliates = ALL_TOOLS.some((t) => t.affiliateProgram);
  const year = new Date().getFullYear();

  // Top categories by size, for internal link equity.
  const topCategories = [...REAL_CATEGORIES]
    .sort((a, b) => getCategoryTools(b).length - getCategoryTools(a).length)
    .slice(0, 6);

  return (
    <footer className="border-t border-white/5 bg-black px-4 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-2xs md:grid-cols-6">
        <div className="col-span-2">
          <h2 className="mb-3 font-bold text-white">{SITE_NAME}</h2>
          <p className="mb-3 leading-relaxed text-zinc-500">
            The curated AI toolbox for video creators. {ALL_TOOLS.length} tools catalogued,{' '}
            {testedCount} tested hands-on, and every listing labelled with exactly how far we have
            verified it.
          </p>
          {hasAffiliates ? (
            <p className="text-[0.6875rem] leading-relaxed text-zinc-600">
              <span className="font-semibold text-zinc-500">FTC disclosure:</span> some outbound
              links are affiliate links and we may earn a commission at no extra cost to you.
              Commissions never affect our scores or rankings.{' '}
              <Link href="/disclosure" className="underline hover:text-zinc-400">
                Learn more
              </Link>
            </p>
          ) : (
            <p className="text-[0.6875rem] leading-relaxed text-zinc-600">
              <span className="font-semibold text-zinc-500">Disclosure:</span> we currently earn no
              commission from any tool listed here.{' '}
              <Link href="/disclosure" className="underline hover:text-zinc-400">
                Our position on this
              </Link>
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Directory</h2>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/tools" className="hover:text-accent-400">All Tools</Link></li>
            <li><Link href="/tools?pricing=Free" className="hover:text-accent-400">Free Tools</Link></li>
            <li><Link href="/tools?tested=1" className="hover:text-accent-400">Tested Tools</Link></li>
            <li><Link href="/compare" className="hover:text-accent-400">Compare</Link></li>
            <li><Link href="/stack-builder" className="hover:text-accent-400">Stack Builder</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Categories</h2>
          <ul className="space-y-2 text-zinc-500">
            {topCategories.map((c) => (
              <li key={c}>
                <Link href={`/category/${categorySlug(c)}`} className="hover:text-accent-400">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Resources</h2>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/benchmark" className="hover:text-accent-400">Benchmark Lab</Link></li>
            <li><Link href="/graveyard" className="hover:text-accent-400">Tool Graveyard</Link></li>
            <li><Link href="/blog" className="hover:text-accent-400">Guides</Link></li>
            <li><Link href="/deals" className="hover:text-accent-400">Deals</Link></li>
            <li><Link href="/developers" className="hover:text-accent-400">Public API</Link></li>
            <li><Link href="/feed.xml" className="hover:text-accent-400">RSS Feed</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Company</h2>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/about" className="hover:text-accent-400">About & Methodology</Link></li>
            <li><Link href="/submit" className="hover:text-accent-400">Submit a Tool</Link></li>
            <li><Link href="/contact" className="hover:text-accent-400">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-accent-400">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-accent-400">Terms</Link></li>
            <li><Link href="/disclosure" className="hover:text-accent-400">Disclosure</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/5 pt-6 text-center text-2xs text-zinc-600">
        © {year} {SITE_NAME}. Tool information is catalogued from public sources and vendor
        documentation; verification levels are stated on every listing.
      </div>
    </footer>
  );
}
