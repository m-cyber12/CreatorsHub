#!/usr/bin/env node
/**
 * seed-ui-v3.mjs (2026-08-08)
 * ---------------------------------------------------------------
 * Completes the UI message tree for the last untranslated pages:
 * stack-builder, calculators, benchmark, developers, compare/[pair],
 * alternatives, account, login, privacy, terms, submit, founders,
 * jobs, templates and the admin panel chrome.
 *
 * It merges the new namespaces into messages/en.json (English source)
 * and mirrors the SAME structure into the other 7 locale files with
 * English placeholder text, so key parity is preserved and
 * `npm run translate:ui` then translates only the new/changed keys
 * (hash-tracked via messages/.cache).
 *
 * Usage: node scripts/seed-ui-v3.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';

const LOCALES = ['en', 'es', 'pt', 'fr', 'de', 'zh', 'ar', 'fa'];

/* ────────────────────────── new UI namespaces ────────────────────────── */

const UI = {
  stackBuilder: {
    badge: 'Interactive workflow planner',
    intro:
      'Pick the outcome and the budget — you get a role-by-role stack with swappable tools, prices computed live from the catalog, and a link you can share. These are editorial picks, not test results: verification labels on each tool tell you exactly how far we can vouch for it.',
    stepGoal: '1 · What are you building?',
    stepBudget: "2 · What's the budget?",
    yourStack: 'Your {budget} stack for “{goal}”',
    shareLink: 'Share link',
    linkCopied: 'Link copied!',
    copySummary: 'Copy summary',
    copied: 'Copied!',
    reset: 'Reset',
    roleLabel: 'Role {n} · {role}',
    chooseTool: 'Choose a tool for {role}',
    visit: 'Visit',
    totalLabel: 'Estimated monthly total',
    perMonth: '/mo',
    totalNoteFree:
      'Summed from listed entry prices in the catalog — free tiers may limit commercial use, check each tool.',
    totalNotePaid:
      'Summed from listed entry prices in the catalog — real spend depends on the plans and credits you actually use.',
    ctaDeals: 'Check free plans & deals',
    disclaimer:
      'Editorial picks based on catalog data and workflow fit — not hands-on test results. Your stack is saved in this browser and the URL updates as you change it, so you can share the exact combination.',
    copyTitle: 'My {budget} stack for: {goal} — via CreatorAI Hub',
    copyRole: '{role}: {name} ({price})',
    copyTotal: 'Estimated total: {total}/mo from listed entry prices',
    copyPlan: 'Plan yours: /stack-builder',
    goals: {
      faceless: {
        label: 'Faceless channel',
        blurb: 'Script → voice → video → packaging, without appearing on camera.',
      },
      shorts: {
        label: 'Shorts & clips',
        blurb: 'Turn long recordings into vertical clips people actually finish.',
      },
      podcast: {
        label: 'Podcast pipeline',
        blurb: 'Record clean, edit by transcript, ship clips and show notes.',
      },
      thumbnails: {
        label: 'Thumbnails & CTR',
        blurb: 'Generate the image, add the typography, test the package.',
      },
      dubbing: {
        label: 'International dubbing',
        blurb: 'Unlock new audiences by taking existing videos into other languages.',
      },
      avatars: {
        label: 'Avatar presenter',
        blurb: 'A synthetic presenter delivers your script on camera.',
      },
    },
    slots: {
      faceless: {
        scripting: { role: 'Scripting & research', hint: 'Ideas, outlines and full scripts' },
        voiceover: { role: 'Voiceover', hint: 'Narration that carries the video' },
        assembly: { role: 'Video assembly', hint: 'Script + voice + visuals into a finished video' },
        packaging: { role: 'SEO & packaging', hint: 'Titles, keywords and thumbnail research' },
      },
      shorts: {
        clip: { role: 'Clip extraction', hint: 'Find and cut the best moments' },
        captions: { role: 'Captions & styling', hint: 'Animated captions, zooms, B-roll' },
        finetune: { role: 'Fine-tune editing', hint: 'Manual polish when the AI gets it 90% right' },
      },
      podcast: {
        recording: { role: 'Recording', hint: 'Remote interviews with local-quality audio' },
        editing: { role: 'Editing & cleanup', hint: 'Cut by text, remove fillers, level audio' },
        clips: { role: 'Clip distribution', hint: 'Audiograms and vertical clips per episode' },
      },
      thumbnails: {
        image: { role: 'Image generation', hint: 'Backgrounds, characters and key art' },
        design: { role: 'Design & typography', hint: 'Layout, text and platform-sized exports' },
        testing: { role: 'Testing & research', hint: 'Outlier research before you commit' },
      },
      dubbing: {
        translate: { role: 'Translation & dubbing', hint: 'Full-video localization with cloned voices' },
        voice: { role: 'Voice quality', hint: 'When you need narration-level TTS separately' },
        subtitles: { role: 'Subtitles & QC', hint: 'Readable subtitles and human review passes' },
      },
      avatars: {
        avatar: { role: 'Avatar & delivery', hint: 'The presenter that reads your script' },
        scripting: { role: 'Scripting', hint: 'Tight scripts read better by avatars' },
        polish: { role: 'Editing & polish', hint: 'Cut, caption and resize the output' },
      },
    },
    budgets: {
      free: { label: '$0 — Free', blurb: 'Only tools with a genuinely free way in.' },
      budget: { label: 'Budget', blurb: 'The cheapest paid entry per role.' },
      pro: { label: 'Pro', blurb: 'The flagship pick per role, price aside.' },
    },
  },

  calculators: {
    badge: 'Free Interactive Creator Tools',
    pageHeading: 'Creator AI Calculators',
    pageSub:
      'Calculate your optimal AI stack budget, estimate hours saved per week, and verify commercial YouTube monetization rights across top AI video tools.',
    freeBadge: '100% Free & Instant',
    freeBadgeSub: 'Live pricing & copyright database',
    free: 'Free',
    tabStack: 'AI Stack Cost Calculator',
    tabTime: 'Video Time Saved Calculator',
    tabCopyright: 'Commercial Copyright Checker',
    stackHeading: 'Select Tools for Your Stack',
    stackSub:
      'Click any tool below to include or remove it from your monthly creator budget calculation.',
    budgetBreakdown: 'Monthly Budget Breakdown',
    totalNote:
      "Total of listed entry prices for {count} selected tools. Where a price is source-checked it links to the official page; otherwise it is the vendor's listed entry price.",
    yourStackCost: 'Your AI stack cost:',
    roiTitle: 'Time-value scenario',
    yourTimeValue: 'Your time value',
    lowHrs: 'Low hrs',
    baseHrs: 'Base hrs',
    highHrs: 'High hrs',
    low: 'Low',
    base: 'Base',
    high: 'High',
    roiNote:
      'Scenario estimate of the time value AI tools could free up at your entered hourly rate. This is an assumption, not a measured result — no real workflow time was benchmarked.',
    compareCta: 'Compare Selected Tools ({count})',
    timeHeading: 'Input Your Weekly Video Output',
    rawHours: 'Raw footage recorded per week:',
    videosPerWeek: 'Shorts / Videos published per week:',
    hourlyRate: 'Your time value ($ per hour):',
    timeSavedLabel: 'Estimated time saved (scenario)',
    timeSavedSub: 'Rough estimate based on the minutes you enter — not a measured workflow result.',
    monthlyValue: 'Monthly Time Dollar Value',
    monthlyValueNote:
      'Estimated at your {rate}/hr time value. A planning figure, not a measured saving.',
    browseCta: 'Browse Recommended Tools',
    hoursUnit: 'hours',
    videosUnit: 'videos',
    copyrightHeading: 'Commercial Rights & YouTube Monetization',
    copyrightSub:
      'Check whether outputs from your AI video tools can be monetized on YouTube or used in client work.',
    searchPlaceholder: 'Search tool name (e.g. Midjourney, Suno)...',
    statusAllowed: 'Commercial use allowed',
    statusRestricted: 'Restricted',
    statusUnclear: 'Unclear — verify',
    freePlan: 'Free Plan:',
    paidPlan: 'Paid Plan:',
    termsChecked: 'Terms checked:',
    officialTerms: 'Official terms & source',
    readToolPage: 'Read tool page',
    notLegalAdvice: 'Not legal advice',
    legalDisclaimer:
      'These summaries are based on publicly available terms of service as of the stated check date. Always verify current terms before monetizing content. We are not lawyers.',
    rules: {
      midjourney: {
        free: 'No free tier',
        paid: 'Full commercial rights on paid plans ($10/mo+)',
        notes:
          'Images made under a paid plan can be used commercially per Midjourney terms, including YouTube monetization.',
      },
      suno: {
        free: 'Non-commercial only',
        paid: 'Commercial use on paid plans',
        notes:
          'Free-plan output is non-commercial; a paid subscription grants commercial rights. Licensing can vary by asset and jurisdiction.',
      },
      elevenlabs: {
        free: 'Attribution required',
        paid: 'Commercial use without attribution on paid plans',
        notes:
          'Free tier requires credit in the video description; paid tiers remove attribution. Check current terms.',
      },
      runway: {
        free: 'Non-commercial only',
        paid: 'Commercial use on Standard and above',
        notes:
          'Outputs on paid tiers are generally usable commercially, but confirm per-version terms before broadcasting.',
      },
      opusclip: {
        free: 'Watermarked, non-commercial',
        paid: 'Commercial use on paid plans',
        notes:
          'Paid tiers export unwatermarked clips; check OpusClip terms for monetization specifics.',
      },
      capcut: {
        free: 'Personal use only for stock/audio library',
        paid: 'Commercial license for included Pro assets',
        notes:
          'Licensing flags on individual stock/music tracks vary; verify each asset before monetizing.',
      },
    },
  },

  benchmark: {
    badge: 'Benchmark Lab',
    intro:
      'Marketing pages all claim the same things. The only way to compare tools honestly is to give them identical work and publish what comes back. Below are the five standard briefs we run, the exact measurements we record, and — importantly — how far through the programme we actually are.',
    statusHeading: 'Current status',
    statCatalogued: 'Tools catalogued',
    statTested: 'Hands-on tested',
    statBriefs: 'Standard briefs',
    testedNote:
      '{count} core AI video tools have completed our 24-point benchmark brief. We publish transparent sub-scores across Output Quality, Speed, Value for Money, Ease of Use, and Export Freedom.',
    startNoteStrong: 'We are at the start of this.',
    startNote:
      'No tool has completed a full brief yet, so no tool on this site carries a numeric score. We would rather show an empty scoreboard than a full one we invented — every listing says plainly whether it has been tested, price-checked, or simply catalogued.',
    briefsHeading: 'The five standard briefs',
    briefsSub:
      'Every tool in a category receives byte-identical input. No tool gets a second chance the others did not get.',
    fixedInput: 'Fixed input',
    task: 'Task',
    whatWeRecord: 'What we record',
    scoringHeading: 'How scores are calculated',
    scoringIntro:
      'Each tested tool gets five sub-scores from 0 to 10. The overall figure is a weighted average, computed rather than hand-adjusted, so we cannot quietly nudge a favourite upward.',
    metricQuality: 'Output quality',
    metricQualityDesc: 'How good is the result you can actually publish',
    metricEase: 'Ease of use',
    metricEaseDesc: 'Time to a first good result without reading documentation',
    metricValue: 'Value for money',
    metricValueDesc: 'Output quality per dollar at the entry paid tier',
    metricSpeed: 'Speed',
    metricSpeedDesc: 'Wall-clock time from input to usable output',
    metricExport: 'Export freedom',
    metricExportDesc: 'Watermarks, resolution caps and commercial rights',
    scoringNote:
      'We use the full range. A 5 out of 10 is a normal, useful score — if nothing ever scored below 7, the numbers would carry no information at all.',
    independenceHeading: 'Independence',
    independenceItems: [
      'We pay for our own subscriptions at the tier we test.',
      'Vendors cannot pay for a score, a ranking position, or a re-test with a better result.',
      'If we ever accept paid placement it will be labelled “Sponsored” and excluded from scoring entirely.',
      'Where a tool has not been tested we say so, rather than filling the gap with a plausible-looking number.',
    ],
    seeAlso: 'See also our {disclosure} and {policy}.',
    disclosureLink: 'affiliate disclosure',
    policyLink: 'editorial policy',
    briefs: {
      b1: {
        name: 'The podcast cut',
        input: 'One fixed 60-minute two-person podcast episode, 1080p, lavalier audio.',
        task: 'Produce the best five vertical short clips the tool can find, with captions burned in.',
        measures: [
          'Wall-clock time from upload to downloadable output',
          'Caption word error rate against a human transcript',
          'Speaker framing accuracy across cuts',
          'How many of the five clips are genuinely publishable without edits',
          'Cost in credits, converted to cost per finished clip',
        ],
      },
      b2: {
        name: 'The cinematic shot',
        input: 'One fixed prompt: a specific camera move, subject and lighting condition.',
        task: 'Generate the shot. Five attempts allowed, best result counts.',
        measures: [
          'Prompt adherence, scored against a written rubric',
          'Temporal coherence — when artefacts first appear',
          'Maximum usable clip length before the model drifts',
          'Whether audio is generated natively',
          'Attempts needed before one usable result, and total cost of those attempts',
        ],
      },
      b3: {
        name: 'The talking head',
        input: 'One fixed 150-word educational script, English.',
        task: 'Generate a full-screen avatar speaking the script.',
        measures: [
          'Lip-sync accuracy at normal playback speed',
          'Natural eye movement and blink cadence',
          'Render time from prompt submission to finished MP4',
          'Cost per minute of finished video at the starter tier',
        ],
      },
      b4: {
        name: 'The clean-up',
        input: 'One 60-second voice recording with air-conditioning hum and room echo.',
        task: 'Clean the audio and level the voice.',
        measures: [
          'Noise reduction without audible gating artefacts',
          'Preservation of natural voice timbre',
          'Processing time',
        ],
      },
      b5: {
        name: 'The dub',
        input: 'One 60-second English talking-head clip.',
        task: 'Dub into Spanish with voice cloning.',
        measures: [
          'Voice likeness to the original English speaker',
          'Natural Spanish prosody and pacing',
          'Whether commercial rights are included at the tier tested',
          'Cost per finished audio minute',
        ],
      },
    },
  },

  developers: {
    metaTitle: 'Public API — Free AI Tools Data for Developers',
    metaDescription:
      'Free read-only JSON API with {count}+ curated AI video tools: names, categories, pricing, verification levels, and tags. Rate-limited, no key required.',
    metaDescriptionOg:
      'Free read-only JSON API with {count}+ curated AI video tools. Rate-limited, no key required.',
    badge: 'Public API v1 — Free',
    heading: 'Build with our tools data',
    intro:
      'A free, read-only JSON API exposing all {count}+ curated AI tools — names, categories, verified pricing, verification levels, verified benchmark scores, and tags. No API key required. Just add attribution with a link back to CreatorAI Hub.',
    featKeyTitle: 'No key required',
    featKeyDesc: '60 requests/min per IP. CORS enabled for browser apps.',
    featDataTitle: '{count}+ tools',
    featDataDesc: '{cats} categories, refreshed with every site update.',
    featCacheTitle: 'Cached & fast',
    featCacheDesc: 'Edge-cached for 1 hour with stale-while-revalidate.',
    endpoint: 'Endpoint',
    params: 'Query Parameters',
    param: 'Param',
    type: 'Type',
    description: 'Description',
    qDesc: 'Search query — typo & synonym tolerant (e.g. caption also matches subtitles).',
    categoryDesc: 'One of: {list}.',
    pricingDesc: 'Free · Freemium · Paid · Free Trial',
    testedDesc: 'Only hands-on-tested tools — the only entries that can carry a verified_score.',
    tagsDesc: 'AND-filter on catalog tags, case-insensitive (e.g. Shorts,Auto-Captions).',
    limitDesc: '1–100, default 50.',
    offsetDesc: 'Pagination offset, default 0.',
    example: 'Example',
    response: 'Response',
    termsLabel: 'Terms:',
    termsBody:
      'Free for personal and non-commercial projects with visible attribution (“Data by CreatorAI Hub” + link). For commercial usage, bulk exports, or webhooks, {contact}.',
    contact: 'contact us',
  },

  comparePair: {
    notFound: 'Comparison not found',
    metaTitle: '{a} vs {b}: Which Should You Use in 2026?',
    metaDescription:
      '{a} ({pa}) compared with {b} ({pb}) on price, features, export freedom and who each one actually suits.',
    ogTitle: '{a} vs {b} (2026)',
    ogDescription: 'A side-by-side comparison of two {category} tools.',
    home: 'Home',
    compare: 'Compare',
    intro: 'Both are {category} tools, but they suit different workflows.',
    cheaperIntro: '{name} is the cheaper entry point; ',
    similarIntro: 'They start at a similar price; ',
    introTail:
      'the sections below compare what we can actually verify — pricing, tier model and capability coverage.',
    noteScores: 'A note on scores:',
    noteScoresBody:
      'we have not yet run either tool hands-on, so this page compares verifiable facts rather than our opinion. We do not publish scores we cannot defend.',
    vs: 'vs',
    sideBySide: 'Side by side',
    attribute: 'Attribute',
    capabilityCoverage: 'Capability coverage',
    capability: 'Capability',
    yes: 'Yes',
    no: 'No',
    coverageNote:
      'Coverage is based on the capabilities we catalog for each tool. A missing mark means we do not track that capability for it, not necessarily that it is impossible.',
    commonQuestions: 'Common questions',
    moreAlternatives: 'More {name} alternatives',
    buildYourOwn: 'Build your own comparison',
    rowCategory: 'Category',
    rowPricing: 'Pricing model',
    rowPrice: 'Starting price',
    rowScore: 'Our score',
    notTested: 'Not tested',
    rowVerification: 'Verification',
    rowMetric: 'Standout metric',
    rowLaunched: 'Launched',
    testedSuffix: '/10 tested',
    visitTool: 'Visit {name}',
    faqQCheaper: 'Is {a} or {b} cheaper?',
    faqCheaperA:
      '{name} is cheaper at the entry tier — {pa} versus {pb}. Check what each tier actually includes before deciding, since credit limits often matter more than headline price.',
    faqCheaperB:
      'Both start at a similar price point ({pa} and {pb}). The real cost difference will come from how each one meters usage.',
    faqQUniqueA: 'What can {a} do that {b} cannot?',
    faqUniqueA:
      'Based on the capabilities we track, {a} covers {list} where {b} does not.',
    faqUniqueANone:
      "Nothing we track distinguishes {a}'s feature coverage from {b}'s — they overlap closely, so the decision comes down to workflow fit and price.",
    faqQUniqueB: 'What can {b} do that {a} cannot?',
    faqUniqueB: '{b} covers {list}, which {a} does not.',
    faqUniqueBNone:
      "Nothing we track distinguishes {b}'s feature coverage from {a}'s.",
  },

  account: {
    headingMain: 'My Creator Space',
    loading: 'Loading…',
    guest: 'Guest mode — bookmarks are stored on this device.',
    signInSync: 'Sign in to sync across devices',
    savedTools: 'Saved Tools ({count})',
    savedSub: 'Tools you bookmarked while browsing the directory.',
    nothingSaved: 'Nothing saved yet',
    nothingSavedSub: 'Tap the bookmark icon on any tool card to build your personal AI toolbox.',
    browseTools: 'Browse {count}+ Tools',
  },

  login: {
    welcome: 'Welcome to CreatorAI Hub',
    welcomeSub:
      'Sync your saved tools, post reviews, and get early access to deals. No password needed.',
    authNotConfigured:
      'Auth backend not configured yet. Add {url} and {key} in Vercel, then run supabase-launch-upgrade.sql. Bookmarks still work locally.',
    magicSent: 'Magic link sent!',
    magicSentSub: 'Check {email} and click the link to sign in.',
    emailPlaceholder: 'your@email.com',
    sendMagicLink: 'Send Magic Link',
    byContinuing: 'By continuing you agree to our {terms} and {privacy}.',
    terms: 'Terms',
    privacyPolicy: 'Privacy Policy',
  },

  privacy: {
    metaTitle: 'Privacy Policy',
    metaDescription:
      'CreatorAI Hub privacy policy: what data we collect, how we use it, GDPR rights, and cookie usage.',
    heading: 'Privacy Policy',
    updated: 'Last updated: August 4, 2026',
    s1: '1. Who we are',
    s1body:
      '{site} (“we”, “us”) operates {host}, a curated directory of AI tools for video creators. This policy explains what personal data we collect, why, and your rights over it.',
    s2: '2. Data we collect',
    account: 'Account data:',
    accountBody:
      'if you sign in, we store your email address and authentication identifiers via our auth provider (Supabase).',
    newsletter: 'Newsletter:',
    newsletterBody: 'your email address and signup source, only when you subscribe.',
    reviews: 'Reviews:',
    reviewsBody: 'the display name, rating, and text you voluntarily submit.',
    bookmarks: 'Bookmarks:',
    bookmarksBody:
      'saved-tool lists, stored locally on your device and — only for signed-in users — synced to your account.',
    analytics: 'Click analytics:',
    analyticsBody:
      'when you click an outbound tool link we log the tool name, timestamp, and referring page. We do not log your identity with clicks.',
    submissions: 'Tool submissions:',
    submissionsBody: 'the tool details and contact email you provide.',
    s3: "3. What we don't do",
    s3body:
      'We do not sell your personal data. We do not run third-party advertising trackers. We do not share your email with tool vendors.',
    s4: '4. Cookies',
    s4body:
      'Essential cookies/localStorage keep you signed in and remember preferences (bookmarks, cookie consent, compare selections). Optional analytics cookies are only set if you click “Accept All” on the consent banner. You can clear them any time in your browser settings.',
    s5: '5. Affiliate links',
    s5body:
      'Some outbound links are affiliate links. Vendors may set their own cookies on their own domains after you leave our site; their privacy policies apply there. See our {disclosure}.',
    disclosure: 'affiliate disclosure',
    s6: '6. Data storage & processors',
    s6body:
      'Data is processed by Vercel (hosting) and Supabase (database & authentication). Both are GDPR-compliant processors with EU standard contractual clauses.',
    s7: '7. Your rights (GDPR / CCPA)',
    s7body:
      'You may request access, correction, export, or deletion of your personal data at any time by emailing {email}. We respond within 30 days. Newsletter emails include a one-click unsubscribe link.',
    s8: '8. Children',
    s8body: 'This service is not directed to children under 16 and we do not knowingly collect their data.',
    s9: '9. Changes',
    s9body:
      'We will update this page when the policy changes and revise the “last updated” date above.',
  },

  terms: {
    metaTitle: 'Terms of Service',
    metaDescription:
      'Terms of service for using the CreatorAI Hub directory, community reviews, public API, and tool submission service.',
    heading: 'Terms of Service',
    updated: 'Last updated: August 4, 2026',
    s1: '1. Acceptance',
    s1body:
      'By accessing {site} you agree to these terms. If you do not agree, please do not use the service.',
    s2: '2. Nature of the service',
    s2body:
      '{site} is an editorial directory. Tool listings, scores, and guides are informational opinions, not professional advice. Third-party tools are owned and operated by their respective vendors — we are not responsible for their pricing changes, availability, output quality, or terms. Always verify pricing on the vendor site before purchasing.',
    s3: '3. Affiliate relationships',
    s3body:
      'Some outbound links are affiliate links that may earn us a commission. This never changes the price you pay and never influences editorial scores. See our {disclosure}.',
    disclosure: 'disclosure',
    s4: '4. User content (reviews & submissions)',
    s4body:
      "By posting a review or submitting a tool you grant us a worldwide, royalty-free license to display and moderate that content. You agree not to post: spam, undisclosed self-promotion (vendors reviewing their own tools), defamatory or unlawful content, or content you don't have rights to. We may edit for formatting or remove content that violates these rules.",
    s5: '5. Accounts',
    s5body:
      'You are responsible for activity under your account. We may suspend accounts that abuse the service (scraping beyond API limits, review manipulation, harassment).',
    s6: '6. Public API',
    s6body:
      'The public API is provided free for non-commercial use with attribution, subject to rate limits. We may modify or discontinue it with reasonable notice. Commercial use requires written permission.',
    s7: '7. Intellectual property',
    s7body:
      'Site design, editorial content, and curation are © {site}. Tool names, logos, and screenshots belong to their respective owners and are used for identification under nominative fair use.',
    s8: '8. Disclaimer & liability',
    s8body:
      'The service is provided “as is” without warranties. To the maximum extent permitted by law, our total liability for any claim related to the service is limited to $100.',
    s9: '9. Changes',
    s9body:
      'We may update these terms; continued use after changes constitutes acceptance. Material changes will be highlighted on this page.',
    s10: '10. Contact',
    s10body: 'Questions? Email {email}.',
  },

  submit: {
    metaTitle: 'Submit Your AI Tool',
    metaDescription:
      'Submit your AI video tool to CreatorAI Hub for editorial review. Free listings for tools that pass our quality bar, with optional featured placement.',
    metaSubtitle:
      'Building an AI tool for video creators? Submit it for editorial review. Listings are {free} if the tool passes our quality bar — we verify pricing, features, and official links for every submission before publishing. Tools selected for our Hands-On Benchmark undergo comprehensive 24-point editorial testing. Typical review time: 3–5 days.',
    freeStrong: 'free',
    formToolName: 'Tool Name',
    formToolNamePh: 'e.g. ClipGenius AI',
    formUrl: 'Website URL',
    formUrlPh: 'https://yourtool.com',
    formTagline: 'One-line Tagline',
    formTaglinePh: 'What does it do, in one sentence?',
    formCategory: 'Category',
    formPricing: 'Pricing Model',
    formEmail: 'Founder / Contact Email',
    formEmailPh: 'you@yourtool.com',
    badgeLabel: 'Verified Founder Badge',
    badgeBody:
      "— I'll add the CreatorAI Hub badge to our site (or mention us on X) in exchange for priority review and a permanent verified badge on our listing.",
    submitBtn: 'Submit for Verified Listing',
    submitNote:
      'We verify pricing, features, and official links for every submission. Spam, dead links, and off-niche tools are rejected.',
    successTitle: 'Submission received!',
    successBody:
      'Our editorial team will verify {name} and email {email} within 3–5 days.',
    failGeneric: 'Failed to submit tool',
  },

  founders: {
    badge: 'Official Founder & Partner Program',
    headingMain: 'Claim Your AI Tool Profile',
    subtitle:
      'Are you building an AI tool listed on {site}? Claim your official profile to manage pricing details, earn the Verified Founder Badge, and embed our authority badge on your site.',
    freeVerif: 'Free Founder Verification',
    freeVerifSub: 'Domain-verified ownership',
    benefit1Title: 'Official Founder Badge',
    benefit1Desc:
      'Displays a verified founder checkmark on your tool card and detail page, signaling authenticity to creators.',
    benefit2Title: 'Priority 24-Point Benchmark',
    benefit2Desc:
      'Tools in our Founder Program get prioritized for our hands-on editorial benchmark and video review tests.',
    benefit3Title: 'Embeddable Authority Badge',
    benefit3Desc:
      'Display an official SVG badge on your homepage or footer, dynamically rendered from our backlink engine.',
    claimHeading: 'Claim Ownership Form',
    engineLabel: 'Backlink Authority Engine',
    badgeHeading: 'Your Embeddable Badge',
    badgeDesc:
      'We generate a dynamic SVG badge for every listed tool. Once verified, embed this snippet in your footer or “Featured On” section.',
    embedLabel: 'HTML Embed Snippet (Replace slug with yours):',
    claimedHeading: 'Already claimed your tool?',
    claimedBody:
      'If you have already claimed ownership and want to submit new pricing, features, or exclusive coupon codes for our Deals page, email us directly.',
    contactTeam: 'Contact Editorial Team',
    formTool: 'Select Your Listed Tool',
    formEmail: 'Official Company Email',
    emailPh: 'you@yourdomain.com',
    domainNote: 'Must match the domain of {url}.',
    yourTool: 'your tool',
    formRole: 'Your Role',
    roleFounder: 'Founder / CEO',
    roleCoFounder: 'Co-Founder',
    roleGrowth: 'Head of Growth / Marketing',
    rolePM: 'Product Manager',
    formNotes: 'Update Request or Note (Optional)',
    notesPh: 'Let us know if your pricing, tagline, or features need immediate updating...',
    badgeLabel: 'Priority Review + Backlink Badge',
    badgeBody:
      '— I will embed the CreatorAI Hub badge on our landing page or press room in exchange for priority editorial benchmark testing.',
    claimBtn: 'Claim Official Profile & Badge',
    successTitle: 'Claim Recorded',
    successBody:
      'We have your claim for {tool}. Our team will verify you own this tool before granting a badge, and we will reply to {email}.',
    failGeneric: 'Could not submit your claim.',
    failGeneric2: 'Something went wrong. Please try again.',
    recorded: 'Your claim has been recorded.',
  },

  jobs: {
    metaTitle: 'AI Video Jobs — Coming Soon',
    metaDescription: 'A job board for AI video editors, motion designers and creator-economy roles.',
    badge: 'In development',
    heading: 'AI video jobs',
    intro:
      'A focused board for AI video editors, motion designers, and creator-economy roles. We will open this once there is enough audience to make posting worthwhile for employers — an empty job board helps nobody.',
    notify: 'Get notified when it opens — for hiring or for looking.',
    hiring: 'Hiring right now?',
    getInTouch: 'Get in touch',
    hiringTail: 'and we will share the role with our list.',
  },

  templates: {
    metaTitle: 'Creator Templates — Coming Soon',
    metaDescription:
      'Production systems, AI prompt kits and revenue calculators for video creators.',
    badge: 'In development',
    heading: 'Creator templates & prompt kits',
    intro:
      'Production systems, prompt libraries for Runway and Veo, and cost calculators for planning a toolchain. We are building this after the core directory is finished — no date promised yet.',
    notify: 'Want to hear when it ships? Join the main list — we will announce it there.',
    meanwhile:
      'In the meantime, {stackBuilder} already calculates monthly costs for a full toolchain.',
    stackBuilderLink: 'the Stack Builder',
  },

  alternatives: {
    notFound: 'Not found',
    metaTitle: '{count} Best {name} Alternatives in 2026 ({free} Free)',
    metaDescription:
      'Looking for a {name} alternative? We compared {count} {category} tools on price, features and export freedom — including {free} with a free tier. Updated 2026.',
    ogTitle: '{count} Best {name} Alternatives (2026)',
    ogDescription: 'Compared on price, features and export freedom — {free} have a free tier.',
    backTo: 'Back to {name}',
    heading: '{count} best {name} alternatives in 2026',
    introA: '{name} is a {category} tool that {tagline}. It starts at {price}.',
    introFree: 'Below are the {count} closest alternatives we track, {n} of which have a free tier.',
    introNoFree: 'Below are the {count} closest alternatives we track.',
    introTail: 'Each entry explains the one thing that actually differs — not a rephrased feature list.',
    verifyNote:
      'We label every tool with how far we have verified it. Where we have not run a tool ourselves, we say so rather than inventing a score.',
    tool: 'Tool',
    from: 'From',
    model: 'Model',
    ourScore: 'Our score',
    verification: 'Verification',
    current: '(current)',
    altsHeading: "Every alternative, and why you'd pick it",
    vsName: 'vs {name}:',
    fullDetails: 'Full details',
    faqHeading: '{name} alternatives — common questions',
    topPicks: 'Top picks at a glance',
    differentiatorFree: 'Completely free, where {name} is {pricing}.',
    differentiatorCheaper: 'About {pct}% cheaper at the entry tier ({priceA} vs {priceB}).',
    differentiatorTested: 'We have tested this one hands-on; {name} is still in our queue.',
    differentiatorUnique: 'Adds {list}, which {name} does not cover.',
    differentiatorMetric: 'Known for: {metric}.',
    differentiatorDefault: 'A direct {category} competitor with a different workflow.',
    faqFreeQ: 'What is the best free {name} alternative?',
    faqFreeA: '{name} is the strongest free option we list — {tagline}. {tail}',
    faqFreeTailFreemium: 'It is freemium, so check the free tier limits before committing.',
    faqFreeTailFree: 'It is genuinely free to use.',
    faqFreeNone:
      'We do not currently list a free alternative to {name} in the {category} category. The closest option is {alt}, starting at {price}.',
    paidTier: 'a paid tier',
    faqCheaperQ: 'Is there a cheaper alternative to {name}?',
    faqCheaperA:
      "Yes — {count} of the tools on this page start below {name}'s {price}. The cheapest is {cheapest} at {cheapestPrice}.",
    faqCheaperNone:
      'Not among the tools we track. {name} is already at the affordable end of {category}; alternatives here compete on capability rather than price.',
    faqSwitchQ: 'Why should I switch from {name}?',
    faqSwitchA:
      'Most people switch for one of three reasons: pricing that no longer fits their volume, a missing export option such as a watermark-free or higher-resolution output, or a workflow that does not match how they actually edit. If none of those apply to you, staying put is usually the right call.',
  },

  admin: {
    signInTitle: 'Admin sign in',
    password: 'Password',
    sessionNote:
      'Sessions are signed and expire after 8 hours. The cookie no longer contains the password itself.',
    admin: 'Admin',
    viewSite: 'View site',
    refresh: 'Refresh',
    signOut: 'Sign out',
    tabOverview: 'Overview',
    tabSubmissions: 'Submissions',
    tabReviews: 'Reviews',
    tabNews: 'News feed',
    tabAnnouncement: 'Announcement',
    tabI18n: 'Translation',
    tabPreview: 'Preview',
    loading: 'Loading',
    loginFailed: 'Login failed',
    loadFailed: 'Could not load data.',
    statsUnavailable: 'Stats unavailable (database not configured or still loading).',
    supabaseNote:
      'Supabase is not configured for this session — DB-side counters show “—”. The catalog counters above always work.',
    toolsCatalogued: 'Tools catalogued',
    pricingVerified: 'Pricing-verified',
    handsOnTested: 'Hands-on tested',
    listedOnly: 'Listed only',
    submissionsPending: 'Submissions pending',
    reviewsPending: 'Reviews pending',
    newsAuto: 'News items (auto)',
    newsLive: 'News live',
    newsletterConfirmed: 'Newsletter confirmed',
    newsletterWaiting: 'Newsletter waiting',
    pollScripting: 'Poll — Scripting',
    pollEditing: 'Poll — Editing',
    pollVoiceover: 'Poll — Voiceover',
    pollThumbnails: 'Poll — Thumbnails',
    toolSubmissions: 'Tool submissions',
    noSubmissions: 'No submissions yet.',
    approve: 'Approve',
    reject: 'Reject',
    communityReviews: 'Community reviews',
    noReviews: 'No reviews yet.',
    siteAnnouncement: 'Site announcement',
    announcementNote:
      'These are the only settings still wired to the live site. The old Design and Content tabs edited values that nothing rendered, so they were removed rather than left to imply they worked.',
    visibleOnSite: 'Visible on site',
    hidden: 'Hidden',
    visible: 'Visible',
    title: 'Title',
    description: 'Description',
    translationEngine: 'Translation engine',
    engineNote:
      'Configure which AI provider translates new content (tool long descriptions, news, blog bodies). Keys are stored in the database and used server-side only — they are never shown in full or exposed to visitors. Env vars (if set) override these.',
    provider: 'Provider',
    autoDetect: 'Auto-detect',
    geminiFree: 'Google Gemini (free tier)',
    openrouterFree: 'OpenRouter (free models)',
    openaiPaid: 'OpenAI (paid)',
    currentlyActive: 'Currently active:',
    geminiKey: 'Gemini API key',
    openrouterKey: 'OpenRouter API key',
    openaiKey: 'OpenAI API key',
    testConnection: 'Test connection',
    backfillHint:
      'After saving, run the backfill once to translate the long descriptions that are still in English: on GitHub → Actions →',
    autoTranslateContent: 'Auto-Translate Content',
    siteContent: 'Site Content',
    siteContentNote:
      'Edit the high-visibility copy below — changes are saved to the database and applied to the live site immediately. The preview pane shows the actual site.',
    livePreview: 'Live preview',
    openFullSite: 'Open full site ↗',
    homepageHero: 'Homepage hero',
    featuredSection: 'Featured section',
    newsletterSection: 'Newsletter section',
    aiStudioHero: 'AI Studio hero',
    ingestNow: 'Ingest now',
    ingestDone: 'Ingested: {kept} relevant, {new} new.',
    ingestFailed: 'Ingest failed',
    saveFailed: 'Save failed',
    providerSaved: 'Translation provider saved.',
    testFailed: 'Test failed.',
    testOk: 'Test OK — {provider} ({model})',
    contentSaved: 'Site content saved — it is live now.',
    announcementSaved: 'Announcement saved.',
    itemApproved: 'Item approved — it can now appear on /news.',
    itemRejected: 'Item rejected and removed.',
    nothingPending: 'Nothing pending.',
    approvedBulk: '{count} item(s) approved.',
    rejectedBulk: '{count} item(s) rejected.',
    newsQueue: 'the news queue',
    submitActionDone: 'Submission {action}d.',
    reviewStatus: 'Review {status}.',
  },
};

/* ──────────────────────────── merge into en ──────────────────────────── */

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

const enFile = 'messages/en.json';
const en = JSON.parse(readFileSync(enFile, 'utf8'));
deepMerge(en, UI);
writeFileSync(enFile, JSON.stringify(en, null, 2) + '\n');

/* Mirror the new structure into the other locales (English placeholder). */
for (const loc of LOCALES.filter((l) => l !== 'en')) {
  const file = `messages/${loc}.json`;
  const j = JSON.parse(readFileSync(file, 'utf8'));
  // Only add keys that don't already exist in that locale (never clobber).
  const addMissing = (target, source, path) => {
    for (const [k, v] of Object.entries(source)) {
      const p = path ? `${path}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (!target[k] || typeof target[k] !== 'object' || Array.isArray(target[k])) target[k] = {};
        addMissing(target[k], v, p);
      } else if (!(k in target) || target[k] === undefined || target[k] === null || target[k] === '') {
        target[k] = v;
      }
    }
  };
  addMissing(j, UI, '');
  writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
}

let newCount = 0;
const count = (o) => Object.entries(o).reduce((n, [, v]) => n + (v && typeof v === 'object' ? count(v) : 1), 0);
for (const ns of Object.keys(UI)) newCount += count(UI[ns]);
console.log(`seeded ${newCount} new UI keys into en.json and mirrored into all locales.`);
