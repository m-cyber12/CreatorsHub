import type { WorkflowTemplate } from '../workflows';

export const podcastToShorts: WorkflowTemplate = {
  slug: 'podcast-to-shorts',
  title: 'One Episode → 10 Publishable Shorts',
  oneLiner: 'The highest-leverage repurposing pipeline: a 60-minute episode becomes a week of ranked, captioned shorts — without re-recording anything.',
  frequency: 'Weekly',
  nodes: [
    {
      id: 'import',
      label: 'Import & transcript',
      tool: 'descript',
      alternatives: ['adobe-podcast', 'whisper'],
      input: 'Raw episode audio (MP3/WAV)',
      output: 'Clean transcript + noise-cleaned audio',
      minutes: 15,
      instructions:
        'Import the finished episode. Run Studio Sound, remove long pauses (not all of them — keep the breathing), and save a custom glossary for your recurring names and terms. The transcript becomes the raw material every later step reads from, so fix the five names that matter before anything else.',
    },
    {
      id: 'highlights',
      label: 'Highlight detection',
      tool: 'opusclip',
      alternatives: ['vizard', 'wisecut', '1of10'],
      input: 'Full episode video or audio',
      output: '15–20 scored clip candidates',
      minutes: 10,
      instructions:
        'Send the episode through the clipper and ask for 15–20 candidates in the 30–60 second range, not 5 perfect ones. You want a ranking pool — the score predicts engagement, not correctness, so treat it as a shortlist, not a verdict.',
      prompt:
        'Find the 15 strongest 30–60 second moments for short-form video: complete thoughts, no cold open, each one understandable to someone who never heard the episode. Prioritise moments with a strong claim, a story, or a concrete example over general advice.',
    },
    {
      id: 'edit',
      label: 'Cut the top 10',
      tool: 'capcut',
      alternatives: ['descript', 'veed'],
      input: '10 shortlist clips',
      output: '10 edited shorts, hook-first',
      minutes: 45,
      instructions:
        'Watch each clip fully before touching it. Move the punchiest 3 seconds to the front, cut topic jumps, and add B-roll to any static stretch. Ten clips at four minutes each beats twenty clips at one minute — this step is where the quality gap shows.',
    },
    {
      id: 'captions',
      label: 'Captions & style',
      tool: 'captions',
      alternatives: ['checksub', 'zeemo'],
      input: '10 edited shorts',
      output: 'Styled, checked captions',
      minutes: 20,
      instructions:
        'Generate captions, then read every line — auto captions mangle the exact names your glossary exists for. Highlight 2–3 keyword words per line in the brand colour. If a caption line does not match the audio, fix the clip, not the caption.',
    },
    {
      id: 'qa',
      label: 'Quality check',
      manual: true,
      alternatives: [],
      input: '10 captioned shorts',
      output: '10 publish-ready files + titles',
      minutes: 15,
      instructions:
        'One pass per clip, on a phone: does it start mid-thought? Does it end cleanly? Does the caption track the words? Write the title yourself — the AI title is a starting point. Write down which three clips you would skip watching; those are your last-to-publish, not your delete pile.',
    },
    {
      id: 'publish',
      label: 'Export & publish',
      tool: 'tubebuddy',
      alternatives: ['vidiq', 'viewstats'],
      input: '10 final shorts',
      output: 'Scheduled week of content + funnel links',
      minutes: 15,
      instructions:
        'Export 9:16 at 1080p per platform. Stagger the schedule (2–3 per day) instead of dumping all ten at once. Pin a comment with the full episode link on every clip — the shorts are discovery, the episode is where the relationship happens.',
    },
  ],
  notes: [
    'The score is a shortlist tool, not a verdict: publishing the top-5-by-score without watching them is the most common way this pipeline produces embarrassing content.',
    'Batch a full month of episodes and rank everything together. The same three moment-types will keep winning in your niche — that pattern is worth more than any single clip.',
    'Keep the funnel honest: a pinned comment beats a bio link, and a bio link beats nothing. Measure which clips actually drive episode listens before you scale the cadence.',
  ],
};
