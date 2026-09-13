import type { WorkflowTemplate } from '../workflows';

export const youtubeLongForm: WorkflowTemplate = {
  slug: 'youtube-long-form',
  title: 'Topic → Publish-Ready Long Video',
  oneLiner: 'The talking-head long-form pipeline: source-backed research, a structured script, a text-based edit, studio-clean audio and packaging that earns the click.',
  frequency: '1–2 / week',
  nodes: [
    {
      id: 'research',
      label: 'Source-backed research',
      tool: 'notebooklm',
      alternatives: ['claude', 'chatgpt'],
      input: 'Topic + your top sources',
      output: 'One-page research brief with numbered sources',
      minutes: 30,
      instructions:
        'Upload the 5–8 sources you will actually cite and generate a source-backed brief — grounding beats general knowledge for anything with numbers or claims in it. Every claim that survives to the script keeps its source number; anything without one is opinion, and gets labelled as such.',
      prompt:
        'From these sources, produce a one-page research brief: the 5 strongest claims (each with its source number), 2 tensions or disagreements between sources, and 3 concrete examples or numbers I can show on screen. Nothing from your own knowledge unless marked [UNVERIFIED].',
    },
    {
      id: 'script',
      label: 'Script & outline',
      tool: 'claude',
      alternatives: ['chatgpt', 'notebooklm'],
      input: 'Research brief',
      output: 'Numbered-section script with visual notes',
      minutes: 40,
      instructions:
        'Structure before prose: the section order is the video. Each section gets a claim, a proof, and a forward pull. Mark visual notes [VISUAL: ...] inline so the edit step has a shot list, not a guess. Read the opening aloud — if you would skip it, rewrite it.',
      prompt:
        'Turn this research brief into a video script. Structure: cold open (10s, strongest claim), context (what the viewer should care about), 4–6 sections each with claim → proof → forward pull, and an end that points to the next logical video. Number every sourced claim with its source number. Mark [VISUAL] notes where a screen or prop should appear.',
    },
    {
      id: 'record',
      label: 'Record & text-edit',
      tool: 'descript',
      alternatives: ['capcut'],
      input: 'Recorded takes + script',
      output: 'Cut video, transcript-edited',
      minutes: 60,
      instructions:
        'Record against the script, not in one take. Edit the transcript: delete silences and stumbles like text, mild filler removal only (a heavy pass sounds like a chatbot). Keep the [VISUAL] moments in the cut — they are the edit plan.',
    },
    {
      id: 'audio',
      label: 'Audio polish',
      tool: 'adobe-podcast',
      alternatives: ['descript-overdub', 'descript'],
      input: 'Cut video audio',
      output: 'Studio-clean voice track',
      minutes: 15,
      instructions:
        'Studio Sound (or equivalent) on the voice track; if one mispronounced word survived the edit, overdub just that line in your cloned voice instead of re-recording the segment. Music low and consistent under the voice, never under the key claims.',
    },
    {
      id: 'thumbnail',
      label: 'Thumbnail & packaging',
      tool: 'canva',
      alternatives: ['adobe-express', 'midjourney'],
      input: 'Final cut + title options',
      output: 'Thumbnail + title + chapters',
      minutes: 20,
      instructions:
        'Three thumbnail concepts tested at 120px wide. Chapters on (they change skip behaviour on long videos) and end screens that point to the next logical video. The title is a promise the first 30 seconds must keep.',
    },
    {
      id: 'publish',
      label: 'SEO & publish',
      tool: 'tubebuddy',
      alternatives: ['vidiq', 'viewstats'],
      input: 'Video + packaging',
      output: 'Published video with researched metadata',
      minutes: 15,
      instructions:
        'Research the search intent before writing the description. First 120 characters of the description are the visible ones — front-load the promise. Pin the comment with the one thing you want viewers to do next.',
    },
  ],
  notes: [
    'The research step is the moat: a video where every number has a source survives fact-check comments; a video where they do not, does not.',
    'Text-editing a 25-minute video is faster and better than timeline editing — but only if the transcript is fixed first (names, jargon, acronyms).',
    '1080p is the standard for talking-head; save 4K for client work. Upload tax is real.',
  ],
};
