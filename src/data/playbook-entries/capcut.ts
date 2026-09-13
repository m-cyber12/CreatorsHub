import type { Playbook } from '../playbooks';

export const capcut: Playbook = {
  slug: 'capcut',
  title: 'CapCut Playbook',
  oneLiner: 'The $0 editor that actually understands short-form — captions, trends, and pacing built in.',
  bestFor: ['Short-form creators on any budget', 'First-time video editors', 'Creators who need native platform pacing'],
  setup: [
    { title: 'Learn the auto tools first', body: 'Auto captions, auto cut (silence removal), and beat sync are 80% of short-form editing. Master those three before touching the timeline manually.', tip: 'Auto cut at “remove all pauses” is too aggressive — it removes the breaths that make speech sound human. Remove “long pauses only” first.' },
    { title: 'Set up a brand kit', body: 'Your two fonts, your two colors, your caption style, your intro block. Save it as a reusable style so every video ships looking like the same channel.' },
    { title: 'Know the safe zones', body: 'TikTok, Reels, and Shorts all cover the bottom ~20% and the right edge with their UI. Nothing important — names, key text, your face — goes in the covered zones.' },
  ],
  workflow: [
    { title: 'Import and auto-cut', body: 'Drop the footage, remove long pauses, reorder the strongest 3 seconds to the front. The hook is a placement decision before it is a writing one.' },
    { title: 'Auto captions + keyword highlights', body: 'Generate captions, fix the typos (always), and highlight the 2–3 keyword words per line in your brand color. Readability at phone size is the test.' },
    { title: 'Beat sync', body: 'Snap cuts and zooms to the music’s beats. A video that moves on the beat feels twice as produced as one that does not — it is one button with taste applied.' },
    { title: 'Export 1080×1920', body: '1080p is the platform standard; 4K only if the source demands it. Export, preview on an actual phone, not the desktop.' },
  ],
  proMoves: [
    { title: 'Keyframed punch-in', body: 'A slow scale from 100% to 110% over 3 seconds on the key line of the video. It is the single cheapest “cinematic” move in short-form and it costs one keyframe pair.' },
    { title: 'Green-screen talking head + B-roll', body: 'Screen-record your talking head on top of screen captures of the product you discuss. The most effective explainer format for SaaS and tutorials, all in-app.' },
    { title: 'Build your own template', body: 'Once the format works (hook → 3 points → CTA), save it as a template. Every future video is a fill-in, not a from-scratch edit — that is how 3×/week channels exist.' },
  ],
  mistakes: [
    'Important text under the platform UI. If the algorithm’s button covers your call-to-action, it does not exist.',
    'Trusting auto captions blindly. The typos are the difference between “watch this” and “what is this.”',
    'Trend-chasing with date-stamped templates. A trend past its peak is negative equity — your own format outlives the template.',
    'Editing only on desktop and never previewing on a phone. Phone playback is the final review, not the desktop.',
  ],
  faq: [
    { q: 'Is CapCut really free?', a: 'Yes, for individual use, including the core editing and caption tools. A Pro tier exists for a subset of features — most short-form workflows never need it.' },
    { q: 'Desktop or mobile?', a: 'Desktop (Windows/Mac) for anything with more than a few clips; mobile for quick on-the-day edits. The desktop version has no watermark on standard exports.' },
    { q: 'What export settings?', a: '1080×1920, 30fps for talking content, 60fps only for fast motion. Default bitrate is fine — the platforms re-encode everything anyway.' },
  ],
};
