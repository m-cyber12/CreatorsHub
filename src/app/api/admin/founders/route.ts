import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { saveToolOverride } from '@/lib/contentOverrides';

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('founder_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json(data, { status: 200 });
      }
    } catch {
      /* fallback */
    }
  }

  return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }

  try {
    const { action, claimId, toolSlug } = await request.json();
    if (!claimId) {
      return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
    }

    if (action === 'approve') {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('founder_claims')
          .update({ status: 'approved' })
          .eq('id', claimId);
      }

      // Grant founder badge on the tool
      if (toolSlug) {
        await saveToolOverride(toolSlug, { hasFounderBadge: true });
      }

      return NextResponse.json({
        success: true,
        message: 'Founder claim approved and Founder Badge granted!',
      });
    } else if (action === 'reject') {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('founder_claims')
          .update({ status: 'rejected' })
          .eq('id', claimId);
      }

      return NextResponse.json({ success: true, message: 'Founder claim rejected.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Action failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
