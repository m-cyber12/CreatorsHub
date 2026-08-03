import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, Github, Send, Flag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact the CreatorAI Hub team — tool submissions, corrections, partnerships, and press.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-black tracking-tight mb-2">Contact Us</h1>
        <p className="text-sm text-zinc-400 mb-10">We read everything. Typical response time: 1–2 business days.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="mailto:hello@creatoraihub.com" className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 hover:border-purple-500/30 transition-colors">
            <Mail className="h-6 w-6 text-purple-400" />
            <h2 className="mt-3 text-sm font-bold group-hover:text-purple-200">General & Press</h2>
            <p className="mt-1 text-xs text-zinc-500">hello@creatoraihub.com</p>
          </a>
          <Link href="/submit" className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 hover:border-purple-500/30 transition-colors">
            <Send className="h-6 w-6 text-emerald-400" />
            <h2 className="mt-3 text-sm font-bold group-hover:text-purple-200">Submit a Tool</h2>
            <p className="mt-1 text-xs text-zinc-500">Free editorial review in 3–5 days</p>
          </Link>
          <a href="mailto:hello@creatoraihub.com?subject=Listing%20Correction" className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 hover:border-purple-500/30 transition-colors">
            <Flag className="h-6 w-6 text-amber-400" />
            <h2 className="mt-3 text-sm font-bold group-hover:text-purple-200">Report Incorrect Info</h2>
            <p className="mt-1 text-xs text-zinc-500">Stale pricing or dead links — fixed within 48h</p>
          </a>
          <a href="https://github.com/m-cyber12/DirectoryAI-Hub" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 hover:border-purple-500/30 transition-colors">
            <Github className="h-6 w-6 text-zinc-300" />
            <h2 className="mt-3 text-sm font-bold group-hover:text-purple-200">GitHub</h2>
            <p className="mt-1 text-xs text-zinc-500">m-cyber12/DirectoryAI-Hub</p>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
