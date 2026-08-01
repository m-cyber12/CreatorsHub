import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json([]);
  const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const { action, submission } = await request.json();
    if (action === 'approve') {
      await supabase.from('submissions').update({ status: 'approved' }).eq('id', submission.id);
      const slug = `${submission.tool_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(Math.random() * 1000)}`;
      await supabase.from('tools').insert([
        {
          name: submission.tool_name,
          slug,
          tagline: submission.tagline,
          description: `${submission.tool_name} is an innovative AI tool for ${submission.category}.`,
          url: submission.website_url,
          logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          cover_image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800&auto=format&fit=crop&q=80',
          category: submission.category || 'Video Editing',
          pricing: submission.pricing || 'Freemium',
          is_featured: false,
          has_founder_badge: !!submission.will_add_badge,
          tags: ['Community', 'AI Tool'],
          status: 'approved',
        },
      ]);
      return NextResponse.json({ success: true, message: 'Approved!' });
    } else if (action === 'reject') {
      await supabase.from('submissions').update({ status: 'rejected' }).eq('id', submission.id);
      return NextResponse.json({ success: true, message: 'Rejected' });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
