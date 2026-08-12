'use client';

import { useStudioQuota } from '@/context/StudioQuotaContext';
import { useAuth } from '@/context/AppProviders';

export type StudioToolSlug =
  | 'prompt-builder'
  | 'thumbnail-brief'
  | 'thumbnail-text'
  | 'content-calendar'
  | 'image-tools'
  | 'subtitle-tools'
  | 'audio-trimmer'
  | 'video-inspector';

export function useStudioAccess() {
  const { user } = useAuth();
  const { access, consumeQuota, refreshQuota, showPaywallModal, setShowPaywallModal } =
    useStudioQuota();

  return {
    user,
    access,
    consume: consumeQuota,
    refresh: refreshQuota,
    showPaywallModal,
    setShowPaywallModal,
  };
}
