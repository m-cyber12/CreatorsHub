'use client';
/* eslint-disable jsx-a11y/label-has-associated-control */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, RefreshCcw, Sparkles, Loader2, Bot } from 'lucide-react';
import { StudioSelect } from './StudioSelect';
import { useStudioQuota } from '@/context/StudioQuotaContext';
import { MarkdownLite } from './MarkdownLite';
import { studioAuthHeaders } from '@/lib/studioAuthClient';

const emotions = [
  'Extreme Curiosity (MrBeast)',
  'High Urgency & Warning',
  'Shock & Surprise',
  'Ultimate Authority & Proof',
  'Insane Transformation (Before/After)',
];

export function ThumbnailBriefBuilder() {
  const t = useTranslations('studio.tb');
  const [f, setF] = useState({
    title: '',
    audience: 'YouTubers & Video Creators',
    emotion: emotions[0],
    subject: 'Creator looking shocked with glowing 3D AI icon',
    colors: 'Obsidian Black with Electric Cyan and Amber accents',
    reference: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const { consumeQuota } = useStudioQuota();

  const copy = async (str: string) => navigator.clipboard.writeText(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allowed = consumeQuota('thumbnail-brief');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await studioAuthHeaders()) },
        body: JSON.stringify({
          tool: 'thumbnail-brief',
          topic: `${f.title} (Focal: ${f.subject})`,
          style: f.emotion,
          category: f.colors,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setAiOutput(data.result);
      }
    } catch {
      setAiOutput(`### 🎨 Thumbnail Brief for ${f.title}\n\n1. Focal Subject: ${f.subject}\n2. Color Scheme: ${f.colors}\n3. Emotion: ${f.emotion}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[.86fr_1.14fr]">
      <form className="studio-form-card" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <h2>{t('setDirection')}</h2>
          <button
            type="button"
            className="studio-reset"
            onClick={() => {
              setF({
                title: '',
                audience: '',
                emotion: emotions[0],
                subject: '',
                colors: '',
                reference: '',
              });
              setAiOutput(null);
            }}
          >
            <RefreshCcw className="h-3.5 w-3.5" /> {t('reset')}
          </button>
        </div>

        <label>
          {t('videoTopic')}
          <textarea
            className="studio-field"
            required
            rows={2}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="e.g. I tested 100 AI Video Editing tools for 30 days"
          />
        </label>

        <label>
          {t('focalSubject')}
          <input
            className="studio-field"
            value={f.subject}
            onChange={(e) => setF({ ...f, subject: e.target.value })}
            placeholder="e.g. Creator holding glowing phone with $10,000"
          />
        </label>

        <label>
          {t('keyEmotion')}
          <StudioSelect
            ariaLabel={t('keyEmotion')}
            value={f.emotion}
            onChange={(value) => setF({ ...f, emotion: value })}
            options={emotions.map((value) => ({ value, label: value }))}
          />
        </label>

        <label>
          {t('brandColours')}
          <input
            className="studio-field"
            value={f.colors}
            onChange={(e) => setF({ ...f, colors: e.target.value })}
            placeholder="e.g. Dark background, High-contrast Cyan and Electric Gold"
          />
        </label>

        <button
          className="studio-generate flex items-center justify-center gap-2"
          disabled={loading || !f.title.trim()}
          type="submit"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? 'Building Thumbnail Strategy...' : t('build')}</span>
        </button>
      </form>

      <section className="studio-results" aria-live="polite">
        <div className="studio-results-heading">
          <div>
            <p className="studio-eyebrow">{t('designOutput')}</p>
            <h2>{aiOutput ? 'Designer-Ready Brief & Specs' : t('empty')}</h2>
          </div>
          <span className="flex items-center gap-1 font-mono text-2xs text-cyan-300">
            <Bot className="h-3 w-3" /> AI Studio Engine
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300 mb-3" />
            <p className="text-sm font-bold text-zinc-300">Generating composition, color contrast & CTR checklist...</p>
          </div>
        ) : aiOutput ? (
          <article className="studio-output relative rounded-2xl border border-cyan-400/30 bg-surface-1 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">Thumbnail Blueprint</span>
              <button
                type="button"
                className="studio-copy"
                onClick={() => copy(aiOutput)}
              >
                <Copy className="h-3.5 w-3.5" /> {t('copy')}
              </button>
            </div>
            <div className="studio-ai-output">
              {/* 2026-08-12 audit: model markdown is rendered, not dumped raw */}
              <MarkdownLite text={aiOutput} />
            </div>
          </article>
        ) : (
          <div className="studio-empty">
            <Sparkles className="h-7 w-7 text-zinc-600" />
            <p>{t('intro')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
