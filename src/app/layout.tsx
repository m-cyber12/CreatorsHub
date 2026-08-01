import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorAI Hub — Bold Studio AI Tools for Video Creators & YouTubers',
  description:
    'Discover the top tested AI video editors, Shorts generators, thumbnail creators, voice cloning tools, and script assistants for YouTube and TikTok creators.',
  keywords: [
    'AI video tools',
    'AI for YouTubers',
    'AI short video generator',
    'AI thumbnail creator',
    'OpusClip alternatives',
    'AI video editing 2026',
    'best AI tools for YouTube',
  ],
  authors: [{ name: 'CreatorAI Hub Solo Founder' }],
  metadataBase: new URL('https://directory-ai-hub.vercel.app'),
  openGraph: {
    title: 'CreatorAI Hub — The Bold Studio AI Directory for Video Creators',
    description:
      'The #1 curated 3D directory of tested AI tools for YouTube, TikTok, and video creators.',
    url: 'https://directory-ai-hub.vercel.app',
    siteName: 'CreatorAI Hub',
    type: 'website',
  },
  verification: {
    other: {
      'impact-site-verification': 'ed8d889a-53ce-4ad7-afce-786373053a01',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Impact.com Site Verification Meta Tag */}
        <meta
          name="impact-site-verification"
          value="ed8d889a-53ce-4ad7-afce-786373053a01"
        />
        <meta
          name="impact-site-verification"
          content="ed8d889a-53ce-4ad7-afce-786373053a01"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}
