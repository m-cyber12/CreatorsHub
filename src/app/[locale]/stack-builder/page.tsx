import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import StackBuilderClient from './StackBuilderClient';

/*
  Bug fix — the Stack Builder was previously a single `'use client'` page with
  no exported `metadata`, so Next.js fell back to the root layout's metadata:
  the page's canonical URL in the HTML pointed at `/` instead of
  `/stack-builder`, and its share preview showed the generic site title.

  Splitting it into a server page (this file, which exports real Metadata)
  + a client component (StackBuilderClient.tsx, which keeps all the
  interactivity) fixes the canonical URL and gives the page a proper,
  page-specific Open Graph share preview — without touching the design.

  i18n (v3.3): metadata now comes from the `stackBuilder` messages so every
  locale gets its own title/description.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stackBuilder' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/stack-builder' },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
    },
  };
}

export default function StackBuilderPage() {
  return (
    <Suspense>
      <StackBuilderClient />
    </Suspense>
  );
}
