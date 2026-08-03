"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('cah_cookie_consent')) setVisible(true);
    } catch {}
  }, []);

  const decide = (value: 'accepted' | 'essential') => {
    try { localStorage.setItem('cah_cookie_consent', value); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1">
            <p className="text-xs leading-relaxed text-zinc-300">
              We use essential cookies to make the site work and optional analytics cookies to understand which tools creators
              love. Read our <Link href="/privacy" className="underline text-purple-400 hover:text-purple-300">Privacy Policy</Link>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => decide('accepted')}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => decide('essential')}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
