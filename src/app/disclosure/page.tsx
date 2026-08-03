import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'FTC affiliate disclosure for CreatorAI Hub: how affiliate links work, and how we keep editorial reviews independent.',
  alternates: { canonical: '/disclosure' },
};

export default function DisclosurePage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-14">
        <h1 className="text-3xl font-black tracking-tight mb-6">Affiliate Disclosure</h1>
        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
          <p>
            In accordance with FTC guidelines (16 CFR Part 255), CreatorAI Hub discloses that some of the outbound links on this
            website are affiliate links. If you click one and make a purchase, we may earn a commission —{' '}
            <span className="text-white font-semibold">at no extra cost to you</span>.
          </p>
          <p>
            Affiliate revenue is how we keep the directory free, ad-free, and independent. Two rules keep it honest:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Editorial scores and rankings are <span className="text-white font-semibold">never</span> influenced by affiliate status. Several Editor&apos;s Choice tools pay us nothing.</li>
            <li>Every listing links to the vendor whether or not an affiliate program exists.</li>
          </ul>
          <p>
            Outbound affiliate links use our <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">/go/</code> redirect and carry{' '}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">rel=&quot;sponsored nofollow&quot;</code> attributes as
            recommended by Google and the FTC.
          </p>
          <p>
            We only recommend tools we have tested or thoroughly researched — read{' '}
            <Link href="/about" className="text-purple-400 underline">our full review methodology</Link>.
          </p>
          <p className="text-zinc-500 pt-4 border-t border-white/10">Last updated: August 3, 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
