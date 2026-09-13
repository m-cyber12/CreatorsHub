import type { WorkflowTemplate } from '../workflows';

export const facelessVideo: WorkflowTemplate = {
  slug: 'faceless-video',
  title: 'Idea → Finished Faceless Video',
  oneLiner: 'The full loop for a narration-and-visuals channel: script, voice, footage, edit, thumbnail and metadata — sized for a 3–4 hour weekly repeat.',
  frequency: '3–5 videos / week',
  nodes: [
    {
      id: 'script',
      label: 'Script',
      tool: 'claude',
      alternatives: ['chatgpt', 'notebooklm'],
      input: 'Video idea + target length',
      output: 'Word-for-word narration script',
      minutes: 30,
      instructions:
        'One idea per video. Write the hook as a sentence a stranger could understand, not a teaser. Keep every claim either sourced or labelled as opinion — the script is the only place a bad idea is cheap to kill.',
      prompt:
        'Write a narration script for a faceless YouTube video, 60–90 seconds per section. Requirements: open with the strongest claim in the first 10 seconds; one idea per section; no filler words; end each section with a forward pull to the next. Flag any claim that needs a source with [SOURCE].',
    },
    {
      id: 'voice',
      label: 'Voiceover',
      tool: 'elevenlabs',
      alternatives: ['murf-ai', 'speechify', 'lovo-ai'],
      input: 'Final script',
      output: 'WAV narration, loudness-normalised',
      minutes: 15,
      instructions:
        'Generate in 1–2 minute chunks, not one giant take — emotion flattens on long generations and a single bad line forces a full redo. Listen pass, regenerate the weak lines, export WAV, loudness-normalise before it touches the timeline.',
    },
    {
      id: 'visuals',
      label: 'Visuals',
      tool: 'invideo',
      alternatives: ['runway', 'midjourney', 'pictory'],
      input: 'Script + narration timeline',
      output: 'B-roll / generated shots per section',
      minutes: 30,
      instructions:
        'Map the script section-by-section to footage: one visual idea per script beat. Generate shots in 4–5 second units and cut them — long holds expose motion artifacts, the edit hides them. Put all text in the editor as overlays, never inside the generated frame.',
    },
    {
      id: 'edit',
      label: 'Edit & assemble',
      tool: 'capcut',
      alternatives: ['descript', 'veed'],
      input: 'Narration + visuals + music',
      output: 'Cut video, beat-synced',
      minutes: 40,
      instructions:
        'Lay the narration first, then cut visuals to it — not the other way around. Snap transitions to the music beat, add a slow keyframed punch-in on the key line, and keep the total under the script length + 10%. Preview on a phone, not the desktop.',
    },
    {
      id: 'thumbnail',
      label: 'Thumbnail & packaging',
      tool: 'canva',
      alternatives: ['adobe-express', 'midjourney'],
      input: 'Final video + title options',
      output: 'Thumbnail + title + description',
      minutes: 15,
      instructions:
        'Three thumbnail concepts, each testable at phone size: if the key element is unreadable when the image is 120px wide, it fails. The title is a promise the first 30 seconds must keep — write the title before the final cut if you have to.',
    },
    {
      id: 'publish',
      label: 'SEO & publish',
      tool: 'tubebuddy',
      alternatives: ['vidiq', 'viewstats'],
      input: 'Video + thumbnail + metadata',
      output: 'Published video, tags researched',
      minutes: 10,
      instructions:
        'Research the search term before you write the description, not after. Chapters on (even for 8-minute videos — they change skip behaviour), and end screens that point to the next logical video in the series, not the newest one.',
    },
  ],
  notes: [
    'The voice is the brand: pick one narrator voice and commit for a quarter. Audiences recognise a voice before a face.',
    'Generated text fails: keep every word of copy in the editor as overlays where you can fix it.',
    'Cost discipline: generated visuals are the expensive step. Budget several attempts per shot and discard most — the shot list is what keeps this under control.',
  ],
};
