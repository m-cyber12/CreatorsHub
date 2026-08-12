import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { getAllOrders, updateOrderStatus } from '@/lib/ordersStore';

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAllOrders();
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
    const { action, orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (action === 'confirm_payment') {
      const order = await updateOrderStatus(orderId, 'confirmed');
      return NextResponse.json({
        success: true,
        message: 'Order confirmed and tool promoted successfully!',
        order,
      });
    } else if (action === 'reject') {
      await updateOrderStatus(orderId, 'rejected');
      return NextResponse.json({ success: true, message: 'Order marked as rejected.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Action failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
