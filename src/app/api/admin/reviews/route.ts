import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('creatorai_admin_session');
  const expectedToken = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD || '';
  if (!expectedToken || !sessionCookie) return false;
  return sessionCookie.value === expectedToken;
}

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabase) return NextResponse.json([], { status: 200 });
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, tool_slug, rating, title, body, author_name, helpful_count, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const { id, status } = await request.json();
    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, review: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
