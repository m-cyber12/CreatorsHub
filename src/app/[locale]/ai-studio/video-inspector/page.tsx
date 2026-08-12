import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { VideoInspector } from '@/components/studio/VideoInspector';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('viMetaTitle'),
    description: t('viMetaDesc'),
    alternates: { canonical: '/ai-studio/video-inspector' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('viEyebrow')}
      title={t('viHeading')}
      description={t('viDesc')}
    >
      <VideoInspector />
    </StudioToolChrome>
  );
}
