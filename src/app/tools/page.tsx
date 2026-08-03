import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ToolsClient } from './ToolsClient';
import { ALL_TOOLS } from '@/data/tools';

export const metadata: Metadata = {
  title: `All ${ALL_TOOLS.length}+ AI Tools for Video Creators (2026)`,
  description: `Browse ${ALL_TOOLS.length}+ independently reviewed AI tools for video creators — filter by category, pricing, and rating. Video generation, editing, voice, thumbnails, and more.`,
  alternates: { canonical: '/tools' },
  openGraph: {
    title: `All ${ALL_TOOLS.length}+ AI Tools for Video Creators`,
    description: 'Filter by category, pricing, and rating. Every tool independently reviewed.',
    url: '/tools',
  },
};

export default function ToolsPage() {
  return (
    <Suspense>
      <ToolsClient />
    </Suspense>
  );
}
