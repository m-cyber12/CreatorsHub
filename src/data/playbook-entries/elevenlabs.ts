import type { Playbook } from '../playbooks';

export const elevenlabs: Playbook = {
  slug: 'elevenlabs',
  title: 'ElevenLabs Playbook',
  oneLiner: 'The most realistic AI voice on the market — used as a narrator, a clone, or a full dubbing pipeline.',
  bestFor: ['Faceless video narration', 'Dubbing existing content', 'Audiobooks & courses', 'UGC ad voice'],
  setup: [
    { title: 'Decide: library voice or clone', body: 'Library voices are instant and safe. Cloning your own voice gives a consistent narrator across a channel — but it requires a clean, consent-secured recording (2–5 minutes, one voice, no background noise).', tip: 'Never clone a voice you do not have explicit permission to use. This is the one rule with legal teeth.' },
    { title: 'Pick one voice and stick to it', body: 'Audiences recognize a voice before a face. One narrator voice for a channel is a brand decision, not a preference — commit for a quarter before changing it.' },
    { title: 'Set your generation defaults', body: 'Stability around 50, similarity high. Lower stability gives more emotional variation and more surprises. Find the sweet spot once, then reuse it everywhere.' },
  ],
  workflow: [
    { title: 'Write for the ear', body: 'Short sentences. Real punctuation (commas and dashes control pacing). No acronyms without a spoken form. Read one paragraph aloud before generating anything.' },
    { title: 'Generate in chunks', body: 'Split long scripts into one-to-two-minute scenes. One 20-minute generation flattens the emotion and wastes credits when a single line needs a redo.' },
    { title: 'Listen pass, regenerate the weak lines', body: 'Play each chunk back. Regenerate lines with odd stress or flat emphasis — usually 10–15% of the script, not all of it.' },
    { title: 'Export and normalize', body: 'Export WAV, loudness-normalize in your editor, and lay it under your video. The audio should sit consistently under any music bed.' },
  ],
  proMoves: [
    { title: 'The dubbing pipeline', body: 'Translate the script (an LLM, with a human review), then generate each language with the same cloned voice. Same narrator, every market — the most compelling use of cloning in 2026.' },
    { title: 'Batch 10 hooks, A/B the first 5 seconds', body: 'Generate ten versions of a cold open. The first five seconds decide retention; the best hook is not the one you wrote first, it is the one you would not skip.' },
    { title: 'Speech-to-text as a safety net', body: 'Run the finished audio back through speech-to-text. Words the transcript mangles are words the audience mangles — regenerate those lines.' },
  ],
  mistakes: [
    'One giant generation per video. Emotion flattens, and a single bad line means redoing everything.',
    'Skipping the listen pass. The voice sounds confident while it is wrong — stress on the wrong syllable in every sentence of the video.',
    'Cloning without consent. The platform restricts it, and so do the people who hear it.',
    'Forgetting credits are per character, not per minute — a 10-minute script is a real cost at scale, not a rounding error.',
  ],
  faq: [
    { q: 'Is voice cloning legal?', a: 'Only with the speaker’s consent. ElevenLabs requires it, and using a clone without it is the single most common legal incident in AI audio. Keep the consent on file.' },
    { q: 'What does the free tier allow?', a: 'Limited monthly minutes with attribution requirements and no commercial use. Fine for evaluation; a working channel needs a paid tier and the commercial license.' },
    { q: 'Can it do audiobooks?', a: 'Yes — with the paid tier and a full-length license. The realistic workflow is still chapter-by-chapter with a human listen pass, not one-click.' },
  ],
};
