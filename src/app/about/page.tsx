import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ALL_TOOLS, CATEGORIES } from '@/data/tools';
import { FlaskConical, Star, DollarSign, RefreshCw, ShieldCheck, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About & Review Methodology',
  description: 'Who curates CreatorAI Hub, how we test AI tools, and how our editorial scoring works. Full transparency on our review process and affiliate policy.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">About CreatorAI Hub</h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          CreatorAI Hub is a specialist directory of AI tools for video creators — YouTubers, editors, podcasters, and
          short-form creators. Instead of listing every AI product on earth, we go deep on one vertical:{' '}
          <span className="text-white font-semibold">tools that help you make better video, faster</span>.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed mb-10">
          Today the directory covers <span className="text-white font-semibold">{ALL_TOOLS.length}+ tools</span> across{' '}
          {CATEGORIES.length - 1} categories, each with verified pricing and an editorial score. We add new tools weekly and
          re-verify listings on a rolling schedule.
        </p>

        {/* Editor profile */}
        <section className="mb-10 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold mb-4"><User className="h-5 w-5 text-purple-400" /> Who runs this?</h2>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-2xl font-black">
              M
            </div>
            <div>
              <h3 className="text-base font-bold text-white">M. — Founder & Lead Curator</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                CreatorAI Hub is an independent, founder-run project. I&apos;m a solo builder and video-tooling nerd who got tired of
                bloated &quot;10,000 AI tools&quot; directories where half the links are dead and none of the pricing is current. Every tool
                listed here passed a manual review; the ones marked <span className="text-amber-300 font-semibold">Editor&apos;s Choice</span> I
                use in my own workflow. You can reach me any time via{' '}
                <Link href="/contact" className="text-purple-400 underline">the contact page</Link> or GitHub.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">How we review tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: FlaskConical, title: '1. Hands-on Testing', desc: 'We sign up, run real creator tasks (a talking-head clip, a caption pass, a thumbnail), and evaluate the actual output — not the marketing page.' },
              { icon: Star, title: '2. Editorial Scoring', desc: 'Scores (1–5) weigh output quality 40%, speed & workflow 25%, value for money 20%, and support/reliability 15%. Community reviews are shown separately and never merged into editorial scores.' },
              { icon: DollarSign, title: '3. Pricing Verification', desc: 'Starting prices are checked against the vendor pricing page at review time. If you spot a stale price, report it and we fix it within 48h.' },
              { icon: RefreshCw, title: '4. Rolling Re-review', desc: 'Each listing shows a "Last reviewed" date. Tools are re-checked on a rolling cycle, and dead or abandoned products are removed.' },
            ].map((m) => (
              <div key={m.title} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
                <m.icon className="h-5 w-5 text-purple-400" />
                <h3 className="mt-2 text-sm font-bold">{m.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Affiliate honesty */}
        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold mb-3"><ShieldCheck className="h-5 w-5 text-emerald-400" /> How we make money</h2>
          <p className="text-xs leading-relaxed text-zinc-400">
            Some outbound links are affiliate links — if you subscribe to a tool through them, we may earn a commission at no extra
            cost to you. Two hard rules keep this honest: <span className="text-white font-semibold">(1)</span> affiliate status never
            affects scores or ranking — several Editor&apos;s Choice tools pay us nothing; <span className="text-white font-semibold">(2)</span>{' '}
            every listing links to the vendor whether or not an affiliate program exists. Read the full{' '}
            <Link href="/disclosure" className="text-emerald-300 underline">affiliate disclosure</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
