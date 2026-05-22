import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import { createCheckoutSession } from '@static-wears/payment-service';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, items } = await req.json();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const session = await createCheckoutSession({
    orderId,
    items,
    customerEmail: user.email!,
    successUrl: `${appUrl}/orders/${orderId}?success=true`,
    cancelUrl: `${appUrl}/checkout?cancelled=true`,
  });

  if (session.error) return NextResponse.json({ error: session.error }, { status: 400 });

  const admin = createSupabaseAdminClient();
  await admin
    .from('payments')
    .insert({
      order_id: orderId,
      stripe_session_id: session.sessionId,
      amount: items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0),
      currency: 'lkr',
    });

  return NextResponse.json({ sessionUrl: session.sessionUrl });
}
