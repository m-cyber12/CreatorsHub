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
  LayoutGrid,
  DollarSign,
} from 'lucide-react';

type Tab = 'content' | 'design' | 'tools' | 'submissions' | 'add_tool' | 'stats';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('content');

  // Site Settings (including Design & Layout)
  const [settings, setSettings] = useState<Record<string, string>>({
    hero_badge: 'Inspired by Bold Studio • MotionSites.ai 3D Edition',
    hero_title_main: 'THE BOLD AI STUDIO',
    hero_title_sub: 'For Video Creators & Editors',
    hero_description:
      'Cinematic 3D aesthetics, scroll-driven transforms, and hand-curated AI video editors for YouTube, Shorts & studio audio production.',
    announcement_title: 'Are you building an AI video tool? Get the Verified Founder Badge!',
    announcement_desc:
      'Add our verified badge on your website or mention CreatorAI Hub on Twitter/X to receive priority listing & permanent SEO backlink.',
    theme_accent: 'purple',
    grid_layout: 'grid-3',
    tool_sort_by: 'featured',
  });

  // Tools & Submissions State
  const [tools, setTools] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Add Tool Form State
  const [newTool, setNewTool] = useState({
    name: '',
    tagline: '',
    description: '',
    url: '',
    affiliate_url: '',
    category: 'Video Editing',
    pricing: 'Freemium',
    starting_price: '$10/mo',
    is_featured: false,
    has_founder_badge: true,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
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
        if (Object.keys(data).length > 0) setSettings((prev) => ({ ...prev, ...data }));
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

  const handleUpdateTool = async (id: string, updates: Record<string, any>) => {
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

  const handleDeleteTool = async (id: string) => {
    if (!confirm('آیا از حذف این ابزار اطمینان دارید؟')) return;
    try {
      await fetch(`/api/tools?id=${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmissionAction = async (submission: any, action: 'approve' | 'reject') => {
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
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTool),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setNewTool({
          name: '',
          tagline: '',
          description: '',
          url: '',
          affiliate_url: '',
          category: 'Video Editing',
          pricing: 'Freemium',
          starting_price: '$10/mo',
          is_featured: false,
          has_founder_badge: true,
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
              <p className="text-xs text-zinc-400">CreatorAI Hub Solo Founder Command Center</p>
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
            {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-extrabold text-white shadow-lg hover:from-purple-500 hover:to-pink-500"
            >
              Login to Command Center
            </button>
          </form>
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <a href="/" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Live Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totalTools = tools.length;
  const activeAffiliates = tools.filter((t) => t.affiliate_url && t.affiliate_url.length > 5).length;
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">Solo Founder God-Mode Dashboard</h1>
              <p className="text-xs text-purple-400 font-bold">Manage content, design, layout &amp; affiliates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAllData} className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700">
              Refresh
            </button>
            <a href="/" target="_blank" className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-500">
              View Live Site ↗
            </a>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 pb-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'content' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>متن‌ها و تیتر سایت</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'design' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>طراحی، رنگ‌بندی و چیدمان</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'tools' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>مدیریت ابزارها و افیلیت ({totalTools})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all relative ${
              activeTab === 'submissions' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>درخواست‌های کاربران</span>
            {pendingSubmissions > 0 && (
              <span className="ml-1.5 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                {pendingSubmissions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add_tool')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'add_tool' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>افزودن ابزار جدید</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'stats' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>آمار درآمدزایی</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {saveStatus === 'saved' && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-sm font-bold text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>تغییرات با موفقیت ذخیره شد و روی سایت زنده اعمال شد!</span>
          </div>
        )}

        {/* TAB 1: CONTENT EDITOR */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveAllSettings} className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8 shadow-xl">
              <h2 className="text-lg font-extrabold text-purple-400">Hero Section Content (متن‌های بالای سایت)</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Hero Badge Text</label>
                  <input
                    type="text"
                    value={settings.hero_badge}
                    onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Main Title</label>
                    <input
                      type="text"
                      value={settings.hero_title_main}
                      onChange={(e) => setSettings({ ...settings, hero_title_main: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Sub Title</label>
                    <input
                      type="text"
                      value={settings.hero_title_sub}
                      onChange={(e) => setSettings({ ...settings, hero_title_sub: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Hero Description</label>
                  <textarea
                    rows={3}
                    value={settings.hero_description}
                    onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
                  />
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
                <span>{saveStatus === 'saving' ? 'در حال ذخیره...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: DESIGN & LAYOUT CONTROLS (NEW!) */}
        {activeTab === 'design' && (
          <form onSubmit={handleSaveAllSettings} className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white">تنظیمات طراحی، رنگ‌بندی و چیدمان سایت (Design &amp; Layout)</h2>
                <p className="text-xs text-zinc-400 mt-1">تغییر زنده رنگ اصلی، تعداد ستون‌های کارت‌ها و ترتیب مرتب‌سازی در صفحه اول</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* 1. Theme Accent */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
                    رنگ اصلی تم (Accent Color)
                  </label>
                  <select
                    value={settings.theme_accent || 'purple'}
                    onChange={(e) => setSettings({ ...settings, theme_accent: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="purple">🟣 بنفش-صورتی (Bold Studio - پیش‌فرض)</option>
                    <option value="blue">🔵 آبی سایبری (Cyber Blue)</option>
                    <option value="emerald">🟢 سبز زمردی (AI Emerald)</option>
                    <option value="amber">🟡 طلایی لوکس (Luxury Gold)</option>
                  </select>
                </div>

                {/* 2. Grid Layout */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
                    چیدمان کارت‌ها (Grid Layout)
                  </label>
                  <select
                    value={settings.grid_layout || 'grid-3'}
                    onChange={(e) => setSettings({ ...settings, grid_layout: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="grid-3">۳ ستونه مدرن (پیش‌فرض)</option>
                    <option value="grid-2">۲ ستونه عریض با جزئیات بیشتر</option>
                  </select>
                </div>

                {/* 3. Sorting Order */}
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
                    ترتیب پیش‌فرض نمایش ابزارها (Sorting)
                  </label>
                  <select
                    value={settings.tool_sort_by || 'featured'}
                    onChange={(e) => setSettings({ ...settings, tool_sort_by: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:border-purple-500"
                  >
                    <option value="featured">⭐ اول ابزارهای ویژه و لنگر (پیش‌فرض)</option>
                    <option value="rating">★ بالاترین امتیاز ۴.۹ ستاره</option>
                    <option value="reviews">💬 بیشترین تعداد نظر</option>
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
                <span>{saveStatus === 'saving' ? 'در حال ذخیره...' : 'Save Design Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: TOOLS MANAGER */}
        {activeTab === 'tools' && (
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-extrabold text-white mb-6">مدیریت ابزارها و ویرایش لینک‌های افیلیت</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">نام ابزار</th>
                    <th className="py-3 px-4">دسته</th>
                    <th className="py-3 px-4">لینک افیلیت (Affiliate URL)</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4 text-right">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-zinc-800/50">
                      <td className="py-4 px-4 font-bold text-white">{tool.name}</td>
                      <td className="py-4 px-4 text-xs text-zinc-400">{tool.category}</td>
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          defaultValue={tool.affiliate_url || ''}
                          placeholder="https://opus.pro/?via=yourname..."
                          onBlur={(e) => handleUpdateTool(tool.id, { affiliate_url: e.target.value })}
                          className="w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-purple-300"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={tool.is_featured}
                          onChange={(e) => handleUpdateTool(tool.id, { is_featured: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => handleDeleteTool(tool.id)} className="text-zinc-500 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SUBMISSIONS APPROVAL INBOX */}
        {activeTab === 'submissions' && (
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-extrabold text-white">صندوق درخواست‌های ثبت ابزار (Submissions Approval)</h2>
            {submissions.length === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-500">هیچ درخواستی در حال حاضر وجود ندارد.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 p-5">
                    <div>
                      <h3 className="text-base font-extrabold text-white">{sub.tool_name}</h3>
                      <p className="text-xs text-zinc-400">{sub.tagline}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSubmissionAction(sub, 'approve')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold">
                        تایید و انتشار
                      </button>
                      <button onClick={() => handleSubmissionAction(sub, 'reject')} className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400">
                        رد
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ADD TOOL */}
        {activeTab === 'add_tool' && (
          <form onSubmit={handleCreateTool} className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl max-w-xl mx-auto space-y-4">
            <h2 className="text-lg font-extrabold text-white">افزودن دستی ابزار جدید</h2>
            <input
              type="text"
              required
              placeholder="Tool Name *"
              value={newTool.name}
              onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
            />
            <input
              type="url"
              required
              placeholder="Website URL *"
              value={newTool.url}
              onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
            />
            <input
              type="url"
              placeholder="Affiliate URL"
              value={newTool.affiliate_url}
              onChange={(e) => setNewTool({ ...newTool, affiliate_url: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-purple-300"
            />
            <input
              type="text"
              required
              placeholder="Tagline *"
              value={newTool.tagline}
              onChange={(e) => setNewTool({ ...newTool, tagline: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
            />
            <button type="submit" className="w-full rounded-2xl bg-purple-600 py-4 text-sm font-extrabold text-white shadow-xl hover:bg-purple-500">
              Add Tool
            </button>
          </form>
        )}

        {/* TAB 6: STATS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-emerald-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">{activeAffiliates}</h3>
              <p className="mt-1 text-xs text-zinc-400 font-bold">Active Affiliate Links</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <Layers className="mx-auto h-8 w-8 text-purple-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">{totalTools}</h3>
              <p className="mt-1 text-xs text-zinc-400 font-bold">Total Curated Tools</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center">
              <Inbox className="mx-auto h-8 w-8 text-pink-400" />
              <h3 className="mt-3 text-3xl font-extrabold text-white">{pendingSubmissions}</h3>
              <p className="mt-1 text-xs text-zinc-400 font-bold">Pending Submissions</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
