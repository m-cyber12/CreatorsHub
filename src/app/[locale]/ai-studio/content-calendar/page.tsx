import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentCalendarBuilder } from '@/components/studio/ContentCalendarBuilder';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('ccMetaTitle'),
    description: t('ccMetaDesc'),
    alternates: { canonical: '/ai-studio/content-calendar' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('ccEyebrow')}
      title={t('ccHeading')}
      description={t('ccDesc')}
    >
      <ContentCalendarBuilder />
    </StudioToolChrome>
  );
}
