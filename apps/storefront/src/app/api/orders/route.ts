import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@static-wears/shared';
import { createOrder, getOrdersByCustomer } from '@static-wears/order-service';
import { sendOrderConfirmation } from '@static-wears/email-service';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await getOrdersByCustomer(user.id);
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = await createOrder({
    customer_id: user.id,
    items: body.items,
    shipping: body.shipping,
    notes: body.notes,
  });

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  const order = result.order!;
  if (user.email) {
    sendOrderConfirmation({
      to: user.email,
      customerName: body.shipping?.name ?? 'Customer',
      orderId: order.id,
      items: body.items.map((i: { product_name: string; quantity: number; unit_price: number }) => ({
        name: i.product_name,
        quantity: i.quantity,
        price: i.unit_price,
      })),
      total: body.items.reduce((s: number, i: { unit_price: number; quantity: number }) => s + i.unit_price * i.quantity, 0),
      shippingAddress: `${body.shipping?.address ?? ''}`,
    }).catch(() => {});
  }

  return NextResponse.json({ order });
}
