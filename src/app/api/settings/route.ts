import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS: Record<string, string> = {
  hero_badge: 'Inspired by Bold Studio • MotionSites.ai 3D Edition',
  hero_title_main: 'THE BOLD AI STUDIO',
  hero_title_sub: 'For Video Creators & Editors',
  hero_description:
    'Cinematic 3D aesthetics, scroll-driven transforms, and hand-curated AI video editors for YouTube, Shorts & studio audio production.',
  announcement_title: 'Are you building an AI video tool? Get the Verified Founder Badge!',
  announcement_desc:
    'Add our verified badge on your website or mention CreatorAI Hub on Twitter/X to receive priority listing & permanent SEO backlink.',
  theme_accent: 'purple',
  grid_layout: 'grid-3',
  tool_sort_by: 'featured',
  card_style: '3d-glass',
  hero_animation: 'enabled',
  footer_copyright: '© 2026 CreatorAI Hub. Built for solo founders.',
};

export async function GET() {
  if (!supabase) return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data) return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    data.forEach((item) => {
      settingsMap[item.key] = item.value;
    });
    return NextResponse.json(settingsMap, { status: 200 });
  } catch (err) {
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!supabase) return NextResponse.json({ success: true, mode: 'fallback' }, { status: 200 });
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) return NextResponse.json({ error: 'Missing key or value' }, { status: 200 });

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      await supabase.from('site_settings').update({ value }).eq('key', key);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
