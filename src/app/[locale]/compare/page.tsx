import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type Tool } from '@/data/tools';
import { localizeTools } from '@/lib/i18n/content';
import { getEffectiveTools } from '@/lib/contentOverrides';
import { CompareClient } from './CompareClient';

type LocaleParams = Promise<{ locale: string }>;

export const revalidate = 30;

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'compare' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/compare' },
  };
}

export default async function ComparePage({
  params: localeParams,
  searchParams,
}: {
  params: LocaleParams;
  searchParams: Promise<{ tools?: string | string[] }>;
}) {
  const { locale } = await localeParams;
  setRequestLocale(locale);
  const params = await searchParams;
  const raw = typeof params.tools === 'string' ? params.tools : Array.isArray(params.tools) ? params.tools[0] : '';
  const effectiveTools = await getEffectiveTools();
  
  // Deduplicate initialTools from raw query
  const seen = new Set<string>();
  const initialTools: Tool[] = [];
  
  if (raw) {
    raw.split(',').forEach((s) => {
      const slug = s.trim();
      if (!seen.has(slug)) {
        const found = effectiveTools.find((t) => t.slug === slug);
        if (found) {
          seen.add(slug);
          initialTools.push(found);
        }
      }
    });
  }

  // Auto-pair with category alternatives if fewer than 2 tools selected
  if (initialTools.length < 2) {
    const existingSlugs = new Set(initialTools.map((t) => t.slug));
    const firstCat = initialTools[0]?.category;

    // First try same category competitors
    const categoryMatches = effectiveTools.filter(
      (t) => !existingSlugs.has(t.slug) && (firstCat ? t.category === firstCat : true)
    );

    for (const match of categoryMatches) {
      if (initialTools.length >= 2) break;
      initialTools.push(match);
      existingSlugs.add(match.slug);
    }

    // Fill remaining if necessary
    for (const tool of effectiveTools) {
      if (initialTools.length >= 2) break;
      if (!existingSlugs.has(tool.slug)) {
        initialTools.push(tool);
        existingSlugs.add(tool.slug);
      }
    }
  }

  const localized = await localizeTools(initialTools.slice(0, 3), locale);

  return (
    <Suspense>
      <CompareClient initialTools={localized} />
    </Suspense>
  );
}
