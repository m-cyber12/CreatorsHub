import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginClient } from './LoginClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'login' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/login' },
    robots: { index: false },
  };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only same-site paths are forwarded to the client; avoid open redirects.
  const nextPath = next?.startsWith('/') && !next.startsWith('//') ? next : '/account';
  return <LoginClient nextPath={nextPath} />;
}
