import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TOOLS } from '@/data/tools';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const tool = INITIAL_TOOLS.find((t) => t.slug === params.slug);

  if (!tool) {
    return NextResponse.redirect(new URL('/tools', request.url));
  }

  console.log(`[AFFILIATE CLICK] ${tool.slug} at ${new Date().toISOString()} from ${request.headers.get('referer') || 'direct'}`);

  const destination = tool.affiliateUrl || tool.url;
  return NextResponse.redirect(destination);
}
