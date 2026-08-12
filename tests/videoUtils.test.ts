import { describe, it, expect } from 'vitest';
import {
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeEmbedUrl,
  isVimeoUrl,
  getVimeoVideoId,
  getVimeoEmbedUrl,
  isDirectVideoUrl,
  getVideoType,
} from '@/lib/videoUtils';

describe('videoUtils', () => {
  it('identifies YouTube watch, short, and shortlink URLs correctly', () => {
    const urls = [
      'https://www.youtube.com/watch?v=kC7xR2rZ5Yk',
      'https://youtu.be/kC7xR2rZ5Yk',
      'https://www.youtube.com/shorts/kC7xR2rZ5Yk',
      'https://youtube.com/embed/kC7xR2rZ5Yk',
    ];
    for (const u of urls) {
      expect(isYouTubeUrl(u)).toBe(true);
      expect(getYouTubeVideoId(u)).toBe('kC7xR2rZ5Yk');
      expect(getYouTubeEmbedUrl(u)).toContain('youtube-nocookie.com/embed/kC7xR2rZ5Yk');
      expect(getVideoType(u)).toBe('youtube');
    }
  });

  it('identifies Vimeo URLs correctly', () => {
    const vimeoUrl = 'https://vimeo.com/123456789';
    expect(isVimeoUrl(vimeoUrl)).toBe(true);
    expect(getVimeoVideoId(vimeoUrl)).toBe('123456789');
    expect(getVimeoEmbedUrl(vimeoUrl)).toContain('player.vimeo.com/video/123456789');
    expect(getVideoType(vimeoUrl)).toBe('vimeo');
  });

  it('identifies direct video file URLs (.mp4, .webm, storage)', () => {
    expect(isDirectVideoUrl('https://cdn.example.com/demo.mp4')).toBe(true);
    expect(isDirectVideoUrl('https://cdn.example.com/clip.webm?token=123')).toBe(true);
    expect(isDirectVideoUrl('https://xyz.supabase.co/storage/v1/object/public/tool-images/opus/123.mp4')).toBe(true);
    expect(getVideoType('https://cdn.example.com/demo.mp4')).toBe('direct');
  });

  it('returns none / false for invalid or null video URLs', () => {
    expect(isYouTubeUrl('')).toBe(false);
    expect(isYouTubeUrl(null)).toBe(false);
    expect(isVimeoUrl(undefined)).toBe(false);
    expect(isDirectVideoUrl('https://example.com/photo.jpg')).toBe(false);
    expect(getVideoType('https://example.com/about')).toBe('none');
  });
});
