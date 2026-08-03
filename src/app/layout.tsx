import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorAI Hub — The Curated AI Toolbox for Video Creators',
  description:
    'Discover the top 50 tested AI video editors, Shorts generators, thumbnail creators, voice cloning tools, and script assistants for YouTube and TikTok creators.',
  keywords: [
    'AI video tools',
    'AI for YouTubers',
    'AI short video generator',
    'AI thumbnail creator',
    'best AI tools for YouTube',
    'AI video editing 2026',
  ],
  authors: [{ name: 'CreatorAI Hub' }],
  metadataBase: new URL('https://directory-ai-hub.vercel.app'),
  openGraph: {
    title: 'CreatorAI Hub — The Curated AI Toolbox for Video Creators',
    description: 'The #1 curated directory of tested AI tools for YouTube, TikTok, and video creators.',
    url: 'https://directory-ai-hub.vercel.app',
    siteName: 'CreatorAI Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatorAI Hub — The Curated AI Toolbox for Video Creators',
    description: 'Stop searching. Start creating.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="impact-site-verification" content="ed8d889a-53ce-4ad7-afce-786373053a01" />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
