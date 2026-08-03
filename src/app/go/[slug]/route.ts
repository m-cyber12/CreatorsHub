import { NextRequest, NextResponse } from 'next/server';
import { ALL_TOOLS } from '@/data/tools';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    return NextResponse.redirect(new URL('/tools', request.url));
  }

  // fire-and-forget click analytics
  const referer = request.headers.get('referer') || 'direct';
  console.log(`[AFFILIATE CLICK] ${tool.slug} at ${new Date().toISOString()} from ${referer}`);
  if (supabase) {
    supabase.from('click_log').insert([{ tool_slug: tool.slug, referer: referer.slice(0, 500) }]).then(() => {});
  }

  const destination = tool.affiliateUrl || tool.url;
  return NextResponse.redirect(destination, { status: 302 });
}
