import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@static-wears/shared';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const base = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com';

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, amount } = await req.json();
  if (!orderId || !amount) return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });

  try {
    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com';

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: 'USD',
            value: (amount / 320).toFixed(2),
          },
        }],
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? 'PayPal error' }, { status: 400 });

    const admin = createSupabaseAdminClient();
    await admin.from('payments').insert({
      order_id: orderId,
      stripe_payment_id: data.id,
      amount,
      currency: 'lkr',
      payment_method: 'paypal',
      payment_status: 'pending',
    });

    return NextResponse.json({ paypalOrderId: data.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
