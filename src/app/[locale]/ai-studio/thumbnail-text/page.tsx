import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ThumbnailTextGenerator } from '@/components/studio/ThumbnailTextGenerator';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('ttMetaTitle'),
    description: t('ttMetaDesc'),
    alternates: { canonical: '/ai-studio/thumbnail-text' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('ttEyebrow')}
      title={t('ttHeading')}
      description={t('ttDesc')}
    >
      <ThumbnailTextGenerator />
    </StudioToolChrome>
  );
}
