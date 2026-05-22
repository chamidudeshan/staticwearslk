import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@static-wears/shared';
import { createOrder, getOrdersByCustomer } from '@static-wears/order-service';

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
  return NextResponse.json({ order: result.order });
}
