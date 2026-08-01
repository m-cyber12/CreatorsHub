"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Save, CheckCircle2, Lock, ArrowLeft, Sliders } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setErrorMsg('');
      fetchSettings();
    } else {
      setErrorMsg('رمز عبور اشتباه است (رمز پیش‌فرض: admin123)');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">No-Code Admin Panel</h2>
              <p className="text-xs text-zinc-400">CreatorAI Hub Solo Founder Dashboard</p>
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
              Login to Dashboard
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-900/80 p-4 sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-extrabold">No-Code Admin Dashboard</h1>
          <a href="/" target="_blank" className="rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-xs font-bold">
            View Live Site ↗
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        {saveStatus === 'saved' && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-sm font-bold text-emerald-300">
            <CheckCircle2 className="h-5 w-5" /> تنظیمات با موفقیت در دیتابیس ذخیره شد!
          </div>
        )}
        <form onSubmit={handleSaveAll} className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 space-y-4">
            <h2 className="text-base font-extrabold text-purple-400">تغییر متون بالای سایت (Hero Section)</h2>
            <div>
              <label className="text-xs text-zinc-400">Hero Badge Text</label>
              <input
                type="text"
                value={settings.hero_badge}
                onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Main Title (تیتر اصلی بزرگ)</label>
              <input
                type="text"
                value={settings.hero_title_main}
                onChange={(e) => setSettings({ ...settings, hero_title_main: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Sub Title (زیرتیتر اصلی)</label>
              <input
                type="text"
                value={settings.hero_title_sub}
                onChange={(e) => setSettings({ ...settings, hero_title_sub: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Hero Description (توضیحات)</label>
              <textarea
                rows={3}
                value={settings.hero_description}
                onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl hover:bg-purple-500"
          >
            <Save className="h-5 w-5" />
            <span>{saveStatus === 'saving' ? 'در حال ذخیره...' : 'Save All Settings to Database'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
