'use client';

import { useStudioQuota } from '@/context/StudioQuotaContext';
import { useAuth } from '@/context/AppProviders';
import type { StudioToolSlug } from '@/lib/studio';

// Re-exported from the Studio registry (single source of truth).
export type { StudioToolSlug } from '@/lib/studio';

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
