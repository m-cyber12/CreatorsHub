'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

/**
 * Audit fix 1.7 — the reverse consent problem.
 *
 * The old banner asked permission for "optional analytics cookies" at a time
 * when the site had no analytics at all, and offered an "Accept All" button
 * that did precisely nothing either way. Asking consent for processing that
 * does not happen is its own compliance defect: it misdescribes what the site
 * does, and it trains users to click through real consent requests.
 *
 * What actually happens now:
 *   - Vercel Analytics and Speed Insights are cookieless and store no
 *     cross-site identifier, so under GDPR/ePrivacy they do not require prior
 *     consent.
 *   - localStorage is used only for your own bookmarks and this dismissal —
 *     strictly necessary for a feature you asked for.
 *
 * So this is an honest notice with a dismiss control, not a fake choice. If a
 * genuinely consent-requiring tool is ever added (ad pixels, cross-site
 * tracking), restore a real two-button opt-in and gate the script on it.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('cah_privacy_notice_seen')) setVisible(true);
    } catch {
      /* storage blocked — just don't show the notice */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem('cah_privacy_notice_seen', '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy notice"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl"
    >
      <div className="rounded-2xl border border-white/10 bg-surface-1/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-2xs leading-relaxed text-zinc-300">
              <strong className="text-white">No tracking cookies here.</strong> We use cookieless
              analytics that cannot identify you, and local storage only for your saved tools. See
              our{' '}
              <Link href="/privacy" className="text-accent-400 underline hover:text-accent-300">
                Privacy Policy
              </Link>
              .
            </p>
            <button
              onClick={dismiss}
              className="mt-3 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
            >
              Got it
            </button>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss privacy notice"
            className="shrink-0 rounded-lg p-1 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
