import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ALL_TOOLS } from '@/data/tools';
import { Flame, ExternalLink, BadgePercent } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Tool Deals & Free Plans for Creators',
  description: 'Current free plans, free trials, and creator-friendly pricing on the best AI video tools — verified August 2026.',
  alternates: { canonical: '/deals' },
};

export default function DealsPage() {
  const freeTools = ALL_TOOLS.filter((t) => t.pricing === 'Free').sort((a, b) => b.rating - a.rating).slice(0, 8);
  const freemium = ALL_TOOLS.filter((t) => t.pricing === 'Freemium').sort((a, b) => b.rating - a.rating).slice(0, 12);
  const trials = ALL_TOOLS.filter((t) => t.pricing === 'Free Trial').sort((a, b) => b.rating - a.rating).slice(0, 8);

  const Section = ({ title, sub, tools }: { title: string; sub: string; tools: typeof freeTools }) => (
    <section className="mb-12">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mb-5 text-xs text-zinc-500">{sub}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <div key={t.slug} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 hover:border-purple-500/30 transition-colors">
            <img src={t.logo} alt={`${t.name} logo`} loading="lazy" className="h-10 w-10 rounded-xl border border-white/10 object-cover" />
            <div className="min-w-0 flex-1">
              <Link href={`/tool/${t.slug}`} className="text-sm font-bold text-white hover:text-purple-300">{t.name}</Link>
              <p className="truncate text-[11px] text-zinc-500">{t.tagline}</p>
              <p className="text-[10px] font-semibold text-emerald-400">{t.pricing}{t.startingPrice ? ` · paid from ${t.startingPrice}` : ''}</p>
            </div>
            <a
              href={`/go/${t.slug}`} target="_blank" rel="noopener noreferrer nofollow sponsored"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-purple-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-purple-500 transition-colors"
            >
              Get It <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 text-xs font-semibold text-rose-300 mb-4">
          <Flame className="h-3.5 w-3.5" /> Verified August 2026
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Deals, Free Plans & Trials</h1>
        <p className="mb-4 max-w-2xl text-sm text-zinc-400">
          Every entry below is verified against the vendor&apos;s pricing page. As we grow, founders will list exclusive
          creator discounts here —{' '}
          <Link href="/submit" className="text-purple-400 underline">building a tool? Get listed</Link>.
        </p>
        <p className="mb-10 inline-flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/80">
          <BadgePercent className="h-3.5 w-3.5" /> Some links are affiliate links — it never changes the price you pay.
        </p>

        <Section title="💚 Genuinely Free Tools" sub="No trial expiry, no credit card — free tiers you can build on." tools={freeTools} />
        <Section title="🔷 Best Freemium Plans" sub="Generous free tiers with paid upgrades when you scale." tools={freemium} />
        <Section title="⏱️ Worthwhile Free Trials" sub="Paid tools with real trial periods worth testing." tools={trials} />
      </main>
      <Footer />
    </div>
  );
}
