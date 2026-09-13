import type { Playbook } from '../playbooks';

export const runway: Playbook = {
  slug: 'runway',
  title: 'Runway Playbook',
  oneLiner: 'AI video generation as a production tool — b-roll, concept visuals, and VFX that used to need a crew.',
  bestFor: ['Faceless video b-roll', 'Product & concept shots', 'VFX cleanup (remove/replace)', 'Music-video-grade concepts'],
  setup: [
    { title: 'Understand the credit economy first', body: 'Every generation spends credits; your plan includes a monthly pool. A 5-second clip costs a small fraction; a 10-variant test costs a real amount. Know the price per generation before you test prompts.', tip: 'Keep a spreadsheet: prompt, settings, cost, result rating. It is the difference between learning and burning money.' },
    { title: 'Test short before you commit', body: 'Generate 4–5 second clips at the lowest useful resolution to test composition and motion. Once the shot is right, regenerate longer and at full resolution. Never spend full-clip credits on a first draft.' },
    { title: 'Build a prompt formula', body: 'Subject + action + camera move + style + lighting. “A ceramic studio, hands glazing a bowl, slow push-in, documentary style, soft window light” beats “a pottery video” by an order of magnitude.' },
  ],
  workflow: [
    { title: 'Script the shot list', body: 'List the 5–8 generated shots the video actually needs (b-roll, transitions, impossible-to-film moments). A shot list caps the credit spend; “generate until it looks good” does not.' },
    { title: 'Generate in batches of four', body: 'For each shot, generate four variants with the same prompt. Pick the one with clean motion and correct hands; the others teach you what to tweak.' },
    { title: 'Extend or image-to-video', body: 'Happy with a still (Midjourney or a frame you captured)? Image-to-video from that still keeps the character and scene consistent across shots — the key to a coherent look.' },
    { title: 'Cut, don’t over-hold', body: 'Generated shots work best at 2–4 seconds on screen, cut to the beat. Long holds expose the motion artifacts; the edit hides them.' },
  ],
  proMoves: [
    { title: 'Midjourney still → Runway motion', body: 'Generate the exact frame you want in an image model, then animate it. This is the industry-standard 2026 pipeline for consistent characters and locations across a whole video.' },
    { title: 'VFX remove and replace', body: 'Removing a logo from a background or replacing a window view with an ocean is a two-minute operation that used to be a compositing afternoon.' },
    { title: 'Audio-react for talking b-roll', body: 'Drive the generated motion from your voiceover’s rhythm so the visuals breathe with the narration — the cheapest way to make generated footage feel intentional.' },
  ],
  mistakes: [
    'Expecting 60 seconds of continuous footage. Generate in 5-second units and edit them; continuity across cuts is solved by the edit, not the model.',
    'Vague prompts and blaming the model. “Make it cinematic” is not a prompt; the formula is.',
    'No prompt log. The winning prompt from last month is invisible without a record — and credits are gone, not refundable.',
    'Text in generated frames. AI video still mangles letters; put all text in your editor as overlays.',
  ],
  faq: [
    { q: 'How do credits actually work?', a: 'Each plan includes a monthly credit pool; every generation spends a predictable amount based on length and resolution. Overage is billed — which is why the shot list and test-short-first habits matter.' },
    { q: 'Can it generate people realistically?', a: 'Yes, and faces have improved dramatically — but they still drift over long takes. Keep human shots short, use image-to-video for consistency, and check hands.' },
    { q: 'Is commercial use allowed?', a: 'On paid plans, generated content is yours to use commercially, subject to the license terms. Check the current terms before client work.' },
  ],
};
