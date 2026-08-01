"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Save, CheckCircle2, Lock, ArrowLeft, RefreshCw, Layers, Sliders } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    hero_badge: 'Inspired by Bold Studio • MotionSites.ai 3D Edition',
    hero_title_main: 'THE BOLD AI STUDIO',
    hero_title_sub: 'For Video Creators & Editors',
    hero_description:
      'Cinematic 3D aesthetics, scroll-driven transforms, and hand-curated AI video editors for YouTube, Shorts & studio audio production.',
    announcement_title: 'Are you building an AI video tool? Get the Verified Founder Badge!',
    announcement_desc:
      'Add our verified badge on your website or mention CreatorAI Hub on Twitter/X to receive priority listing & permanent SEO backlink.',
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Verify Admin Password (default: admin123 or from env)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setErrorMsg('');
      fetchSettings();
    } else {
      setErrorMsg('رمز عبور اشتباه است / Invalid password');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">No-Code Admin Panel</h2>
              <p className="text-xs text-zinc-400">CreatorAI Hub Solo Founder Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
              {errorMsg && <p className="mt-2 text-xs text-red-400 font-semibold">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-pink-500"
            >
              Login to Dashboard
            </button>
          </form>
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <a href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Live Website</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">No-Code Admin Dashboard</h1>
              <p className="text-xs text-purple-400 font-bold">Edit website texts, titles &amp; settings live</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              View Live Site ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {saveStatus === 'saved' && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-sm font-bold text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>تنظیمات با موفقیت در دیتابیس سوپابیس ذخیره شد و روی سایت زنده اعمال شد!</span>
          </div>
        )}

        <form onSubmit={handleSaveAll} className="space-y-8">
          {/* Section 1: Hero Settings */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-extrabold">Hero Section Content (متن‌های بالای سایت)</h2>
                <p className="text-xs text-zinc-400">تغییر زنده تیتر، شعار، و توضیحات اصلی صفحه اول سایت</p>
              </div>
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
                Hero Section
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Hero Badge Text (بج درخشان بالای تیتر)
                </label>
                <input
                  type="text"
                  value={settings.hero_badge}
                  onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Main Title (تیتر اصلی غول‌پیکر)
                  </label>
                  <input
                    type="text"
                    value={settings.hero_title_main}
                    onChange={(e) => setSettings({ ...settings, hero_title_main: e.target.value })}
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
                    onChange={(e) => setSettings({ ...settings, hero_title_sub: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Hero Description (توضیحات زیر عنوان)
                </label>
                <textarea
                  rows={3}
                  value={settings.hero_description}
                  onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Announcement Banner Settings */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-extrabold">Announcement Banner (بنر اطلاعیه Founders)</h2>
                <p className="text-xs text-zinc-400">متن اطلاعیه دریافت نشان تایید بنیان‌گذار</p>
              </div>
              <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300">
                Flywheel Banner
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={settings.announcement_title}
                  onChange={(e) => setSettings({ ...settings, announcement_title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Announcement Description
                </label>
                <textarea
                  rows={2}
                  value={settings.announcement_desc}
                  onChange={(e) => setSettings({ ...settings, announcement_desc: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all active:scale-95"
            >
              <Save className="h-5 w-5" />
              <span>{saveStatus === 'saving' ? 'در حال ذخیره...' : 'Save All Settings to Database'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
  }
      
