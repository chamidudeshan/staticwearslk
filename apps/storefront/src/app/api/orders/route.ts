import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createOrder, getOrdersByCustomer } from '@static-wears/order-service';
import { publishEvent, TOPICS } from '@static-wears/kafka';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await getOrdersByCustomer(userId);
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = await createOrder({
    customer_id: userId,
    items: body.items,
    shipping: body.shipping,
    notes: body.notes,
  });

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  const order = result.order!;

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (email) {
    publishEvent(TOPICS.ORDER_PLACED, {
      orderId: order.id,
      to: email,
      customerName: body.shipping?.name ?? user?.firstName ?? 'Customer',
      items: body.items.map((i: { product_name: string; quantity: number; unit_price: number }) => ({
        name: i.product_name,
        quantity: i.quantity,
        price: i.unit_price,
      })),
      total: body.items.reduce(
        (s: number, i: { unit_price: number; quantity: number }) => s + i.unit_price * i.quantity,
        0
      ),
      shippingAddress: body.shipping?.address ?? '',
    }).catch((err) => console.error('[orders] Kafka publish failed:', err));
  }

  return NextResponse.json({ order });
}
