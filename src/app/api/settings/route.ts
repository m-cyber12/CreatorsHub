import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({}, { status: 200 });
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const settingsMap: Record<string, string> = {};
  data?.forEach((item) => { settingsMap[item.key] = item.value; });
  return NextResponse.json(settingsMap);
}

export async function POST(request: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
