import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SubtitleTools } from '@/components/studio/SubtitleTools';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('stMetaTitle'),
    description: t('stMetaDesc'),
    alternates: { canonical: '/ai-studio/subtitle-tools' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('stEyebrow')}
      title={t('stHeading')}
      description={t('stDesc')}
    >
      <SubtitleTools />
    </StudioToolChrome>
  );
}
