'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  BellRing,
  CheckCheck,
  Layers,
  Newspaper,
  Tag,
  BadgeCheck,
  Sparkles,
  Skull,
  FlaskConical,
} from 'lucide-react';
import {
  buildPersonalUpdates,
  countUnread,
  getUpdatesLastSeen,
  setUpdatesLastSeen,
  UPDATE_KINDS,
  type PersonalUpdates,
  type UpdateEvent,
  type UpdateKind,
} from '@/lib/updates';
import {
  acknowledgeToolChanges,
  WORKSPACE_CHANGED_EVENT,
} from '@/lib/workspace';
import { track } from '@/lib/analytics';

const KIND_ICONS: Record<UpdateKind, typeof Tag> = {
  'price-changed': Tag,
  'pricing-model-changed': Tag,
  'verification-upgraded': BadgeCheck,
  'tool-added': Sparkles,
  'tool-retired': Skull,
  'tool-unlisted': Skull,
  'benchmark-published': FlaskConical,
};

function formatDay(isoDay: string, locale: string): string {
  const d = new Date(`${isoDay}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDay;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(d);
}

export function UpdatesClient({
  events,
  priceConfigured,
}: {
  events: UpdateEvent[];
  priceConfigured: boolean;
}) {
  const t = useTranslations('updates');
  const tm = useTranslations('my');
  const tt = useTranslations('tool');
  const locale = useLocale();

  const [tab, setTab] = useState<'you' | 'catalog'>('you');
  const [kindFilter, setKindFilter] = useState<UpdateKind | 'all'>('all');
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [personal, setPersonal] = useState<PersonalUpdates | null>(null);
  const [ackTick, setAckTick] = useState(0);

  const refreshPersonal = useCallback(() => {
    try {
      setPersonal(buildPersonalUpdates(events));
    } catch {
      setPersonal({ openAlerts: [], toolEvents: [], stackGroups: [], savedTools: [] });
    }
    setLastSeen(getUpdatesLastSeen());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, ackTick]);

  const trackedVisit = useRef(false);
  useEffect(() => {
    refreshPersonal();
    if (!trackedVisit.current) {
      trackedVisit.current = true;
      // Return-loop telemetry (P4): a visit counts as a "return" when this
      // device has been here before (day-precision, local only).
      track(getUpdatesLastSeen() ? 'updates_return_visit' : 'updates_visit');
    }
    window.addEventListener(WORKSPACE_CHANGED_EVENT, refreshPersonal);
    return () => window.removeEventListener(WORKSPACE_CHANGED_EVENT, refreshPersonal);
  }, [refreshPersonal]);

  const markRead = useCallback(() => {
    const now = new Date().toISOString();
    setUpdatesLastSeen(now);
    setLastSeen(now);
  }, []);

  const unreadCatalog = useMemo(() => countUnread(events, lastSeen), [events, lastSeen]);
  const unreadPersonal = useMemo(
    () => (personal ? countUnread(personal.toolEvents, lastSeen) : 0),
    [personal, lastSeen]
  );

  const kindsPresent = useMemo(
    () => UPDATE_KINDS.filter((k) => events.some((e) => e.kind === k)),
    [events]
  );
  const catalogEvents = useMemo(
    () => (kindFilter === 'all' ? events : events.filter((e) => e.kind === kindFilter)),
    [events, kindFilter]
  );

  const levelLabel = (level: string) =>
    level === 'hands-on-tested'
      ? tt('handsOnTested')
      : level === 'pricing-verified'
        ? tt('pricingVerified')
        : tt('listedOnly');

  const renderEvent = (e: UpdateEvent, showKind: boolean) => {
    const Icon = KIND_ICONS[e.kind];
    const isNew = lastSeen === null || e.date > lastSeen.slice(0, 10);
    return (
      <li
        key={e.id}
        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface-1 px-4 py-3"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-accent-300">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={e.href}
              onClick={() => track('update_viewed', { kind: e.kind })}
              className="font-semibold text-white hover:text-accent-300 hover:underline"
            >
              {e.toolName}
            </Link>
            {isNew && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-2xs font-bold text-emerald-300">
                {t('unread')}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {showKind && <span className="font-medium text-zinc-300">{t(`kinds.${e.kind}`)} · </span>}
            {e.kind === 'verification-upgraded' && e.detail
              ? levelLabel(e.detail)
              : e.kind === 'price-changed' && e.detail
                ? t('priceDetail', { change: e.detail })
                : (e.detail ?? '')}
          </p>
        </div>
        <time dateTime={e.date} className="shrink-0 pt-0.5 font-mono text-2xs tabular-nums text-zinc-500">
          {formatDay(e.date, locale)}
        </time>
      </li>
    );
  };

  return (
    <div className="pt-8">
      {/* Tabs + read state */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label={t('tabsLabel')} className="inline-flex rounded-xl border border-white/10 bg-surface-1 p-1">
          <button type="button"
            role="tab"
            aria-selected={tab === 'you'}
            onClick={() => setTab('you')}
            className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === 'you' ? 'bg-accent-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('tabs.forYou')}
            {personal && personal.openAlerts.length + unreadPersonal > 0 && (
              <span className="ms-2 rounded-full bg-black/25 px-1.5 py-0.5 font-mono text-2xs font-bold tabular-nums">
                {personal.openAlerts.length + unreadPersonal}
              </span>
            )}
          </button>
          <button type="button"
            role="tab"
            aria-selected={tab === 'catalog'}
            onClick={() => setTab('catalog')}
            className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === 'catalog' ? 'bg-accent-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('tabs.catalog')}
            {unreadCatalog > 0 && (
              <span className="ms-2 rounded-full bg-black/25 px-1.5 py-0.5 font-mono text-2xs font-bold tabular-nums">
                {unreadCatalog}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-2xs text-zinc-500">
            {lastSeen ? t('lastVisit', { date: formatDay(lastSeen.slice(0, 10), locale) }) : t('neverVisited')}
          </p>
          <button type="button"
            onClick={markRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-accent-500/40 hover:text-white"
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('markRead')}
          </button>
        </div>
      </div>

      {tab === 'you' && (
        <div className="mt-8 space-y-10">
          {/* Open alerts — current state, undated by construction */}
          <section aria-labelledby="updates-open-alerts">
            <h2 id="updates-open-alerts" className="flex items-center gap-2 text-lg font-bold">
              <BellRing className="h-5 w-5 text-amber-300" aria-hidden="true" /> {t('openAlerts.title')}
            </h2>
            {!personal || personal.openAlerts.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-white/10 bg-surface-1 px-4 py-5 text-sm text-zinc-400">
                <p className="font-semibold text-white">{t('openAlerts.empty')}</p>
                <p className="mt-1 text-xs">{t('openAlerts.emptyHint')}</p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-xs text-zinc-500">{t('openAlerts.intro')}</p>
                <ul className="mt-3 space-y-2">
                  {personal.openAlerts.map((a, i) => (
                    <li
                      key={`${a.slug}:${a.kind}:${i}`}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3"
                    >
                      {a.kind === 'tool-retired' || a.kind === 'tool-unlisted' ? (
                        <span className="font-mono font-semibold text-white">{a.toolName}</span>
                      ) : (
                        <Link href={`/tool/${a.slug}`} className="font-semibold text-white hover:text-accent-300 hover:underline">
                          {a.toolName}
                        </Link>
                      )}
                      <span className="text-xs text-zinc-300">{tm(`alerts.kinds.${a.kind}`)}</span>
                      <span className="font-mono text-2xs tabular-nums text-zinc-500">{a.detail}</span>
                      <button type="button"
                        onClick={() => {
                          acknowledgeToolChanges(a.slug);
                          setAckTick((n) => n + 1);
                          track('alert_acknowledged', { slug: a.slug });
                        }}
                        className="ms-auto rounded-lg border border-white/10 px-2.5 py-1 text-2xs font-semibold text-zinc-300 hover:border-accent-500/40 hover:text-white"
                      >
                        {tm('alerts.acknowledge')}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button"
                    onClick={() => {
                      const slugs = [...new Set((personal?.openAlerts ?? []).map((a) => a.slug))];
                      for (const slug of slugs) acknowledgeToolChanges(slug);
                      setAckTick((n) => n + 1);
                      track('alerts_acknowledged_all', { count: slugs.length });
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-accent-500/40 hover:text-white"
                  >
                    {tm('alerts.acknowledgeAll')}
                  </button>
                  <Link
                    href="/my?tab=alerts"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-300 hover:underline"
                  >
                    {t('openAlerts.viewAll')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </>
            )}
          </section>

          {/* Dated events on watched tools */}
          <section aria-labelledby="updates-your-tools">
            <h2 id="updates-your-tools" className="flex items-center gap-2 text-lg font-bold">
              <Newspaper className="h-5 w-5 text-accent-300" aria-hidden="true" /> {t('yourTools.title')}
            </h2>
            {!personal || personal.toolEvents.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-white/10 bg-surface-1 px-4 py-5 text-sm text-zinc-400">
                <p className="font-semibold text-white">{t('yourTools.empty')}</p>
                <p className="mt-1 text-xs">{t('yourTools.emptyHint')}</p>
                <Link
                  href="/tools"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-300 hover:underline"
                >
                  {t('yourTools.emptyCta')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">{personal.toolEvents.map((e) => renderEvent(e, true))}</ul>
            )}
          </section>

          {/* Stack rollups */}
          {personal && personal.stackGroups.length > 0 && (
            <section aria-labelledby="updates-stacks">
              <h2 id="updates-stacks" className="flex items-center gap-2 text-lg font-bold">
                <Layers className="h-5 w-5 text-violet-300" aria-hidden="true" /> {t('stackUpdates.title')}
              </h2>
              <div className="mt-3 space-y-4">
                {personal.stackGroups.map((g) => (
                  <div key={g.stackId} className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                    <p className="text-sm font-bold">
                      {g.stackName}{' '}
                      <span className="ms-1 font-mono text-2xs font-semibold tabular-nums text-zinc-500">
                        ({g.events.length})
                      </span>
                    </p>
                    <ul className="mt-2 space-y-2">{g.events.map((e) => renderEvent(e, true))}</ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === 'catalog' && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('filterLabel')}>
            <button type="button"
              onClick={() => setKindFilter('all')}
              aria-pressed={kindFilter === 'all'}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                kindFilter === 'all'
                  ? 'border-accent-500/50 bg-accent-500/10 text-accent-300'
                  : 'border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {t('filters.all')}
            </button>
            {kindsPresent.map((k) => (
              <button type="button"
                key={k}
                onClick={() => setKindFilter(k)}
                aria-pressed={kindFilter === k}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  kindFilter === k
                    ? 'border-accent-500/50 bg-accent-500/10 text-accent-300'
                    : 'border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {t(`kinds.${k}`)}
              </button>
            ))}
          </div>

          {!priceConfigured && (
            <p className="mt-4 rounded-2xl border border-white/10 bg-surface-1 px-4 py-3 text-xs text-zinc-500">
              {t('priceNote')}
            </p>
          )}

          {catalogEvents.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-surface-1 px-4 py-8 text-center text-sm text-zinc-400">
              <p className="font-semibold text-white">{t('catalog.empty')}</p>
              <p className="mt-1 text-xs">{t('catalog.emptyHint')}</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">{catalogEvents.map((e) => renderEvent(e, kindFilter === 'all'))}</ul>
          )}

          <p className="mt-6 text-xs text-zinc-500">
            <Link href="/changelog" className="font-semibold text-accent-300 hover:underline">
              {t('changelogLink')}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
