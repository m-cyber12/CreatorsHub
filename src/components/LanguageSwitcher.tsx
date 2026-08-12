'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Languages, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { LOCALE_META, routing } from '@/i18n/routing';

/**
 * Language switcher — visible in the header on every page and locale.
 * Switching keeps you on the exact same URL path, just in the new locale
 * (e.g. /fa/tool/opusclip ↔ /es/tool/opusclip).
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as keyof typeof LOCALE_META;
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const switchTo = (next: string) => {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next as never });
  };

  const current = LOCALE_META[locale];

  return (
    <div ref={ref} className="relative locale-switcher">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('languageLabel')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-2xs font-semibold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Languages className="h-4 w-4 text-accent-300" aria-hidden="true" />
        {!compact && <span className="hidden md:inline">{current.flag} {current.native}</span>}
        <ChevronDown
          className={`h-3 w-3 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute end-0 z-[60] mt-2 w-56 rounded-xl border border-white/10 bg-surface-1 p-1.5 shadow-2xl">
          <p className="px-3 pb-1 pt-2 text-2xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('language')}
          </p>
          <ul className="max-h-72 overflow-y-auto">
            {routing.locales.map((l) => {
              const meta = LOCALE_META[l as keyof typeof LOCALE_META];
              const active = l === locale;
              return (
                <li key={l}>
                  <button
                    onClick={() => switchTo(l)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-2xs font-medium transition-colors ${
                      active
                        ? 'bg-accent-500/10 text-accent-300'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                    lang={l}
                    dir={meta.dir}
                  >
                    <span aria-hidden="true">{meta.flag}</span>
                    <span className="flex-1 text-start">{meta.native}</span>
                    {active && <Check className="h-3.5 w-3.5 text-accent-300" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-white/5 px-3 pb-1 pt-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t('poweredByTranslation')}
          </p>
          <p className="border-t border-white/5 px-3 pb-1.5 pt-2 text-[10px] leading-relaxed text-amber-700 dark:text-amber-200/80">
            {t('notAllTranslated')}
          </p>
          <a
            href={googleTranslateUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-3 mb-2 mt-0.5 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-surface-2 px-3 py-1.5 text-[10px] font-bold text-accent-300 transition-colors hover:border-accent-500/40 hover:text-accent-200"
          >
            <Languages className="h-3 w-3" aria-hidden="true" />
            {t('googleTranslate')}
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Google Translate link for the current page. The English (canonical) URL is
 * derived by stripping the locale prefix, so Google translates the original
 * English content into the user's language — no API key needed, free.
 */
function googleTranslateUrl(locale: string): string {
  if (typeof window === 'undefined') return 'https://translate.google.com/';
  const { origin, pathname, search } = window.location;
  const locales = routing.locales as readonly string[];
  const segs = pathname.split('/').filter(Boolean);
  let enPath = pathname;
  if (segs.length > 0 && (locales as string[]).includes(segs[0])) {
    enPath = '/' + segs.slice(1).join('/');
    if (enPath === '/') enPath = '';
  }
  const enUrl = `${origin}${enPath}${search}`;
  return `https://translate.google.com/translate?sl=en&tl=${locale}&u=${encodeURIComponent(enUrl)}`;
}
