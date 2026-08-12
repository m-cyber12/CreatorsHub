import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AudioTrimmer } from '@/components/studio/AudioTrimmer';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('atMetaTitle'),
    description: t('atMetaDesc'),
    alternates: { canonical: '/ai-studio/audio-trimmer' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('atEyebrow')}
      title={t('atHeading')}
      description={t('atDesc')}
    >
      <AudioTrimmer />
    </StudioToolChrome>
  );
}
