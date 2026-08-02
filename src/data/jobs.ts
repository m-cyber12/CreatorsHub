export interface CreatorJob {
  id: string;
  company: string;
  title: string;
  salary: string;
  location: string;
  type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Per-Video';
  category: 'Video Editor' | 'Thumbnail Artist' | 'Scriptwriter' | 'AI Prompt Engineer';
  description: string;
  isFeatured: boolean;
  applyUrl: string;
  postedDate: string;
}

export const CREATOR_JOBS: CreatorJob[] = [
  {
    id: '1',
    company: 'Nexus Documentaries',
    title: 'Lead Video Editor (Proficient in ElevenLabs & Runway Gen-3)',
    salary: '$3,000 - $4,500 / month',
    location: 'Remote (Worldwide)',
    type: 'Full-Time',
    category: 'Video Editor',
    description:
      'We are looking for a senior video editor for our 500k+ subscriber faceless history channel. Must have proven experience using AI voiceover dubbing and cinematic B-roll generation.',
    isFeatured: true,
    applyUrl: 'https://www.linkedin.com',
    postedDate: 'Today',
  },
  {
    id: '2',
    company: 'Apex YouTube Agency',
    title: 'Midjourney v6 & Photoshop AI Thumbnail Designer',
    salary: '$50 - $100 / thumbnail',
    location: 'Remote (Worldwide)',
    type: 'Contract',
    category: 'Thumbnail Artist',
    description:
      'Seeking a creative designer who blends Midjourney v6 concept art with Photoshop Generative Fill to create 15%+ CTR thumbnails for finance and tech YouTubers.',
    isFeatured: true,
    applyUrl: 'https://www.linkedin.com',
    postedDate: '2 days ago',
  },
  {
    id: '3',
    company: 'ClipViral AI',
    title: 'TikTok & Shorts Creator (OpusClip / Submagic Specialist)',
    salary: '$1,800 - $2,500 / month',
    location: 'Remote (Worldwide)',
    type: 'Part-Time',
    category: 'Video Editor',
    description:
      'Turn long podcast interviews into daily animated viral Shorts. Proven track record with Alex Hormozi style captions and dynamic pacing required.',
    isFeatured: false,
    applyUrl: 'https://www.linkedin.com',
    postedDate: '3 days ago',
  },
  {
    id: '4',
    company: 'Synergy Media',
    title: 'AI YouTube Scriptwriter (VidIQ & SEO Specialist)',
    salary: '$200 / script',
    location: 'Remote (Worldwide)',
    type: 'Per-Video',
    category: 'Scriptwriter',
    description:
      'Write high-retention 12-minute documentary scripts using AI research tools. Must understand YouTube hooks, pacing, and CTR psychology.',
    isFeatured: false,
    applyUrl: 'https://www.linkedin.com',
    postedDate: '5 days ago',
  },
];
