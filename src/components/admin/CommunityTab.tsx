'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X, ExternalLink } from 'lucide-react';

interface PendingPost {
  id: number;
  entity_type: string;
  entity_slug: string;
  kind: string;
  parent_id: number | null;
  title: string | null;
  body: string;
  author_name: string;
  created_at: string;
}

interface ReportRow {
  id: number;
  post_id: number;
  reason: string;
  detail: string | null;
  created_at: string;
  post: PendingPost | null;
}

function entityHref(entityType: string, slug: string): string {
  if (entityType === 'tool') return `/tool/${slug}`;
  if (entityType === 'outcome') return `/outcomes/${slug}`;
  if (entityType === 'workflow') return `/workflows/${slug}`;
  return '/';
}

/**
 * Community moderation queue (P3/P4): pending Q&A posts plus user reports.
 * Approving publishes; removing deletes (reports cascade). Mutations carry
 * the admin CSRF token like every other moderation action.
 */
export function CommunityTab({ csrf }: { csrf: string }) {
  const t = useTranslations('admin');
  const [pending, setPending] = useState<PendingPost[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/community');
      if (!res.ok) return;
      const d = await res.json();
      setConfigured(d.configured !== false);
      setPending(Array.isArray(d.pending) ? d.pending : []);
      setReports(Array.isArray(d.reports) ? d.reports : []);
    } catch {
      /* stay on last state */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const moderate = async (id: number, status: 'approved' | 'removed') => {
    setBusyId(id);
    setMessage('');
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setMessage(t('communityModerated', { status }));
      setPending((prev) => prev.filter((p) => p.id !== id));
      setReports((prev) => (status === 'removed' ? prev.filter((r) => r.post_id !== id) : prev));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!loaded) {
    return <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('activityLoading')}</p>;
  }
  if (!configured) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-bold">{t('communityTitle')}</h2>
        <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-400">{t('communityNotConfigured')}</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold">{t('communityTitle')}</h2>
        <p className="mb-4 text-2xs leading-relaxed text-zinc-500">{t('communityIntro')}</p>
        {message && (
          <p className="mb-4 rounded-xl border border-white/10 bg-surface-1 p-3 text-xs text-zinc-300" role="status">
            {message}
          </p>
        )}
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">
          {t('pendingTitle', { count: pending.length })}
        </h3>
        {pending.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('pendingEmpty')}</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/10 bg-surface-1 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-2xs text-accent-400">
                      #{p.id} · {p.entity_type}/{p.entity_slug} · {p.kind}
                      {p.parent_id ? ` · → #${p.parent_id}` : ''}
                    </p>
                    {p.title && <h4 className="mt-1 font-bold text-white">{p.title}</h4>}
                    <p className="mt-1 whitespace-pre-wrap text-2xs text-zinc-400">{p.body}</p>
                    <p className="mt-1.5 text-2xs text-zinc-500">
                      {p.author_name} · {new Date(p.created_at).toLocaleString()}
                    </p>
                    <a
                      href={entityHref(p.entity_type, p.entity_slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-2xs font-semibold text-accent-300 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" /> {t('openPage')}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => moderate(p.id, 'approved')}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-2xs font-bold text-black disabled:opacity-60"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" /> {t('approve')}
                    </button>
                    <button
                      onClick={() => moderate(p.id, 'removed')}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400 disabled:opacity-60"
                    >
                      <X className="h-3 w-3" aria-hidden="true" /> {t('reject')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">
          {t('reportsTitle', { count: reports.length })}
        </h3>
        {reports.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('reportsEmpty')}</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/10 bg-surface-1 p-5">
                <p className="font-mono text-2xs text-amber-300">
                  {r.reason}
                  {r.detail ? ` — ${r.detail}` : ''} · {new Date(r.created_at).toLocaleString()}
                </p>
                {r.post ? (
                  <div className="mt-2 rounded-lg bg-black/20 p-3">
                    <p className="font-mono text-2xs text-zinc-500">
                      #{r.post.id} · {r.post.entity_type}/{r.post.entity_slug} · {r.post.kind} · {r.post.author_name}
                    </p>
                    {r.post.title && <p className="mt-1 text-xs font-bold text-zinc-200">{r.post.title}</p>}
                    <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-2xs text-zinc-400">{r.post.body}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => moderate(r.post!.id, 'removed')}
                        disabled={busyId === r.post.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400 disabled:opacity-60"
                      >
                        <X className="h-3 w-3" aria-hidden="true" /> {t('reject')}
                      </button>
                      <a
                        href={entityHref(r.post.entity_type, r.post.entity_slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-2xs font-semibold text-accent-300 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> {t('openPage')}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-2xs text-zinc-500">{t('reportedPostGone')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
