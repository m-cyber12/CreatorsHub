/**
 * Noxifera AI Advisor — the decision engine.
 *
 * Roadmap §4 ("The first killer feature"): a creator arrives with a goal and
 * leaves with a stage-by-stage system of tools, costs and next steps.
 *
 * Design rules (deliberate):
 *  - NO chatbot, NO LLM. The engine is a deterministic function over the
 *    catalog's structured data (categories, pricing, tags). Same answers in,
 *    same system out — testable, free, private, offline.
 *  - Every recommended slug must exist in the catalog (CI-enforced in
 *    scripts/validate-data.mjs). Nothing here invents tools.
 *  - Budget compliance is a guarantee, not a hint: the resolver downgrades
 *    picks until the monthly total fits the chosen budget.
 *  - Recommendations are editorial picks, never test claims (the honesty
 *    rules from the 2026-08 audit still apply).
 */

import { ALL_TOOLS, type Tool } from '@/data/tools';
import type { CreatorPreferences } from '@/lib/workspace';

/* ── Inputs ─────────────────────────────────────────────────────────────── */

export const CONTENT_TYPES = ['long-form', 'short-form', 'faceless', 'podcast', 'ugc', 'course'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'multichannel'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const BUDGETS = ['free', 'under50', 'under150', 'unlimited'] as const;
export type Budget = (typeof BUDGETS)[number];

export const EXPERIENCE_LEVELS = ['new', 'some', 'pro'] as const;
export type Experience = (typeof EXPERIENCE_LEVELS)[number];

export const AUTOMATION_LEVELS = ['manual', 'balanced', 'max'] as const;
export type Automation = (typeof AUTOMATION_LEVELS)[number];

export interface AdvisorAnswers {
  content: ContentType;
  platform: Platform;
  budget: Budget;
  experience: Experience;
  automation: Automation;
  /** false = an AI voice is fine (or required, for faceless). */
  useOwnVoice: boolean;
  /** Catalog slugs the creator already pays for / uses. */
  existingTools: string[];
}

/* ── Outputs ────────────────────────────────────────────────────────────── */

export type StageKey =
  | 'research'
  | 'script'
  | 'voice'
  | 'visuals'
  | 'editing'
  | 'captions'
  | 'clipping'
  | 'recording'
  | 'audio-polish'
  | 'avatar'
  | 'thumbnail'
  | 'seo'
  | 'distribution'
  | 'design';

export interface AdvisorStage {
  key: StageKey;
  /** Catalog slug of the pick, or null when the stage is done manually. */
  tool: string | null;
  /** Why this tool, in one sentence (editorial, honest). */
  reason: string;
  /** Other solid options, in order. */
  alternatives: string[];
  /** 1 (trivial) → 5 (steep). Static editorial estimate. */
  learningCurve: 1 | 2 | 3 | 4 | 5;
  /** The single next step to take in this stage. */
  nextStep: string;
  /** True when the pick comes from the creator's existing subscriptions. */
  fromExisting: boolean;
}

export interface AdvisorResult {
  answers: AdvisorAnswers;
  stages: AdvisorStage[];
  /** Sum of starting prices of the paid picks, USD/month (approx). */
  monthlyTotal: number;
  /** How many stages are fully manual (free by definition). */
  freeStageCount: number;
  /** First three concrete actions. */
  firstActions: string[];
}

/* ── Catalog helpers ────────────────────────────────────────────────────── */

const toolCache = new Map<string, Tool>();
for (const t of ALL_TOOLS) toolCache.set(t.slug, t);

export function catalogTool(slug: string): Tool | undefined {
  return toolCache.get(slug);
}

/**
 * Approximate monthly cost from a catalog price string.
 * "$12/mo" → 12 · "$150/yr" → 12.5 · "Free" → 0 · "$299 one-time" → 0
 * (one-time costs are excluded from the monthly total but still displayed).
 */
export function monthlyCost(price: string | undefined): number {
  if (!price) return 0;
  if (/one-?time|lifetime/i.test(price)) return 0;
  const m = price.replace(/,/g, '').match(/\$?(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (/yr|year/i.test(price)) return n / 12;
  return n;
}

/* ── Stage copy (editorial, one candidate reason + next step each) ─────── */

interface Reason {
  why: string;
  next: string;
}

const REASONS: Record<string, Record<string, Reason>> = {
  research: {
    chatgpt: {
      why: 'fast, general-purpose brainstorming and topic research in one prompt pass',
      next: 'Run one research prompt: 10 topic angles for your niche, with a one-line angle for each.',
    },
    claude: {
      why: 'longest context for source-heavy research and structured outlines',
      next: 'Paste your source material and ask for a one-page research brief with sources numbered.',
    },
    notebooklm: {
      why: 'grounds answers in the sources you upload instead of general knowledge',
      next: 'Upload your top 5 sources and generate the source-backed brief.',
    },
  },
  script: {
    claude: {
      why: 'strong at long-form structure, pacing and rewriting drafts to a target length',
      next: 'Draft the script in three passes: outline → first draft → tighten to your target word count.',
    },
    chatgpt: {
      why: 'quick hook options and format templates for most script jobs',
      next: 'Generate 5 cold-open hooks, pick one, then draft the body around it.',
    },
    jasper: {
      why: 'brand-voice consistency when you write at volume',
      next: 'Set your brand voice once, then generate the draft and rework the opening 30 seconds by hand.',
    },
    writesonic: {
      why: 'SEO-aware drafts with keywords baked into the narrative',
      next: 'Give it your target keyword and ask for a script with the keyword in the first 20 seconds.',
    },
  },
  voice: {
    elevenlabs: {
      why: 'the reference point for natural narration and voice cloning',
      next: 'Generate a 60-second test read, then record your final script at the same pacing.',
    },
    'murf-ai': {
      why: '120+ voices with pitch control, cheaper for high-volume narration',
      next: 'Test three voices on one paragraph before committing to a narrator.',
    },
    'lovo-ai': {
      why: 'dialogue and multi-speaker editing for explainer formats',
      next: 'Build a two-speaker sample to check the emotion controls.',
    },
    'descript-overdub': {
      why: 'clones your own voice so you can fix mistakes by typing',
      next: 'Train your Overdub model with the minimum clean sample, then test one corrected line.',
    },
    speechify: {
      why: 'low-friction text-to-speech when you just need a decent read fast',
      next: 'Generate the read and spot-check pacing on dense paragraphs.',
    },
  },
  visuals: {
    runway: {
      why: 'generates cinematic B-roll plus editing tools (inpainting, tracking) in one place',
      next: 'Generate one 5-second B-roll shot from your strongest visual idea and judge the motion.',
    },
    midjourney: {
      why: 'still imagery and key frames with a distinctive look',
      next: 'Generate 4 stills in one style reference and pick your visual language.',
    },
    invideo: {
      why: 'stock-footage assembly when you need coverage fast',
      next: 'Draft a prompt for your opening scene and review what it auto-assembles.',
    },
    pictory: {
      why: 'script-to-video with stock footage and narration in one flow',
      next: 'Paste a 200-word script segment and review how the auto-assembly reads.',
    },
    autoshorts: {
      why: 'end-to-end faceless short generation: script, voice and B-roll',
      next: 'Generate one short on the cheapest plan and grade the result honestly.',
    },
  },
  editing: {
    capcut: {
      why: 'free, cross-platform, and its AI captions and templates match short-form trends',
      next: 'Import your first segment and cut it end-to-end once to learn the workflow.',
    },
    descript: {
      why: 'edits dialogue-driven video by editing text — filler words and all',
      next: 'Import one talking segment, strip filler words, and export a cleaned cut.',
    },
    veed: {
      why: 'entire pipeline in the browser with one-click resize for every platform',
      next: 'Upload a rough cut and export the 9:16 and 1:1 versions in one pass.',
    },
    'adobe-premiere-pro': {
      why: 'industry-standard timeline control for effects-heavy work',
      next: 'Build a project template with your sequences and export presets, then cut one video in it.',
    },
    'davinci-resolve': {
      why: 'Hollywood-grade colour and audio, free for the standard version',
      next: 'Import a short clip and practice a basic grade; its free tier has no export limits.',
    },
    filmora: {
      why: 'the gentlest learning curve of the full editors',
      next: 'Follow one end-to-end tutorial, then redo the edit from memory.',
    },
    cleanvoice: {
      why: 'fast text-based clean-up of talk-heavy episodes',
      next: 'Edit one episode by deleting sentences in the transcript.',
    },
  },
  captions: {
    submagic: {
      why: 'the retention-style animated captions plus auto B-roll and zooms',
      next: 'Style one clip with the default template, then match the caption font to your brand.',
    },
    capcut: {
      why: 'built-in animated captions at zero extra cost',
      next: 'Turn on auto-captions in CapCut and apply one animated style you will reuse.',
    },
    captions: {
      why: 'app-first auto-captions tuned for mobile editing',
      next: 'Process one clip and correct the three worst transcriptions to train its accuracy.',
    },
    zeemo: {
      why: 'captions with B-roll inserts aimed at talking-head content',
      next: 'Run one clip through and compare its B-roll picks against your taste.',
    },
  },
  clipping: {
    opusclip: {
      why: 'long-form to vertical clips with virality scores and reframing',
      next: 'Upload your longest video and review the top 5 scored clips before editing anything.',
    },
    klap: {
      why: 'fast clips with branded captions and a simple review flow',
      next: 'Generate clips from one YouTube link and compare against OpusClip on the same source.',
    },
    munch: {
      why: 'trend-keyword scoring for marketing teams',
      next: 'Run one podcast through and check the keyword relevance of the top moments.',
    },
    vizard: {
      why: 'solid clipping with a generous free tier',
      next: 'Clip one video on the free tier to see the limits before paying.',
    },
    headliner: {
      why: 'podcast-native clipping with audiogram output',
      next: 'Publish one audiogram clip to test how it performs vs. video clips.',
    },
    'repurpose-io': {
      why: 'auto-distributes finished clips to every platform you connect',
      next: 'Connect your top platform and let it post your next clip for you.',
    },
  },
  recording: {
    riverside: {
      why: 'studio-quality multi-track remote recording with AI clips built in',
      next: 'Book one test recording with a guest and check the separate audio tracks.',
    },
    podcastle: {
      why: 'free, in-browser multi-track recorder',
      next: 'Record a 5-minute test and compare levels with a paid setup.',
    },
    streamyard: {
      why: 'live-first recording with built-in scene switching',
      next: 'Run a live test episode and review the exported multi-cam file.',
    },
  },
  'audio-polish': {
    auphonic: {
      why: 'automated loudness, noise reduction and leveler for consistent episodes',
      next: 'Upload one raw episode and compare loudness before/after (target −16 LUFS).',
    },
    'adobe-podcast': {
      why: 'free one-click speech enhancement',
      next: 'Enhance your worst-sounding clip first — it is the quickest quality win.',
    },
    cleanvoice: {
      why: 'removes filler words, mouth sounds and dead air in one pass',
      next: 'Clean one rough take and check that no syllables were eaten with the fillers.',
    },
  },
  avatar: {
    heygen: {
      why: 'photoreal avatars from a short recording of you, plus lip-sync translation',
      next: 'Record the avatar setup once on your phone, then generate a 30-second test presenter video.',
    },
    synthesia: {
      why: 'studio-quality presenters in 130+ languages, strongest for structured content',
      next: 'Generate one 60-second script with a stock avatar to judge the tone.',
    },
    'd-id': {
      why: 'talking photos and interactive presenters at the lowest price point',
      next: 'Animate one photo with a 30-second script and check the lip-sync quality.',
    },
    colossyan: {
      why: 'training-style videos with auto-translation into 70+ languages',
      next: 'Build a one-slide test video and preview the translated versions.',
    },
  },
  thumbnail: {
    canva: {
      why: 'the fastest path from idea to export with thousands of templates',
      next: 'Duplicate your best-performing thumbnail as a template; change only the subject and text.',
    },
    midjourney: {
      why: 'generated backgrounds and key art with a recognisable style',
      next: 'Generate 4 background concepts in one style, pick one, add text in Canva.',
    },
    'adobe-express': {
      why: 'generative fill plus quick social-sized exports',
      next: 'Use generative fill to extend a photo to 1280×720, then place your text.',
    },
    'thumbly-ai': {
      why: 'CTR-oriented thumbnail generation from your video topic',
      next: 'Generate 3 variants for your next video and pick by the emotion it projects.',
    },
    photoroom: {
      why: 'clean product cutouts and backgrounds for UGC-style ads',
      next: 'Cut out your product from a phone photo and place it on a generated background.',
    },
  },
  seo: {
    tubebuddy: {
      why: 'A/B thumbnail testing plus keyword data inside YouTube Studio',
      next: 'Run one A/B test on your next upload and let it run 48 hours before deciding.',
    },
    vidiq: {
      why: 'keyword and competitor-gap analysis for titles and descriptions',
      next: 'Find the top 3 competitor videos on your topic and note their titles and tags.',
    },
    nexlev: {
      why: 'SEO-optimised descriptions and tags in one click',
      next: 'Generate your description from the title and edit the first two lines for a human voice.',
    },
    '1of10': {
      why: 'AI title and description generation focused on YouTube',
      next: 'Generate 5 title options and pick the one with the strongest curiosity gap.',
    },
  },
  distribution: {
    'repurpose-io': {
      why: 'auto-publishes one asset to every platform you connect',
      next: 'Connect one extra platform and auto-publish your next clip to it.',
    },
  },
  design: {
    canva: {
      why: 'brand kits keep every asset on-style across formats',
      next: 'Create a brand kit (colours, fonts, logo) so every design starts on-brand.',
    },
    'adobe-express': {
      why: 'fast templated graphics with generative fill',
      next: 'Set up one reusable banner template and export all platform sizes from it.',
    },
    'leonardo-ai': {
      why: 'consistent style references for series artwork',
      next: 'Generate a style sheet of 4 related images and keep the prompt that works.',
    },
    colossyan: {
      why: 'slide-to-video with a presenter, aimed at structured lessons',
      next: 'Convert one module outline into a presenter video.',
    },
  },
};

/* ── Stage plans ──────────────────────────────────────────────────────────
 * Candidate order is editorial (first = flagship pick for a funded setup).
 * `manual` marks stages that can be done by hand at $0 — the resolver takes
 * the manual path when the creator prefers manual work, wants their own
 * voice, or when the budget is $0.
 */

interface StageDef {
  key: StageKey;
  /** [slug, reasonKey] pairs. */
  candidates: [string, string][];
  /** 1–5 editorial learning curve. */
  curve: 1 | 2 | 3 | 4 | 5;
  manual?: { next: string; reason: string };
}

const PLANS: Record<ContentType, StageDef[]> = {
  'long-form': [
    {
      key: 'research',
      curve: 1,
      manual: {
        next: 'Write a one-page brief: topic, audience, the one thing they should learn or feel.',
        reason: 'you know your niche best — a written brief beats a chatbot prompt for most experienced creators',
      },
      candidates: [
        ['chatgpt', 'chatgpt'],
        ['claude', 'claude'],
        ['notebooklm', 'notebooklm'],
      ],
    },
    {
      key: 'script',
      curve: 2,
      candidates: [
        ['claude', 'claude'],
        ['chatgpt', 'chatgpt'],
        ['jasper', 'jasper'],
        ['writesonic', 'writesonic'],
      ],
    },
    {
      key: 'voice',
      curve: 1,
      manual: {
        next: 'Record yourself with any decent mic — your own voice outperforms every TTS on trust.',
        reason: 'your voice is free, and your audience already tunes in for it',
      },
      candidates: [
        ['elevenlabs', 'elevenlabs'],
        ['murf-ai', 'murf-ai'],
        ['lovo-ai', 'lovo-ai'],
        ['descript-overdub', 'descript-overdub'],
        ['speechify', 'speechify'],
      ],
    },
    {
      key: 'visuals',
      curve: 3,
      manual: {
        next: 'Film B-roll with a phone: 3 angles, 10 seconds each, for the heaviest points.',
        reason: 'generated footage is expensive per usable second; a phone is $0',
      },
      candidates: [
        ['runway', 'runway'],
        ['invideo', 'invideo'],
        ['midjourney', 'midjourney'],
      ],
    },
    {
      key: 'editing',
      curve: 3,
      candidates: [
        ['capcut', 'capcut'],
        ['descript', 'descript'],
        ['veed', 'veed'],
        ['adobe-premiere-pro', 'adobe-premiere-pro'],
        ['davinci-resolve', 'davinci-resolve'],
      ],
    },
    {
      key: 'thumbnail',
      curve: 2,
      candidates: [
        ['canva', 'canva'],
        ['midjourney', 'midjourney'],
        ['adobe-express', 'adobe-express'],
      ],
    },
    {
      key: 'seo',
      curve: 1,
      candidates: [
        ['tubebuddy', 'tubebuddy'],
        ['vidiq', 'vidiq'],
        ['nexlev', 'nexlev'],
        ['1of10', '1of10'],
      ],
    },
    {
      key: 'distribution',
      curve: 1,
      manual: {
        next: 'Upload the cut-down vertical highlights to your top social platform within 24 hours.',
        reason: 'manual distribution costs nothing and you control the captions',
      },
      candidates: [['repurpose-io', 'repurpose-io']],
    },
  ],

  'short-form': [
    {
      key: 'clipping',
      curve: 1,
      manual: {
        next: 'Re-watch your last video, note the 3 highest-energy 30-second windows, cut them in an editor.',
        reason: 'you know your best moments better than a score — under 10 videos a month, this is enough',
      },
      candidates: [
        ['opusclip', 'opusclip'],
        ['klap', 'klap'],
        ['munch', 'munch'],
        ['vizard', 'vizard'],
      ],
    },
    {
      key: 'captions',
      curve: 1,
      manual: {
        next: 'Use your editor’s built-in captions — accurate enough after a correction pass.',
        reason: 'most editors include captions; paying extra is only worth it at volume',
      },
      candidates: [
        ['submagic', 'submagic'],
        ['capcut', 'capcut'],
        ['captions', 'captions'],
        ['zeemo', 'zeemo'],
      ],
    },
    {
      key: 'editing',
      curve: 2,
      candidates: [
        ['capcut', 'capcut'],
        ['veed', 'veed'],
        ['descript', 'descript'],
      ],
    },
    {
      key: 'seo',
      curve: 1,
      manual: {
        next: 'Make the first line of your caption the hook, under 40 characters. That is 80% of short-form SEO.',
        reason: 'short platforms rank on retention and hook, not metadata',
      },
      candidates: [
        ['tubebuddy', 'tubebuddy'],
        ['vidiq', 'vidiq'],
      ],
    },
    {
      key: 'distribution',
      curve: 1,
      manual: {
        next: 'Post the same clip to all three platforms with platform-native captions.',
        reason: 'one clip, three platforms, zero cost — the compounding play for short-form',
      },
      candidates: [['repurpose-io', 'repurpose-io']],
    },
  ],

  faceless: [
    {
      key: 'script',
      curve: 2,
      candidates: [
        ['claude', 'claude'],
        ['chatgpt', 'chatgpt'],
        ['writesonic', 'writesonic'],
      ],
    },
    {
      key: 'voice',
      curve: 1,
      candidates: [
        ['elevenlabs', 'elevenlabs'],
        ['murf-ai', 'murf-ai'],
        ['lovo-ai', 'lovo-ai'],
        ['speechify', 'speechify'],
      ],
    },
    {
      key: 'visuals',
      curve: 2,
      candidates: [
        ['invideo', 'invideo'],
        ['pictory', 'pictory'],
        ['runway', 'runway'],
        ['autoshorts', 'autoshorts'],
      ],
    },
    {
      key: 'editing',
      curve: 2,
      candidates: [
        ['capcut', 'capcut'],
        ['veed', 'veed'],
        ['descript', 'descript'],
      ],
    },
    {
      key: 'thumbnail',
      curve: 2,
      candidates: [
        ['canva', 'canva'],
        ['midjourney', 'midjourney'],
        ['thumbly-ai', 'thumbly-ai'],
      ],
    },
    {
      key: 'seo',
      curve: 1,
      candidates: [
        ['tubebuddy', 'tubebuddy'],
        ['vidiq', 'vidiq'],
        ['nexlev', 'nexlev'],
      ],
    },
  ],

  podcast: [
    {
      key: 'recording',
      curve: 2,
      manual: {
        next: 'Record locally with Audacity (free) and a dynamic USB mic — multi-track, then edit.',
        reason: 'remote recording tools exist for guests; solo podcasts are fine locally',
      },
      candidates: [
        ['riverside', 'riverside'],
        ['podcastle', 'podcastle'],
        ['streamyard', 'streamyard'],
      ],
    },
    {
      key: 'editing',
      curve: 2,
      candidates: [
        ['descript', 'descript'],
        ['cleanvoice', 'cleanvoice'],
        ['filmora', 'filmora'],
      ],
    },
    {
      key: 'audio-polish',
      curve: 1,
      candidates: [
        ['auphonic', 'auphonic'],
        ['adobe-podcast', 'adobe-podcast'],
        ['cleanvoice', 'cleanvoice'],
      ],
    },
    {
      key: 'clipping',
      curve: 1,
      manual: {
        next: 'Cut 3 clips per episode by hand — the highest-retention 30–60 second window each.',
        reason: 'clipping is the podcast growth lever; do it manually until volume demands a tool',
      },
      candidates: [
        ['opusclip', 'opusclip'],
        ['headliner', 'headliner'],
        ['klap', 'klap'],
      ],
    },
    {
      key: 'distribution',
      curve: 1,
      manual: {
        next: 'Publish the episode plus 3 clips to your top platforms the same day.',
        reason: 'day-of-release distribution is where most podcast discovery happens',
      },
      candidates: [['repurpose-io', 'repurpose-io']],
    },
  ],

  ugc: [
    {
      key: 'script',
      curve: 1,
      candidates: [
        ['chatgpt', 'chatgpt'],
        ['claude', 'claude'],
      ],
    },
    {
      key: 'avatar',
      curve: 2,
      candidates: [
        ['heygen', 'heygen'],
        ['d-id', 'd-id'],
        ['synthesia', 'synthesia'],
        ['colossyan', 'colossyan'],
      ],
    },
    {
      key: 'design',
      curve: 1,
      candidates: [
        ['canva', 'canva'],
        ['photoroom', 'photoroom'],
        ['adobe-express', 'adobe-express'],
      ],
    },
    {
      key: 'editing',
      curve: 1,
      candidates: [
        ['capcut', 'capcut'],
        ['veed', 'veed'],
      ],
    },
  ],

  course: [
    {
      key: 'script',
      curve: 2,
      candidates: [
        ['claude', 'claude'],
        ['chatgpt', 'chatgpt'],
      ],
    },
    {
      key: 'design',
      curve: 2,
      candidates: [
        ['canva', 'canva'],
        ['adobe-express', 'adobe-express'],
        ['colossyan', 'colossyan'],
      ],
    },
    {
      key: 'avatar',
      curve: 2,
      manual: {
        next: 'Record yourself presenting each module — a real face converts courses better than any avatar.',
        reason: 'for courses, trust beats production value; avatars are a localisation layer, not a replacement',
      },
      candidates: [
        ['heygen', 'heygen'],
        ['synthesia', 'synthesia'],
        ['colossyan', 'colossyan'],
      ],
    },
    {
      key: 'voice',
      curve: 1,
      manual: {
        next: 'Narrate with your own voice — it is the backbone of course trust.',
        reason: 'your voice, your authority; TTS is for localisation, not the original',
      },
      candidates: [
        ['elevenlabs', 'elevenlabs'],
        ['murf-ai', 'murf-ai'],
      ],
    },
  ],
};

export const STAGE_TITLES: Record<StageKey, string> = {
  research: 'Research',
  script: 'Script',
  voice: 'Voice',
  visuals: 'Visuals',
  editing: 'Editing',
  captions: 'Captions',
  clipping: 'Clipping',
  recording: 'Recording',
  'audio-polish': 'Audio polish',
  avatar: 'Presenter',
  thumbnail: 'Thumbnail',
  seo: 'SEO & packaging',
  distribution: 'Distribution',
  design: 'Design',
};

/* ── Resolver ──────────────────────────────────────────────────────────── */

const BUDGET_CAPS: Record<Budget, number | null> = {
  free: 0,
  under50: 50,
  under150: 150,
  unlimited: null,
};

/** True when the pick costs $0 on its entry/free tier. */
function isFreePick(slug: string): boolean {
  const t = catalogTool(slug);
  return !t || t.pricing === 'Free' || t.pricing === 'Freemium' || monthlyCost(t.startingPrice) === 0;
}

function pickForBudget(candidates: [string, string][], budget: Budget): string | null {
  const pool = candidates.filter(([slug]) => catalogTool(slug));
  if (pool.length === 0) return null;

  if (budget === 'free') {
    const free = pool.find((c) => isFreePick(c[0]));
    return free ? free[0] : null;
  }
  if (budget === 'unlimited') {
    return pool[0][0]; // editorial flagship order
  }
  // under50 / under150: cheapest paid first, but only if it fits the cap.
  const costOf = (c: [string, string]) => monthlyCost(catalogTool(c[0])?.startingPrice);
  const paid = pool.filter((c) => !isFreePick(c[0]));
  const ordered = [...(paid.length ? paid : pool)].sort((a, b) => costOf(a) - costOf(b));
  const cap = BUDGET_CAPS[budget] ?? Infinity;
  return (ordered.find((c) => costOf(c) <= cap) ?? ordered[0])[0];
}

export function runAdvisor(answers: AdvisorAnswers): AdvisorResult {
  const plan = PLANS[answers.content];
  const existing = new Set(answers.existingTools.filter((sl) => catalogTool(sl)));
  // Faceless content cannot rely on the creator's own voice.
  const effectiveAnswers: AdvisorAnswers = {
    ...answers,
    useOwnVoice: answers.content === 'faceless' ? false : answers.useOwnVoice,
  };

  const stages: AdvisorStage[] = [];

  for (const def of plan) {
    const [ownedSlug, ownedKey] = def.candidates.find(([slug]) => existing.has(slug)) ?? [null, null];

    const wantsOwnVoice = def.key === 'voice' && effectiveAnswers.useOwnVoice;
    const manualAllowed =
      def.manual !== undefined &&
      (wantsOwnVoice ||
        effectiveAnswers.automation === 'manual' ||
        (effectiveAnswers.automation === 'balanced' && effectiveAnswers.budget === 'free'));

    // 1. Reuse a tool the creator already has — no new subscription.
    if (ownedSlug && !manualAllowed) {
      const tool = catalogTool(ownedSlug)!;
      const r = REASONS[def.key as keyof typeof REASONS][ownedKey] as Reason;
      stages.push({
        key: def.key,
        tool: ownedSlug,
        reason: `You already have ${tool.name} — ${r.why}. No new subscription needed.`,
        alternatives: def.candidates.filter(([sl]) => sl !== ownedSlug).map(([sl]) => sl),
        learningCurve: def.curve,
        nextStep: r.next,
        fromExisting: true,
      });
      continue;
    }

    // 2. The manual path (free, by hand).
    if (manualAllowed && def.manual) {
      stages.push({
        key: def.key,
        tool: null,
        reason: def.manual.reason,
        alternatives: def.candidates.map(([sl]) => sl),
        learningCurve: 1,
        nextStep: def.manual.next,
        fromExisting: false,
      });
      continue;
    }

    // 3. Budget-aware editorial pick.
    const slug = pickForBudget(def.candidates, effectiveAnswers.budget);
    if (!slug) {
      stages.push({
        key: def.key,
        tool: null,
        reason: 'No catalog tool fits this stage under your constraints — do it manually.',
        alternatives: [],
        learningCurve: 1,
        nextStep: def.manual?.next ?? 'Do this stage by hand with free tools.',
        fromExisting: false,
      });
      continue;
    }
    const tool = catalogTool(slug)!;
    const r = REASONS[def.key as keyof typeof REASONS][def.candidates.find(([sl]) => sl === slug)![1]] as Reason;
    stages.push({
      key: def.key,
      tool: slug,
      reason: `${tool.name} — ${r.why}.`,
      alternatives: def.candidates.filter(([sl]) => sl !== slug).map(([sl]) => sl),
      learningCurve: def.curve,
      nextStep: r.next,
      fromExisting: false,
    });
  }

  /* ── Budget compliance ───────────────────────────────────────────────
   * Downgrade the most expensive paid picks (that are not from the creator's
   * existing subscriptions) until the monthly total fits the cap. Always the
   * most expensive stage first, replaced by the stage's free-tier candidate
   * or its manual path. Deterministic. */
  const cap = BUDGET_CAPS[effectiveAnswers.budget];
  const totalOf = (st: AdvisorStage[]) =>
    st.reduce((sum, s) => {
      if (!s.tool || s.fromExisting) return sum;
      const t = catalogTool(s.tool);
      if (!t || t.pricing === 'Free' || t.pricing === 'Freemium') return sum;
      return sum + monthlyCost(t.startingPrice);
    }, 0);

  let guard = 0;
  while (cap !== null && totalOf(stages) > cap && guard++ < 16) {
    const paid = stages
      .map((s, i) => ({ s, i }))
      .filter(
        ({ s }) =>
          s.tool &&
          !s.fromExisting &&
          catalogTool(s.tool)?.pricing !== 'Free' &&
          catalogTool(s.tool)?.pricing !== 'Freemium'
      )
      .sort(
        (a, b) =>
          monthlyCost(catalogTool(b.s.tool!)?.startingPrice) -
          monthlyCost(catalogTool(a.s.tool!)?.startingPrice)
      );
    if (paid.length === 0) break;
    const { s, i } = paid[0];
    const def = plan.find((d) => d.key === s.key)!;
    const freeSlug = pickForBudget(def.candidates, 'free');
    if (freeSlug && freeSlug !== s.tool) {
      const t = catalogTool(freeSlug)!;
      const r = REASONS[def.key as keyof typeof REASONS][def.candidates.find(([sl]) => sl === freeSlug)![1]] as Reason;
      stages[i] = {
        ...s,
        tool: freeSlug,
        reason: `${t.name} — the free/entry option for this stage: ${r.why}.`,
        alternatives: def.candidates.filter(([sl]) => sl !== freeSlug).map(([sl]) => sl),
      };
    } else if (def.manual) {
      stages[i] = { ...s, tool: null, reason: def.manual.reason, nextStep: def.manual.next, fromExisting: false };
    } else {
      break;
    }
  }

  const monthlyTotal = Math.round(totalOf(stages) * 100) / 100;
  const freeStageCount = stages.filter((s) => !s.tool).length;

  return {
    answers: effectiveAnswers,
    stages,
    monthlyTotal,
    freeStageCount,
    firstActions: stages.slice(0, 3).map((s) => s.nextStep),
  };
}

/**
 * Map an advisor content type to a Stack Builder goal so "Build Stack" lands
 * on the matching pre-built stack (deep-linked via ?goal=).
 */
export const CONTENT_TO_GOAL: Record<ContentType, string> = {
  'long-form': 'longform',
  'short-form': 'shorts',
  faceless: 'faceless',
  podcast: 'podcast',
  ugc: 'ugc',
  course: 'avatars',
};

/* ── My NOXIFERA preference prefill ─────────────────────────────────────── */
/**
 * Map free-text workspace preferences onto advisor enums. Deterministic and
 * conservative: a field is applied only when the text matches exactly one
 * enum's aliases (substring match on normalized text). Anything ambiguous
 * is left at the wizard default — never guessed.
 */

export interface PrefillResult {
  content?: ContentType;
  platform?: Platform;
  budget?: Budget;
  experience?: Experience;
  automation?: Automation;
  existing: string[];
  /** Number of fields confidently matched (existing tools count as one). */
  matchedCount: number;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchOne<T extends string>(text: string, aliases: Record<T, string[]>): T | undefined {
  const n = ` ${norm(text)} `;
  let found: T | undefined;
  for (const key of Object.keys(aliases) as T[]) {
    if (aliases[key].some((w) => n.includes(w))) {
      if (found !== undefined) return undefined; // ambiguous — refuse to guess
      found = key;
    }
  }
  return found;
}

const CONTENT_ALIASES: Record<ContentType, string[]> = {
  'long-form': ['long form', 'longform', 'long video', 'talking head', 'youtube video', 'essay', 'documentary'],
  'short-form': ['short form', 'shortform', 'short', 'shorts', 'reel', 'vertical', 'tiktok video'],
  faceless: ['faceless', 'no face', 'anonymous', 'ai avatar'],
  podcast: ['podcast', 'audio show', 'interview show'],
  ugc: ['ugc', ' ad', 'ads', 'commercial', 'product video', 'promo'],
  course: ['course', 'tutorial', 'class', 'lesson', 'coaching', 'education'],
};

const PLATFORM_ALIASES: Record<Platform, string[]> = {
  youtube: ['youtube', ' you tube', ' yt '],
  tiktok: ['tiktok', 'tik tok'],
  instagram: ['instagram', 'insta', ' ig '],
  multichannel: ['multi', 'everywhere', 'all platform', 'cross platform', 'repurpose'],
};

const BUDGET_ALIASES: Record<Budget, string[]> = {
  free: ['free', ' 0 ', '$0', 'no budget', 'nothing'],
  under50: ['50', 'cheap', 'low budget', 'tight'],
  under150: ['150', '100', 'mid', 'medium'],
  unlimited: ['unlimited', 'no limit', 'any budget', 'whatever it takes', 'flexible'],
};

const EXPERIENCE_ALIASES: Record<Experience, string[]> = {
  new: ['beginner', 'new', 'just start', 'starting out', 'novice'],
  some: ['intermediate', 'some experience', 'hobby', 'casual'],
  pro: ['advanced', 'pro', 'expert', 'professional', 'full time', 'agency'],
};

const AUTOMATION_ALIASES: Record<Automation, string[]> = {
  manual: ['manual', 'hands on', 'craft', 'control', 'diy'],
  balanced: ['balanced', 'mix', 'both'],
  max: ['automat', 'fast', 'scale', 'ai first', 'efficient', 'volume'],
};

export function matchPreferencesToAdvisor(prefs: CreatorPreferences): PrefillResult {
  const out: PrefillResult = { existing: [...prefs.currentTools], matchedCount: 0 };
  if (prefs.contentFormat) {
    const c = matchOne(prefs.contentFormat, CONTENT_ALIASES);
    if (c) {
      out.content = c;
      out.matchedCount += 1;
    }
  }
  if (prefs.platform) {
    const p = matchOne(prefs.platform, PLATFORM_ALIASES);
    if (p) {
      out.platform = p;
      out.matchedCount += 1;
    }
  }
  if (prefs.budget) {
    const b = matchOne(prefs.budget, BUDGET_ALIASES);
    if (b) {
      out.budget = b;
      out.matchedCount += 1;
    }
  }
  if (prefs.skillLevel) {
    const e = matchOne(prefs.skillLevel, EXPERIENCE_ALIASES);
    if (e) {
      out.experience = e;
      out.matchedCount += 1;
    }
  }
  if (prefs.workflowStyle) {
    const a = matchOne(prefs.workflowStyle, AUTOMATION_ALIASES);
    if (a) {
      out.automation = a;
      out.matchedCount += 1;
    }
  }
  if (out.existing.length > 0) out.matchedCount += 1;
  return out;
}
