import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PromptBuilder } from '@/components/studio/PromptBuilder';
import { StudioToolChrome } from '@/components/studio/StudioToolChrome';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('pbMetaTitle'),
    description: t('pbMetaDesc'),
    alternates: { canonical: '/ai-studio/prompt-builder' },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return (
    <StudioToolChrome
      eyebrow={t('pbEyebrow')}
      title={t('pbHeading')}
      description={t('pbDesc')}
    >
      <PromptBuilder />
    </StudioToolChrome>
  );
}
