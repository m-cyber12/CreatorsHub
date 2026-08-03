import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/context/AppProviders';
import { CookieConsent } from '@/components/CookieConsent';

const SITE_URL = 'https://directory-ai-hub.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'CreatorAI Hub — The Curated AI Toolbox for Video Creators',
    template: '%s | CreatorAI Hub',
  },
  description:
    'Discover 200+ tested AI video editors, Shorts generators, thumbnail creators, voice cloning tools, and script assistants for YouTube and TikTok creators. Every tool independently reviewed.',
  keywords: [
    'AI video tools',
    'AI for YouTubers',
    'AI short video generator',
    'AI thumbnail creator',
    'best AI tools for YouTube',
    'AI video editing 2026',
    'AI voice cloning',
    'text to video AI',
  ],
  authors: [{ name: 'CreatorAI Hub Editorial Team' }],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CreatorAI Hub — The Curated AI Toolbox for Video Creators',
    description: '200+ independently tested AI tools for YouTube, TikTok, and video creators — with reviews, pricing, and side-by-side comparisons.',
    url: SITE_URL,
    siteName: 'CreatorAI Hub',
    type: 'website',
    images: [{ url: '/brand-cover.png', width: 1200, height: 630, alt: 'CreatorAI Hub — Curated AI tools for video creators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatorAI Hub — The Curated AI Toolbox for Video Creators',
    description: 'Stop searching. Start creating. 200+ tested AI tools for video creators.',
    images: ['/brand-cover.png'],
  },
  robots: { index: true, follow: true },
};

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CreatorAI Hub',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: 'Curated directory of independently tested AI tools for video creators.',
  contactPoint: { '@type': 'ContactPoint', email: 'hello@creatoraihub.com', contactType: 'customer support' },
};

const siteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CreatorAI Hub',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/tools?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="impact-site-verification" content="ed8d889a-53ce-4ad7-afce-786373053a01" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
        <AppProviders>
          {children}
          <CookieConsent />
        </AppProviders>
      </body>
    </html>
  );
}
