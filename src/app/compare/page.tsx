import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareClient } from './CompareClient';

export const metadata: Metadata = {
  title: 'Compare AI Tools Side-by-Side (2026)',
  description: 'Compare pricing, ratings, categories, and features of the best AI video tools head-to-head before you subscribe. Up to 3 tools at once.',
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return (
    <Suspense>
      <CompareClient />
    </Suspense>
  );
}
