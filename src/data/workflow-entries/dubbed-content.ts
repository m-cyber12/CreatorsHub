import type { WorkflowTemplate } from '../workflows';

export const dubbedContent: WorkflowTemplate = {
  slug: 'dubbed-content',
  title: 'One Video → 5 Languages',
  oneLiner: 'The multilingual growth pipeline: one master video becomes localised versions with matched voice, synced subtitles and a real QA pass — not machine-dubbed leftovers.',
  frequency: 'Per hero video',
  nodes: [
    {
      id: 'translate',
      label: 'Translate the script',
      tool: 'claude',
      alternatives: ['chatgpt'],
      input: 'Master script + target languages',
      output: 'Natural-language translations, line-aligned',
      minutes: 25,
      instructions:
        'Translate for the ear, not the page: short lines, real idiom, no word-for-word carries. Keep the line count close to the original so the timing survives. A human reads every line before it is voiced — this is the step that separates localisation from machine dubbing.',
      prompt:
        'Translate this video script into {language}. Rules: natural spoken phrasing for that market (not written-form); keep each line within ±15% of the original length; preserve the punch of each hook line; flag anything that does not translate (jokes, units, cultural references) with [ADAPT] and suggest a local equivalent.',
    },
    {
      id: 'dub',
      label: 'Voice the dub',
      tool: 'rask-ai',
      alternatives: ['dubverse', 'heygen', 'elevenlabs'],
      input: 'Translated lines + master audio',
      output: 'Dubbed audio per language',
      minutes: 30,
      instructions:
        'Use the same cloned voice across all languages when the tool supports it — same narrator, every market, is the whole point of cloning in 2026. Generate in line-aligned chunks so you can fix one bad line without re-voicing the video.',
    },
    {
      id: 'subs',
      label: 'Subtitle sync',
      tool: 'descript',
      alternatives: ['happy-scribe', 'captions'],
      input: 'Dubs + translations',
      output: 'Synced subtitle tracks per language',
      minutes: 25,
      instructions:
        'Time the subtitles to the dubbed audio, not the original. Two lines max per card, 1.5 seconds minimum on screen. Burn-in only where the platform requires it; soft subs everywhere else so viewers can switch.',
    },
    {
      id: 'qa',
      label: 'Listen QA',
      manual: true,
      alternatives: [],
      input: 'Dub + subs per language',
      output: 'Approved versions or fix list',
      minutes: 20,
      instructions:
        'One full listen per language at 1×: mouth-and-audio drift, words the dub mangles, subtitle lines that lie to the audio. Run the finished audio back through speech-to-text — words the transcript mangles are words the audience mangles. Fix the list, do not re-dub the world.',
    },
    {
      id: 'export',
      label: 'Export & localise metadata',
      tool: 'capcut',
      alternatives: ['descript'],
      input: 'Approved dubs + subs',
      output: 'Per-language files + local titles/descriptions',
      minutes: 15,
      instructions:
        'Export per-language masters with matched titles and descriptions (translated with the same script pass, not a browser). One upload per market where the platform allows region targeting; the metadata is part of the localisation, not an afterthought.',
    },
  ],
  notes: [
    'Timing drift is the visible failure mode: a dub that runs 10% long per line is unwatchable by line 30. Length discipline in the translation step is what protects the whole pipeline.',
    'Consent is non-negotiable: the cloned voice needs the speaker on file, in every market you publish in.',
    'Localise the thumbnail and title with the same pass — most channels dub the video and leave the packaging in the original language, which caps the local CTR.',
  ],
};
