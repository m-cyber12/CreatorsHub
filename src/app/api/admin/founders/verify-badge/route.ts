import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url, slug } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'CreatorAI-Hub-Badge-Bot/1.0 (+https://creatorsaicenter.vercel.app)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json({
          embedded: false,
          statusText: `Website returned HTTP ${res.status}`,
        });
      }

      const html = await res.text();
      const lower = html.toLowerCase();
      const hasDirectBadge =
        lower.includes(`/badge/${slug}`) ||
        lower.includes('creatorsaicenter.vercel.app/badge') ||
        lower.includes('creatoraihub') ||
        lower.includes('featured on creatorai');

      const hasGeneralBadge =
        lower.includes('/badge/') || lower.includes('creatorai') || lower.includes('badge');

      if (hasDirectBadge) {
        return NextResponse.json({
          embedded: true,
          confidence: 'high',
          statusText: '✅ Official CreatorAI Hub badge found on website!',
        });
      } else if (hasGeneralBadge) {
        return NextResponse.json({
          embedded: true,
          confidence: 'medium',
          statusText: '⚠️ Badge / backlink detected in HTML.',
        });
      }

      return NextResponse.json({
        embedded: false,
        confidence: 'none',
        statusText: '❌ Badge not detected in homepage HTML.',
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeout);
      const msg = fetchErr instanceof Error ? fetchErr.message : 'Timeout/Network error';
      return NextResponse.json({
        embedded: false,
        statusText: `Could not reach website: ${msg}`,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
