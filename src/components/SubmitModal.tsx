"use client";

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '@/data/tools';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    tagline: '',
    category: CATEGORIES[1],
    pricing: 'Freemium',
    founderEmail: '',
    willAddBadge: true,
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API submission (In production, posts to /api/submit -> Supabase)
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 2500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">
              Tool Submitted Successfully!
            </h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-sm">
              We have received your submission. It will be reviewed and published in our next curation cycle!
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">
                Submit Your AI Video Tool
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Get featured in front of thousands of YouTubers, video editors, and content creators.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. OpusClip"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://yourtool.ai"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Tagline / Short Pitch *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="1 sentence describing how it helps video creators"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Pricing *
                  </label>
                  <select
                    value={formData.pricing}
                    onChange={(e) =>
                      setFormData({ ...formData, pricing: e.target.value as any })
                    }
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                    <option value="Free Trial">Free Trial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Founder Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.founderEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, founderEmail: e.target.value })
                  }
                  placeholder="founder@yourtool.ai (for verification & backlink info)"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Founder Flywheel Checkbox */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.willAddBadge}
                    onChange={(e) =>
                      setFormData({ ...formData, willAddBadge: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      Priority Listing + Verified Founder Badge
                    </span>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      We prioritize submissions from founders who add our small badge or mention CreatorAI Hub on their website/Twitter.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Submitting Tool...' : 'Submit AI Tool for Curation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
