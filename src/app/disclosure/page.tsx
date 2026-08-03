import Link from 'next/link';

export const metadata = {
  title: 'Affiliate Disclosure — CreatorAI Hub',
  description: 'FTC Affiliate Disclosure for CreatorAI Hub.',
};

export default function DisclosurePage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 mb-8 block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mb-6">Affiliate Disclosure</h1>
        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
          <p>
            CreatorAI Hub is a curated directory of AI tools for video creators. Some of the outbound links on this website are affiliate links, which means we may earn a commission if you click on the link or make a purchase using the link.
          </p>
          <p>
            This comes at no extra cost to you. Our editorial team independently reviews and selects tools based on merit, performance, and creator feedback — not affiliate commissions.
          </p>
          <p>
            We only recommend tools we have tested or thoroughly researched. Our goal is to help you find the best AI tools for your creative workflow.
          </p>
          <p className="text-zinc-500 pt-4 border-t border-white/10">
            Last updated: August 2026
          </p>
        </div>
      </div>
    </div>
  );
}
