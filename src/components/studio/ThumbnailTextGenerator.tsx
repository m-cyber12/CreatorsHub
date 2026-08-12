'use client';
/* eslint-disable jsx-a11y/label-has-associated-control */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, Sparkles, Loader2, Bot } from 'lucide-react';
import { StudioSelect } from './StudioSelect';
import { useStudioQuota } from '@/context/StudioQuotaContext';
import { MarkdownLite } from './MarkdownLite';
import { studioAuthHeaders } from '@/lib/studioAuthClient';

export function ThumbnailTextGenerator() {
  const t = useTranslations('studio.tt');
  const [f, setF] = useState({ topic: '', type: 'Tutorial', tone: 'Viral Hook', max: 4 });
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const { consumeQuota } = useStudioQuota();

  const copy = async (value: string) => navigator.clipboard.writeText(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allowed = consumeQuota('thumbnail-text');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await studioAuthHeaders()) },
        body: JSON.stringify({
          tool: 'thumbnail-text',
          topic: f.topic,
          category: f.type,
          style: f.tone,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setAiOutput(data.result);
      }
    } catch {
      setAiOutput(`1. I Tested ${f.topic || 'AI Tools'} So You Don't Have To\n2. The Secret ${f.topic || 'AI'} Strategy in 2026\n3. Stop Wasting Hours Editing!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[.72fr_1.28fr]">
      <form className="studio-form-card" onSubmit={handleSubmit}>
        <h2>{t('setConstraint')}</h2>
        <label>
          {t('topic')}
          <textarea
            className="studio-field"
            required
            rows={2}
            value={f.topic}
            onChange={(e) => setF({ ...f, topic: e.target.value })}
            placeholder={t('topicPlaceholder')}
          />
        </label>
        <label>
          {t('contentType')}
          <StudioSelect
            ariaLabel={t('contentType')}
            value={f.type}
            onChange={(value) => setF({ ...f, type: value })}
            options={['Tutorial', 'Review', 'Challenge', 'News', 'Story', 'Comparison', 'Reaction'].map((value) => ({
              value,
              label: value,
            }))}
          />
        </label>
        <label>
          {t('tone')}
          <StudioSelect
            ariaLabel={t('tone')}
            value={f.tone}
            onChange={(value) => setF({ ...f, tone: value })}
            options={['Viral Hook', 'High Curiosity', 'MrBeast Style', 'Authoritative', 'Direct & Punchy'].map(
              (value) => ({ value, label: value })
            )}
          />
        </label>
        <button
          className="studio-generate flex items-center justify-center gap-2"
          disabled={loading || !f.topic.trim()}
          type="submit"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? t('analyzing') : t('generate')}</span>
        </button>
        <p className="studio-help">{t('generateHelp')}</p>
      </form>

      <section className="studio-results" aria-live="polite">
        <div className="studio-results-heading">
          <div>
            <p className="studio-eyebrow">{t('shortCopy')}</p>
            <h2>{aiOutput ? t('resultHeading') : t('keepShort')}</h2>
          </div>
          <span className="flex items-center gap-1 font-mono text-2xs text-cyan-300">
            <Bot className="h-3 w-3" /> {t('engineLabel')}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300 mb-3" />
            <p className="text-sm font-bold text-zinc-300">{t('analyzingLong')}</p>
          </div>
        ) : aiOutput ? (
          <article className="studio-output relative rounded-2xl border border-cyan-400/30 bg-surface-1 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">{t('highCtrFormulas')}</span>
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
            <Check className="h-7 w-7 text-zinc-600" />
            <p>{t('empty')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
