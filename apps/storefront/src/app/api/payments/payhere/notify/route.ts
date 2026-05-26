import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { updateOrderStatus } from '@static-wears/order-service';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const merchantId = formData.get('merchant_id') as string;
  const orderId = formData.get('order_id') as string;
  const paymentId = formData.get('payment_id') as string;
  const statusCode = formData.get('status_code') as string;
  const md5sig = formData.get('md5sig') as string;
  const payhereAmount = formData.get('payhere_amount') as string;
  const payhereCurrency = formData.get('payhere_currency') as string;

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
  const secretHash = createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const expectedSig = createHash('md5')
    .update(`${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`)
    .digest('hex')
    .toUpperCase();

  if (expectedSig !== md5sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (statusCode === '2') {
    await supabase.from('payments').upsert({
      order_id: orderId,
      stripe_payment_id: paymentId,
      amount: parseFloat(payhereAmount),
      currency: 'lkr',
      payment_method: 'payhere',
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
    }, { onConflict: 'order_id' });

    await updateOrderStatus(orderId, 'confirmed');
  } else if (statusCode === '0') {
    await supabase.from('payments')
      .update({ payment_status: 'pending' })
      .eq('order_id', orderId);
  } else {
    await supabase.from('payments')
      .update({ payment_status: 'failed' })
      .eq('order_id', orderId);
  }

  return new NextResponse('OK', { status: 200 });
}
