import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_TOOLS } from '@/data/tools';

export async function GET() {
  if (!supabase) return NextResponse.json(INITIAL_TOOLS);
  const { data, error } = await supabase.from('tools').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const body = await request.json();
    const { name, slug, tagline, description, url, affiliate_url, category, pricing, is_featured, has_founder_badge } = body;
    const { data, error } = await supabase
      .from('tools')
      .insert([
        {
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          tagline,
          description,
          url,
          affiliate_url: affiliate_url || null,
          logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          cover_image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800&auto=format&fit=crop&q=80',
          category: category || 'Video Editing',
          pricing: pricing || 'Freemium',
          is_featured: !!is_featured,
          has_founder_badge: !!has_founder_badge,
          tags: ['AI Tool', 'Video'],
          status: 'approved',
        },
      ])
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const { id, ...updates } = await request.json();
    const { data, error } = await supabase.from('tools').update(updates).eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const id = new URL(request.url).searchParams.get('id');
    const { error } = await supabase.from('tools').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
      }
