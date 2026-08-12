#!/usr/bin/env tsx
/**
 * dump-tools.ts (2026-08-10)
 * Dumps the effective tool catalog to stdout as JSON, so the Python generator
 * (make-affiliate-xlsx.py) can build the affiliate Excel without a TS runtime.
 * Usage: npx tsx scripts/dump-tools.ts > /tmp/tools.json
 */
import { ALL_TOOLS } from '../src/data/tools';

const out = ALL_TOOLS.map((t) => ({
  name: t.name,
  slug: t.slug,
  category: t.category,
  pricing: t.pricing,
  startingPrice: t.startingPrice || '',
  url: t.url,
  affiliateUrl: t.affiliateUrl || '',
  affiliateProgram: t.affiliateProgram || '',
  verificationLevel: t.verificationLevel,
}));

process.stdout.write(JSON.stringify(out));
