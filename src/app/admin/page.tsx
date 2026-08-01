"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sliders,
  Layers,
  Inbox,
  PlusCircle,
  TrendingUp,
  Trash2,
  ExternalLink,
  Award,
  Check,
  X,
  Palette,
  Edit3,
  Download,
  Upload,
  DollarSign,
  Database,
  RefreshCw,
} from 'lucide-react';

type Tab =
  | 'content'
  | 'design'
  | 'tools'
  | 'submissions'
  | 'add_tool'
  | 'stats'
  | 'backup';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('content');

  // Site Settings (Content + 10 Themes + Layout + SEO)
  const [settings, setSettings] = useState<Record<string, string>>({
    hero_badge: 'Inspired by Bold Studio • MotionSites.ai 3D Edition',
    hero_title_main: 'THE BOLD AI STUDIO',
    hero_title_sub: 'For Video Creators & Editors',
    hero_description:
      'Cinematic 3D aesthetics, scroll-driven transforms, and hand-curated AI video editors for YouTube, Shorts & studio audio production.',
    announcement_title:
      'Are you building an AI video tool? Get the Verified Founder Badge!',
    announcement_desc:
      'Add our verified badge on your website or mention CreatorAI Hub on Twitter/X to receive priority listing & permanent SEO backlink.',
    footer_copyright: '© 2026 CreatorAI Hub. Built for solo founders.',
    seo_keywords:
      'AI video tools, AI for YouTubers, AI shorts generator, AI video editing 2026',
    theme_accent: 'purple',
    grid_layout: 'grid-3',
    tool_sort_by: 'featured',
    card_style: '3d-glass',
    hero_animation: 'enabled',
  });

  const [tools, setTools] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  const [editingTool, setEditingTool] = useState<any | null>(null);

  const [newTool, setNewTool] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    url: '',
    affiliate_url: '',
    logo: '',
    cover_image: '',
    category: 'Video Editing',
    pricing: 'Freemium',
    starting_price: '$10/mo',
    is_featured: false,
    has_founder_badge: true,
    tags: 'AI Tool, Video, Creator',
    metrics: '10x Speed',
  });

  const [importJsonText, setImportJsonText] = useState('');
  const [backupMsg, setBackupMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setErrorMsg('');
      fetchAllData();
    } else {
      setErrorMsg('رمز عبور اشتباه است (رمز پیش‌فرض: admin123)');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const resSettings = await fetch('/api/settings');
      if (resSettings.ok) {
        const data = await resSettings.json();
        if (Object.keys(data).length > 0)
          setSettings((prev) => ({ ...prev, ...data }));
      }

      const resTools = await fetch('/api/tools');
      if (resTools.ok) {
        const data = await resTools.json();
        setTools(Array.isArray(data) ? data : []);
      }

      const resSubs = await fetch('/api/admin/submissions');
      if (resSubs.ok) {
        const data = await resSubs.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleUpdateToolInline = async (
    id: string,
    updates: Record<string, any>
  ) => {
    try {
      const res = await fetch('/api/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditedTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;
    setSaveStatus('saving');
    try {
      const formattedTags =
        typeof editingTool.tags === 'string'
          ? editingTool.tags.split(',').map((t: string) => t.trim())
          : editingTool.tags;

      const res = await fetch('/api/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingTool,
          tags: formattedTags,
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setEditingTool(null);
        fetchAllData();
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm('آیا از حذف این ابزار از دیتابیس اطمینان دارید؟')) return;
    try {
      await fetch(`/api/tools?id=${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmissionAction = async (
    submission: any,
    action: 'approve' | 'reject'
  ) => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, submission }),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      const formattedTags = newTool.tags.split(',').map((t) => t.trim());
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTool,
          tags: formattedTags,
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setNewTool({
          name: '',
          slug: '',
          tagline: '',
          description: '',
          url: '',
          affiliate_url: '',
          logo: '',
          cover_image: '',
          category: 'Video Editing',
          pricing: 'Freemium',
          starting_price: '$10/mo',
          is_featured: false,
          has_founder_badge: true,
          tags: 'AI Tool, Video, Creator',
          metrics: '10x Speed',
        });
        fetchAllData();
        setActiveTab('tools');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(tools, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `creator-ai-hub-backup-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setBackupMsg('فایل بکاپ JSON با موفقیت دانلود شد!');
    setTimeout(() => setBackupMsg(''), 4000);
  };

  const handleImportJson = async () => {
    if (!importJsonText) return;
    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      let importedCount = 0;
      for (const item of items) {
        await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        importedCount++;
      }
      setBackupMsg(
        `${importedCount} ابزار با موفقیت از فایل JSON وارد دیتابیس شد!`
      );
      setImportJsonText('');
      fetchAllData();
    } catch (err) {
      setBackupMsg('خطا در فرمت JSON وارد شده.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">God-Mode Admin Panel</h2>
              <p className="text-xs text-zinc-400">
                CreatorAI Hub Solo Founder Command Center
              </p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password (default: admin123)"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
            {errorMsg && (
              <p className="text-xs font-semibold text-red-400">{errorMsg}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-extrabold text-white shadow-lg hover:from-purple-500 hover:to-pink-500"
            >
              Login to Command Center
            </button>
          </form>
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Live Website</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totalTools = tools.length;
  const activeAffiliates = tools.filter(
    (t) => t.affiliate_url && t.affiliate_url.length > 5
  ).length;
  const pendingSubmissions = submissions.filter(
    (s) => s.status === 'pending'
  ).length;
  const featuredCount = tools.filter((t) => t.is_featured).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-900/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Solo Founder God-Mode Dashboard
              </h1>
              <p className="text-xs font-bold text-purple-400">
                10 Cinematic Themes, Design, Content, Affiliates, CRUD &amp; Backups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-500"
            >
              <span>Live Site ↗</span>
            </a>
          </div>
        </div>

        {/* 7-Tab Navigation Bar */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 border-t border-white/5 px-4 pt-3 pb-2.5 sm:px-6 lg:px-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'content'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>۱. متن‌ها و تیتر سایت</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'design'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>۲. ۱۰ تم سینمایی، طراحی و چیدمان</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'tools'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>۳. ابزارها و افیلیت ({totalTools})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>۴. درخواست‌ها</span>
            {pendingSubmissions > 0 && (
              <span className="ml-1 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                {pendingSubmissions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add_tool')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'add_tool'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>۵. افزودن ابزار جدید</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>۶. آمار و درآمد</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>۷. بکاپ و ورود/خروج JSON</span>
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {saveStatus === 'saved' && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm font-bold text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>
              تغییرات با موفقیت در دیتابیس سوپابیس ذخیره شد و روی سایت اعمال شد!
            </span>
          </div>
        )}

        {/* TAB 1: CONTENT EDITOR */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveAllSettings} className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl sm:p-8">
              <h2 className="text-lg font-extrabold text-purple-400">
                Hero Section &amp; Website Content (متن‌های بالای سایت)
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                تغییر زنده تیتر، شعار، بنرها و کلمات کلیدی سئو بدون ۱ خط کدنویسی
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Hero Badge Text
                  </label>
                  <input
                    type="text"
                    value={settings.hero_badge}
                    onChange={(e) =>
                      setSettings({ ...settings, hero_badge: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Main Title (تیتر اصلی بزرگ)
                    </label>
                    <input
                      type="text"
                      value={settings.hero_title_main}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero_title_main: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Sub Title (زیرتیتر اصلی)
                    </label>
                    <input
                      type="text"
                      value={settings.hero_title_sub}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero_title_sub: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Hero Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.hero_description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero_description: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 border-t border-white/5 pt-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Announcement Banner Title
                    </label>
                    <input
                      type="text"
                      value={settings.announcement_title}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          announcement_title: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Footer Copyright Text
                    </label>
                    <input
                      type="text"
                      value={settings.footer_copyright || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          footer_copyright: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl hover:bg-purple-500"
              >
                <Save className="h-5 w-5" />
                <span>
                  {saveStatus === 'saving'
                    ? 'در حال ذخیره...'
                    : 'Save All Settings'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: 10 CINEMATIC THEMES & DESIGN CONTROLS */}
        {activeTab === 'design' && (
          <form onSubmit={handleSaveAllSettings} className="space-y-6">
            <div className="space-y-6 rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl sm:p-8">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  ۱۰ تم سینمایی، طراحی و چیدمان (10-Theme God Mode)
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  تغییر زنده بک‌گراند، رنگ نئون، تعداد ستون‌ها و انیمیشن‌های ۳ بعدی
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. 10 Themes */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-purple-400">
                    انتخاب از ۱۰ تم سینمایی (Cinematic Theme)
                  </label>
                  <select
                    value={settings.theme_accent || 'purple'}
                    onChange={(e) =>
                      setSettings({ ...settings, theme_accent: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm font-bold text-white focus:border-purple-500"
                  >
                    <option value="purple">🟣 ۱. بنفش-صورتی بولد (Bold Studio - پیش‌فرض)</option>
                    <option value="blue">🔵 ۲. آبی سایبری ماتریکس (Cyber Blue)</option>
                    <option value="emerald">🟢 ۳. سبز زمردی هوش مصنوعی (AI Emerald)</option>
                    <option value="amber">🟡 ۴. طلایی لوکس سلطنتی (Luxury Gold)</option>
                    <option value="rose">🔴 ۵. رز نئونی و بنفش (Neon Rose Cyberpunk)</option>
                    <option value="sunset">🟠 ۶. نارنجی غروب و آتش (Sunset Horizon)</option>
                    <option value="ocean">🐬 ۷. فیروزه‌ای اقیانوسی (Ocean Cyan Deep)</option>
                    <option value="aurora">🌌 ۸. شفق قطبی چندرنگ (Aurora Green/Violet)</option>
                    <option value="monochrome">⚪ ۹. نقره‌ای تک‌رنگ مینیمال (Luxury Silver)</option>
                    <option value="crimson">🍷 ۱۰. قرمز یاقوتی شب (Crimson Midnight)</option>
                  </select>
                </div>

                {/* 2. Grid Layout */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-purple-400">
                    چیدمان کارت‌ها (Grid Layout)
                  </label>
                  <select
                    value={settings.grid_layout || 'grid-3'}
                    onChange={(e) =>
                      setSettings({ ...settings, grid_layout: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="grid-3">۳ ستونه مدرن (پیش‌فرض)</option>
                    <option value="grid-2">۲ ستونه عریض با جزئیات بیشتر</option>
                    <option value="grid-1">۱ ستونه (نمایش لیستی کامل)</option>
                  </select>
                </div>

                {/* 3. Tool Sorting */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-purple-400">
                    مرتب‌سازی ابزارها (Default Sorting)
                  </label>
                  <select
                    value={settings.tool_sort_by || 'featured'}
                    onChange={(e) =>
                      setSettings({ ...settings, tool_sort_by: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="featured">⭐ اول ابزارهای ویژه (پیش‌فرض)</option>
                    <option value="rating">★ بالاترین امتیاز ۴.۹ ستاره</option>
                    <option value="reviews">💬 بیشترین تعداد نظر</option>
                    <option value="newest">🆕 جدیدترین ابزارها</option>
                  </select>
                </div>

                {/* 4. Card Style */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-purple-400">
                    استایل کارت‌ها (Card Style)
                  </label>
                  <select
                    value={settings.card_style || '3d-glass'}
                    onChange={(e) =>
                      setSettings({ ...settings, card_style: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="3d-glass">
                      ✨ شیشه‌ای ۳ بعدی با هاور نئونی
                    </option>
                    <option value="minimal-border">
                      ⬛ مینیمال تخت با حاشیه ساده
                    </option>
                  </select>
                </div>

                {/* 5. Hero Floating Animation */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-purple-400">
                    انیمیشن‌های ۳ بعدی هدر (Hero Motion)
                  </label>
                  <select
                    value={settings.hero_animation || 'enabled'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero_animation: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="enabled">🚀 فعال بودن انیمیشن شناور</option>
                    <option value="static">⚡ استاتیک (ساده برای سرعت بالاتر)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl hover:bg-purple-500"
              >
                <Save className="h-5 w-5" />
                <span>Save 10-Theme Design Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: TOOLS & AFFILIATES MANAGER (FULL CRUD) */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl sm:p-8">
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    مدیریت ابزارها و ویرایش لینک‌های افیلیت
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    روی کادر لینک افیلیت هر ابزار کلیک کنید، آدرس درآمدزایی خود را بگذارید و ذخیره کنید
                  </p>
                </div>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
                  {tools.length} Tools in DB
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-4 py-3">نام ابزار</th>
                      <th className="px-4 py-3">دسته</th>
                      <th className="px-4 py-3">لینک افیلیت (Affiliate URL)</th>
                      <th className="px-4 py-3 text-center">Featured</th>
                      <th className="px-4 py-3 text-center">Verified</th>
                      <th className="px-4 py-3 text-right">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tools.map((tool) => (
                      <tr key={tool.id} className="hover:bg-zinc-800/50">
                        <td className="px-4 py-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{tool.name}</span>
                            <a
                              href={tool.url}
                              target="_blank"
                              className="text-zinc-500 hover:text-white"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-zinc-400">
                          {tool.category}
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            defaultValue={tool.affiliate_url || ''}
                            placeholder="https://opus.pro/?via=yourname..."
                            onBlur={(e) =>
                              handleUpdateToolInline(tool.id, {
                                affiliate_url: e.target.value,
                              })
                            }
                            className="w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-purple-300 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={tool.is_featured}
                            onChange={(e) =>
                              handleUpdateToolInline(tool.id, {
                                is_featured: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded text-purple-600"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={tool.has_founder_badge}
                            onChange={(e) =>
                              handleUpdateToolInline(tool.id, {
                                has_founder_badge: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded text-purple-600"
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingTool(tool)}
                              className="rounded-lg bg-purple-500/10 p-2 text-purple-400 hover:bg-purple-500/20 hover:text-white"
                              title="ویرایش کامل مشخصات ابزار"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTool(tool.id)}
                              className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:text-white"
                              title="حذف ابزار"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal for Full Tool Editing */}
            {editingTool && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-lg font-extrabold text-white">
                      ویرایش کامل ابزار: {editingTool.name}
                    </h3>
                    <button
                      onClick={() => setEditingTool(null)}
                      className="rounded-lg p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedTool} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Tool Name *
                        </label>
                        <input
                          type="text"
                          value={editingTool.name}
                          onChange={(e) =>
                            setEditingTool({
                              ...editingTool,
                              name: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Category *
                        </label>
                        <select
                          value={editingTool.category}
                          onChange={(e) =>
                            setEditingTool({
                              ...editingTool,
                              category: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                        >
                          <option value="Video Editing">Video Editing</option>
                          <option value="Shorts & Reels">Shorts & Reels</option>
                          <option value="Thumbnails & Design">
                            Thumbnails & Design
                          </option>
                          <option value="Voice & Audio">Voice & Audio</option>
                          <option value="Script & SEO">Script & SEO</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Tagline *
                      </label>
                      <input
                        type="text"
                        value={editingTool.tagline}
                        onChange={(e) =>
                          setEditingTool({
                            ...editingTool,
                            tagline: e.target.value,
                          })
                        }
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingTool.description}
                        onChange={(e) =>
                          setEditingTool({
                            ...editingTool,
                            description: e.target.value,
                          })
                        }
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Website URL *
                        </label>
                        <input
                          type="url"
                          value={editingTool.url}
                          onChange={(e) =>
                            setEditingTool({
                              ...editingTool,
                              url: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
                          Affiliate URL (لینک درآمدزایی)
                        </label>
                        <input
                          type="url"
                          value={editingTool.affiliate_url || ''}
                          onChange={(e) =>
                            setEditingTool({
                              ...editingTool,
                              affiliate_url: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-purple-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingTool(null)}
                        className="rounded-xl border border-white/10 bg-zinc-800 px-5 py-2.5 text-xs font-bold hover:bg-zinc-700"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-purple-500"
                      >
                        <Save className="h-4 w-4" />
                        <span>ذخیره تغییرات ابزار</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUBMISSIONS APPROVAL INBOX */}
        {activeTab === 'submissions' && (
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  صندوق درخواست‌های ثبت ابزار (Submissions Approval Inbox)
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  درخواست‌های ارسال‌شده توسط استارتاپ‌ها را با ۱ کلیک تایید و در سایت منتشر کنید
                </p>
              </div>
              <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300">
                {pendingSubmissions} Pending
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="py-16 text-center text-zinc-500">
                <Inbox className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2 text-sm font-bold">
                  هیچ درخواستی در حال حاضر وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">
                          {sub.tool_name}
                        </h3>
                        <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300">
                          {sub.category}
                        </span>
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-400">
                          {sub.pricing}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{sub.tagline}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                        <span>
                          سایت:{' '}
                          <a
                            href={sub.website_url}
                            target="_blank"
                            className="text-purple-400 underline"
                          >
                            {sub.website_url}
                          </a>
                        </span>
                        <span>ایمیل بنیان‌گذار: {sub.founder_email}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {sub.status === 'pending' ? (
                        <>
                          <button
                            onClick={() =>
                              handleSubmissionAction(sub, 'approve')
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                          >
                            <Check className="h-4 w-4" />
                            <span>تایید و انتشار فوری در سایت</span>
                          </button>
                          <button
                            onClick={() =>
                              handleSubmissionAction(sub, 'reject')
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                            <span>رد</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-bold ${
                            sub.status === 'approved'
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {sub.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ADD TOOL NO-CODE FORM */}
        {activeTab === 'add_tool' && (
          <form
            onSubmit={handleCreateTool}
            className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl sm:p-8"
          >
            <div>
              <h2 className="text-lg font-extrabold text-white">
                افزودن دستی ابزار جدید به سایت (No-Code Form)
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                مشخصات ابزار جدید را وارد کنید تا مستقیماً در دیتابیس سوپابیس و صفحه اصلی ثبت شود
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Tool Name *
              </label>
              <input
                type="text"
                required
                value={newTool.name}
                onChange={(e) =>
                  setNewTool({ ...newTool, name: e.target.value })
                }
                placeholder="e.g. InVideo AI"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={newTool.url}
                  onChange={(e) =>
                    setNewTool({ ...newTool, url: e.target.value })
                  }
                  placeholder="https://invideo.io"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
                  Affiliate URL (لینک درآمدزایی شما)
                </label>
                <input
                  type="url"
                  value={newTool.affiliate_url}
                  onChange={(e) =>
                    setNewTool({ ...newTool, affiliate_url: e.target.value })
                  }
                  placeholder="https://invideo.io/?ref=yourname"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-purple-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Tagline *
              </label>
              <input
                type="text"
                required
                value={newTool.tagline}
                onChange={(e) =>
                  setNewTool({ ...newTool, tagline: e.target.value })
                }
                placeholder="1 sentence describing the tool"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Description
              </label>
              <textarea
                rows={2}
                value={newTool.description}
                onChange={(e) =>
                  setNewTool({ ...newTool, description: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Category
                </label>
                <select
                  value={newTool.category}
                  onChange={(e) =>
                    setNewTool({ ...newTool, category: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                >
                  <option value="Video Editing">Video Editing</option>
                  <option value="Shorts & Reels">Shorts & Reels</option>
                  <option value="Thumbnails & Design">
                    Thumbnails & Design
                  </option>
                  <option value="Voice & Audio">Voice & Audio</option>
                  <option value="Script & SEO">Script & SEO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Pricing
                </label>
                <select
                  value={newTool.pricing}
                  onChange={(e) =>
                    setNewTool({ ...newTool, pricing: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Free Trial">Free Trial</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="w-full rounded-2xl bg-purple-600 py-4 text-sm font-extrabold text-white shadow-xl hover:bg-purple-500"
            >
              <span>Add &amp; Publish Tool to Site</span>
            </button>
          </form>
        )}

        {/* TAB 6: MONETIZATION STATS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-emerald-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">
                {activeAffiliates}
              </h3>
              <p className="mt-1 text-xs font-bold text-zinc-400">
                Active Affiliate Links
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">
                لینک‌های درآمدزایی فعال که در سایتت ست شده است
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <Layers className="mx-auto h-8 w-8 text-purple-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">
                {totalTools}
              </h3>
              <p className="mt-1 text-xs font-bold text-zinc-400">
                Total Curated Tools
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">
                تعداد ابزارهای تست‌شده موجود در دیتابیس
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <Award className="mx-auto h-8 w-8 text-amber-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">
                {featuredCount}
              </h3>
              <p className="mt-1 text-xs font-bold text-zinc-400">
                Featured Tools
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">
                ابزارهایی که در جایگاه ویژه و بالای لیست هستند
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <Inbox className="mx-auto h-8 w-8 text-pink-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">
                {pendingSubmissions}
              </h3>
              <p className="mt-1 text-xs font-bold text-zinc-400">
                Pending Submissions
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">
                درخواست‌های جدید در انتظار بررسی شما
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: JSON BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl sm:p-8">
              <h2 className="text-lg font-extrabold text-white">
                بکاپ‌گیری و ورود/خروج اطلاعات با فایل JSON (Data Backup)
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                با ۱ کلیک از کل دیتابیس ابزارها خروجی بگیرید یا ابزارها را به صورت دسته‌ای وارد کنید
              </p>

              {backupMsg && (
                <div className="mt-4 rounded-xl bg-purple-500/15 border border-purple-500/30 p-3 text-xs font-bold text-purple-300">
                  {backupMsg}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleExportJson}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 text-xs font-extrabold text-white shadow-lg hover:bg-purple-500"
                >
                  <Download className="h-4 w-4" />
                  <span>دانلود بکاپ JSON کل ابزارها ({totalTools} ابزار)</span>
                </button>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  وارد کردن دسته‌ای ابزارها از متن JSON (Import JSON)
                </label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='[ { "name": "New Tool", "url": "https://...", ... } ]'
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-white focus:border-purple-500"
                />
                <button
                  onClick={handleImportJson}
                  disabled={!importJsonText}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>وارد کردن ابزارها به دیتابیس</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
