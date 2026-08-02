export interface CreatorTemplate {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Notion OS' | 'AI Prompts' | 'Google Sheets' | 'Workflow';
  price: string;
  isFree: boolean;
  coverImage: string;
  buyUrl: string;
  rating: number;
  salesCount: string;
  features: string[];
}

export const CREATOR_TEMPLATES: CreatorTemplate[] = [
  {
    id: '1',
    slug: 'youtube-creator-notion-os',
    title: 'YouTube Creator Notion OS (2026 Edition)',
    tagline: 'The all-in-one Notion workspace to script, schedule, and manage your YouTube channel',
    description:
      'Manage video ideas, track sponsor deals, script episodes with AI hook templates, and coordinate with video editors in one beautiful dark-mode Notion dashboard.',
    category: 'Notion OS',
    price: '$29',
    isFree: false,
    coverImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://gumroad.com',
    rating: 4.9,
    salesCount: '1,420+ Creators',
    features: [
      '50+ Viral Hook Templates',
      'Sponsor CRM & Revenue Tracker',
      'Kanban Video Production Pipeline',
      'Editor & Designer Guest Portal',
    ],
  },
  {
    id: '2',
    slug: '50-viral-midjourney-thumbnail-prompts',
    title: '50 Viral Midjourney v6 Thumbnail Prompt Kit',
    tagline: 'Copy-paste tested Midjourney prompts that generate 15%+ CTR YouTube thumbnails',
    description:
      'Stop guessing Midjourney parameters. This kit includes 50 high-contrast, emotional expression, and cinematic B-roll prompts tested across tech, finance, and documentary channels.',
    category: 'AI Prompts',
    price: '$19',
    isFree: false,
    coverImage:
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://gumroad.com',
    rating: 4.9,
    salesCount: '890+ Designers',
    features: [
      '50 Copy-Paste v6 Prompts',
      'Lighting & Camera Parameter Cheat-sheet',
      'Facial Expression Reference Grid',
      'Free Lifetime Updates',
    ],
  },
  {
    id: '3',
    slug: 'faceless-youtube-revenue-calculator',
    title: 'Faceless YouTube CPM & Revenue Google Sheet',
    tagline: 'Calculate potential AdSense revenue, costs, and profit margins for any niche',
    description:
      'A pre-programmed spreadsheet with updated 2026 CPM averages across 30 YouTube niches. Automatically calculates editor costs, AI tool overhead, and net profitability.',
    category: 'Google Sheets',
    price: 'Free',
    isFree: true,
    coverImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://docs.google.com',
    rating: 4.8,
    salesCount: '3,200+ Downloads',
    features: [
      '30 Niche CPM Averages',
      'Automated Profit Margin Formula',
      'AI Tool Overhead Budgeter',
      '100% Free Google Sheet',
    ],
  },
  {
    id: '4',
    slug: 'solo-founder-directory-notion-os',
    title: 'Solo Founder Niche Directory Notion OS',
    tagline: 'How to curate, market, and monetize a 3D AI directory in 4 hours per week',
    description:
      'The complete founder handbook and database template to track tool submissions, manage affiliate links, and execute the Founder Badge Flywheel outreach system.',
    category: 'Notion OS',
    price: '$49',
    isFree: false,
    coverImage:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://gumroad.com',
    rating: 5.0,
    salesCount: '340+ Founders',
    features: [
      'Founder Flywheel Email Scripts',
      'Affiliate Link CRM',
      'Reddit & Hacker News Launch Checklist',
      'Zero-Maintenance SOPs',
    ],
  },
  {
    id: '5',
    slug: 'tiktok-viral-hook-script-kit',
    title: '100 Viral TikTok & Shorts Hook Templates (GPT-4o Kit)',
    tagline: 'Copy-paste ChatGPT prompts to generate scroll-stopping first 3 seconds',
    description:
      'Tested prompt engineering templates that force GPT-4o to write high-retention storytelling hooks and curiosity loops.',
    category: 'AI Prompts',
    price: '$19',
    isFree: false,
    coverImage:
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://gumroad.com',
    rating: 4.9,
    salesCount: '1,100+ Creators',
    features: [
      '100 Curiosity Loop Hook Prompts',
      'Storytelling Structure Framework',
      'Shorts Pacing Formula',
      'GPT-4o System Instructions',
    ],
  },
  {
    id: '6',
    slug: 'video-editor-client-portal-notion',
    title: 'Freelance AI Video Editor Client Portal (Notion)',
    tagline: 'Professional client onboarding, asset delivery & revision tracker',
    description:
      'Impress high-paying YouTube clients with an organized Notion portal. Track video drafts, collect feedback timestamps, and automate invoicing.',
    category: 'Notion OS',
    price: '$39',
    isFree: false,
    coverImage:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://gumroad.com',
    rating: 4.8,
    salesCount: '620+ Editors',
    features: [
      'Client Onboarding Questionnaire',
      'Video Revision Timestamp Log',
      'Asset Upload Box',
      'Automated Contract & Invoice Template',
    ],
  },
  {
    id: '7',
    slug: 'ai-documentary-scriptwriting-system-notion',
    title: 'AI Documentary Scriptwriting System (Notion + GPT)',
    tagline: 'Write 20-minute Netflix-style documentary scripts using AI research assistants',
    description:
      'A structured 5-act documentary outline template paired with custom research prompts for historical, true-crime, and finance video essays.',
    category: 'Workflow',
    price: '$34',
    isFree: false,
    coverImage:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://gumroad.com',
    rating: 4.9,
    salesCount: '490+ Creators',
    features: [
      '5-Act Documentary Outline',
      'Fact-Checking & Citation Tracker',
      'ElevenLabs Voiceover Timing Sheet',
      'B-Roll Visual Shot List Generator',
    ],
  },
  {
    id: '8',
    slug: 'free-youtube-sponsor-outreach-tracker',
    title: 'YouTube Sponsor Email Outreach Tracker (Google Sheet)',
    tagline: 'Free CRM spreadsheet to track brand deals, follow-ups, and rate cards',
    description:
      'Organize your sponsor outreach. Track email sent dates, negotiate CPM rates, and store brand media kits in one clean sheet.',
    category: 'Google Sheets',
    price: 'Free',
    isFree: true,
    coverImage:
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
    buyUrl: 'https://docs.google.com',
    rating: 4.9,
    salesCount: '4,100+ Downloads',
    features: [
      'Sponsor Contact CRM',
      'Automated CPM Rate Calculator',
      'Email Follow-up Reminder Log',
      '100% Free Asset',
    ],
  },
];
