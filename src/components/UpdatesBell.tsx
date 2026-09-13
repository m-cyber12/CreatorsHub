'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/i18n/navigation';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { computeAlerts, getSavedTools, WORKSPACE_CHANGED_EVENT } from '@/lib/workspace';

/**
 * Header bell for the return loop (P1). Shows the count of *open* personal
 * alerts (saved tools whose snapshot differs from the live catalog) and
 * links to /updates. Purely local — no account, no fetch.
 */
export function UpdatesBell() {
  const t = useTranslations('header');
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    try {
      setCount(computeAlerts(getSavedTools()).length);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith('noxifera_my_')) refresh();
    };
    window.addEventListener('storage', onStorage);
    // Same-tab updates (acknowledge/save) don't fire storage events.
    window.addEventListener('noxifera:workspace', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('noxifera:workspace', refresh);
    };
  }, [refresh]);

  return (
    <Link
      href="/updates"
      className="relative hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:inline-flex"
      aria-label={count > 0 ? t('updatesBadge', { count }) : t('updates')}
      title={t('updates')}
    >
      <Bell className="h-4 w-4" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-2xs font-bold tabular-nums text-black">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
