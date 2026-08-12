'use client';
/* eslint-disable jsx-a11y/label-has-associated-control */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, RefreshCcw, Sparkles, Loader2, Bot } from 'lucide-react';
import { StudioSelect } from './StudioSelect';
import { useStudioQuota } from '@/context/StudioQuotaContext';
import { studioAuthHeaders } from '@/lib/studioAuthClient';

const initial = {
  output: 'Image',
  topic: '',
  audience: '',
  style: 'Cinematic Photorealistic',
  platform: 'YouTube',
  ratio: '16:9',
  required: '',
  avoid: '',
};

const fieldClass = 'studio-field';

function CopyButton({ value, t }: { value: string; t: (k: string, p?: Record<string, string>) => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="studio-copy"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      aria-label={t('copyOutput')}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

export function PromptBuilder() {
  const t = useTranslations('studio.pb');
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'ai_cloud_model' | 'smart_creator_engine'>('smart_creator_engine');
  const { consumeQuota } = useStudioQuota();

  const update = (key: keyof typeof initial, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check and decrement daily AI quota
    const allowed = consumeQuota('prompt-builder');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await studioAuthHeaders()) },
        body: JSON.stringify({
          tool: 'prompt-builder',
          prompt: form.topic,
          category: form.output,
          platform: form.platform,
          style: form.style,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setAiOutput(data.result);
        setAiSource(data.source || 'smart_creator_engine');
      }
    } catch {
      // Fallback
      setAiOutput(`### 🎬 Generated ${form.output} Prompt for ${form.topic}\n\nCinematic, 8k render, ${form.style}, aspect ratio ${form.ratio}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[.86fr_1.14fr]">
      <form className="studio-form-card" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <h2>{t('buildBrief')}</h2>
          <button
            type="button"
            className="studio-reset"
            onClick={() => {
              setForm(initial);
              setAiOutput(null);
            }}
          >
            <RefreshCcw className="h-3.5 w-3.5" /> {t('reset')}
          </button>
        </div>

        <label>
          {t('outputType')}
          <StudioSelect
            ariaLabel={t('outputType')}
            value={form.output}
            onChange={(value) => update('output', value)}
            options={['Image', 'Video', 'Thumbnail', 'Script', 'Avatar', 'B-roll'].map((value) => ({
              value,
              label: value,
            }))}
          />
        </label>

        <label>
          {t('mainSubject')}
          <textarea
            className={fieldClass}
            required
            rows={2}
            value={form.topic}
            onChange={(e) => update('topic', e.target.value)}
            placeholder={t('subjectPlaceholder')}
          />
        </label>

        <label>
          {t('audience')}
          <input
            className={fieldClass}
            value={form.audience}
            onChange={(e) => update('audience', e.target.value)}
            placeholder={t('audiencePlaceholder')}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label>
            {t('styleTone')}
            <input
              className={fieldClass}
              value={form.style}
              onChange={(e) => update('style', e.target.value)}
            />
          </label>
          <label>
            {t('platform')}
            <StudioSelect
              ariaLabel={t('platform')}
              value={form.platform}
              onChange={(value) => update('platform', value)}
              options={['YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'Generic'].map((value) => ({
                value,
                label: value,
              }))}
            />
          </label>
        </div>

        <label>
          {t('aspectRatio')}
          <StudioSelect
            ariaLabel={t('aspectRatio')}
            value={form.ratio}
            onChange={(value) => update('ratio', value)}
            options={['16:9', '9:16', '1:1', '4:5'].map((value) => ({ value, label: value }))}
          />
        </label>

        <button
          className="studio-generate flex items-center justify-center gap-2"
          type="submit"
          disabled={loading || !form.topic.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? 'Generating with AI...' : t('generate')}</span>
        </button>
      </form>

      <section className="studio-results" aria-live="polite">
        <div className="studio-results-heading">
          <div>
            <p className="studio-eyebrow">{t('output')}</p>
            <h2>{aiOutput ? 'Generated Creator Brief & Prompts' : t('emptyHeading')}</h2>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-2xs text-cyan-300">
            <Bot className="h-3.5 w-3.5" />
            {aiSource === 'ai_cloud_model' ? 'AI Cloud Engine' : 'Studio Engine'}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300 mb-3" />
            <p className="text-sm font-bold text-zinc-300">Crafting cinematic prompt parameters...</p>
          </div>
        ) : aiOutput ? (
          <div className="space-y-4">
            <article className="studio-output relative rounded-2xl border border-cyan-400/30 bg-surface-1 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  Ready to Copy & Use
                </span>
                <CopyButton value={aiOutput} t={t} />
              </div>
              <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-mono text-zinc-200">
                {aiOutput}
              </div>
            </article>
          </div>
        ) : (
          <div className="studio-empty">
            <Sparkles className="h-7 w-7 text-zinc-500" />
            <p>{t('emptyText')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
