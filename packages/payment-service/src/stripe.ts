import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function createCheckoutSession(data: {
  orderId: string;
  items: { name: string; price: number; quantity: number; image?: string }[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionUrl: string | null; sessionId: string | null; error: string | null }> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: data.customerEmail,
      mode: 'payment',
      line_items: data.items.map((item) => ({
        price_data: {
          currency: 'lkr',
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: { order_id: data.orderId },
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
    });
    return { sessionUrl: session.url, sessionId: session.id, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { sessionUrl: null, sessionId: null, error: msg };
  }
}

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return null;
  }
}
