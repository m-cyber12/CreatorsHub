import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorAI Hub — Curated AI Tools for Video Creators & YouTubers',
  description:
    'Discover the top tested AI video editors, Shorts generators, thumbnail creators, voice cloning tools, and script assistants for YouTube and TikTok creators.',
  keywords: [
    'AI video tools',
    'AI for YouTubers',
    'AI short video generator',
    'AI thumbnail creator',
    'OpusClip alternatives',
    'AI video editing 2026',
  ],
  openGraph: {
    title: 'CreatorAI Hub — Curated AI Tools for Video Creators',
    description:
      'The #1 curated directory of tested AI tools for YouTube, TikTok, and video creators.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}
