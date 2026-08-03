import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { AppProviders } from '@/context/AppProviders';
import { CookieConsent } from '@/components/CookieConsent';
import { SITE_URL, SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL } from '@/config/site';
import { ALL_TOOLS } from '@/data/tools';

/**
 * Audit fix 4.2 — no font was defined anywhere: no next/font, no @font-face,
 * no fontFamily in Tailwind. The site rendered in each platform's default
 * sans-serif, so it looked materially different on Windows, Android and macOS.
 * Self-hosted via next/font (no external request, no layout shift).
 */
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0E0F12',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  /**
   * Audit fix 1.1 — the old description claimed "Every tool independently
   * reviewed" for a catalog that was 77% machine-generated. Replaced with a
   * claim that is actually true.
   */
  description: `Find the right AI tool for video work in under a minute. ${ALL_TOOLS.length} tools for YouTube and TikTok creators — video editors, Shorts generators, thumbnail makers, voice cloning and script assistants — each labelled with exactly how far we have verified it.`,
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
  authors: [{ name: `${SITE_NAME} Editorial Team` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    types: {
      // Audit fix 3.2 — /feed.xml previously 404'd.
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: `${ALL_TOOLS.length} AI tools for video creators, with honest verification labels, side-by-side comparison and a graveyard of tools that no longer exist.`,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-optimized.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — curated AI tools for video creators`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: `${ALL_TOOLS.length} AI tools for video creators. We label exactly what we have tested.`,
    images: ['/brand-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/logo.svg' }],
  },
};

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: 'Curated directory of AI tools for video creators, with transparent verification levels.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: CONTACT_EMAIL,
    contactType: 'customer support',
  },
};

const siteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/tools?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark`}>
      <head>
        <meta name="impact-site-verification" content="ed8d889a-53ce-4ad7-afce-786373053a01" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      </head>
      <body className="overflow-x-hidden bg-surface-0 font-sans text-foreground antialiased selection:bg-accent-500/30 selection:text-accent-100">
        {/* Audit fix 4.6 — there was no skip link anywhere on the site. */}
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-black focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <AppProviders>
          {children}
          <CookieConsent />
        </AppProviders>
        {/*
          Audit fix 1.7 — the site had zero analytics of any kind, while the
          cookie banner asked consent for "optional analytics cookies" that did
          not exist. Vercel Analytics is cookieless and GDPR-safe by default.
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
