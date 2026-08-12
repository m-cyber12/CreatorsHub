'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Copy, Download, FileText, RefreshCcw, WandSparkles } from 'lucide-react';

const sample = `1
00:00:01,000 --> 00:00:03,200
Welcome back to the channel.

2
00:00:03,400 --> 00:00:05,800
Welcome back to the channel.

3
00:00:06,000 --> 00:00:08,000
Let’s make this clear.`;

const stamp = /^(\d{2}):(\d{2}):(\d{2})[,. ](\d{3})$/;
const ms = (s: string) => {
  const m = s.match(stamp);
  return m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) * 1000 + +m[4] : -1;
};

function clean(value: string) {
  const blocks = value.replace(/\r/g, '').trim().split(/\n\s*\n/);
  let prev = '';
  return blocks
    .map((b) => b.split('\n').filter((line, i) => !(i === 0 && /^\d+$/.test(line.trim()))))
    .filter((lines) => {
      const text = lines.slice(1).join(' ').trim().toLowerCase();
      if (!text || text === prev) return false;
      prev = text;
      return true;
    })
    .map((lines, i) => `${i + 1}\n${lines.join('\n')}`)
    .join('\n\n');
}

function srtVtt(value: string, toVtt: boolean) {
  let out = value.replace(/\r/g, '').trim();
  if (toVtt) {
    out = out.replace(/^\d+\n/gm, '').replace(/,/g, '.');
    return `WEBVTT\n\n${out}`;
  }
  return out.replace(/^WEBVTT\s*/, '').trim().replace(/\./g, ',').split(/\n\s*\n/).map((b, i) => `${i + 1}\n${b}`).join('\n\n');
}

export function SubtitleTools() {
  const t = useTranslations('studio.st');
  const [text, setText] = useState(sample);
  const [result, setResult] = useState('');
  const [report, setReport] = useState<string[]>([]);

  const run = (action: 'clean' | 'vtt' | 'srt' | 'validate' | 'lines') => {
    if (action === 'clean') {
      setResult(clean(text));
      setReport([t('msgDedup')]);
    }
    if (action === 'vtt') {
      setResult(srtVtt(text, true));
      setReport([t('msgVtt')]);
    }
    if (action === 'srt') {
      setResult(srtVtt(text, false));
      setReport([t('msgCueNumbers')]);
    }
    if (action === 'validate') {
      const cues = [...text.matchAll(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}[,.]\d{3})/g)];
      const issues = cues.flatMap((m, i) => {
        const x = [] as string[];
        if (ms(m[1]) >= ms(m[2])) x.push(`Cue ${i + 1}: end time must come after start time.`);
        if (i && ms(m[1]) < ms(cues[i - 1][2])) x.push(`Cue ${i + 1}: overlaps the previous cue.`);
        return x;
      });
      setReport(issues.length ? issues : [`Valid: ${cues.length} timestamp cue${cues.length === 1 ? '' : 's'} found; no ordering or overlap issue detected.`]);
      setResult('');
    }
    if (action === 'lines') {
      const lines = text.replace(/\r/g, '').split('\n').filter((x) => x && !/^\d+$/.test(x) && !x.includes('-->'));
      const issues = lines.filter((x) => x.length > 42).map((x) => `Long line (${x.length} characters): “${x}”`);
      setReport(issues.length ? issues : [`All ${lines.length} dialogue line${lines.length === 1 ? '' : 's'} are 42 characters or fewer.`]);
      setResult('');
    }
  };

  const download = () => {
    const content = result || text;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = result?.startsWith('WEBVTT') ? 'captions.vtt' : 'captions.srt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2">
      <section className="studio-form-card">
        <div className="flex justify-between gap-4">
          <h2>{t('yourFile')}</h2>
          <button className="studio-reset" onClick={() => { setText(sample); setResult(''); setReport([]); }}>
            <RefreshCcw className="h-3.5 w-3.5" /> {t('sample')}
          </button>
        </div>
        <label>
          {t('paste')}
          <textarea className="studio-subtitle-editor" aria-label={t('paste')} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="studio-action-grid">
          <button onClick={() => run('clean')}><WandSparkles />{t('cleanSrt')}</button>
          <button onClick={() => run('vtt')}>{t('srt2vtt')}</button>
          <button onClick={() => run('srt')}>{t('vtt2srt')}</button>
          <button onClick={() => run('validate')}>{t('validate')}</button>
          <button onClick={() => run('lines')}>{t('checkLength')}</button>
        </div>
        <p className="studio-help">{t('toolNote')}</p>
      </section>

      <section className="studio-results">
        <div className="studio-results-heading">
          <div>
            <p className="studio-eyebrow">{t('localOutput')}</p>
            <h2>{result ? t('converted') : t('checksReports')}</h2>
          </div>
          <span>{t('noUpload')}</span>
        </div>
        {result && (
          <>
            <textarea className="studio-subtitle-editor" aria-label={t('output')} readOnly value={result} />
            <div className="mt-3 flex gap-2">
              <button className="studio-copy" onClick={() => navigator.clipboard.writeText(result)}>
                <Copy className="h-4 w-4" /> {t('copy')}
              </button>
              <button className="studio-copy" onClick={download}>
                <Download className="h-4 w-4" /> {t('download')}
              </button>
            </div>
          </>
        )}
        {report.length > 0 ? (
          <ul className="studio-report">
            {report.map((x, i) => (
              <li key={i}><CheckCircle2 className="h-4 w-4" />{x}</li>
            ))}
          </ul>
        ) : (
          !result && (
            <div className="studio-empty">
              <FileText className="h-7 w-7" />
              <p>{t('pasteNote')}</p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
