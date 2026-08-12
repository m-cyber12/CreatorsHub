'use client';
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, ImageIcon, Palette, RefreshCcw, WandSparkles } from 'lucide-react';
import { StudioSelect } from './StudioSelect';

type Meta = { width: number; height: number; size: number; type: string };
const targets: Record<string, [number, number]> = {
  'YouTube thumbnail': [1280, 720],
  'Shorts cover': [1080, 1920],
  TikTok: [1080, 1920],
  Instagram: [1080, 1080],
  'Instagram portrait': [1080, 1350],
};
const fmt = (n: number) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);

function paletteFrom(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = 72;
  canvas.height = 72;
  const c = canvas.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(image, 0, 0, 72, 72);
  const data = c.getImageData(0, 0, 72, 72).data;
  const buckets = new Map<string, number>();
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    if (Math.max(r, g, b) - Math.min(r, g, b) < 12) continue;
    const key = `rgb(${r}, ${g}, ${b})`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([x]) => x);
}

export function ImageTools() {
  const t = useTranslations('studio.it');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [target, setTarget] = useState('YouTube thumbnail');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(0.86);
  const [mode, setMode] = useState<'fit' | 'crop'>('crop');
  const [palette, setPalette] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setMeta({ width: img.naturalWidth, height: img.naturalHeight, size: f.size, type: f.type || t('unknown') });
      setPalette(paletteFrom(img));
      setMessage('');
    };
    img.src = URL.createObjectURL(f);
  };

  const exportImage = () => {
    if (!image || !file) return;
    const [tw, th] = targets[target];
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d')!;
    if (format === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, tw, th); }
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = tw / th;
    let sx = 0, sy = 0, sw = image.naturalWidth, sh = image.naturalHeight;
    if (mode === 'crop') {
      if (sourceRatio > targetRatio) { sw = image.naturalHeight * targetRatio; sx = (image.naturalWidth - sw) / 2; }
      else { sh = image.naturalWidth / targetRatio; sy = (image.naturalHeight - sh) / 2; }
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, tw, th);
    } else {
      const scale = Math.min(tw / image.naturalWidth, th / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(image, (tw - w) / 2, (th - h) / 2, w, h);
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = format.split('/')[1].replace('jpeg', 'jpg');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${file.name.replace(/\.[^.]+$/, '')}-${tw}x${th}.${ext}`;
        a.click();
        URL.revokeObjectURL(a.href);
        setMessage(`Exported ${tw} × ${th} ${ext.toUpperCase()} locally.`);
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[.82fr_1.18fr]">
      <section className="studio-form-card">
        <h2>{t('chooseImage')}</h2>
        <label className="studio-file-input">
          <ImageIcon className="h-5 w-5" />
          <span>{file ? file.name : t('selectPrompt')}</span>
          <input aria-label={t('selectFile')} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {meta && (
          <div className="studio-meta-grid">
            <span>{meta.width} × {meta.height}</span>
            <span>{fmt(meta.size)}</span>
            <span>{meta.type.replace('image/', '').toUpperCase()}</span>
          </div>
        )}
        <label>
          {t('targetPreset')}
          <StudioSelect ariaLabel={t('targetPreset')} value={target} onChange={setTarget} options={Object.keys(targets).map((value) => ({ value, label: value, description: `${targets[value][0]} × ${targets[value][1]}` }))} />
        </label>
        <label>
          {t('fitMethod')}
          <StudioSelect ariaLabel={t('fitMethod')} value={mode} onChange={(value) => setMode(value as 'fit' | 'crop')} options={[{ value: 'crop', label: t('fitCover') }, { value: 'fit', label: t('fitContain') }]} />
        </label>
        <label>
          {t('exportFormat')}
          <StudioSelect ariaLabel={t('exportFormat')} value={format} onChange={(value) => setFormat(value as typeof format)} options={[{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }, { value: 'image/webp', label: 'WebP' }]} />
        </label>
        {format !== 'image/png' && (
          <label>
            {t('quality')} <span className="studio-range-value">{Math.round(quality * 100)}%</span>
            <input className="studio-range" type="range" min="0.4" max="1" step="0.02" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
          </label>
        )}
        <button className="studio-generate" disabled={!image} onClick={exportImage}>
          <Download className="h-4 w-4" /> {t('resizeDownload')}
        </button>
        <p className="studio-help">{t('canvasNote')}</p>
      </section>

      <section className="studio-results">
        {image ? (
          <>
            <div className="studio-results-heading">
              <div>
                <p className="studio-eyebrow">{t('localPreview')}</p>
                <h2>{t('inspectExport')}</h2>
              </div>
              <span>{targets[target][0]} × {targets[target][1]}</span>
            </div>
            <img className="studio-image-preview" src={preview} alt={t('selectedPreview')} />
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-cyan-300" />
                <h3 className="text-sm font-bold">{t('palette')}</h3>
              </div>
              <div className="studio-palette">
                {palette.map((c) => <span key={c} title={c} style={{ background: c }} />)}
              </div>
            </div>
            {message && <p className="studio-success"><WandSparkles className="h-4 w-4" />{message}</p>}
          </>
        ) : (
          <div className="studio-empty">
            <ImageIcon className="h-7 w-7" />
            <p>{t('selectNote')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
