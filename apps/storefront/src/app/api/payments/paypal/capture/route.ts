import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import { updateOrderStatus } from '@static-wears/order-service';

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
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paypalOrderId, orderId } = await req.json();

  try {
    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com';

    const res = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok || data.status !== 'COMPLETED') {
      return NextResponse.json({ error: data.message ?? 'Capture failed' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    await admin.from('payments').update({
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
    }).eq('order_id', orderId).eq('payment_method', 'paypal');

    await updateOrderStatus(orderId, 'confirmed');

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
