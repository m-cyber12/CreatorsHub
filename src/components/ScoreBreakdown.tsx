import { useTranslations } from 'next-intl';
import { computeOverall, type ToolScores, type ToolVerdict } from '@/data/tools';

/**
 * Multi-dimensional score display (audit fix 2.1, 4.3).
 *
 * The old UI showed five stars for a rating where every tool scored 4.1–4.9
 * and none below 4.0 — five stars cannot resolve that range, so every card
 * looked identical and the score carried no information.
 *
 * Horizontal bars over a 0–10 scale with monospace tabular numerals make
 * differences legible at a glance, in the visual language of a measurement
 * tool rather than an app store.
 */

type Dim = { key: keyof ToolScores; labelKey: string; hintKey: string };
const DIMENSIONS: Dim[] = [
  { key: 'outputQuality', labelKey: 'quality', hintKey: 'qualityHint' },
  { key: 'speed', labelKey: 'speed', hintKey: 'speedHint' },
  { key: 'easeOfUse', labelKey: 'ease', hintKey: 'easeHint' },
  { key: 'valueForMoney', labelKey: 'value', hintKey: 'valueHint' },
  { key: 'exportFreedom', labelKey: 'export', hintKey: 'exportHint' },
];

function barColor(v: number) {
  if (v >= 8) return 'bg-emerald-400';
  if (v >= 6) return 'bg-accent-400';
  if (v >= 4) return 'bg-orange-400';
  return 'bg-rose-400';
}

export function ScoreBreakdown({
  scores,
  verdict,
}: {
  scores: ToolScores;
  verdict?: ToolVerdict;
}) {
  const t = useTranslations('components.scoreBreakdown');
  const overall = computeOverall(scores);

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">{t('howItScored')}</h2>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-black tabular-nums text-white">
            {overall.toFixed(1)}
          </span>
          <span className="text-sm text-zinc-500">{t('overallSuffix')}</span>
        </div>
      </div>

      <dl className="space-y-3">
        {DIMENSIONS.map(({ key, labelKey, hintKey }) => {
          const value = scores[key];
          const label = t(labelKey);
          const hint = t(hintKey);
          return (
            <div key={key} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
              <dt className="text-sm text-zinc-300" title={hint}>
                {label}
              </dt>
              <dd
                className="h-2 overflow-hidden rounded-full bg-surface-3"
                role="meter"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-label={t('meterAria', { label, value: value.toFixed(1) })}
              >
                <div
                  className={`h-full rounded-full ${barColor(value)}`}
                  style={{ width: `${value * 10}%` }}
                />
              </dd>
              <span className="font-mono text-sm font-bold tabular-nums text-zinc-200">
                {value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 text-2xs text-zinc-500">{t('overallNote')}</p>

      {verdict && (
        <div className="mt-5 grid gap-3 border-t border-white/5 pt-5 sm:grid-cols-2">
          <div>
            <h3 className="text-2xs font-bold uppercase tracking-wider text-emerald-400">
              {t('bestFor')}
            </h3>
            <p className="mt-1 text-sm text-zinc-300">{verdict.bestFor}</p>
          </div>
          <div>
            <h3 className="text-2xs font-bold uppercase tracking-wider text-rose-400">{t('skipIf')}</h3>
            <p className="mt-1 text-sm text-zinc-300">{verdict.skipIf}</p>
          </div>
        </div>
      )}
    </section>
  );
}
