/**
 * Noxifera outcome guides — Roadmap §3.4 ("better outcome pages").
 *
 * Pages organised around the CREATOR'S GOAL, not the tool category. Each
 * outcome is a concrete system: the jobs, the tool for each job (with
 * editorial reasons and alternatives), a realistic first-run workflow with
 * time estimates, and an honest cost computed from catalog pricing at render
 * time (never hardcoded).
 *
 * Every slug referenced here must exist in the catalog — enforced by
 * scripts/validate-data.mjs. Ground rules match the rest of the site:
 * editorial picks, no invented scores, drawbacks stated where they matter.
 */

export interface OutcomeJob {
  /** The job this step of the system performs. */
  role: string;
  /** Primary pick (catalog slug). */
  tool: string;
  /** Why this tool for this job — one honest sentence. */
  why: string;
  /** Solid alternatives, in order. */
  alternatives: string[];
}

export interface OutcomeWorkflowStep {
  step: string;
  /** Realistic first-run time in minutes. */
  minutes: number;
}

export interface Outcome {
  slug: string;
  title: string;
  /** The question this page answers (shown as a chip, used in meta). */
  intent: string;
  /** 1–2 paragraphs of genuine orientation. */
  intro: string[];
  jobs: OutcomeJob[];
  workflow: OutcomeWorkflowStep[];
  /** Honest caveats — what goes wrong, what this system is not. */
  caveats: string[];
  /** Related blog post slugs. */
  relatedGuides: string[];
  /** Related outcome slugs. */
  relatedOutcomes: string[];
  faq: { q: string; a: string }[];
}

export const OUTCOMES: Outcome[] = [
  {
    slug: 'podcast-to-shorts',
    title: 'Podcast → 10 Shorts',
    intent: 'How do I turn one podcast episode into a steady stream of clips?',
    intro: [
      'Your podcast is a clip factory you already pay for in time. One good episode contains three to five moments that work as standalone short-form videos — the job is finding them fast, captioning them in a style that holds attention, and getting them to every platform before the week ends.',
      'This system is built around one episode per week. Total first-run time is about two and a half hours; after the first two episodes it usually drops under 90 minutes because the template decisions stop being decisions.',
    ],
    jobs: [
      {
        role: 'Record clean',
        tool: 'riverside',
        why: 'Separate multi-track audio for every guest means you can rescue one bad take without re-recording, and the built-in AI clips give you a second opinion on the best moments.',
        alternatives: ['podcastle', 'streamyard'],
      },
      {
        role: 'Edit by transcript',
        tool: 'descript',
        why: 'Cutting the episode is mostly deleting sentences — Descript does that in the transcript, strips filler words in bulk, and levels the audio while it is at it.',
        alternatives: ['cleanvoice', 'filmora'],
      },
      {
        role: 'Find and cut the clips',
        tool: 'opusclip',
        why: 'Feed it the finished episode and it returns ranked vertical candidates with reframing and captions; the virality score is a sorting hint, not a promise.',
        alternatives: ['klap', 'headliner'],
      },
      {
        role: 'Style the captions',
        tool: 'submagic',
        why: 'The retention-style animated captions, zooms and B-roll inserts in one pass — the look that makes a talking clip feel finished instead of raw.',
        alternatives: ['capcut', 'captions'],
      },
      {
        role: 'Ship everywhere',
        tool: 'repurpose-io',
        why: 'One finished clip auto-published to every platform you connect, so publishing stops being a nightly chore.',
        alternatives: ['zapier'],
      },
    ],
    workflow: [
      { step: 'Record the episode with multi-track audio (or import a previous one)', minutes: 60 },
      { step: 'Cut the episode in Descript: delete dead air, strip fillers, level audio', minutes: 45 },
      { step: 'Run the episode through OpusClip; review the top 5–10 scored moments', minutes: 15 },
      { step: 'Pick 3–5, style captions in Submagic, fix any bad transcriptions', minutes: 25 },
      { step: 'Export 9:16 and push to all platforms (manual or via Repurpose)', minutes: 15 },
    ],
    caveats: [
      'Clip scores are a ranking aid — the moments that actually win are usually the ones where you or your guest say something true and specific. Use the score to choose review order, not the final cut.',
      'Audio-heavy clips under 30 seconds perform best for cold audiences; save the long-form payoff for your own channel.',
      'If your episodes are under 20 minutes, skip the clipping tool and cut by hand — the tool pays off at episode length, not at clip length.',
    ],
    relatedGuides: ['ai-podcast-production-workflow-2026', 'top-5-ai-tools-10x-youtube-shorts-views'],
    relatedOutcomes: ['short-form-video', 'ai-podcast'],
    faq: [
      {
        q: 'How many shorts should I cut from one episode?',
        a: 'Three to five is the sweet spot for a 45–60 minute episode. More than that and you are usually cutting moments that only work with the surrounding context. The exception: interview episodes with distinct, quotable guests often yield six or more.',
      },
      {
        q: 'Can I do this for free?',
        a: 'Yes, with a slower loop: record locally (Audacity), edit in Descript’s free tier, clip by hand in CapCut’s free captions. The paid versions buy you time per episode, not capability — if you are under two episodes a month, the free path is defensible.',
      },
      {
        q: 'Do audiograms (text + waveform) still work?',
        a: 'They work for podcast discovery on LinkedIn and X, where audio-only content underperforms. On TikTok, Reels and Shorts, motion beats static waveforms — a talking clip or B-roll over audio outperforms an audiogram in almost every case we have seen.',
      },
    ],
  },

  {
    slug: 'faceless-youtube',
    title: 'Faceless YouTube channel',
    intent: 'How do I build a YouTube channel without appearing on camera?',
    intro: [
      'A faceless channel is a narration-and-visuals pipeline: a script, a voice, footage (generated, stock or both), an edit and a package that earns the click. The channels that survive are the ones with a repeatable 3–4 hour weekly process and a visual style viewers can recognise before the thumbnail loads.',
      'This system covers the full loop. Budget honestly: the tools below cost what the catalog says, and the free path — listed under each job — is genuinely workable for the first 10 videos while you learn what your audience wants.',
    ],
    jobs: [
      {
        role: 'Research & script',
        tool: 'claude',
        why: 'Long context means you can paste sources and competitor transcripts, then get a structured draft with the pacing of a video, not an essay.',
        alternatives: ['chatgpt', 'writesonic'],
      },
      {
        role: 'Voiceover',
        tool: 'elevenlabs',
        why: 'The reference point for natural narration; on monetised channels you need the tier that grants commercial rights, so match the plan to licensing, not just character count.',
        alternatives: ['murf-ai', 'lovo-ai'],
      },
      {
        role: 'Visuals',
        tool: 'invideo',
        why: 'Stock-footage assembly from the script with a voiceover track — the fastest way to get coverage for listicle and explainer formats.',
        alternatives: ['pictory', 'runway'],
      },
      {
        role: 'Edit & polish',
        tool: 'capcut',
        why: 'Free, fast, and its auto-captions handle the retention layer; most faceless edits are pacing plus captions plus sound design.',
        alternatives: ['veed', 'descript'],
      },
      {
        role: 'Thumbnail',
        tool: 'canva',
        why: 'Templates plus your own faceless visual style means the thumbnail is a 20-minute job, not a design session.',
        alternatives: ['midjourney', 'thumbly-ai'],
      },
      {
        role: 'SEO & packaging',
        tool: 'tubebuddy',
        why: 'Keyword data plus A/B thumbnail testing inside YouTube Studio — the two levers a faceless channel actually controls.',
        alternatives: ['vidiq', 'nexlev'],
      },
    ],
    workflow: [
      { step: 'Pick the topic from a keyword list with real search demand (not hype)', minutes: 30 },
      { step: 'Write the script to a word count target (≈150 words/minute of video)', minutes: 45 },
      { step: 'Generate the voiceover and spot-check pacing on dense paragraphs', minutes: 15 },
      { step: 'Assemble visuals: stock for coverage, generated shots for the 2–3 money moments', minutes: 40 },
      { step: 'Edit: pacing, captions, sound design, one pattern-interrupt per 30s', minutes: 45 },
      { step: 'Package: 3 thumbnail variants + title, publish, start the A/B test', minutes: 25 },
    ],
    caveats: [
      'Stock-driven assembly looks like stock-driven assembly. Channels built purely on it tend to blend together — the differentiator is the 2–3 custom or generated moments and a consistent visual style.',
      'Voice licensing is the silent failure mode: check that your TTS plan grants commercial rights before you monetise.',
      'This is a volume game. One polished video a month loses to a consistent three-per-week for the first 6 months; plan the pipeline, not the masterpiece.',
    ],
    relatedGuides: ['faceless-youtube-channel-ai-tool-stack', 'best-ai-video-generators-2026-tested'],
    relatedOutcomes: ['short-form-video', 'ai-thumbnail'],
    faq: [
      {
        q: 'Can I really run this for $0/month?',
        a: 'For the first 10 videos: ChatGPT free tier for scripting, your own voice or a free TTS tier for narration, stock from Pexels/ Pixabay, CapCut for editing, Canva free for the thumbnail. The moment you cross ~4 videos a month, the ElevenLabs + TubeBuddy pair (under $45/mo total) is where the money usually goes.',
      },
      {
        q: 'Which niches still work for faceless channels in 2026?',
        a: 'The ones with durable search demand and weak incumbent packaging: how-it-works explainers, history and documentary formats, finance and business mechanics, and evergreen listicles in underserved languages. Trend-chasing niches work too, but they die with the trend.',
      },
      {
        q: 'Will YouTube demonetise AI-voice channels?',
        a: 'YouTube’s policy targets mass-produced repetitive content, not the use of AI voices. Original scripts, a recognisable style and real editing survive; paste-and-regenerate channels do not. The policy language is about value, not tools.',
      },
    ],
  },

  {
    slug: 'ai-thumbnail',
    title: 'AI thumbnail system',
    intent: 'How do I make thumbnails that earn the click without being a designer?',
    intro: [
      'A thumbnail is a 2-second argument. The system that works is boring: a repeatable layout, 3–5 words maximum, a face or a strong object, and a style your channel is recognised by. AI changes the cost structure of the two hard parts — the background image and the concept — while you keep the part that actually earns the click.',
      'Run this once per video. After three videos you will have a template; after ten, you will stop thinking about it at all.',
    ],
    jobs: [
      {
        role: 'Concept & layout',
        tool: 'canva',
        why: 'Duplicate your best-performing thumbnail and change only the subject and text — the fastest path from idea to export, with brand kits keeping everything on-style.',
        alternatives: ['snappa', 'adobe-express'],
      },
      {
        role: 'Background & key art',
        tool: 'midjourney',
        why: 'Generated backgrounds and characters with a distinctive look; text rendering is still unreliable, so add typography in the design tool, not in the image.',
        alternatives: ['leonardo-ai', 'ideogram'],
      },
      {
        role: 'Cutouts & product shots',
        tool: 'photoroom',
        why: 'Clean cutouts from a phone photo in seconds — the workhorse for face or product placement over a generated background.',
        alternatives: ['adobe-express'],
      },
      {
        role: 'Test before you commit',
        tool: 'tubebuddy',
        why: 'A/B testing inside YouTube Studio means the second variant ships while the first is still running — the only honest way to know which one works.',
        alternatives: ['1of10', 'thumbnailtest'],
      },
    ],
    workflow: [
      { step: 'Write 3 thumbnail concepts as one-line layouts (not images)', minutes: 10 },
      { step: 'Generate 4 background options in one style reference; pick 1', minutes: 15 },
      { step: 'Cut out the face/product and composite over the background', minutes: 10 },
      { step: 'Add ≤5 words in your brand font; check at phone size', minutes: 10 },
      { step: 'Export, upload, start the A/B test at publish time', minutes: 5 },
    ],
    caveats: [
      'Midjourney text is still unreliable — generate the visual, add the words in Canva. Thumbnails that put rendered-in text through the generator read as broken within two years of style drift.',
      'A/B results need sample size: under ~10k impressions the difference is usually noise. Let a test run at least 48 hours.',
      'The thumbnail earns the click; the first 30 seconds keep it. A 2× CTR thumbnail on a 20% retention video is a loss, not a win.',
    ],
    relatedGuides: ['midjourney-v7-thumbnail-ctr-secrets', 'free-ai-tool-stack-for-new-creators'],
    relatedOutcomes: ['faceless-youtube', 'short-form-video'],
    faq: [
      {
        q: 'Faces or no faces — what works?',
        a: 'Faces win on average for creator channels; objects and high-contrast scenes win for brand and product content. The real rule is consistency: whatever you pick, pick it once and make it recognisable.',
      },
      {
        q: 'How big should the text be?',
        a: 'Readable at 160px wide. If you have to squint at a phone to read it, it is too small — and most viewers never zoom.',
      },
      {
        q: 'Do AI-generated faces in thumbnails count as clickbait?',
        a: 'The thumbnail should represent the video. A generated face of a character that appears in the video is fine; a generated face of a person who does not, with a claim the video cannot deliver, is clickbait — and YouTube increasingly demotes it.',
      },
    ],
  },

  {
    slug: 'short-form-video',
    title: 'Short-form video system',
    intent: 'How do I produce Shorts, Reels and TikToks consistently?',
    intro: [
      'Short-form is a hook game with a production pipeline underneath. The videos that grow are the ones with a first 2 seconds that stops the thumb, captions that keep the eye, and a cadence that the algorithm can schedule around. The tools below do the repetitive 70%; your job is the hook and the last 20%.',
      'Whether you clip from long-form or create from scratch, the finishing layer — captions, pacing, sound — is the same system.',
    ],
    jobs: [
      {
        role: 'Find and cut the moment',
        tool: 'opusclip',
        why: 'If you have long-form source, it ranks the moments for you; if you are creating from scratch, this slot is your pre-production note list, and the tool slot goes to CapCut.',
        alternatives: ['klap', 'vizard'],
      },
      {
        role: 'Captions & retention styling',
        tool: 'submagic',
        why: 'Animated captions, auto zooms, B-roll and SFX in one pass — the finishing layer that separates “raw clip” from “finished short”.',
        alternatives: ['capcut', 'captions', 'zeemo'],
      },
      {
        role: 'Edit & export',
        tool: 'capcut',
        why: 'Free, cross-platform, trend-templates that match what is currently working on TikTok, and 9:16 exports for every platform.',
        alternatives: ['veed', 'descript'],
      },
      {
        role: 'Hook & title',
        tool: 'chatgpt',
        why: 'Five cold-open options in one prompt; pick the one that works spoken out loud, not the one that reads clever.',
        alternatives: ['1of10', 'claude'],
      },
      {
        role: 'SEO & distribution',
        tool: 'tubebuddy',
        why: 'For YouTube Shorts: keyword data and the publish analytics that tell you which hooks are actually working.',
        alternatives: ['vidiq', 'repurpose-io'],
      },
    ],
    workflow: [
      { step: 'Pick the moment (from your footage or a content note)', minutes: 10 },
      { step: 'Cut it: hook in the first 2 seconds, no intro, one idea per clip', minutes: 15 },
      { step: 'Style: captions, zooms, B-roll, sound design', minutes: 15 },
      { step: 'Write 5 hook options; pick one; write the one-line caption', minutes: 10 },
      { step: 'Publish to your primary platform; repost the same file to the others', minutes: 10 },
    ],
    caveats: [
      'The same file, posted to three platforms, is not laziness — it is the strategy. Native-looking variations (different first line, different cover frame) help; full re-edits per platform rarely pay for their time.',
      'Caption tools transcribe; they do not edit. A bad transcript in a caption is worse than no caption — review every word before export.',
      'Consistency beats volume: three-per-week for six months outperforms 20 in a month and silence, because the algorithm (and your audience) reward the pattern.',
    ],
    relatedGuides: ['top-5-ai-tools-10x-youtube-shorts-views', 'free-ai-tool-stack-for-new-creators'],
    relatedOutcomes: ['podcast-to-shorts', 'faceless-youtube'],
    faq: [
      {
        q: 'What is the ideal short length in 2026?',
        a: 'Match the length to the idea, not to a number — but the retention curve is unforgiving past 60 seconds for cold audiences. Under 35 seconds for discovery clips, up to 90 for established audiences, never padding.',
      },
      {
        q: 'Should I show my face?',
        a: 'Talking-head shorts with captions outperform pure B-roll on average for creator growth, because the face is the brand. Faceless shorts work for product, food and process content where the visual is the point.',
      },
      {
        q: 'Do trending sounds matter?',
        a: 'They are a small, decaying boost — a head start in the first 24 hours. They do not rescue a bad hook, and a good hook survives without one. Use them when they fit the edit, not when they trend.',
      },
    ],
  },

  {
    slug: 'ai-voiceover',
    title: 'AI voiceover & dubbing',
    intent: 'How do I get studio-quality narration and multilingual versions without a studio?',
    intro: [
      'Voice is where AI has genuinely closed the gap: narration that does not sound synthetic, and dubbing that carries a speaker into other languages with their voice. The practical system has three layers — the voice itself, the audio cleanup, and (for international distribution) the dubbing pass.',
      'One rule above all: check the commercial rights on your exact plan before you monetise. Free tiers historically exclude commercial use, and that is the most expensive surprise in this niche.',
    ],
    jobs: [
      {
        role: 'Narration',
        tool: 'elevenlabs',
        why: 'The reference point for natural TTS and voice cloning; tiers are metered in characters and the commercial-rights boundary is what you are actually buying.',
        alternatives: ['murf-ai', 'lovo-ai'],
      },
      {
        role: 'Voice cloning (your own)',
        tool: 'descript-overdub',
        why: 'A text-to-speech model of your own voice so you fix mistakes by typing instead of re-recording — with the ownership verification that responsible cloning requires.',
        alternatives: ['resemble-ai'],
      },
      {
        role: 'Cleanup & enhancement',
        tool: 'adobe-podcast',
        why: 'Free one-click speech enhancement for anything you recorded yourself — the quickest quality win in the whole pipeline.',
        alternatives: ['auphonic'],
      },
      {
        role: 'Dubbing into other languages',
        tool: 'rask-ai',
        why: 'Full-video translation with voice-cloned dubbing — one source video becomes a dozen language versions.',
        alternatives: ['heygen', 'dubverse'],
      },
      {
        role: 'Loudness & QC',
        tool: 'auphonic',
        why: 'Automated loudness normalisation (−16 LUFS for streaming) so every episode sounds the same, whichever voice generated it.',
        alternatives: ['cleanvoice'],
      },
    ],
    workflow: [
      { step: 'Write the script to a word count target; mark pauses and emphasis', minutes: 20 },
      { step: 'Generate a 60-second test read; pick the voice and settings that survive it', minutes: 15 },
      { step: 'Generate the full narration; spot-check dense paragraphs and numbers', minutes: 10 },
      { step: 'Enhance/clean; normalise loudness to −16 LUFS', minutes: 10 },
      { step: 'For dubbing: run the video through the dubbing tool, review the lip-sync and re-generates per language', minutes: 30 },
    ],
    caveats: [
      'Commercial rights are plan-specific and change — the tool page shows when we last checked the pricing page, and the plan page is the final word.',
      'Cloned voices need the speaker’s explicit verification. Cloning a voice you do not own is a liability, not a feature.',
      'Dubbing QC is per-language: a good English master does not guarantee a good Arabic or Korean localisation. Listen to the first 60 seconds of every language before shipping.',
    ],
    relatedGuides: ['elevenlabs-vs-heygen-voice-avatar-comparison', 'complete-guide-ai-multilingual-video-dubbing'],
    relatedOutcomes: ['faceless-youtube', 'dubbed-content'],
    faq: [
      {
        q: 'Is AI voiceover acceptable for monetised YouTube?',
        a: 'Yes — YouTube’s monetisation rules concern repetitive, mass-produced content, not the voice source. Original script + natural narration + real editing is fine. The constraints are your TTS plan’s commercial terms and YouTube’s value judgement, not a voice ban.',
      },
      {
        q: 'Cloning my own voice — how much sample is needed?',
        a: 'Most tools want 1–30 minutes of clean speech. ElevenLabs’ instant clone works from a minute or two; the professional grade needs more. Record in a quiet room; reverb is the enemy of a good clone.',
      },
      {
        q: 'Voice cloning for dubbing — do the lip movements match?',
        a: 'HeyGen and Rask regenerate lip movement for presenter video; pure audio dubbing (Auphonic + TTS) leaves the original lips. For talking-head videos, use the lip-sync tools; for B-roll narration, audio-only is fine.',
      },
    ],
  },

  {
    slug: 'ai-ugc',
    title: 'AI UGC ads',
    intent: 'How do I make product ad videos that look like creator content, without hiring creators?',
    intro: [
      'UGC-style ads — the handheld, creator-voiced product testimonial — are the highest-converting short-form ad format, and they are a talent market you cannot keep up with. AI presenters close most of the gap: a script, a synthetic (or cloned) presenter, product cutouts, and a fast edit that looks native to the feed.',
      'The honest caveat first: the best UGC ads still feel human, and viewers can sense a synthetic presenter in high-emotion content. This system is strongest for product explainers, demos and feature callouts — the formats where the product is the star.',
    ],
    jobs: [
      {
        role: 'Ad script',
        tool: 'chatgpt',
        why: 'Hook, problem, product, proof, CTA — the five-beat UGC structure in one prompt, with three hook variants per ad.',
        alternatives: ['claude', 'copy-ai'],
      },
      {
        role: 'AI presenter',
        tool: 'heygen',
        why: 'A photoreal avatar from a short recording of you — or a stock avatar — delivering the script with lip-sync; the most creator-facing of the avatar platforms.',
        alternatives: ['d-id', 'synthesia', 'colossyan'],
      },
      {
        role: 'Product visuals',
        tool: 'canva',
        why: 'Cutouts, backgrounds and feature callouts at ad speed; brand kits keep every ad on-brand.',
        alternatives: ['photoroom', 'adobe-express'],
      },
      {
        role: 'Edit & export',
        tool: 'capcut',
        why: '9:16, captions, native pacing and the platform sizes in one free tool — the ad should not look like an ad tool’s output.',
        alternatives: ['veed'],
      },
    ],
    workflow: [
      { step: 'Write 3 hook variants + the 5-beat body (60–90 seconds of script)', minutes: 20 },
      { step: 'Generate the presenter video from the best hook variant', minutes: 15 },
      { step: 'Cut out the product; build 2–3 feature callouts', minutes: 15 },
      { step: 'Edit: presenter + product + callouts, captions on, native pacing', minutes: 20 },
      { step: 'Export per platform; ship 2–3 variants for the ad account', minutes: 10 },
    ],
    caveats: [
      'Per-minute pricing on avatar tools makes long ads expensive — keep scripts under 90 seconds and batch the renders.',
      'Disclosure: ad platforms and the FTC expect clear advertising disclosure for synthetic presenters. Do not disguise a synthetic creator as a real customer.',
      'The format is winning on product clarity, not on the presenter’s realism. If the product is not the star in the edit, no avatar saves it.',
    ],
    relatedGuides: ['elevenlabs-vs-heygen-voice-avatar-comparison', 'best-ai-video-generators-2026-tested'],
    relatedOutcomes: ['short-form-video', 'ai-thumbnail'],
    faq: [
      {
        q: 'Do AI UGC ads actually convert?',
        a: 'They convert at the level of the script and offer, not the presenter. Teams that treat the avatar as a delivery vehicle for a proven hook structure get strong results on explainers and demos; teams that hope the face saves a weak script do not.',
      },
      {
        q: 'Cloning myself as the UGC presenter — is that worth it?',
        a: 'Yes, for recurring campaigns: the consistent “founder” or “spokesperson” clone builds recognition across dozens of ad variants, and it removes the re-shoot cost when the script changes. It is the highest-leverage use of the cloning features.',
      },
      {
        q: 'HeyGen vs Synthesia for UGC?',
        a: 'HeyGen for creator-style, casual, on-trend content and lip-synced translation; Synthesia for structured, presentation-style explainers at multilingual volume. The tones do not overlap much, and UGC leans HeyGen.',
      },
    ],
  },

  {
    slug: 'ai-podcast',
    title: 'AI-assisted podcast pipeline',
    intent: 'How do I produce a professional podcast solo, without an audio engineer?',
    intro: [
      'The modern solo podcast is a one-person pipeline: record, edit by transcript, polish the audio to broadcast loudness, and ship clips. Every layer has a tool that used to require a studio or an engineer, and the whole loop runs in an afternoon for a 60-minute episode.',
      'The quality floor this gives you is real: consistent loudness, no dead air, clean fillers — the three things listeners notice before they notice your topic.',
    ],
    jobs: [
      {
        role: 'Record',
        tool: 'riverside',
        why: 'Multi-track remote recording with studio-quality local audio for every participant; the separate tracks are your insurance against one bad take.',
        alternatives: ['podcastle', 'streamyard'],
      },
      {
        role: 'Edit by transcript',
        tool: 'descript',
        why: 'The episode edit is sentence deletion — filler words, tangents and dead air — done in the transcript, with Studio Sound cleaning the room.',
        alternatives: ['cleanvoice', 'filmora'],
      },
      {
        role: 'Polish to broadcast level',
        tool: 'auphonic',
        why: 'Automated noise reduction and loudness normalisation to −16 LUFS, the streaming standard — every episode sounds the same on day one and day 300.',
        alternatives: ['adobe-podcast'],
      },
      {
        role: 'Clips for social',
        tool: 'opusclip',
        why: 'The finished episode in, ranked vertical clips out — the distribution layer that makes the podcast a growth engine instead of an archive.',
        alternatives: ['headliner', 'klap'],
      },
      {
        role: 'Distribute',
        tool: 'repurpose-io',
        why: 'One publish action to every platform; the episode, the show notes and the clips all ship the same day.',
        alternatives: ['zapier'],
      },
    ],
    workflow: [
      { step: 'Record the episode (guest or solo) with multi-track audio', minutes: 60 },
      { step: 'Transcript edit: cut tangents, strip fillers, tighten the intro', minutes: 45 },
      { step: 'Polish: noise reduction + loudness to −16 LUFS', minutes: 10 },
      { step: 'Clip 3–5 moments; style captions; fix transcriptions', minutes: 25 },
      { step: 'Publish episode + show notes + clips, same day', minutes: 15 },
    ],
    caveats: [
      'Transcript editing is where podcasts get cut well or cut badly: the test is whether a listener who missed the first 10 minutes still knows what is going on at minute 11.',
      'Auphonic is per-minute priced — long-form shows should batch a month of episodes, not upload one by one.',
      'Show notes with chapters are not optional in 2026: most listening happens on phones with the episode half-sketched past.',
    ],
    relatedGuides: ['ai-podcast-production-workflow-2026', 'free-ai-tool-stack-for-new-creators'],
    relatedOutcomes: ['podcast-to-shorts', 'ai-voiceover'],
    faq: [
      {
        q: 'Do I really need a multi-track recorder?',
        a: 'For solo shows: no — Audacity + a decent USB mic is enough, and Descript will still edit the transcript. For interviews: yes, or one flubbed sentence kills the whole take.',
      },
      {
        q: 'What loudness target should I use?',
        a: '−16 LUFS integrated for Spotify/Apple streaming, −14 LUFS for podcasts distributed through Apple’s pipeline. Auphonic handles the measurement — the point is that every episode hits the same number.',
      },
      {
        q: 'How long should episodes be?',
        a: 'The retention data is unforgiving: 25–40 minutes for most creator podcasts, 60+ only when the format (interview, documentary) earns it. A 20-minute tight episode beats a 50-minute meandering one every time.',
      },
    ],
  },

  {
    slug: 'dubbed-content',
    title: 'Dub your existing videos',
    intent: 'How do I take the videos I already have into other languages?',
    intro: [
      'Your existing back catalogue is your cheapest growth: the content is proven, and the only thing standing between it and a new audience is the language barrier. The dubbing stack — translation with voice-cloned speech, regenerated lip sync for talking heads, and subtitles as the safety layer — turns one video into a dozen regional versions.',
      'Budget honestly: dubbing tools price per minute of video, and the QC pass per language is where the real time goes. Start with the two languages your analytics already show curiosity in, not with all fourteen.',
    ],
    jobs: [
      {
        role: 'Translate & dub',
        tool: 'rask-ai',
        why: 'Full-video translation with voice-cloned dubbing — your voice in the other language, keeping the source video’s pacing.',
        alternatives: ['heygen', 'dubverse', 'papercup'],
      },
      {
        role: 'Lip sync (talking heads)',
        tool: 'heygen',
        why: 'Regenerates the lip movement for the new language — the difference between “dubbed” and “recorded in that language” for presenter video.',
        alternatives: ['rask-ai'],
      },
      {
        role: 'Subtitle track',
        tool: 'happy-scribe',
        why: 'Accurate auto-transcription per language with a human-review pass — subtitles are the fallback that works even when a viewer mutes.',
        alternatives: ['checksub', 'zeemo'],
      },
      {
        role: 'Voice quality (optional)',
        tool: 'elevenlabs',
        why: 'When the cloning result is not right, the best synthetic voices in the language are one API away; dubbing tools let you swap the voice per language.',
        alternatives: ['wellsaid-labs', 'cartesia'],
      },
      {
        role: 'Publish per region',
        tool: 'repurpose-io',
        why: 'Each language version ships to the right regional channels; one workflow, many markets.',
        alternatives: ['zapier'],
      },
    ],
    workflow: [
      { step: 'Pick the top 5 videos by existing performance; pick 2 target languages', minutes: 15 },
      { step: 'Run the translation + dubbing pass; review the script translation before rendering', minutes: 20 },
      { step: 'Regenerate lip sync for presenter segments; re-render weak takes', minutes: 30 },
      { step: 'Generate the subtitle track per language; fix the worst 10 transcriptions', minutes: 25 },
      { step: 'Publish per region with local titles and descriptions', minutes: 20 },
    ],
    caveats: [
      'Translate the script, not just the audio — a literal translation that reads wrong in the target language is worse than a localised rewrite. Budget 20 minutes per language for the script pass.',
      'Cultural localisation is not translation: prices, units, humour and references all need a human eye. The tools get you 80%; the last 20% is your judgment.',
      'Lip-sync quality varies by language and by face geometry. If a language looks uncanny, ship it with subtitles instead of the lip-sync version.',
    ],
    relatedGuides: ['complete-guide-ai-multilingual-video-dubbing', 'ai-tools-seo-guide-video-creators'],
    relatedOutcomes: ['ai-voiceover', 'faceless-youtube'],
    faq: [
      {
        q: 'Which languages are worth dubbing first?',
        a: 'The ones your analytics already show intent in: non-English viewers who watch your content, or the largest adjacent markets to your audience. Spanish, Portuguese, Hindi, Arabic and Japanese are the highest-value targets for most English creator channels.',
      },
      {
        q: 'Does dubbing hurt SEO for the original video?',
        a: 'No — the original stays the canonical version; dubs are separate uploads (or dubbed tracks) in their own markets. The original’s ranking is unaffected, and the dubs compound reach.',
      },
      {
        q: 'Is audio-only dubbing (no lip sync) acceptable?',
        a: 'For B-roll, screen and product content: yes, fully. For talking heads: viewers notice the mismatch within seconds — use lip sync or ship subtitles-only for that language.',
      },
    ],
  },
];

export const getOutcome = (slug: string): Outcome | undefined =>
  OUTCOMES.find((o) => o.slug === slug);
