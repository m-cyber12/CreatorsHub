'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, ChevronDown, Flag, Loader2, MessageCircleQuestion, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/context/AppProviders';
import { track } from '@/lib/analytics';
import { groupQaPosts, type CommunityPost, type QaEntityType, type QaKind, type QaReportReason } from '@/lib/qa';

const HELPFUL_KEY = 'noxifera_qa_helpful';

const CREATED_EVENT = {
  question: 'question_created',
  answer: 'answer_created',
  tip: 'tip_created',
  showcase: 'showcase_created',
} as const;

function formatDay(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

export function CommunityQA({ entityType, entitySlug }: { entityType: QaEntityType; entitySlug: string }) {
  const t = useTranslations('qa');
  const locale = useLocale();
  const { user } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [kind, setKind] = useState<'question' | 'tip' | 'showcase'>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [voted, setVoted] = useState<number[]>([]);
  const [answerFor, setAnswerFor] = useState<number | null>(null);
  const [reported, setReported] = useState<number[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/qa?entity=${entityType}&slug=${encodeURIComponent(entitySlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setPosts(Array.isArray(d.posts) ? d.posts : []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    try {
      const raw = localStorage.getItem(HELPFUL_KEY);
      if (raw) setVoted(JSON.parse(raw));
    } catch {}
    return () => {
      alive = false;
    };
  }, [entityType, entitySlug]);

  const defaultName = user?.email?.split('@')[0] || '';

  const submitPost = async (e: React.FormEvent, postKind: QaKind, parentId: number | null, onDone?: () => void) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_slug: entitySlug,
          kind: postKind,
          parent_id: parentId,
          title: title.trim(),
          body: body.trim(),
          author_name: authorName.trim() || defaultName || 'Anonymous Creator',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      // Held for moderation — never render unapproved content as live.
      track(CREATED_EVENT[postKind], { entity: entityType });
      setStatus('success');
      setTitle('');
      setBody('');
      onDone?.();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit');
    }
  };

  const markHelpful = useCallback(
    (id: number) => {
      if (voted.includes(id)) return;
      const next = [...voted, id];
      setVoted(next);
      try {
        localStorage.setItem(HELPFUL_KEY, JSON.stringify(next));
      } catch {}
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, helpful_count: p.helpful_count + 1 } : p)));
      track('helpful_vote', { entity: entityType, post: id });
      fetch('/api/qa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'helpful' }),
      }).catch(() => {});
    },
    [voted, entityType]
  );

  const submitReport = async (postId: number, reason: QaReportReason) => {
    try {
      const res = await fetch('/api/qa/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, reason }),
      });
      if (!res.ok) return;
      setReported((prev) => [...prev, postId]);
    } catch {}
  };

  const { questions, tips, showcases } = groupQaPosts(posts);

  const renderPost = (p: CommunityPost, nested = false) => (
    <article
      key={p.id}
      className={`rounded-2xl border border-white/10 bg-surface-1 p-4 ${nested ? 'ms-4 border-s-2 border-s-accent-500/40 sm:ms-8' : ''}`}
    >
      {p.title && <h3 className="text-sm font-bold text-white">{p.title}</h3>}
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{p.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-zinc-500">
        <span>{p.author_name}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={p.created_at}>{formatDay(p.created_at, locale)}</time>
        <span className="ms-auto inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => markHelpful(p.id)}
            disabled={voted.includes(p.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 font-semibold text-zinc-300 hover:border-accent-500/40 hover:text-white disabled:opacity-60"
            aria-label={t('helpful', { count: p.helpful_count })}
          >
            <ThumbsUp className="h-3 w-3" aria-hidden="true" />
            {voted.includes(p.id) ? t('helpfulDone') : t('helpful', { count: p.helpful_count })}
          </button>
          {reported.includes(p.id) ? (
            <span className="inline-flex items-center gap-1 px-1 font-semibold text-zinc-500">
              <Flag className="h-3 w-3" aria-hidden="true" /> {t('reportDone')}
            </span>
          ) : (
            <details className="relative">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-lg border border-white/10 px-2 py-1 font-semibold text-zinc-500 hover:text-white [&::-webkit-details-marker]:hidden">
                <Flag className="h-3 w-3" aria-hidden="true" /> {t('report')}
              </summary>
              <span className="absolute end-0 z-20 mt-1 flex w-40 flex-col gap-1 rounded-xl border border-white/10 bg-surface-1 p-2 shadow-2xl">
                <span className="px-2 pt-1 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                  {t('reportTitle')}
                </span>
                {(['spam', 'abuse', 'misinformation', 'other'] as const).map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => submitReport(p.id, reason)}
                    className="rounded-lg px-2 py-1.5 text-start text-2xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    {t(`reasons.${reason}`)}
                  </button>
                ))}
              </span>
            </details>
          )}
        </span>
      </div>
    </article>
  );

  return (
    <section className="mt-12" aria-labelledby="qa-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="qa-heading" className="flex items-center gap-2 text-xl font-bold">
            <MessageCircleQuestion className="h-5 w-5 text-accent-400" aria-hidden="true" />
            {t('heading')}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {posts.length > 0 ? t('subline', { count: posts.length }) : t('beFirst')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setComposerOpen(!composerOpen)}
          aria-expanded={composerOpen}
          className="inline-flex items-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-2.5 text-xs font-bold text-accent-300 transition-colors hover:bg-accent-500/20"
        >
          {t('askCta')}
        </button>
      </div>

      {composerOpen && (
        <form
          onSubmit={(e) => submitPost(e, kind, null, () => setComposerOpen(false))}
          className="mb-6 space-y-4 rounded-3xl border border-accent-500/20 bg-zinc-900/60 p-6"
        >
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('askCta')}>
            {(['question', 'tip', 'showcase'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                  kind === k
                    ? 'border-accent-500/50 bg-accent-500/10 text-accent-300'
                    : 'border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {t(`kinds.${k}`)}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="qa-title" className="mb-1.5 block text-xs font-bold text-zinc-300">
              {t('titleLabel')}
            </label>
            <input
              id="qa-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePh')}
              maxLength={120}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="qa-body" className="mb-1.5 block text-xs font-bold text-zinc-300">
              {t('bodyLabel')}
            </label>
            <textarea
              id="qa-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('bodyPh')}
              rows={4}
              maxLength={2000}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="qa-name" className="mb-1.5 block text-xs font-bold text-zinc-300">
              {t('nameLabel')}
            </label>
            <input
              id="qa-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={defaultName || t('namePh')}
              maxLength={40}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent-500/50 focus:outline-none sm:max-w-xs"
            />
          </div>
          {status === 'success' && (
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t('pendingNotice')}
            </p>
          )}
          {status === 'error' && <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-accent-400 disabled:opacity-60"
          >
            {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {status === 'submitting' ? t('submitting') : t('submit')}
          </button>
        </form>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-zinc-500" aria-live="polite">
          {t('loading')}
        </p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">
              {t('questionsTitle')}
            </h3>
            {questions.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-surface-1 p-4 text-sm text-zinc-500">
                {t('emptyQuestions')}
              </p>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    {renderPost(q)}
                    {q.answers.length > 0 && (
                      <div className="space-y-2">
                        <p className="ms-4 text-2xs font-bold uppercase tracking-wider text-zinc-500 sm:ms-8">
                          {t('answersTitle')}
                        </p>
                        {q.answers.map((a) => renderPost(a, true))}
                      </div>
                    )}
                    {answerFor === q.id ? (
                      <form
                        onSubmit={(e) =>
                          submitPost(e, 'answer', q.id, () => {
                            setAnswerFor(null);
                          })
                        }
                        className="ms-4 space-y-3 rounded-2xl border border-accent-500/20 bg-zinc-900/60 p-4 sm:ms-8"
                      >
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder={t('answerPh')}
                          rows={3}
                          maxLength={2000}
                          required
                          aria-label={t('bodyLabel')}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent-500/50 focus:outline-none"
                        />
                        {status === 'error' && <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-black hover:bg-accent-400 disabled:opacity-60"
                          >
                            {status === 'submitting' ? t('submitting') : t('submit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnswerFor(null)}
                            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAnswerFor(q.id);
                          setBody('');
                          setErrorMsg('');
                        }}
                        className="ms-4 inline-flex items-center gap-1 text-xs font-bold text-accent-300 hover:underline sm:ms-8"
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> {t('answerCta')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">
              {t('tipsTitle')}
            </h3>
            {tips.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-surface-1 p-4 text-sm text-zinc-500">
                {t('emptyTips')}
              </p>
            ) : (
              <div className="space-y-3">{tips.map((p) => renderPost(p))}</div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">
              {t('showcasesTitle')}
            </h3>
            {showcases.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-surface-1 p-4 text-sm text-zinc-500">
                {t('emptyShowcases')}
              </p>
            ) : (
              <div className="space-y-3">{showcases.map((p) => renderPost(p))}</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
