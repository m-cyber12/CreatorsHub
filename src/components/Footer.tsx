import Link from 'next/link';
import { ALL_TOOLS } from '@/data/tools';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black px-4 py-12">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-bold text-white mb-3">CreatorAI Hub</h4>
          <p className="text-zinc-500 leading-relaxed mb-3">
            The curated AI toolbox for video creators. {ALL_TOOLS.length}+ hand-reviewed tools. Stop searching, start creating.
          </p>
          <p className="text-zinc-600 leading-relaxed text-[10px]">
            <span className="font-semibold text-zinc-500">FTC Disclosure:</span> Some outbound links are affiliate links.
            We may earn a commission at no extra cost to you.{' '}
            <Link href="/disclosure" className="underline hover:text-zinc-400">Learn more</Link>
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Directory</h4>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/tools" className="hover:text-purple-400">All Tools</Link></li>
            <li><Link href="/tools?pricing=Free" className="hover:text-purple-400">Free Tools</Link></li>
            <li><Link href="/tools?sort=newest" className="hover:text-purple-400">New Tools</Link></li>
            <li><Link href="/compare" className="hover:text-purple-400">Compare</Link></li>
            <li><Link href="/stack-builder" className="hover:text-purple-400">Stack Builder</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Resources</h4>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/blog" className="hover:text-purple-400">Blog & Guides</Link></li>
            <li><Link href="/deals" className="hover:text-purple-400">Deals</Link></li>
            <li><Link href="/developers" className="hover:text-purple-400">Public API</Link></li>
            <li><Link href="/submit" className="hover:text-purple-400">Submit a Tool</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/about" className="hover:text-purple-400">About & Methodology</Link></li>
            <li><Link href="/contact" className="hover:text-purple-400">Contact</Link></li>
            <li><Link href="/login" className="hover:text-purple-400">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/privacy" className="hover:text-purple-400">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-purple-400">Terms of Service</Link></li>
            <li><Link href="/disclosure" className="hover:text-purple-400">Affiliate Disclosure</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-[11px] text-zinc-600">
        © 2026 CreatorAI Hub. All rights reserved. Listings independently reviewed — last audit: August 2026.
      </div>
    </footer>
  );
}
