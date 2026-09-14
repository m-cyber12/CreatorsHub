import { SITE_URL } from '@/config/site';
import { routing } from '@/i18n/routing';

/**
 * Build hreflang alternates for a canonical path.
 * Example: canonical '/about' → { 'x-default': SITE_URL/about, en: SITE_URL/about, es: SITE_URL/es/about, ... }
 * Default locale (en) stays at root without prefix.
 */
export function localizedAlternates(canonicalPath: string) {
  const clean = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const languages: Record<string, string> = {
    'x-default': `${SITE_URL}${clean}`,
  };
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) {
      languages[locale] = `${SITE_URL}${clean}`;
    } else {
      languages[locale] = `${SITE_URL}/${locale}${clean}`;
    }
  }
  return {
    canonical: clean,
    languages,
  };
}
