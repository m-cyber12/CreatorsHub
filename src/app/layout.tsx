import type { Metadata, Viewport } from 'next';
import {
  Cinzel,
  Inter,
  JetBrains_Mono,
  Vazirmatn,
  Noto_Sans_Arabic,
  Noto_Sans_SC,
} from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/config/site';
import { routing, isRTL, type Locale } from '@/i18n/routing';
import { ALL_TOOLS } from '@/data/tools';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/** Brand serif — the NOXIFERA wordmark and display moments (Noxifera 1.0). */
const display = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const persian = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-fa',
  display: 'swap',
  preload: false,
});

const arabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-ar',
  display: 'swap',
  preload: false,
});

const chinese = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-zh',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  themeColor: '#0F1019',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: 'common' });
  const toolCount = ALL_TOOLS.length;

  // hreflang alternates: every locale variant of the home page, including
  // the x-default English root.
  const languages: Record<string, string> = { 'x-default': SITE_URL };
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${l}`;
  }

  return {
    title: {
      default: `${SITE_NAME} — ${t('tagline')}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: t('metaDescription', { count: toolCount }),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: '/',
      languages,
      types: {
        'application/rss+xml': `${SITE_URL}/feed.xml`,
        'application/rss+xml;title=tools': `${SITE_URL}/feed-tools.xml`,
      },
    },
    openGraph: {
      title: `${SITE_NAME} — ${t('tagline')}`,
      description: t('ogDescription', { count: toolCount }),
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
      locale,
      images: [
        {
          url: '/og-noxifera.png',
          width: 1424,
          height: 752,
          alt: `${SITE_NAME} — ${t('ogImageAlt')}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${t('tagline')}`,
      description: t('twitterDescription', { count: toolCount }),
      images: ['/og-noxifera.png'],
    },
    icons: {
      icon: [
        { url: '/logo.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32' },
      ],
      apple: [{ url: '/logo.svg' }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dir = isRTL(locale) ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${sans.variable} ${mono.variable} ${display.variable} ${persian.variable} ${arabic.variable} ${chinese.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="impact-site-verification" content="ed8d889a-53ce-4ad7-afce-786373053a01" />
        {/* Google Search Console verification — set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        {/* Google Analytics — set NEXT_PUBLIC_GA_ID (G-XXXX) in Vercel */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.svg`,
              slogan: 'Light in the Darkness',
              description:
                'The AI platform for creators: discover, compare and benchmark AI tools with verified pricing, then build the workflow system that fits your goal.',
              contactPoint: { '@type': 'ContactPoint', email: CONTACT_EMAIL, contactType: 'customer support' },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/tools?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="overflow-x-hidden bg-surface-0 font-sans text-foreground antialiased selection:bg-accent-500/30 selection:text-accent-100">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
