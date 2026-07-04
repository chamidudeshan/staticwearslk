import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createOrder, getOrdersByCustomer } from '@static-wears/order-service';
import { publishEvent, TOPICS } from '@static-wears/kafka';
import { getVariantStockInfo } from '@static-wears/product-service';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orders = await getOrdersByCustomer(userId);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

  // Check stock levels after order — publish low stock alert if any variant is below threshold
  const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD ?? '5', 10);
  const variantIds: string[] = (body.items ?? [])
    .map((i: { variant_id?: string }) => i.variant_id)
    .filter(Boolean);

  if (variantIds.length > 0) {
    Promise.all(variantIds.map((id) => getVariantStockInfo(id)))
      .then((infos) => {
        const lowItems = infos
          .filter((info): info is NonNullable<typeof info> => !!info && info.currentStock <= LOW_STOCK_THRESHOLD)
          .map((info) => ({ ...info, threshold: LOW_STOCK_THRESHOLD }));
        if (lowItems.length > 0) {
          publishEvent(TOPICS.STOCK_LOW, { items: lowItems }).catch((err) =>
            console.error('[orders] Low stock Kafka publish failed:', err)
          );
        }
      })
      .catch((err) => console.error('[orders] Stock check failed:', err));
  }

  return NextResponse.json({ order });
}
