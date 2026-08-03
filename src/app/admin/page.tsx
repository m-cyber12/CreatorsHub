'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  LogOut,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Inbox,
  Megaphone,
  ExternalLink,
} from 'lucide-react';

/**
 * Admin panel — rebuilt.
 *
 * Audit fix 6.2. The previous version was 1,392 lines (the largest file in the
 * project) and its two biggest tabs did nothing at all:
 *
 *   - "Content" edited hero_title_main ("THE BOLD AI STUDIO"), hero_badge
 *     ("Inspired by Bold Studio • MotionSites.ai 3D Edition") and
 *     hero_description. The only consumer of /api/settings was the Hero3D
 *     component, which was orphaned — the homepage hardcoded everything. So
 *     these fields could never change the live site, and the badge still
 *     named the template the project was copied from.
 *   - "Design" offered ten colour themes, grid_layout, card_style and
 *     hero_animation. None were read by any rendered component.
 *
 * It also had: a Persian UI on an English site, one POST per settings key in a
 * loop (12+ sequential requests to save one form), `any` types throughout, no
 * CSRF token, and no audit log.
 *
 * This version keeps only what genuinely operates the site — moderation,
 * submissions, and the one announcement that is actually rendered — in English,
 * against the hardened session (lib/adminAuth.ts) and service-role writes.
 */

type Tab = 'submissions' | 'reviews' | 'announcement';

interface Submission {
  id: string;
  tool_name: string;
  website_url: string;
  tagline: string;
  category: string;
  pricing: string;
  founder_email: string;
  status: string;
  created_at: string;
}

interface Review {
  id: string;
  tool_slug: string;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  status: string;
  created_at: string;
}

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: 'submissions', label: 'Submissions', icon: Inbox },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [announcement, setAnnouncement] = useState({
    announcement_title: '',
    announcement_desc: '',
    announcement_enabled: 'false',
  });

  const flash = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ── auth ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setAuthed(true);
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthed(false);
  };

  // ── data ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, revRes, setRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/reviews'),
        fetch('/api/settings'),
      ]);
      if (subRes.ok) setSubmissions(await subRes.json());
      if (revRes.ok) setReviews(await revRes.json());
      if (setRes.ok) {
        const s = await setRes.json();
        setAnnouncement({
          announcement_title: s.announcement_title ?? '',
          announcement_desc: s.announcement_desc ?? '',
          announcement_enabled: s.announcement_enabled ?? 'false',
        });
      }
    } catch {
      flash('err', 'Could not load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  const actOnSubmission = async (submission: Submission, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, submission }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      flash('ok', `Submission ${action}d.`);
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Failed');
    }
  };

  const moderateReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      flash('ok', `Review ${status}.`);
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Failed');
    }
  };

  /** Single batched save — the old panel fired one request per key in a loop. */
  const saveAnnouncement = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      flash('ok', 'Announcement saved.');
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────
  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-0">
        <Loader2 className="h-6 w-6 animate-spin text-accent-400" aria-label="Loading" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-0 px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface-1 p-8"
        >
          <h1 className="text-xl font-bold text-white">Admin sign in</h1>
          <label htmlFor="admin-pw" className="mt-6 block text-2xs font-semibold text-zinc-400">
            Password
          </label>
          <input
            id="admin-pw"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
          />
          {authError && (
            <p role="alert" className="mt-3 text-2xs font-semibold text-rose-400">
              {authError}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in
          </button>
          <p className="mt-4 text-2xs leading-relaxed text-zinc-500">
            Sessions are signed and expire after 8 hours. The cookie no longer contains the
            password itself.
          </p>
        </form>
      </div>
    );
  }

  const pendingSubs = submissions.filter((s) => s.status === 'pending');
  const pendingReviews = reviews.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <header className="border-b border-white/10 bg-surface-1">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold">Admin</h1>
            <p className="text-2xs text-zinc-500">
              Moderation and site operations ·{' '}
              <Link href="/" className="underline hover:text-zinc-300">
                View site
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-2xs font-semibold text-zinc-300 hover:bg-white/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-2xs font-semibold text-rose-400 hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div
          role="status"
          className={`mx-auto mt-4 max-w-6xl rounded-xl border px-4 py-3 text-sm font-semibold ${
            toast.kind === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon }) => {
            const count = id === 'submissions' ? pendingSubs.length : id === 'reviews' ? pendingReviews.length : 0;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-2xs font-bold transition-colors ${
                  tab === id
                    ? 'border-accent-500 bg-accent-500/15 text-accent-300'
                    : 'border-white/10 bg-surface-1 text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
                {count > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 font-mono text-[0.625rem] tabular-nums text-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <main className="mt-6">
          {/* Submissions */}
          {tab === 'submissions' && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Tool submissions</h2>

              <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent-500/20 bg-accent-500/5 p-4 text-2xs leading-relaxed text-zinc-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                <p>
                  <strong>Note:</strong> tool pages are statically generated from{' '}
                  <code className="rounded bg-surface-2 px-1">src/data/tools.ts</code> with{' '}
                  <code className="rounded bg-surface-2 px-1">dynamicParams = false</code>. Approving
                  here records the submission, but the tool will not have a live page until it is
                  added to the data file and the site is redeployed. See{' '}
                  <code className="rounded bg-surface-2 px-1">DEPLOYMENT.md</code> for why this
                  trade-off was kept.
                </p>
              </div>

              {submissions.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">
                  No submissions yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {submissions.map((s) => (
                    <li key={s.id} className="rounded-xl border border-white/10 bg-surface-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white">{s.tool_name}</h3>
                          <p className="mt-0.5 text-2xs text-zinc-400">{s.tagline}</p>
                          <a
                            href={s.website_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="mt-1 inline-flex items-center gap-1 text-2xs text-accent-400 hover:underline"
                          >
                            {s.website_url}
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                          <p className="mt-1.5 text-2xs text-zinc-500">
                            {s.category} · {s.pricing} · {s.founder_email}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-2xs font-bold ${
                              s.status === 'pending'
                                ? 'bg-accent-500/15 text-accent-300'
                                : s.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-zinc-500/15 text-zinc-400'
                            }`}
                          >
                            {s.status}
                          </span>
                          {s.status === 'pending' && (
                            <>
                              <button
                                onClick={() => actOnSubmission(s, 'approve')}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-2xs font-bold text-black"
                              >
                                <Check className="h-3 w-3" aria-hidden="true" /> Approve
                              </button>
                              <button
                                onClick={() => actOnSubmission(s, 'reject')}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400"
                              >
                                <X className="h-3 w-3" aria-hidden="true" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Reviews */}
          {tab === 'reviews' && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Community reviews</h2>
              <p className="mb-4 text-2xs leading-relaxed text-zinc-500">
                Reviews are created with status <code className="rounded bg-surface-2 px-1">pending</code> and
                only appear on the site once approved. Approved reviews are the only source for
                structured-data ratings, so keep this list honest.
              </p>

              {reviews.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">
                  No reviews yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-xl border border-white/10 bg-surface-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold tabular-nums text-accent-400">
                              {r.rating}/5
                            </span>
                            <h3 className="font-bold text-white">{r.title}</h3>
                          </div>
                          <p className="mt-1 text-2xs text-zinc-400">{r.body}</p>
                          <p className="mt-1.5 text-2xs text-zinc-500">
                            {r.author_name} · {r.tool_slug} ·{' '}
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-2xs font-bold ${
                              r.status === 'pending'
                                ? 'bg-accent-500/15 text-accent-300'
                                : r.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-zinc-500/15 text-zinc-400'
                            }`}
                          >
                            {r.status}
                          </span>
                          {r.status !== 'approved' && (
                            <button
                              onClick={() => moderateReview(r.id, 'approved')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-2xs font-bold text-black"
                            >
                              <Check className="h-3 w-3" aria-hidden="true" /> Approve
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              onClick={() => moderateReview(r.id, 'rejected')}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400"
                            >
                              <X className="h-3 w-3" aria-hidden="true" /> Reject
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Announcement */}
          {tab === 'announcement' && (
            <section className="max-w-2xl">
              <h2 className="mb-2 text-lg font-bold">Site announcement</h2>
              <p className="mb-5 text-2xs leading-relaxed text-zinc-500">
                These are the only settings still wired to the live site. The old Design and Content
                tabs edited values that nothing rendered, so they were removed rather than left to
                imply they worked.
              </p>

              <div className="space-y-4 rounded-xl border border-white/10 bg-surface-1 p-6">
                <div>
                  <label htmlFor="a-enabled" className="block text-2xs font-semibold text-zinc-400">
                    Visible on site
                  </label>
                  <select
                    id="a-enabled"
                    value={announcement.announcement_enabled}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, announcement_enabled: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  >
                    <option value="false">Hidden</option>
                    <option value="true">Visible</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="a-title" className="block text-2xs font-semibold text-zinc-400">
                    Title
                  </label>
                  <input
                    id="a-title"
                    value={announcement.announcement_title}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, announcement_title: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="a-desc" className="block text-2xs font-semibold text-zinc-400">
                    Description
                  </label>
                  <textarea
                    id="a-desc"
                    rows={3}
                    value={announcement.announcement_desc}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, announcement_desc: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={saveAnnouncement}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  Save
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
