import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      url,
      tagline,
      category,
      pricing,
      founderEmail,
      willAddBadge,
    } = body;

    if (!name || !url || !tagline || !founderEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If Supabase is connected, insert into database
    if (supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            tool_name: name,
            website_url: url,
            tagline: tagline,
            category: category,
            pricing: pricing,
            founder_email: founderEmail,
            will_add_badge: willAddBadge,
            status: 'pending',
          },
        ])
        .select();

      if (error) {
        console.error('Supabase Error:', error);
        return NextResponse.json(
          { error: 'Database insert failed', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Tool submitted successfully!', data },
        { status: 201 }
      );
    }

    // Fallback if Supabase keys aren't set yet (mock success)
    return NextResponse.json(
      {
        success: true,
        message: 'Submission received (Mock Mode — Connect Supabase keys in Vercel)',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request payload' },
      { status: 400 }
    );
  }
}
