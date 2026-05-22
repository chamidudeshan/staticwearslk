import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@static-wears/payment-service';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { updateOrderStatus } from '@static-wears/order-service';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  const event = await constructWebhookEvent(body, signature);

  if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  const supabase = createSupabaseAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (!orderId) return NextResponse.json({ received: true });

    await supabase
      .from('payments')
      .update({
        payment_status: 'paid',
        stripe_payment_id: session.payment_intent as string,
        payment_method: 'card',
        payment_date: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id);

    await updateOrderStatus(orderId, 'confirmed');
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    await supabase
      .from('payments')
      .update({ payment_status: 'failed' })
      .eq('stripe_payment_id', intent.id);
  }

  return NextResponse.json({ received: true });
}
