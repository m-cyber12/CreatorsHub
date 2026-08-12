/**
 * Payment & Wallet Configuration for CreatorAI Hub
 */

export const PAYMENT_CONFIG = {
  // Primary Tonkeeper / TON Network wallet address
  tonWalletAddress:
    process.env.NEXT_PUBLIC_TON_WALLET || 'UQBO4t5VxktvcSesz-0I1A2FdGK6xLNHfgJwCvZi4NVKb26o',

  // Official USDT TRC-20 (Tron) wallet address
  trc20WalletAddress:
    process.env.NEXT_PUBLIC_USDT_TRC20_WALLET || 'TSgztrYqvyah3ZdGiicr3Z1Dq3amM2FrWW',

  // Plans & Pricing
  plans: {
    free: {
      id: 'free',
      name: 'Standard Listing',
      priceUsd: 0,
      originalPriceUsd: 0,
      durationLabel: 'Standard Queue',
      durationDays: 0,
      turnaroundHours: 720,
      features: [
        'Catalogued in tool directory',
        'Standard review queue (up to 30 days)',
        'SEO backlinks & tool detail page',
        'Direct outbound link to your tool',
        'Included in category listings',
      ],
    },
    fastTrack: {
      id: 'fast-track',
      name: 'Fast-Track Verified',
      priceUsd: 29,
      originalPriceUsd: 49,
      durationLabel: 'Lifetime Verification',
      durationDays: 0,
      turnaroundHours: 48,
      features: [
        'Guaranteed review & publish in < 48 hours',
        'Official "Pricing-Verified" badge & trust seal',
        'Dofollow high-authority SEO backlink to your website',
        'Prioritized in category searches & filters',
        'Evidence audit & transparent pricing breakdown',
        'Embeddable Founder badge for your website',
      ],
    },
    featured: {
      id: 'featured',
      name: 'Featured Boost (6 Months)',
      priceUsd: 99,
      originalPriceUsd: 149,
      durationLabel: '6 Months Active Placement',
      durationDays: 180,
      turnaroundHours: 24,
      features: [
        'Top 3 Featured slot on the Homepage for 6 Months',
        'Pinned to the top of your category page for 6 Months',
        'Featured spotlight in CreatorAI Hub weekly newsletter',
        'Guaranteed review & live publication in < 24 hours',
        'Glowing golden border & "Featured" badge on all cards',
        'Social media announcement & priority indexing',
        'Live editable description, video preview & deals in admin',
      ],
    },
  },

  // AI Studio Pro Subscriptions (Budget-friendly with Daily Quotas)
  studioPlans: {
    monthly: {
      id: 'studio-monthly',
      name: 'Studio Pro Monthly',
      priceUsd: 4.99,
      billing: 'per month',
      features: [
        '50 AI Script & Prompt Generations per day',
        'Viral YouTube Thumbnail Brief Generator',
        'Audio Trimmer & Subtitle VTT/SRT Formatter',
        'Content Calendar Builder with 30-day export',
        'Direct access to Google Gemini & Llama AI models',
      ],
    },
    yearly: {
      id: 'studio-yearly',
      name: 'Studio Pro Annual',
      priceUsd: 29,
      originalPriceUsd: 60,
      billing: 'per year (Save 52%)',
      features: [
        'Everything in Studio Pro Monthly',
        '50 AI Generations per day for 365 days',
        'Commercial usage rights for all prompts',
        'Early access to Video Auto-Repurposing Beta',
        '52% Launch Discount ($2.41/mo effective)',
      ],
    },
  },
} as const;

export type PlanId = keyof typeof PAYMENT_CONFIG.plans;
export type StudioPlanId = keyof typeof PAYMENT_CONFIG.studioPlans;
