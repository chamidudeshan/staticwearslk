import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@static-wears/shared';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, amount } = await req.json();

  const merchantId = process.env.PAYHERE_MERCHANT_ID!;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
  const currency = 'LKR';
  const amountFormatted = parseFloat(String(amount)).toFixed(2);

  const secretHash = createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const hash = createHash('md5')
    .update(`${merchantId}${orderId}${amountFormatted}${currency}${secretHash}`)
    .digest('hex')
    .toUpperCase();

  const isSandbox = process.env.PAYHERE_ENV !== 'production';

  return NextResponse.json({
    merchantId,
    orderId,
    amount: amountFormatted,
    currency,
    hash,
    payhereUrl: isSandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout',
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payhere/notify`,
  });
}
