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
];
