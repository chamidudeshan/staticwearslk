import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/require-admin';
import { updateOrderStatus, getOrderByIdAdmin } from '@static-wears/order-service';
import { publishEvent, TOPICS } from '@static-wears/kafka';
import type { OrderStatus } from '@static-wears/shared';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await req.json();
  const result = await updateOrderStatus(params.id, status as OrderStatus);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  const order = await getOrderByIdAdmin(params.id);
  if (order) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(order.customer_id);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const customerName = clerkUser.fullName ?? clerkUser.firstName ?? 'Customer';
      if (email) {
        publishEvent(TOPICS.ORDER_STATUS_CHANGED, {
          orderId: order.id,
          to: email,
          customerName,
          status: status.charAt(0).toUpperCase() + status.slice(1),
        }).catch((err) => console.error('[admin/orders] Kafka publish failed:', err));
      }
    } catch (err) {
      console.error('[admin/orders] Clerk user lookup failed:', err);
    }
  }

  return NextResponse.json({ success: true });
}
