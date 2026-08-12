'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface StudioQuotaState {
  limit: number;
  used: number;
  remaining: number;
  limitReached: boolean;
}

interface StudioQuotaContextType {
  access: StudioQuotaState;
  consumeQuota: (toolSlug?: string) => boolean;
  refreshQuota: () => void;
  showPaywallModal: boolean;
  setShowPaywallModal: (show: boolean) => void;
}

const DAILY_FREE_LIMIT = 3;

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStoredQuota(): { date: string; used: number } {
  if (typeof window === 'undefined') return { date: getTodayKey(), used: 0 };
  try {
    const raw = localStorage.getItem('cah_studio_daily_quota');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayKey()) {
        return { date: getTodayKey(), used: Number(parsed.used) || 0 };
      }
    }
  } catch {
    /* noop */
  }
  return { date: getTodayKey(), used: 0 };
}

function setStoredQuota(used: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      'cah_studio_daily_quota',
      JSON.stringify({ date: getTodayKey(), used })
    );
  } catch {
    /* noop */
  }
}

const StudioQuotaContext = createContext<StudioQuotaContextType>({
  access: { limit: DAILY_FREE_LIMIT, used: 0, remaining: DAILY_FREE_LIMIT, limitReached: false },
  consumeQuota: () => true,
  refreshQuota: () => {},
  showPaywallModal: false,
  setShowPaywallModal: () => {},
});

export function StudioQuotaProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<StudioQuotaState>({
    limit: DAILY_FREE_LIMIT,
    used: 0,
    remaining: DAILY_FREE_LIMIT,
    limitReached: false,
  });
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const refreshQuota = useCallback(() => {
    const stored = getStoredQuota();
    const used = Math.min(DAILY_FREE_LIMIT, Math.max(0, stored.used));
    const remaining = Math.max(0, DAILY_FREE_LIMIT - used);
    setAccess({
      limit: DAILY_FREE_LIMIT,
      used,
      remaining,
      limitReached: remaining <= 0,
    });
  }, []);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  const consumeQuota = useCallback(
    (toolSlug = 'ai-tool'): boolean => {
      const stored = getStoredQuota();

      if (stored.used >= DAILY_FREE_LIMIT) {
        refreshQuota();
        setShowPaywallModal(true);
        return false;
      }

      const newUsed = stored.used + 1;
      setStoredQuota(newUsed);

      const remaining = Math.max(0, DAILY_FREE_LIMIT - newUsed);
      setAccess({
        limit: DAILY_FREE_LIMIT,
        used: newUsed,
        remaining,
        limitReached: remaining <= 0,
      });

      if (remaining <= 0) {
        setShowPaywallModal(true);
      }

      return true;
    },
    [refreshQuota]
  );

  return (
    <StudioQuotaContext.Provider
      value={{ access, consumeQuota, refreshQuota, showPaywallModal, setShowPaywallModal }}
    >
      {children}
    </StudioQuotaContext.Provider>
  );
}

export function useStudioQuota() {
  return useContext(StudioQuotaContext);
}
