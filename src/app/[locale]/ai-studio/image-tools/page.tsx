import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ImageTools } from '@/components/studio/ImageTools';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('itMetaTitle'),
    description: t('itMetaDesc'),
    alternates: { canonical: '/ai-studio/image-tools' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('itEyebrow')}
      title={t('itHeading')}
      description={t('itDesc')}
    >
      <ImageTools />
    </StudioToolChrome>
  );
}
