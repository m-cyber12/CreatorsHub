/**
 * Video Utilities for Noxifera
 * Handles robust detection and formatting for direct videos (MP4/WebM), YouTube, and Vimeo.
 */

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return /(?:youtu\.be|youtube\.com)/i.test(url);
}

export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.slice(1).split(/[?#&]/)[0];
      if (id && id.length === 11) return id;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'v', 'live'].includes(pathParts[0]) && pathParts[1]) {
        return pathParts[1].slice(0, 11);
      }
    }
  } catch {
    /* fallback to regex */
  }
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/|live\/))([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(url?: string | null, autoplay = true): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  const autoParam = autoplay ? '1' : '0';
  const muteParam = autoplay ? '1' : '0';
  // Use youtube.com (not nocookie) — nocookie blocks many videos with "Video unavailable"
  // youtube.com is more permissive and handles age-restricted / ad-supported videos better.
  // For hover previews we loop via playlist param; for modal we keep controls.
  const loopPart = autoplay ? `&loop=1&playlist=${id}` : '';
  const base = `https://www.youtube.com/embed/${id}?autoplay=${autoParam}&mute=${muteParam}&rel=0&modestbranding=1&playsinline=1&controls=1&iv_load_policy=3&enablejsapi=1${loopPart}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${base}&origin=${encodeURIComponent(window.location.origin)}`;
  }
  return base;
}

export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function isVimeoUrl(url?: string | null): boolean {
  if (!url) return false;
  return /vimeo\.com/i.test(url);
}

export function getVimeoVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match ? match[1] : null;
}

export function getVimeoEmbedUrl(url?: string | null, autoplay = true): string | null {
  const id = getVimeoVideoId(url);
  if (!id) return null;
  const autoParam = autoplay ? '1' : '0';
  const loopPart = autoplay ? '&loop=1&background=1' : '';
  return `https://player.vimeo.com/video/${id}?autoplay=${autoParam}&muted=${autoplay ? 1 : 0}&responsive=1${loopPart}`;
}

export function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  if (isYouTubeUrl(url) || isVimeoUrl(url)) return false;
  return /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(url) || url.includes('/storage/v1/object/public/tool-images/');
}

export function getVideoType(url?: string | null): 'youtube' | 'vimeo' | 'direct' | 'none' {
  if (!url) return 'none';
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVimeoUrl(url)) return 'vimeo';
  if (isDirectVideoUrl(url)) return 'direct';
  return 'none';
}

export function getVideoEmbedUrl(url?: string | null, autoplay = true): string | null {
  if (!url) return null;
  if (isYouTubeUrl(url)) return getYouTubeEmbedUrl(url, autoplay);
  if (isVimeoUrl(url)) return getVimeoEmbedUrl(url, autoplay);
  if (isDirectVideoUrl(url)) return url;
  return null;
}

export function getVideoThumbnail(url?: string | null): string | null {
  if (!url) return null;
  if (isYouTubeUrl(url)) return getYouTubeThumbnail(url);
  return null;
}
