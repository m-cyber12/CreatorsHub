import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ThumbnailBriefBuilder } from '@/components/studio/ThumbnailBriefBuilder';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('tbMetaTitle'),
    description: t('tbMetaDesc'),
    alternates: { canonical: '/ai-studio/thumbnail-brief' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('tbEyebrow')}
      title={t('tbHeading')}
      description={t('tbDesc')}
    >
      <ThumbnailBriefBuilder />
    </StudioToolChrome>
  );
}
