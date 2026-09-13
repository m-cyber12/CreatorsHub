import type { Playbook } from '../playbooks';

export const opusclip: Playbook = {
  slug: 'opusclip',
  title: 'OpusClip Playbook',
  oneLiner: 'Turn one long video into a week of ranked shorts — then stop publishing the ones nobody should see.',
  bestFor: ['Podcasters with long-form episodes', 'Coaches & educators', 'Agencies repurposing client content'],
  setup: [
    { title: 'Connect your source', body: 'Link YouTube (best for automatic pulls) or upload files. Feed it 3–4 finished episodes first so the ranking has a real sample to work on.', tip: 'Unlisted YouTube uploads work if you are not ready for the episode to be public.' },
    { title: 'Set your brand profile', body: 'Colors, logo watermark, and caption style. Clips that look like the brand convert; clips that look like a template get scrolled past.', tip: 'Keep the watermark small and in the top corner — not over the speaker.' },
    { title: 'Decide your length targets', body: 'TikTok: 30–45s. Shorts/Reels: 30–60s. Set the clip length range instead of letting it vary wildly — consistency trains your audience.' },
  ],
  workflow: [
    { title: 'Pull the week’s content', body: 'Every time a long video ships, send it through OpusClip. It returns clips scored by predicted performance (0–100).' },
    { title: 'Review the top five, not the top one', body: 'Open the highest-scoring clips and watch them fully. Check: does it start mid-thought? Does it end cleanly? Does the caption track the words? Fix cuts in the built editor.' },
    { title: 'Add the human layer', body: 'Swap a weak hook for the punchiest 3 seconds you have, add B-roll to static moments, and write the title yourself — the AI title is a starting point, not a finish.' },
    { title: 'Export per platform, publish same day', body: 'Export 9:16 for each platform with the hook-first title. Fresh clips outperform re-uploaded ones; aim for the 24-hour window.' },
  ],
  proMoves: [
    { title: 'Batch-rank across episodes', body: 'Run a full month of episodes and rank all clips together. The pattern is useful: the same three moments always win in your niche. That is your content map.' },
    { title: 'A/B the hook, keep the body', body: 'Take one clip and make three versions with different first 3 seconds. Publish them on different days. The hook is 80% of the short’s performance.' },
    { title: 'Funnel back to long-form', body: 'Pin a comment with the full episode link on every clip. Shorts are the discovery layer; the long video is where the relationship happens.' },
  ],
  mistakes: [
    'Publishing the highest-scored clip without watching it — the score predicts engagement, not correctness, and it happily scores a clip that ends mid-sentence.',
    'Ignoring awkward cuts at topic changes. One hard jump in the first 5 seconds kills the watch.',
    'Treating the AI captions as final. They miss jargon and names constantly.',
    'Expecting shorts to replace long-form. They are the top of the funnel, not the funnel.',
  ],
  faq: [
    { q: 'Does OpusClip replace an editor?', a: 'No. It finds the moments and does the rough cut. The final 20% — hook, B-roll, title, caption fixes — is still yours, and it is where the quality gap shows.' },
    { q: 'What does the free tier give you?', a: 'A limited monthly clip allowance with a watermark. It is enough to validate the workflow before paying; not enough for a channel.' },
    { q: 'What clip length actually works?', a: '30–45 seconds for TikTok, 30–60 for Shorts and Reels. Longer is fine only if every second earns the next — test one longer clip per month, not as the default.' },
  ],
};
