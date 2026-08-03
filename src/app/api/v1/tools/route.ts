import { NextResponse } from 'next/server';
import { ALL_TOOLS, CATEGORIES } from '@/data/tools';
import { searchToolsAdvanced } from '@/lib/search';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * Public read-only API — v1
 *
 * GET /api/v1/tools
 *   ?q=<query>            full-text search (typo & synonym tolerant)
 *   ?category=<name>      filter by category
 *   ?pricing=Free|Freemium|Paid|Free Trial
 *   ?limit=<1-100>        default 50
 *   ?offset=<n>           default 0
 *
 * Response: { meta: {...}, data: Tool[] }
 */
export async function GET(request: Request) {
  if (!rateLimit(`apiv1:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded: 60 requests/minute.' }, { status: 429 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category');
  const pricing = url.searchParams.get('pricing');
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  let result = ALL_TOOLS;
  if (category) {
    if (!(CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: `Unknown category. Valid: ${CATEGORIES.filter((c) => c !== 'All').join(', ')}` }, { status: 400 });
    }
    result = result.filter((t) => t.category === category);
  }
  if (pricing) result = result.filter((t) => t.pricing === pricing);
  if (q) result = searchToolsAdvanced(q, result, 300);

  const page = result.slice(offset, offset + limit).map((t) => ({
    name: t.name,
    slug: t.slug,
    tagline: t.tagline,
    description: t.description,
    url: t.url,
    logo: t.logo,
    category: t.category,
    pricing: t.pricing,
    startingPrice: t.startingPrice || null,
    rating: t.rating,
    tags: t.tags,
    lastReviewed: t.lastReviewed || null,
    detailPage: `https://directory-ai-hub.vercel.app/tool/${t.slug}`,
  }));

  return NextResponse.json(
    {
      meta: {
        total: result.length,
        count: page.length,
        limit,
        offset,
        source: 'CreatorAI Hub Public API v1',
        docs: 'https://directory-ai-hub.vercel.app/developers',
        license: 'Free for non-commercial use with attribution and a link back.',
      },
      data: page,
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
