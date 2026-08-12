import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { getAllSubmissions, moderateSubmission } from '@/lib/submissionsStore';

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAllSubmissions();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }

  try {
    const { action, submission } = await request.json();
    if (!submission?.id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (action === 'approve') {
      await moderateSubmission(submission.id, 'approved');
      return NextResponse.json({ success: true, message: 'Submission approved!' }, { status: 200 });
    } else if (action === 'reject') {
      await moderateSubmission(submission.id, 'rejected');
      return NextResponse.json({ success: true, message: 'Submission rejected.' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Action failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
