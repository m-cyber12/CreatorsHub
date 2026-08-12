'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Film, ImageIcon, MonitorCheck, Smartphone, Video } from 'lucide-react';

const human = (n: number) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);

export function VideoInspector() {
  const t = useTranslations('studio.vi');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [meta, setMeta] = useState<{ w: number; h: number; duration: number } | null>(null);
  const [poster, setPoster] = useState('');
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); if (poster) URL.revokeObjectURL(poster); }, [url, poster]);

  const select = (f?: File) => {
    if (!f) return;
    setFile(f);
    setMeta(null);
    setPoster('');
    setUrl(URL.createObjectURL(f));
  };

  const ratio = meta ? meta.w / meta.h : 0;

  const fit = useMemo(() => {
    if (!meta) return [];
    const vertical = ratio < 0.9;
    const wide = ratio > 1.5;
    return [
      { name: 'YouTube Shorts', ok: vertical, text: vertical ? t('tipFitShorts') : t('tipShorts') },
      { name: 'TikTok', ok: vertical, text: vertical ? t('tipFitTikTok') : t('tipVertical') },
      { name: 'YouTube', ok: wide, text: wide ? t('tipFitYoutube') : t('tip16x9') },
    ];
  }, [meta, ratio, t]);

  const frame = () => {
    const v = video.current;
    if (!v || !meta) return;
    const c = document.createElement('canvas');
    c.width = meta.w;
    c.height = meta.h;
    c.getContext('2d')!.drawImage(v, 0, 0);
    c.toBlob((b) => { if (b) setPoster(URL.createObjectURL(b)); }, 'image/jpeg', 0.92);
  };

  const downloadPoster = () => {
    if (!poster) return;
    const a = document.createElement('a');
    a.href = poster;
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'video'}-poster.jpg`;
    a.click();
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr]">
      <section className="studio-form-card">
        <h2>{t('selectVideo')}</h2>
        <label className="studio-file-input">
          <Video className="h-5 w-5" />
          <span>{file ? file.name : t('selectPrompt')}</span>
          <input aria-label={t('selectFile')} type="file" accept="video/*" onChange={(e) => select(e.target.files?.[0])} />
        </label>
        {file && (
          <div className="studio-meta-grid">
            <span>{human(file.size)}</span>
            <span>{file.type || t('unknownType')}</span>
          </div>
        )}
        {meta && (
          <>
            <div className="studio-video-facts">
              <span>{t('resolution')}<strong>{meta.w} × {meta.h}</strong></span>
              <span>{t('aspectRatio')}<strong>{ratio.toFixed(2)}:1</strong></span>
              <span>{t('duration')}<strong>{meta.duration.toFixed(1)} sec</strong></span>
            </div>
            <button className="studio-generate" onClick={frame}>
              <ImageIcon className="h-4 w-4" /> {t('extractPoster')}
            </button>
            <p className="studio-help">{t('metaNote')}</p>
          </>
        )}
      </section>

      <section className="studio-results">
        {url ? (
          <>
            <div className="studio-results-heading">
              <div>
                <p className="studio-eyebrow">{t('localInspection')}</p>
                <h2>{meta ? t('platformFit') : t('readingMeta')}</h2>
              </div>
              <span>{t('browserOnly')}</span>
            </div>
            <video
              ref={video}
              src={url}
              controls
              className="studio-video-preview"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                setMeta({ w: v.videoWidth, h: v.videoHeight, duration: v.duration });
              }}
            >
              <track kind="captions" />
            </video>
            {meta && (
              <div className="studio-fit-grid">
                {fit.map((x) => (
                  <article key={x.name} data-ok={x.ok}>
                    <div>{x.ok ? <MonitorCheck className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}<strong>{x.name}</strong></div>
                    <p>{x.text}</p>
                  </article>
                ))}
              </div>
            )}
            {poster && (
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">{t('posterFrame')}</h3>
                  <button className="studio-copy" onClick={downloadPoster}><Download className="h-4 w-4" /> {t('downloadJpg')}</button>
                </div>
                <img className="studio-poster" src={poster} alt={t('extracted')} />
              </div>
            )}
          </>
        ) : (
          <div className="studio-empty">
            <Film className="h-7 w-7" />
            <p>{t('selectNote')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
