import type { Playbook } from '../playbooks';

export const descript: Playbook = {
  slug: 'descript',
  title: 'Descript Playbook',
  oneLiner: 'Edit video the way you edit a document — and keep the audio clean enough to sound professional without a studio.',
  bestFor: ['Talking-head video creators', 'Podcast producers', 'Teams that review edits in text'],
  setup: [
    { title: 'Import and check the transcript', body: 'Upload once; Descript transcribes it. Before anything else, skim the transcript for wrong names, jargon, and product terms — the transcript is the edit, so a bad transcript is a bad edit.', tip: 'Add a custom glossary for your recurring terms. Five minutes now saves hours later.' },
    { title: 'Set your cleanup defaults', body: 'Turn on filler word removal (start mild: “um” only) and Studio Sound. You can always push harder per project, but a global aggressive setting makes every edit sound robotic.' },
    { title: 'Know your export limits', body: 'The free tier transcribes limited hours and exports at 720p. If you ship daily, the paid plan is not optional — know that before you fall in love with a workflow.' },
  ],
  workflow: [
    { title: 'Edit the transcript', body: 'Delete silences, stumbles, and repeats like text. This is 80% of the work and it is where Descript beats every timeline editor for talking-head content.' },
    { title: 'Fix the audio', body: 'Studio Sound on all tracks; add music low in the background; if the room tone is bad, noise reduction before Studio Sound, not after.' },
    { title: 'Add the visual layer', body: 'Green-screen a static background off, add captions (check them), drop in B-roll or screen captures at the exact transcript moment you discuss them.' },
    { title: 'Export both formats', body: 'One MP4 for video, one clean MP3/WAV for the podcast feed. Same session, two deliverables — the podcast should never be an afterthought.' },
  ],
  proMoves: [
    { title: 'Overdub the one bad line', body: 'Mispoken one word? Overdub lets you re-record just that line in your cloned voice and splice it in. No re-recording the segment, no “um, sorry, restart.”' },
    { title: 'Scenes as chapters', body: 'Mark scenes in the transcript and they become chapters in the export. Chapters are the difference between a 30-minute podcast people listen to at 1.5× and one they abandon.' },
    { title: 'Multitrack for the intro', body: 'Keep your voiceover on track 1 and build the intro (music stinger, logo, lower third) on separate tracks. Reuse the exact same intro block in every episode — consistency is branding.' },
  ],
  mistakes: [
    'Aggressive filler removal on every track. A mild pass sounds human; a heavy pass sounds like a chatbot reading your ideas.',
    'Exporting only the video and re-recording the podcast separately — double the work, and the two versions drift apart.',
    'Trusting the transcript on technical terms. “LLM” and “VPS” get transcribed wrong constantly.',
    'Doing everything at 4K and paying the upload tax. 1080p is the standard for talking-head; save 4K for client work.',
  ],
  faq: [
    { q: 'Is Descript good enough for a real podcast?', a: 'Yes — it is used by many professional shows. The audio tools (Studio Sound, filler cleanup) are the reason, and the text-based edit is why episodes ship on time.' },
    { q: 'How accurate is the transcript?', a: 'Very good for normal speech. It struggles with accents, technical jargon, and two people talking at once — which is why the custom glossary and the skim pass matter.' },
    { q: 'Free or paid?', a: 'Free (1 hour transcription/month, 720p export) is enough to decide if you like the workflow. A weekly-show creator lives on the paid tier.' },
  ],
};
