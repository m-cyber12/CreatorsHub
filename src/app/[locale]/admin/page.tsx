'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
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
  Newspaper,
  LayoutDashboard,
  Download,
  Languages,
  Eye,
  Wrench,
  FileText,
  Tag,
  Coins,
  ShieldCheck,
} from 'lucide-react';

type Tab = 'overview' | 'orders' | 'claims' | 'submissions' | 'reviews' | 'news' | 'announcement' | 'i18n' | 'preview' | 'tools' | 'blog' | 'deals';

interface AdminStats {
  catalog: { total: number; handsOnTested: number; pricingVerified: number; listedOnly: number };
  db: {
    configured: boolean;
    submissionsPending: number;
    reviewsPending: number;
    newsPending: number;
    newsApproved: number;
    newsletterConfirmed: number;
    newsletterWaiting: number;
    poll: { writing: number; editing: number; voiceover: number; thumbnails: number };
  };
}

interface FounderClaim {
  id: string;
  tool_slug: string;
  company_email: string;
  role: string;
  notes: string;
  will_embed_badge: boolean;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  tool_name: string;
  website_url: string;
  tagline: string;
  category: string;
  pricing: string;
  founder_email: string;
  plan: string;
  amount_usd: number;
  crypto_currency: string;
  wallet_address?: string;
  tx_hash?: string;
  status: string;
  created_at: string;
}

interface NewsRow {
  slug: string;
  title: string;
  excerpt: string;
  source: string;
  source_url: string;
  category: string;
  published_at: string;
  approved: boolean;
  ai_summarized: boolean;
}

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

const TABS: { id: Tab; labelKey: string; icon: typeof Inbox }[] = [
  { id: 'overview', labelKey: 'tabOverview', icon: LayoutDashboard },
  { id: 'orders', labelKey: 'tabOrders', icon: Coins },
  { id: 'claims', labelKey: 'tabClaims', icon: ShieldCheck },
  { id: 'submissions', labelKey: 'tabSubmissions', icon: Inbox },
  { id: 'reviews', labelKey: 'tabReviews', icon: MessageSquare },
  { id: 'news', labelKey: 'tabNews', icon: Newspaper },
  { id: 'announcement', labelKey: 'tabAnnouncement', icon: Megaphone },
  { id: 'i18n', labelKey: 'tabI18n', icon: Languages },
  { id: 'preview', labelKey: 'tabPreview', icon: Eye },
  { id: 'tools', labelKey: 'tabTools', icon: Wrench },
  { id: 'blog', labelKey: 'tabBlog', icon: FileText },
  { id: 'deals', labelKey: 'tabDeals', icon: Tag },
];

export default function AdminPage() {
  const t = useTranslations('admin');
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [csrf, setCsrf] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [claims, setClaims] = useState<FounderClaim[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ingestBusy, setIngestBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [announcement, setAnnouncement] = useState({
    announcement_title: '',
    announcement_desc: '',
    announcement_enabled: 'false',
  });

  // i18n provider config (admin-panel managed translation keys)
  const [i18n, setI18n] = useState({
    provider: '',
    geminiApiKey: '',
    openrouterApiKey: '',
    openaiApiKey: '',
    geminiModel: '',
    openrouterModel: '',
    effective: '',
    effectiveModel: '',
    env: { provider: '', hasOpenAI: false, hasGemini: false, hasOpenRouter: false } as {
      provider: string;
      hasOpenAI: boolean;
      hasGemini: boolean;
      hasOpenRouter: boolean;
    },
  });
  const [i18nBusy, setI18nBusy] = useState(false);
  const [i18nTest, setI18nTest] = useState<{ ok: boolean; message: string } | null>(null);

  // Site Content (Preview tab): editable page copy
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [siteContentBusy, setSiteContentBusy] = useState(false);

  // Catalog editor (v3.5): tools + blog posts editable from the panel.
  const [tools, setTools] = useState<Array<Record<string, unknown> & { slug: string; overriddenFields?: string[] }>>([]);
  const [toolsSearch, setToolsSearch] = useState('');
  const [toolEditor, setToolEditor] = useState<null | { mode: 'edit' | 'new'; slug: string }>(null);
  const [toolForm, setToolForm] = useState<Record<string, string | boolean>>({});
  const [toolsBusy, setToolsBusy] = useState(false);
  const [posts, setPosts] = useState<Array<Record<string, unknown> & { slug: string; overriddenFields?: string[] }>>([]);
  const [postsSearch, setPostsSearch] = useState('');
  const [postEditor, setPostEditor] = useState<null | { mode: 'edit' | 'new'; slug: string }>(null);
  const [postForm, setPostForm] = useState<Record<string, string>>({});
  const [postsBusy, setPostsBusy] = useState(false);

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
        headers: mutHeaders(),
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('loginFailed'));
      setAuthed(true);
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : t('loginFailed'));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthed(false);
  };

  // ── data ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [subRes, revRes, newsRes, setRes, i18nRes, statsRes, contentRes, toolsRes, postsRes, dealsRes, ordersRes, claimsRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/reviews'),
        fetch('/api/admin/news'),
        fetch('/api/settings'),
        fetch('/api/admin/i18n/provider'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/site-content'),
        fetch('/api/admin/tools'),
        fetch('/api/admin/blog'),
        fetch('/api/admin/deals'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/founders'),
      ]);
      if (claimsRes.ok) {
        const cl = await claimsRes.json();
        if (Array.isArray(cl)) setClaims(cl);
      }
      if (ordersRes.ok) {
        const ord = await ordersRes.json();
        if (Array.isArray(ord)) setOrders(ord);
      }
      if (toolsRes.ok) {
        const d = await toolsRes.json();
        if (Array.isArray(d?.tools)) setTools(d.tools);
      }
      if (postsRes.ok) {
        const d = await postsRes.json();
        if (Array.isArray(d?.posts)) setPosts(d.posts);
      }
      if (dealsRes.ok) {
        const d = await dealsRes.json();
        if (Array.isArray(d?.deals)) setDeals(d.deals);
      }
      if (contentRes.ok) {
        const c = await contentRes.json();
        if (c?.effective) setSiteContent({ ...c.defaults, ...c.effective });
      }
      if (subRes.ok) setSubmissions(await subRes.json());
      if (revRes.ok) setReviews(await revRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
      if (statsRes.ok) {
        const st = await statsRes.json();
        if (st && typeof st === 'object' && st.catalog) setStats(st);
      }
      if (i18nRes.ok) {
        try {
          const ip = await i18nRes.json();
          setI18n((prev) => ({
            ...prev,
            provider: ip.db?.provider ?? prev.provider,
            geminiModel: ip.db?.geminiModel ?? prev.geminiModel,
            openrouterModel: ip.db?.openrouterModel ?? prev.openrouterModel,
            effective: ip.effective ?? '',
            effectiveModel: ip.effectiveModel ?? '',
            env: ip.env ?? prev.env,
          }));
        } catch {
          /* non-JSON — ignore */
        }
      }
      if (setRes.ok) {
        const s = await setRes.json();
        setAnnouncement({
          announcement_title: s.announcement_title ?? '',
          announcement_desc: s.announcement_desc ?? '',
          announcement_enabled: s.announcement_enabled ?? 'false',
        });
      }
    } catch {
      if (!silent) flash('err', t('loadFailed'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (authed) {
      loadAll(false);
      const interval = setInterval(() => {
        loadAll(true); // Silent background sync — zero screen flicker or unmount
      }, 15_000);
      return () => clearInterval(interval);
    }
  }, [authed, loadAll]);

  // Re-fetch quietly when user switches tabs to ensure fresh data without flashing
  useEffect(() => {
    if (authed) {
      loadAll(true);
    }
  }, [tab, authed, loadAll]);

  // Fetch a CSRF token bound to this session and send it on every mutation
  // (audit fix 6.2 / 2.3). Without it, admin writes return 403.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    fetch('/api/admin/auth/csrf')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.token) setCsrf(d.token);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [authed]);

  // Helper: base headers for admin mutation requests, including the CSRF token.
  const mutHeaders = () => ({ 'Content-Type': 'application/json', 'x-csrf-token': csrf });

  const moderateOrder = async (orderId: string, action: 'confirm_payment' | 'reject') => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: mutHeaders(),
        body: JSON.stringify({ action, orderId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Order update failed');
      flash('ok', action === 'confirm_payment' ? 'Order confirmed & Tool promoted!' : 'Order rejected.');
      await loadAll();
    } catch (err: unknown) {
      flash('err', err instanceof Error ? err.message : 'Action failed');
    }
  };

  const [badgeChecks, setBadgeChecks] = useState<Record<string, { statusText: string; embedded: boolean }>>({});
  const [checkingBadge, setCheckingBadge] = useState<string | null>(null);

  const checkBadgeLive = async (claimId: string, url: string, slug: string) => {
    setCheckingBadge(claimId);
    try {
      const res = await fetch('/api/admin/founders/verify-badge', {
        method: 'POST',
        headers: mutHeaders(),
        body: JSON.stringify({ url, slug }),
      });
      const d = await res.json();
      setBadgeChecks((p) => ({ ...p, [claimId]: { statusText: d.statusText, embedded: !!d.embedded } }));
    } catch {
      setBadgeChecks((p) => ({ ...p, [claimId]: { statusText: 'Check failed', embedded: false } }));
    } finally {
      setCheckingBadge(null);
    }
  };

  const moderateClaim = async (claimId: string, toolSlug: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/founders', {
        method: 'POST',
        headers: mutHeaders(),
        body: JSON.stringify({ action, claimId, toolSlug }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Claim update failed');
      flash('ok', action === 'approve' ? 'Founder Claim approved & Badge granted!' : 'Claim rejected.');
      await loadAll();
    } catch (err: unknown) {
      flash('err', err instanceof Error ? err.message : 'Action failed');
    }
  };

  const quickToggleToolFlag = async (
    slug: string,
    flag: 'isFeatured' | 'hasFounderBadge' | 'isEditorsChoice',
    currentVal: boolean
  ) => {
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: mutHeaders(),
        body: JSON.stringify({ slug, fields: { [flag]: !currentVal } }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Update failed');
      flash('ok', `${slug}: ${flag} is now ${!currentVal ? 'ON (فعال)' : 'OFF (غیرفعال)'}`);
      await loadAll();
    } catch (err: unknown) {
      flash('err', err instanceof Error ? err.message : 'Update failed');
    }
  };

  const actOnSubmission = async (submission: Submission, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: mutHeaders(),
        body: JSON.stringify({ action, submission }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      flash('ok', t('submitActionDone', { action }));
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Failed');
    }
  };

  /** Editorial gate for auto-aggregated news (migration 0006). */
  const moderateNews = async (slug: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: mutHeaders(),
        body: JSON.stringify({ slug, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      flash('ok', action === 'approve' ? t('itemApproved') : t('itemRejected'));
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Failed');
    }
  };

  /* v2.8: bulk moderation for the queue. */
  const bulkNews = async (action: 'approve' | 'reject') => {
    const pending = news.filter((n) => !n.approved);
    if (pending.length === 0) {
      flash('err', t('nothingPending'));
      return;
    }
    setBusy(true);
    try {
      for (const n of pending) {
        const res = await fetch('/api/admin/news', {
          method: 'PATCH',
          headers: mutHeaders(),
          body: JSON.stringify({ slug: n.slug, action }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      }
      flash(
        'ok',
        action === 'approve'
          ? t('approvedBulk', { count: String(pending.length) })
          : t('rejectedBulk', { count: String(pending.length) })
      );
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  /* v2.8: run the ingestion pipeline now (no cron wait). */
  const ingestNow = async () => {
    setIngestBusy(true);
    try {
      const res = await fetch('/api/admin/news/refresh', { method: 'POST', headers: mutHeaders() });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.note || t('ingestFailed'));
      flash('ok', t('ingestDone', { kept: String(d.kept ?? 0), new: String(d.insertedNew ?? 0) }));
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('ingestFailed'));
    } finally {
      setIngestBusy(false);
    }
  };

  const moderateReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: mutHeaders(),
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      flash('ok', t('reviewStatus', { status }));
      loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Failed');
    }
  };

  const saveI18n = async () => {
    setI18nBusy(true);
    setI18nTest(null);
    try {
      const res = await fetch('/api/admin/i18n/provider', {
        method: 'PUT',
        headers: mutHeaders(),
        body: JSON.stringify({
          provider: i18n.provider,
          geminiApiKey: i18n.geminiApiKey,
          openrouterApiKey: i18n.openrouterApiKey,
          openaiApiKey: i18n.openaiApiKey,
          geminiModel: i18n.geminiModel,
          openrouterModel: i18n.openrouterModel,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || t('saveFailed'));
      flash('ok', t('providerSaved'));
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setI18nBusy(false);
    }
  };

  const testI18n = async () => {
    setI18nBusy(true);
    setI18nTest(null);
    try {
      const res = await fetch('/api/admin/i18n/provider', {
        method: 'POST',
        headers: mutHeaders(),
      });
      const data = await res.json();
      setI18nTest({ ok: data.ok, message: data.message || data.note || t('testFailed') });
      if (data.ok) flash('ok', t('testOk', { provider: data.provider, model: data.model }));
      else flash('err', data.message || t('testFailed'));
    } catch (err) {
      setI18nTest({ ok: false, message: err instanceof Error ? err.message : t('testFailed') });
    } finally {
      setI18nBusy(false);
    }
  };

  const runTranslate = async () => {
    setI18nBusy(true);
    setI18nTest(null);
    try {
      const res = await fetch('/api/admin/translate/run', { method: 'POST', headers: mutHeaders(), body: JSON.stringify({ limit: 10 }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', t('translateDone', { count: String(d.translated ?? 0) }));
      setI18nTest({ ok: true, message: t('translateDone', { count: String(d.translated ?? 0) }) });
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
      setI18nTest({ ok: false, message: err instanceof Error ? err.message : t('testFailed') });
    } finally {
      setI18nBusy(false);
    }
  };

  const saveSiteContent = async () => {
    setSiteContentBusy(true);
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: mutHeaders(),
        body: JSON.stringify(siteContent),
      });
      if (!res.ok) throw new Error((await res.json()).error || t('saveFailed'));
      flash('ok', t('contentSaved'));
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setSiteContentBusy(false);
    }
  };

  // ── Deals manager (v3.5) ─────────────────────────────────────────────
  const [deals, setDeals] = useState<Array<{ id: string; title: string; toolSlug?: string; code?: string; discount?: string; url?: string; description?: string; enabled: boolean }>>([]);
  const [dealEditor, setDealEditor] = useState<null | { mode: 'edit' | 'new'; id: string }>(null);
  const [dealForm, setDealForm] = useState<{ title: string; toolSlug: string; code: string; discount: string; url: string; description: string; enabled: boolean }>({
    title: '', toolSlug: '', code: '', discount: '', url: '', description: '', enabled: true,
  });
  const [dealsBusy, setDealsBusy] = useState(false);

  const openDealEditor = (deal: (typeof deals)[number] | null) => {
    if (!deal) {
      setDealEditor({ mode: 'new', id: '' });
      setDealForm({ title: '', toolSlug: '', code: '', discount: '', url: '', description: '', enabled: true });
      return;
    }
    setDealEditor({ mode: 'edit', id: deal.id });
    setDealForm({
      title: String(deal.title ?? ''), toolSlug: String(deal.toolSlug ?? ''), code: String(deal.code ?? ''),
      discount: String(deal.discount ?? ''), url: String(deal.url ?? ''), description: String(deal.description ?? ''),
      enabled: deal.enabled !== false,
    });
  };

  const saveDeal = async () => {
    setDealsBusy(true);
    try {
      if (!String(dealForm.title ?? '').trim()) throw new Error(t('required'));
      const payload = {
        title: String(dealForm.title ?? ''), toolSlug: String(dealForm.toolSlug ?? '').trim() || undefined,
        code: String(dealForm.code ?? '').trim() || undefined, discount: String(dealForm.discount ?? '').trim() || undefined,
        url: String(dealForm.url ?? '').trim() || undefined, description: String(dealForm.description ?? '').trim() || undefined,
        enabled: dealForm.enabled,
      };
      const res =
        dealEditor?.mode === 'edit'
          ? await fetch('/api/admin/deals', { method: 'PUT', headers: mutHeaders(), body: JSON.stringify({ id: dealEditor.id, fields: payload }) })
          : await fetch('/api/admin/deals', { method: 'POST', headers: mutHeaders(), body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', dealEditor?.mode === 'edit' ? t('dealSaved') : t('dealAdded'));
      setDealEditor(null);
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setDealsBusy(false);
    }
  };

  const removeDeal = async (id: string) => {
    try {
      const res = await fetch('/api/admin/deals', { method: 'DELETE', headers: mutHeaders(), body: JSON.stringify({ id }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', t('dealRemoved'));
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    }
  };

// ── catalog editor (v3.5) ─────────────────────────────────────────
  const openToolEditor = (tool: (typeof tools)[number] | null) => {
    if (!tool) {
      setToolEditor({ mode: 'new', slug: '' });
      setToolForm({
        name: '', slug: '', tagline: '', url: '', logo: '', coverImage: '',
        category: 'Video Generation', pricing: 'Free', startingPrice: '',
        description: '', longDescription: '', pageIntro: '', bestFor: '',
        tags: '', verificationLevel: 'listed-only', isFeatured: false, isEditorsChoice: false,
        affiliateUrl: '', affiliateProgram: '', previewVideoUrl: '',
      });
      return;
    }
    setToolEditor({ mode: 'edit', slug: tool.slug });
    setToolForm({
      name: String(tool.name ?? ''), slug: String(tool.slug ?? ''), tagline: String(tool.tagline ?? ''),
      url: String(tool.url ?? ''), logo: String(tool.logo ?? ''), coverImage: String(tool.coverImage ?? ''),
      category: String(tool.category ?? 'Video Generation'),
      pricing: String(tool.pricing ?? 'Free'), startingPrice: String(tool.startingPrice ?? ''),
      description: String(tool.description ?? ''), longDescription: String(tool.longDescription ?? ''),
      pageIntro: String(tool.pageIntro ?? ''), bestFor: String(tool.bestFor ?? ''),
      tags: Array.isArray(tool.tags) ? tool.tags.join(', ') : String(tool.tags ?? ''),
      verificationLevel: String(tool.verificationLevel ?? 'listed-only'),
      isFeatured: !!tool.isFeatured, isEditorsChoice: !!tool.isEditorsChoice,
      affiliateUrl: String(tool.affiliateUrl ?? ''), affiliateProgram: String(tool.affiliateProgram ?? ''),
      previewVideoUrl: String(tool.previewVideoUrl ?? ''),
    });
  };

  const saveTool = async () => {
    setToolsBusy(true);
    try {
      const slug = toolForm.slug as string;
      if (!slug.trim()) throw new Error(t('required'));
      const fields = {
        name: String(toolForm.name ?? ''),
        tagline: String(toolForm.tagline ?? ''),
        url: String(toolForm.url ?? ''),
        logo: String(toolForm.logo ?? ''),
        coverImage: String(toolForm.coverImage ?? ''),
        category: String(toolForm.category ?? 'Video Generation'),
        pricing: String(toolForm.pricing ?? 'Free'),
        startingPrice: String(toolForm.startingPrice ?? ''),
        description: String(toolForm.description ?? ''),
        longDescription: String(toolForm.longDescription ?? ''),
        pageIntro: String(toolForm.pageIntro ?? ''),
        bestFor: String(toolForm.bestFor ?? ''),
        tags: String(toolForm.tags ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        verificationLevel: String(toolForm.verificationLevel ?? 'listed-only'),
        isFeatured: !!toolForm.isFeatured,
        isEditorsChoice: !!toolForm.isEditorsChoice,
        affiliateUrl: String(toolForm.affiliateUrl ?? '').trim(),
        affiliateProgram: String(toolForm.affiliateProgram ?? ''),
        previewVideoUrl: String(toolForm.previewVideoUrl ?? '').trim(),
      };
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
      const res =
        toolEditor?.mode === 'edit'
          ? await fetch('/api/admin/tools', { method: 'PUT', headers: mutHeaders(), body: JSON.stringify({ slug: toolEditor.slug, fields }) })
          : await fetch('/api/admin/tools', { method: 'POST', headers: mutHeaders(), body: JSON.stringify({ ...fields, slug: cleanSlug }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', toolEditor?.mode === 'edit' ? t('toolSaved') : t('toolAdded'));
      setToolEditor(null);
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setToolsBusy(false);
    }
  };

  const [uploading, setUploading] = useState<string | null>(null); // 'logo' | 'coverImage'

  const uploadImage = async (field: 'logo' | 'coverImage' | 'previewVideoUrl') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = field === 'previewVideoUrl' ? 'video/*' : 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(field);
      try {
        const fd = new FormData();
        fd.append('slug', String(toolForm.slug ?? ''));
        fd.append('file', file);
        // FormData sets its own multipart Content-Type with a boundary — we must
        // NOT send mutHeaders() (application/json) or the server can't parse it.
        const res = await fetch('/api/admin/tools/upload', {
          method: 'POST',
          headers: { 'x-csrf-token': csrf },
          body: fd,
        });
        const d = await res.json();
        if (!d.ok) throw new Error(d.error || t('saveFailed'));
        setToolForm({ ...toolForm, [field]: d.url });
        flash('ok', t('imageUploaded'));
      } catch (err) {
        flash('err', err instanceof Error ? err.message : t('saveFailed'));
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const resetTool = async (slug: string) => {
    try {
      const res = await fetch('/api/admin/tools', { method: 'DELETE', headers: mutHeaders(), body: JSON.stringify({ slug }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', t('toolReset'));
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    }
  };

  const openPostEditor = (post: (typeof posts)[number] | null) => {
    if (!post) {
      setPostEditor({ mode: 'new', slug: '' });
      setPostForm({ title: '', slug: '', excerpt: '', category: 'Creator Tools', date: new Date().toISOString().slice(0, 10), readTime: '3 min read', featuredToolSlug: '', content: '' });
      return;
    }
    setPostEditor({ mode: 'edit', slug: post.slug });
    setPostForm({
      title: String(post.title ?? ''), slug: String(post.slug ?? ''), excerpt: String(post.excerpt ?? ''),
      category: String(post.category ?? ''), date: String(post.date ?? ''), readTime: String(post.readTime ?? ''),
      featuredToolSlug: String(post.featuredToolSlug ?? ''), content: String(post.content ?? ''),
    });
  };

  const savePost = async () => {
    setPostsBusy(true);
    try {
      const slug = postForm.slug as string;
      if (!slug.trim()) throw new Error(t('required'));
      const fields = {
        title: String(postForm.title ?? ''), excerpt: String(postForm.excerpt ?? ''),
        category: String(postForm.category ?? ''), date: String(postForm.date ?? ''),
        readTime: String(postForm.readTime ?? ''), featuredToolSlug: String(postForm.featuredToolSlug ?? ''),
        content: String(postForm.content ?? ''),
      };
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
      const res =
        postEditor?.mode === 'edit'
          ? await fetch('/api/admin/blog', { method: 'PUT', headers: mutHeaders(), body: JSON.stringify({ slug: postEditor.slug, fields }) })
          : await fetch('/api/admin/blog', { method: 'POST', headers: mutHeaders(), body: JSON.stringify({ ...fields, slug: cleanSlug }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', postEditor?.mode === 'edit' ? t('postSaved') : t('postAdded'));
      setPostEditor(null);
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setPostsBusy(false);
    }
  };

  const resetPost = async (slug: string) => {
    try {
      const res = await fetch('/api/admin/blog', { method: 'DELETE', headers: mutHeaders(), body: JSON.stringify({ slug }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t('saveFailed'));
      flash('ok', t('postReset'));
      await loadAll();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    }
  };

  /** Single batched save — the old panel fired one request per key in a loop. */
  const saveAnnouncement = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: mutHeaders(),
        body: JSON.stringify(announcement),
      });
      if (!res.ok) throw new Error((await res.json()).error || t('saveFailed'));
      flash('ok', t('announcementSaved'));
    } catch (err) {
      flash('err', err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────
  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-0">
        <Loader2 className="h-6 w-6 animate-spin text-accent-400" aria-label={t('loading')} />
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
          <h1 className="text-xl font-bold text-white">{t('signInTitle')}</h1>
          <label htmlFor="admin-pw" className="mt-6 block text-2xs font-semibold text-zinc-400">
            {t('password')}
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
            {t('signIn')}
          </button>
          <p className="mt-4 text-2xs leading-relaxed text-zinc-500">{t('sessionNote')}</p>
        </form>
      </div>
    );
  }

  const pendingSubs = submissions.filter((s) => s.status === 'pending');
  const pendingReviews = reviews.filter((r) => r.status === 'pending');

  const statCards: { label: string; value: number; tint: string; db?: boolean }[] = [
    { label: t('toolsCatalogued'), value: stats?.catalog?.total ?? 0, tint: 'text-accent-300' },
    { label: t('pricingVerified'), value: stats?.catalog?.pricingVerified ?? 0, tint: 'text-emerald-300' },
    { label: t('handsOnTested'), value: stats?.catalog?.handsOnTested ?? 0, tint: 'text-emerald-300' },
    { label: t('listedOnly'), value: stats?.catalog?.listedOnly ?? 0, tint: 'text-zinc-400' },
    { label: t('submissionsPending'), value: stats?.db?.submissionsPending ?? 0, tint: 'text-accent-300', db: true },
    { label: t('reviewsPending'), value: stats?.db?.reviewsPending ?? 0, tint: 'text-accent-300', db: true },
    { label: t('newsAuto'), value: stats?.db?.newsApproved ?? 0, tint: 'text-emerald-300', db: true },
    { label: t('newsLive'), value: stats?.db?.newsApproved ?? 0, tint: 'text-emerald-300', db: true },
    { label: t('newsletterConfirmed'), value: stats?.db?.newsletterConfirmed ?? 0, tint: 'text-emerald-300', db: true },
    { label: t('newsletterWaiting'), value: stats?.db?.newsletterWaiting ?? 0, tint: 'text-zinc-400', db: true },
    { label: t('pollScripting'), value: stats?.db?.poll?.writing ?? 0, tint: 'text-rose-300', db: true },
    { label: t('pollEditing'), value: stats?.db?.poll?.editing ?? 0, tint: 'text-emerald-300', db: true },
    { label: t('pollVoiceover'), value: stats?.db?.poll?.voiceover ?? 0, tint: 'text-cyan-300', db: true },
    { label: t('pollThumbnails'), value: stats?.db?.poll?.thumbnails ?? 0, tint: 'text-violet-300', db: true },
  ];

  const siteFieldGroups: { heading: string; fields: [string, string][] }[] = [
    {
      heading: t('homepageHero'),
      fields: [
        ['homeHeroTitle1', t('heroTitle1Label')],
        ['homeHeroTitleAccent', t('heroTitleAccentLabel')],
        ['homeHeroSub', t('heroSubLabel')],
        ['homeHeroCtaPlan', t('ctaPlanLabel')],
        ['homeHeroCtaBrowse', t('ctaBrowseLabel')],
      ],
    },
    {
      heading: t('featuredSection'),
      fields: [
        ['homeFeaturedTitle', t('featuredTitleLabel')],
        ['homeFeaturedSub', t('featuredSubLabel')],
      ],
    },
    {
      heading: t('newsletterSection'),
      fields: [['homeNewsletterTitle', t('newsletterTitleLabel')]],
    },
    {
      heading: t('aiStudioHero'),
      fields: [
        ['studioKicker', t('kickerLabel')],
        ['studioHeroTitle1', t('heroTitle1Label')],
        ['studioHeroTitle2', t('heroTitle1Label')],
        ['studioHeroText', t('heroTextLabel')],
      ],
    },
  ];


  // ── helpers: CSV export + completeness (v3.5) ────────────────────────
  const completeness = {
    withLogo: tools.filter((tool) => String(tool.logo ?? '').trim()).length,
    withCover: tools.filter((tool) => String(tool.coverImage ?? '').trim()).length,
    withAffiliate: tools.filter((tool) => String(tool.affiliateUrl ?? '').trim()).length,
    withVideo: tools.filter((tool) => String(tool.previewVideoUrl ?? '').trim()).length,
    edited: tools.filter((tool) => (tool.overriddenFields?.length ?? 0) > 0).length,
  };

  const downloadCsv = (rows: Array<Array<string | number>>, filename: string) => {
    const esc = (v: string | number) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportToolsCsv = () => {
    const rows: Array<Array<string | number>> = [
      ['#', 'name', 'slug', 'category', 'pricing', 'price', 'url', 'go_link', 'affiliate_url', 'affiliate_program', 'logo', 'cover', 'video', 'edited_fields'],
      ...tools.map((tool, i) => [
        i + 1,
        String(tool.name ?? ''), String(tool.slug ?? ''), String(tool.category ?? ''),
        String(tool.pricing ?? ''), String(tool.startingPrice ?? ''), String(tool.url ?? ''),
        `${'https://creatorsaicenter.vercel.app'}/go/${tool.slug}`,
        String(tool.affiliateUrl ?? ''), String(tool.affiliateProgram ?? ''),
        String(tool.logo ?? ''), String(tool.coverImage ?? ''), String(tool.previewVideoUrl ?? ''),
        (tool.overriddenFields?.length ?? 0) > 0 ? 'edited' : '',
      ]),
    ];
    downloadCsv(rows, 'tools.csv');
  };

  const exportPostsCsv = () => {
    const rows: Array<Array<string | number>> = [
      ['slug', 'title', 'category', 'date', 'readTime', 'edited_fields'],
      ...posts.map((post) => [
        String(post.slug ?? ''), String(post.title ?? ''), String(post.category ?? ''),
        String(post.date ?? ''), String(post.readTime ?? ''),
        (post.overriddenFields?.length ?? 0) > 0 ? 'edited' : '',
      ]),
    ];
    downloadCsv(rows, 'blog-posts.csv');
  };

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <header className="border-b border-white/10 bg-surface-1">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold">{t('admin')}</h1>
            <p className="text-2xs text-zinc-500">
              {t('moderationSub')}{' '}
              <Link href="/" className="underline hover:text-zinc-300">
                {t('viewSite')}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAll(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-2xs font-semibold text-zinc-300 hover:bg-white/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {t('refresh')}
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-2xs font-semibold text-rose-400 hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> {t('signOut')}
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
        <nav className="flex flex-wrap gap-2" aria-label={t('adminSections')}>
          {TABS.map(({ id, labelKey, icon: Icon }) => {
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
                {t(labelKey)}
                {count > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 font-mono text-2xs tabular-nums text-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <main id="main" className="mt-6">
          {/* v2.8 Overview dashboard */}
          {tab === 'overview' && (
            <section>
              <h2 className="mb-4 text-lg font-bold">{t('tabOverview')}</h2>
              {!stats || !stats.catalog ? (
                <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">
                  {t('statsUnavailable')}
                </p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((c) => (
                      <div key={c.label} className="rounded-xl border border-white/10 bg-surface-1 p-4">
                        <p className={`font-mono text-2xl font-black tabular-nums ${c.tint}`}>
                          {c.db && !stats.db?.configured ? '—' : c.value}
                        </p>
                        <p className="mt-1 text-2xs text-zinc-500">{c.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[
                      [t('compLogo'), completeness.withLogo, tools.length],
                      [t('compCover'), completeness.withCover, tools.length],
                      [t('compAffiliate'), completeness.withAffiliate, tools.length],
                      [t('compVideo'), completeness.withVideo, tools.length],
                      [t('compEdited'), completeness.edited, tools.length],
                    ].map(([label, val, total]) => (
                      <div key={label as string} className="rounded-xl border border-white/10 bg-surface-1 px-3 py-2">
                        <p className="font-mono text-lg font-black tabular-nums text-accent-300">{String(val)}<span className="text-2xs text-zinc-500">/{total}</span></p>
                        <p className="text-2xs text-zinc-500">{label as string}</p>
                      </div>
                    ))}
                  </div>
                  {!stats.db?.configured && (
                    <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-2xs leading-relaxed text-amber-200/80">
                      {t('supabaseNote')}
                    </p>
                  )}
                  <p className="mt-4 text-2xs leading-relaxed text-zinc-500">
                    {t.rich('quickActions', {
                      newsQueue: (chunks) => (
                        <button onClick={() => setTab('news')} className="text-accent-400 underline">
                          {chunks}
                        </button>
                      ),
                    })}
                  </p>
                </>
              )}
            </section>
          )}

          {tab === 'orders' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Paid Orders & Fast-Track Promotions</h2>
                  <p className="text-2xs text-zinc-400">
                    Review incoming crypto payments, verified submissions, and featured placements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-2xs font-bold text-emerald-300">
                    {orders.filter((o) => o.status === 'confirmed').length} Paid Orders
                  </span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-2xs font-bold text-amber-300">
                    {orders.filter((o) => o.status === 'submitted' || o.status === 'pending').length} Pending
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-surface-1 p-8 text-center text-sm text-zinc-500">
                  <Coins className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                  No orders yet. When founders submit paid tools, orders will appear here.
                </div>
              ) : (
                <ul className="space-y-4">
                  {orders.map((ord) => {
                    const isTon = ord.crypto_currency?.includes('TON');
                    const txExplorerUrl = ord.tx_hash
                      ? isTon
                        ? `https://tonviewer.com/transaction/${ord.tx_hash}`
                        : `https://tronscan.org/#/transaction/${ord.tx_hash}`
                      : null;

                    return (
                      <li key={ord.id} className="rounded-2xl border border-white/10 bg-surface-1 p-5 shadow-lg">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-white">{ord.tool_name}</h3>
                              <span className="rounded-md border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 font-mono text-2xs font-bold text-accent-300">
                                {ord.plan.toUpperCase()} (${ord.amount_usd})
                              </span>
                              <span
                                className={`rounded-md px-2 py-0.5 font-mono text-2xs font-bold ${
                                  ord.status === 'confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : ord.status === 'submitted'
                                    ? 'bg-sky-500/20 text-sky-300'
                                    : ord.status === 'rejected'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {ord.status.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-2xs text-zinc-300">{ord.tagline}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-zinc-400">
                              <span>
                                Website:{' '}
                                <a
                                  href={ord.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-400 underline"
                                >
                                  {ord.website_url}
                                </a>
                              </span>
                              <span>Founder: {ord.founder_email}</span>
                              <span>Created: {new Date(ord.created_at).toLocaleString()}</span>
                            </div>

                            {ord.tx_hash && (
                              <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-2xs">
                                <span className="font-bold text-zinc-400">TXID:</span>
                                <code className="truncate font-mono text-emerald-300">{ord.tx_hash}</code>
                                {txExplorerUrl && (
                                  <a
                                    href={txExplorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto inline-flex shrink-0 items-center gap-1 text-accent-400 hover:underline"
                                  >
                                    View Explorer <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {ord.status !== 'confirmed' && (
                              <button
                                onClick={() => moderateOrder(ord.id, 'confirm_payment')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-2xs font-bold text-black shadow-md hover:bg-emerald-400"
                              >
                                <Check className="h-3.5 w-3.5" /> Confirm & Feature
                              </button>
                            )}
                            {ord.status !== 'rejected' && (
                              <button
                                onClick={() => moderateOrder(ord.id, 'reject')}
                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-2xs font-bold text-rose-400 hover:bg-white/5"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {tab === 'claims' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Founder Claim Ownership Requests</h2>
                  <p className="text-2xs text-zinc-400">
                    Verify tool founders, approve claims, and grant the official Founder Verified badge.
                  </p>
                </div>
                <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 font-mono text-2xs font-bold text-accent-300">
                  {claims.length} Claims
                </span>
              </div>

              {claims.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-surface-1 p-8 text-center text-sm text-zinc-500">
                  <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                  No founder claims yet. When creators claim their profiles at /founders, they will appear here.
                </div>
              ) : (
                <ul className="space-y-3">
                  {claims.map((c) => (
                    <li key={c.id} className="rounded-xl border border-white/10 bg-surface-1 p-5 shadow-lg">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{c.tool_slug}</h3>
                            <span
                              className={`rounded px-2 py-0.5 font-mono text-2xs font-bold ${
                                c.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : c.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {c.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-2xs text-zinc-300">
                            Founder: <strong className="text-white">{c.company_email}</strong> · Role: {c.role}
                          </p>
                          {c.notes && <p className="mt-1 text-2xs italic text-zinc-400">&ldquo;{c.notes}&rdquo;</p>}
                          <p className="mt-1.5 text-2xs text-zinc-500">
                            Date: {new Date(c.created_at).toLocaleString()} · Will embed badge:{' '}
                            {c.will_embed_badge ? 'Yes (بله)' : 'No'}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const toolObj = tools.find((t) => String(t.slug) === c.tool_slug);
                                const siteUrl = toolObj?.url ? String(toolObj.url) : `https://${c.tool_slug}.com`;
                                checkBadgeLive(c.id, siteUrl, c.tool_slug);
                              }}
                              disabled={checkingBadge === c.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-2xs font-bold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
                            >
                              {checkingBadge === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                              🔍 Auto-Detect Badge on Site
                            </button>
                            {badgeChecks[c.id] && (
                              <span
                                className={`rounded-lg px-2.5 py-1 text-2xs font-bold ${
                                  badgeChecks[c.id].embedded
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {badgeChecks[c.id].statusText}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {c.status !== 'approved' && (
                            <button
                              onClick={() => moderateClaim(c.id, c.tool_slug, 'approve')}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-2xs font-bold text-black hover:bg-emerald-400"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve & Grant Badge
                            </button>
                          )}
                          {c.status !== 'rejected' && (
                            <button
                              onClick={() => moderateClaim(c.id, c.tool_slug, 'reject')}
                              className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-2xs font-bold text-rose-400 hover:bg-white/5"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
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

          {tab === 'submissions' && (
            <section>
              <h2 className="mb-4 text-lg font-bold">{t('toolSubmissions')}</h2>

              <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent-500/20 bg-accent-500/5 p-4 text-2xs leading-relaxed text-zinc-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                <p>
                  <strong>{t('reviewNote')}</strong>{' '}
                  {t.rich('reviewNoteBody', {
                    tools: (chunks) => <code className="rounded bg-surface-2 px-1">{chunks}</code>,
                    dynamicParams: (chunks) => <code className="rounded bg-surface-2 px-1">{chunks}</code>,
                    deployment: (chunks) => <code className="rounded bg-surface-2 px-1">{chunks}</code>,
                  })}
                </p>
              </div>

              {submissions.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">
                  {t('noSubmissions')}
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
                                <Check className="h-3 w-3" aria-hidden="true" /> {t('approve')}
                              </button>
                              <button
                                onClick={() => actOnSubmission(s, 'reject')}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400"
                              >
                                <X className="h-3 w-3" aria-hidden="true" /> {t('reject')}
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
              <h2 className="mb-4 text-lg font-bold">{t('communityReviews')}</h2>
              <p className="mb-4 text-2xs leading-relaxed text-zinc-500">
                {t.rich('reviewsIntro', {
                  pending: (chunks) => <code className="rounded bg-surface-2 px-1">{chunks}</code>,
                })}
              </p>

              {reviews.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">
                  {t('noReviews')}
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
                              <Check className="h-3 w-3" aria-hidden="true" /> {t('approve')}
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              onClick={() => moderateReview(r.id, 'rejected')}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400"
                            >
                              <X className="h-3 w-3" aria-hidden="true" /> {t('reject')}
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

          {/* News feed — v3 auto-published, read-only monitoring */}
          {tab === 'news' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  {t('newsFeedHeading')}{' '}
                  <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-2xs font-bold tabular-nums text-emerald-300">
                    {t('autoPublished')}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={ingestNow}
                    disabled={ingestBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 text-2xs font-bold text-black disabled:opacity-50"
                  >
                    {ingestBusy ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Download className="h-3 w-3" aria-hidden="true" />}
                    {t('ingestNow')}
                  </button>
                </div>
              </div>
              <p className="mb-4 text-2xs leading-relaxed text-zinc-500">
                {t.rich('newsIntro', {
                  news: (chunks) => <code className="rounded bg-surface-2 px-1">{chunks}</code>,
                })}
              </p>

              {news.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">
                  {t.rich('noNewsYet', {
                    code: (chunks) => <code className="rounded bg-surface-2 px-1">{chunks}</code>,
                  })}
                </p>
              ) : (
                <ul className="space-y-3">
                  {news.map((n) => (
                    <li key={n.slug} className="rounded-xl border border-white/10 bg-surface-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-white">{n.title}</h3>
                            {n.ai_summarized && (
                              <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 text-2xs font-bold text-cyan-300">
                                {t('aiSummary')}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-2xs leading-relaxed text-zinc-400">{n.excerpt}</p>
                          <p className="mt-1.5 text-2xs text-zinc-500">
                            {n.source} · {n.category} ·{' '}
                            {new Date(n.published_at).toLocaleDateString()} ·{' '}
                            <a
                              href={n.source_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex items-center gap-1 text-accent-400 hover:text-accent-300"
                            >
                              {t('original')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-2xs font-bold text-emerald-300">
                            {t('live')}
                          </span>
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
              <h2 className="mb-2 text-lg font-bold">{t('siteAnnouncement')}</h2>
              <p className="mb-5 text-2xs leading-relaxed text-zinc-500">{t('announcementNote')}</p>

              <div className="space-y-4 rounded-xl border border-white/10 bg-surface-1 p-6">
                <div>
                  <label htmlFor="a-enabled" className="block text-2xs font-semibold text-zinc-400">
                    {t('visibleOnSite')}
                  </label>
                  <select
                    id="a-enabled"
                    value={announcement.announcement_enabled}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, announcement_enabled: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  >
                    <option value="false">{t('hidden')}</option>
                    <option value="true">{t('visible')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="a-title" className="block text-2xs font-semibold text-zinc-400">
                    {t('title')}
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
                    {t('description')}
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
                  {t('save')}
                </button>
              </div>
            </section>
          )}

          {/* Translation engine — admin-managed provider keys */}
          {tab === 'i18n' && (
            <section className="max-w-2xl">
              <h2 className="mb-2 text-lg font-bold">{t('translationEngine')}</h2>
              <p className="mb-5 text-2xs leading-relaxed text-zinc-500">{t('engineNote')}</p>

              <div className="space-y-4 rounded-xl border border-white/10 bg-surface-1 p-6">
                <div>
                  <label htmlFor="i18n-provider" className="block text-2xs font-semibold text-zinc-400">
                    {t('provider')}
                  </label>
                  <select
                    id="i18n-provider"
                    value={i18n.provider}
                    onChange={(e) => setI18n({ ...i18n, provider: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  >
                    <option value="">{t('autoDetect')}</option>
                    <option value="gemini">{t('geminiFree')}</option>
                    <option value="openrouter">{t('openrouterFree')}</option>
                    <option value="openai">{t('openaiPaid')}</option>
                  </select>
                  {i18n.effective && (
                    <p className="mt-1.5 text-2xs text-zinc-500">
                      {t('currentlyActive')} <span className="font-mono text-accent-300">{i18n.effective}</span>
                      {i18n.effectiveModel ? ` · ${i18n.effectiveModel}` : ''}
                      {i18n.env.provider ? t('forcedByEnv', { provider: i18n.env.provider }) : ''}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="i18n-gemini" className="block text-2xs font-semibold text-zinc-400">
                    {t('geminiKey')} <span className="text-zinc-600">{t('geminiFreeNote')}</span>
                  </label>
                  <input
                    id="i18n-gemini"
                    type="password"
                    autoComplete="off"
                    placeholder={i18n.effective === 'gemini' && !i18n.env.hasGemini ? t('alreadySet') : t('pasteKey', { name: 'GEMINI_API_KEY' })}
                    value={i18n.geminiApiKey}
                    onChange={(e) => setI18n({ ...i18n, geminiApiKey: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="i18n-openrouter" className="block text-2xs font-semibold text-zinc-400">
                    {t('openrouterKey')} <span className="text-zinc-600">{t('openrouterFreeNote')}</span>
                  </label>
                  <input
                    id="i18n-openrouter"
                    type="password"
                    autoComplete="off"
                    placeholder={i18n.effective === 'openrouter' && !i18n.env.hasOpenRouter ? t('alreadySet') : t('pasteKey', { name: 'OPENROUTER_API_KEY' })}
                    value={i18n.openrouterApiKey}
                    onChange={(e) => setI18n({ ...i18n, openrouterApiKey: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  />
                  <input
                    placeholder={t('modelDefault')}
                    value={i18n.openrouterModel}
                    onChange={(e) => setI18n({ ...i18n, openrouterModel: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-accent-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="i18n-openai" className="block text-2xs font-semibold text-zinc-400">
                    {t('openaiKey')} <span className="text-zinc-600">{t('openaiPaidNote')}</span>
                  </label>
                  <input
                    id="i18n-openai"
                    type="password"
                    autoComplete="off"
                    placeholder={i18n.effective === 'openai' && !i18n.env.hasOpenAI ? t('alreadySet') : t('pasteKey', { name: 'OPENAI_API_KEY' })}
                    value={i18n.openaiApiKey}
                    onChange={(e) => setI18n({ ...i18n, openaiApiKey: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={saveI18n}
                    disabled={i18nBusy}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black disabled:opacity-60"
                  >
                    {i18nBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    {t('saveKeys')}
                  </button>
                  <button
                    onClick={runTranslate}
                    disabled={i18nBusy}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-2xs font-bold text-zinc-300 hover:bg-white/5 disabled:opacity-60"
                  >
                    <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('translateNow')}
                  </button>
                  <button
                    onClick={testI18n}
                    disabled={i18nBusy}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-2xs font-bold text-zinc-300 hover:bg-white/5 disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('testConnection')}
                  </button>
                </div>

                {i18nTest && (
                  <p
                    role="status"
                    className={`rounded-xl border px-4 py-3 text-2xs font-semibold ${
                      i18nTest.ok
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {i18nTest.message}
                  </p>
                )}

                <p className="border-t border-white/5 pt-3 text-2xs leading-relaxed text-zinc-600">
                  {t.rich('backfillNote', {
                    action: (chunks) => <span className="font-mono text-zinc-400">{chunks}</span>,
                    limit: (chunks) => <span className="font-mono text-zinc-400">{chunks}</span>,
                  })}
                </p>
              </div>
            </section>
          )}


          {/* Catalog editor — tools (v3.5) */}
          {tab === 'tools' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  {t('tabTools')}{' '}
                  <span className="ml-1 rounded-full bg-accent-500/15 px-2 py-0.5 font-mono text-2xs font-bold tabular-nums text-accent-300">
                    {tools.length}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={toolsSearch}
                    onChange={(e) => setToolsSearch(e.target.value)}
                    placeholder={t('searchTools')}
                    className="w-56 rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                  />
                  <button
                    onClick={exportToolsCsv}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-2xs font-bold text-zinc-300 hover:bg-white/5"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> {t('exportCsv')}
                  </button>
                  <button
                    onClick={() => openToolEditor(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black hover:bg-accent-400"
                  >
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> {t('addTool')}
                  </button>
                </div>
              </div>

              {toolEditor ? (
                <div className="rounded-2xl border border-white/10 bg-surface-1 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold">
                      {toolEditor.mode === 'edit' ? t('edit') : t('newTool')} — {toolEditor.mode === 'edit' ? toolEditor.slug : ''}
                    </h3>
                    <button onClick={() => setToolEditor(null)} className="text-2xs font-semibold text-zinc-400 hover:text-white">
                      {t('cancel')}
                    </button>
                  </div>

                  <p className="mt-1 text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('toolBasics')}</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['name', t('fieldName'), 'text', true],
                      ['slug', t('fieldSlug'), 'text', toolEditor.mode === 'new'],
                      ['tagline', t('fieldTagline'), 'text', false],
                      ['url', t('fieldUrl'), 'text', false],
                      ['logo', t('fieldLogo'), 'text', false],
                      ['coverImage', t('fieldCover'), 'text', false],
                      ['startingPrice', t('fieldPrice'), 'text', false],
                    ].map(([key, label, , required]) => (
                      <div key={key as string}>
                        <label htmlFor={`tf-${key}`} className="block text-2xs font-semibold text-zinc-400">
                          {label as string}{required ? ' *' : ''}
                        </label>
                        <div className="mt-1 flex items-start gap-2">
                          <input
                            id={`tf-${key}`}
                            value={String(toolForm[key as string] ?? '')}
                            onChange={(e) => setToolForm({ ...toolForm, [key as string]: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                          />
                          {(key === 'logo' || key === 'coverImage') && (
                            <>
                              <button
                                type="button"
                                onClick={() => uploadImage(key as 'logo' | 'coverImage')}
                                disabled={uploading !== null}
                                className="shrink-0 rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-2xs font-bold text-accent-300 hover:bg-white/5 disabled:opacity-50"
                              >
                                {uploading === key ? t('uploading') : t('uploadImage')}
                              </button>
                              {String(toolForm[key as string] ?? '') && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={String(toolForm[key as string])}
                                  alt=""
                                  className="h-9 w-9 shrink-0 rounded-lg border border-white/10 object-cover"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div>
                      <label htmlFor="tf-category" className="block text-2xs font-semibold text-zinc-400">{t('fieldCategory')}</label>
                      <select
                        id="tf-category"
                        value={String(toolForm.category ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      >
                        {[...new Set(tools.map((tool) => String(tool.category ?? '')).filter(Boolean))].sort().map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tf-pricing" className="block text-2xs font-semibold text-zinc-400">{t('fieldPricing')}</label>
                      <select
                        id="tf-pricing"
                        value={String(toolForm.pricing ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, pricing: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      >
                        {['Free', 'Freemium', 'Paid', 'Free Trial'].map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tf-verification" className="block text-2xs font-semibold text-zinc-400">{t('fieldVerification')}</label>
                      <select
                        id="tf-verification"
                        value={String(toolForm.verificationLevel ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, verificationLevel: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      >
                        {['hands-on-tested', 'pricing-verified', 'listed-only'].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <p className="mt-5 text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('affiliateSection')}</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="tf-affiliateUrl" className="block text-2xs font-semibold text-zinc-400">
                        {t('fieldAffiliateUrl')}{' '}
                        <span className="font-normal text-zinc-600">({t('affiliateHint')})</span>
                      </label>
                      <input
                        id="tf-affiliateUrl"
                        value={String(toolForm.affiliateUrl ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, affiliateUrl: e.target.value })}
                        placeholder="https://www.opus.pro/?via=creatoraihub"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="tf-affiliateProgram" className="block text-2xs font-semibold text-zinc-400">{t('fieldAffiliateProgram')}</label>
                      <select
                        id="tf-affiliateProgram"
                        value={String(toolForm.affiliateProgram ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, affiliateProgram: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      >
                        <option value="">{t('affiliateNone')}</option>
                        <option value="impact">Impact</option>
                        <option value="partnerstack">PartnerStack</option>
                        <option value="rewardful">Rewardful</option>
                        <option value="direct">Direct</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <p className="text-2xs leading-relaxed text-zinc-500">{t('affiliateProgramNote')}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('videoSection')}</p>
                  <div className="mt-2">
                    <label htmlFor="tf-previewVideoUrl" className="block text-2xs font-semibold text-zinc-400">
                      {t('fieldVideoUrl')}{' '}
                      <span className="font-normal text-zinc-600">({t('videoHint')})</span>
                    </label>
                    <div className="mt-1 flex items-start gap-2">
                      <input
                        id="tf-previewVideoUrl"
                        value={String(toolForm.previewVideoUrl ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, previewVideoUrl: e.target.value })}
                        placeholder="https://your-cdn.com/tool-demo.mp4"
                        className="w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => uploadImage('previewVideoUrl')}
                        disabled={uploading !== null}
                        className="shrink-0 rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-2xs font-bold text-accent-300 hover:bg-white/5 disabled:opacity-50"
                      >
                        {uploading === 'previewVideoUrl' ? t('uploading') : t('uploadVideo')}
                      </button>
                    </div>
                    <p className="mt-1 text-2xs leading-relaxed text-zinc-500">{t('videoNote')}</p>
                    {String(toolForm.previewVideoUrl ?? '') && !/youtu\.be\/|youtube\.com\/|vimeo\.com\//.test(String(toolForm.previewVideoUrl ?? '')) && (
                      <video
                        src={String(toolForm.previewVideoUrl)}
                        muted
                        loop
                        playsInline
                        controls
                        className="mt-2 max-h-40 w-full rounded-xl border border-white/10 bg-black/40 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLVideoElement).style.display = 'none';
                        }}
                      />
                    )}
                    {/youtu\.be\/|youtube\.com\//.test(String(toolForm.previewVideoUrl ?? '')) && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${String(toolForm.previewVideoUrl).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/i)?.[1] || ''}`}
                          title="YouTube Video Preview"
                          className="h-44 w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <p className="border-t border-white/10 bg-surface-2/60 px-3 py-1.5 text-2xs text-emerald-300">
                          ✓ YouTube embed detected (plays interactively on tool page with demo badge on cards)
                        </p>
                      </div>
                    )}
                    {/vimeo\.com\//.test(String(toolForm.previewVideoUrl ?? '')) && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <iframe
                          src={`https://player.vimeo.com/video/${String(toolForm.previewVideoUrl).match(/vimeo\.com\/(\d+)/)?.[1] || ''}`}
                          title="Vimeo Video Preview"
                          className="h-44 w-full border-0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                        <p className="border-t border-white/10 bg-surface-2/60 px-3 py-1.5 text-2xs text-emerald-300">
                          ✓ Vimeo embed detected (plays interactively on tool page with demo badge on cards)
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="mt-5 text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('toolDescription')}</p>
                  <div className="mt-2 grid gap-3">
                    {[
                      ['description', t('fieldShortDesc'), 2],
                      ['pageIntro', t('fieldPageIntro'), 2],
                      ['bestFor', t('fieldBestFor'), 2],
                      ['longDescription', t('fieldLongDesc'), 6],
                    ].map(([key, label, rows]) => (
                      <div key={key as string}>
                        <label htmlFor={`tf-${key}`} className="block text-2xs font-semibold text-zinc-400">{label as string}</label>
                        <textarea
                          id={`tf-${key}`}
                          rows={rows as number}
                          value={String(toolForm[key as string] ?? '')}
                          onChange={(e) => setToolForm({ ...toolForm, [key as string]: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                        />
                      </div>
                    ))}
                    <div>
                      <label htmlFor="tf-tags" className="block text-2xs font-semibold text-zinc-400">{t('fieldTags')}</label>
                      <input
                        id="tf-tags"
                        value={String(toolForm.tags ?? '')}
                        onChange={(e) => setToolForm({ ...toolForm, tags: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('toolFlags')}</p>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={!!toolForm.isFeatured}
                        onChange={(e) => setToolForm({ ...toolForm, isFeatured: e.target.checked })}
                        className="h-4 w-4 accent-accent-500"
                      /> {t('fieldFeatured')}
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={!!toolForm.isEditorsChoice}
                        onChange={(e) => setToolForm({ ...toolForm, isEditorsChoice: e.target.checked })}
                        className="h-4 w-4 accent-accent-500"
                      /> {t('fieldEditorsChoice')}
                    </label>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={saveTool}
                      disabled={toolsBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black disabled:opacity-60"
                    >
                      {toolsBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                      {t('saveTool')}
                    </button>
                    {toolEditor.mode === 'edit' && (
                      <button
                        onClick={() => { resetTool(toolEditor.slug); setToolEditor(null); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-2xs font-bold text-rose-400 hover:bg-white/5"
                      >
                        {t('reset')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {tools.length === 0 ? (
                    <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('noToolsMatch')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {tools
                        .filter((tool) => !toolsSearch || String(tool.name ?? '').toLowerCase().includes(toolsSearch.toLowerCase()) || String(tool.slug).toLowerCase().includes(toolsSearch.toLowerCase()))
                        .map((tool) => (
                          <li key={tool.slug} className="rounded-xl border border-white/10 bg-surface-1 px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-white">{String(tool.name ?? tool.slug)}</span>
                                  {(tool.overriddenFields?.length ?? 0) > 0 && (
                                    <span className="rounded bg-accent-500/15 px-1.5 py-0.5 text-2xs font-bold text-accent-300">
                                      {t('editedBadge', { count: String(tool.overriddenFields?.length) })}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 truncate text-2xs text-zinc-500">
                                  {tool.slug} · {String(tool.category ?? '')} · {String(tool.pricing ?? '')}{tool.startingPrice ? ` · ${String(tool.startingPrice)}` : ''}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => quickToggleToolFlag(tool.slug, 'isFeatured', !!tool.isFeatured)}
                                  title="Toggle Featured status on Homepage"
                                  className={`rounded-lg border px-2.5 py-1 text-2xs font-bold transition-all ${
                                    tool.isFeatured
                                      ? 'border-accent-500 bg-accent-500/20 text-accent-300 shadow-sm'
                                      : 'border-white/10 bg-surface-2 text-zinc-500 hover:text-white'
                                  }`}
                                >
                                  ⭐ {tool.isFeatured ? 'Featured: ON' : 'Featured: OFF'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => quickToggleToolFlag(tool.slug, 'hasFounderBadge', !!tool.hasFounderBadge)}
                                  title="Toggle Founder Verified badge"
                                  className={`rounded-lg border px-2.5 py-1 text-2xs font-bold transition-all ${
                                    tool.hasFounderBadge
                                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                                      : 'border-white/10 bg-surface-2 text-zinc-500 hover:text-white'
                                  }`}
                                >
                                  🛡️ {tool.hasFounderBadge ? 'Founder: ON' : 'Founder: OFF'}
                                </button>
                                <button
                                  onClick={() => openToolEditor(tool)}
                                  className="rounded-lg bg-surface-2 border border-white/10 px-3 py-1 text-2xs font-bold text-zinc-300 hover:text-white"
                                >
                                  {t('edit')}
                                </button>
                                {(tool.overriddenFields?.length ?? 0) > 0 && (
                                  <button
                                    onClick={() => resetTool(tool.slug)}
                                    className="rounded-lg border border-white/10 px-3 py-1 text-2xs font-bold text-rose-400 hover:bg-white/5"
                                  >
                                    {t('reset')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          )}

          {/* Blog editor (v3.5) */}
          {tab === 'blog' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  {t('tabBlog')}{' '}
                  <span className="ml-1 rounded-full bg-accent-500/15 px-2 py-0.5 font-mono text-2xs font-bold tabular-nums text-accent-300">
                    {posts.length}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={postsSearch}
                    onChange={(e) => setPostsSearch(e.target.value)}
                    placeholder={t('searchPosts')}
                    className="w-56 rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                  />
                  <button
                    onClick={exportPostsCsv}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-2xs font-bold text-zinc-300 hover:bg-white/5"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> {t('exportCsv')}
                  </button>
                  <button
                    onClick={() => openPostEditor(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black hover:bg-accent-400"
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {t('addPost')}
                  </button>
                </div>
              </div>

              {postEditor ? (
                <div className="rounded-2xl border border-white/10 bg-surface-1 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold">{postEditor.mode === 'edit' ? t('edit') : t('newPost')} — {postEditor.slug || ''}</h3>
                    <button onClick={() => setPostEditor(null)} className="text-2xs font-semibold text-zinc-400 hover:text-white">
                      {t('cancel')}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['title', t('postTitle'), true],
                      ['slug', t('postSlug'), postEditor.mode === 'new'],
                      ['category', t('postCategory'), false],
                      ['date', t('postDate'), false],
                      ['readTime', t('postReadTime'), false],
                      ['featuredToolSlug', t('fieldFeaturedTool'), false],
                    ].map(([key, label, required]) => (
                      <div key={key as string}>
                        <label htmlFor={`pf-${key}`} className="block text-2xs font-semibold text-zinc-400">
                          {label as string}{required ? ' *' : ''}
                        </label>
                        <input
                          id={`pf-${key}`}
                          value={postForm[key as string] ?? ''}
                          onChange={(e) => setPostForm({ ...postForm, [key as string]: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label htmlFor="pf-excerpt" className="block text-2xs font-semibold text-zinc-400">{t('postExcerpt')}</label>
                    <textarea
                      id="pf-excerpt"
                      rows={2}
                      value={postForm.excerpt ?? ''}
                      onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-3">
                    <label htmlFor="pf-content" className="block text-2xs font-semibold text-zinc-400">{t('postContent')}</label>
                    <textarea
                      id="pf-content"
                      rows={12}
                      value={postForm.content ?? ''}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 font-mono text-xs text-white focus:border-accent-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={savePost}
                      disabled={postsBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black disabled:opacity-60"
                    >
                      {postsBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                      {t('savePost')}
                    </button>
                    {postEditor.mode === 'edit' && (
                      <button
                        onClick={() => { resetPost(postEditor.slug); setPostEditor(null); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-2xs font-bold text-rose-400 hover:bg-white/5"
                      >
                        {t('reset')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {posts.length === 0 ? (
                    <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('noPostsMatch')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {posts
                        .filter((post) => !postsSearch || String(post.title ?? '').toLowerCase().includes(postsSearch.toLowerCase()) || String(post.slug).toLowerCase().includes(postsSearch.toLowerCase()))
                        .map((post) => (
                          <li key={post.slug} className="rounded-xl border border-white/10 bg-surface-1 px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-white">{String(post.title ?? post.slug)}</span>
                                  {(post.overriddenFields?.length ?? 0) > 0 && (
                                    <span className="rounded bg-accent-500/15 px-1.5 py-0.5 text-2xs font-bold text-accent-300">
                                      {t('editedBadge', { count: String(post.overriddenFields?.length) })}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 truncate text-2xs text-zinc-500">
                                  {post.slug} · {String(post.category ?? '')} · {String(post.date ?? '')}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  onClick={() => openPostEditor(post)}
                                  className="rounded-lg bg-surface-2 border border-white/10 px-3 py-1.5 text-2xs font-bold text-zinc-300 hover:text-white"
                                >
                                  {t('edit')}
                                </button>
                                {(post.overriddenFields?.length ?? 0) > 0 && (
                                  <button
                                    onClick={() => resetPost(post.slug)}
                                    className="rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400 hover:bg-white/5"
                                  >
                                    {t('reset')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          )}

          {/* Deals & coupons manager (v3.5) */}
          {tab === 'deals' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  {t('tabDeals')}{' '}
                  <span className="ml-1 rounded-full bg-accent-500/15 px-2 py-0.5 font-mono text-2xs font-bold tabular-nums text-accent-300">
                    {deals.length}
                  </span>
                </h2>
                <button
                  onClick={() => openDealEditor(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black hover:bg-accent-400"
                >
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" /> {t('addDeal')}
                </button>
              </div>

              {dealEditor ? (
                <div className="rounded-2xl border border-white/10 bg-surface-1 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold">{dealEditor.mode === 'edit' ? t('edit') : t('newDeal')}</h3>
                    <button onClick={() => setDealEditor(null)} className="text-2xs font-semibold text-zinc-400 hover:text-white">{t('cancel')}</button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {([
                      ['title', t('dealTitle'), true],
                      ['toolSlug', t('dealToolSlug'), false],
                      ['code', t('dealCode'), false],
                      ['discount', t('dealDiscount'), false],
                      ['url', t('dealUrl'), false],
                    ] as [keyof typeof dealForm, string, boolean][]).map(([key, label, required]) => (
                      <div key={key as string}>
                        <label htmlFor={`df-${key}`} className="block text-2xs font-semibold text-zinc-400">
                          {label as string}{required ? ' *' : ''}
                        </label>
                        <input
                          id={`df-${key}`}
                          value={String(dealForm[key] ?? '')}
                          onChange={(e) => setDealForm({ ...dealForm, [key]: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label htmlFor="df-description" className="block text-2xs font-semibold text-zinc-400">{t('dealDescription')}</label>
                      <textarea
                        id="df-description"
                        rows={3}
                        value={dealForm.description}
                        onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={dealForm.enabled}
                        onChange={(e) => setDealForm({ ...dealForm, enabled: e.target.checked })}
                        className="h-4 w-4 accent-accent-500"
                      /> {t('visible')}
                    </label>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={saveDeal}
                      disabled={dealsBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black disabled:opacity-60"
                    >
                      {dealsBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                      {t('save')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {deals.length === 0 ? (
                    <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('noDeals')}</p>
                  ) : (
                    deals.map((deal) => (
                      <div key={deal.id} className="rounded-xl border border-white/10 bg-surface-1 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white">{deal.title}</span>
                              {deal.code && (
                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-2xs font-bold text-emerald-300">{deal.code}</span>
                              )}
                              {!deal.enabled && (
                                <span className="rounded bg-zinc-500/15 px-1.5 py-0.5 text-2xs font-bold text-zinc-400">{t('hidden')}</span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-2xs text-zinc-500">
                              {deal.discount || ''}{deal.toolSlug ? ` · ${deal.toolSlug}` : ''}{deal.url ? ` · ${deal.url}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() => openDealEditor(deal)}
                              className="rounded-lg bg-surface-2 border border-white/10 px-3 py-1.5 text-2xs font-bold text-zinc-300 hover:text-white"
                            >
                              {t('edit')}
                            </button>
                            <button
                              onClick={() => removeDeal(deal.id)}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-rose-400 hover:bg-white/5"
                            >
                              {t('reject')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )}

          {/* Site Content — preview + edit + save */}
          {tab === 'preview' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{t('siteContent')}</h2>
                <button
                  onClick={saveSiteContent}
                  disabled={siteContentBusy}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black disabled:opacity-60"
                >
                  {siteContentBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  {t('savePublish')}
                </button>
              </div>
              <p className="mb-4 text-2xs leading-relaxed text-zinc-500">{t('siteContentNote')}</p>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Live preview */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-1">
                  <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('livePreview')}</span>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xs font-semibold text-accent-400 hover:text-accent-300"
                    >
                      {t('openFullSite')}
                    </a>
                  </div>
                  <iframe
                    src="/"
                    title={t('sitePreviewTitle')}
                    className="h-[560px] w-full bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>

                {/* Editor */}
                <div className="space-y-3 rounded-xl border border-white/10 bg-surface-1 p-5">
                  {siteFieldGroups.map((group) => (
                    <React.Fragment key={group.heading}>
                      <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">{group.heading}</p>
                      {group.fields.map(([key, label]) => (
                        <div key={key}>
                          <label htmlFor={`sc-${key}`} className="block text-2xs font-semibold text-zinc-400">
                            {label}
                          </label>
                          {key === 'homeHeroSub' || key === 'studioHeroText' ? (
                            <textarea
                              id={`sc-${key}`}
                              rows={3}
                              value={siteContent[key] ?? ''}
                              onChange={(e) => setSiteContent({ ...siteContent, [key]: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                            />
                          ) : (
                            <input
                              id={`sc-${key}`}
                              value={siteContent[key] ?? ''}
                              onChange={(e) => setSiteContent({ ...siteContent, [key]: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                            />
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
