import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { sendOrderConfirmation, sendShippingUpdate, sendLowStockAlert } from '@static-wears/email-service';

export async function GET(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'order';
  const to = searchParams.get('to');
  if (!to) return NextResponse.json({ error: 'Missing ?to=email' }, { status: 400 });

  let result: { error: string | null };

  if (type === 'shipping') {
    result = await sendShippingUpdate({
      to,
      customerName: 'Test Customer',
      orderId: 'test-order-id-12345',
      status: 'shipped',
    });
  } else if (type === 'lowstock') {
    result = await sendLowStockAlert({
      items: [
        { productName: 'Classic Hoodie', color: 'Black', size: 'M', currentStock: 2, threshold: 5 },
        { productName: 'Drop Tee', color: 'White', size: 'L', currentStock: 0, threshold: 5 },
      ],
    });
  } else {
    result = await sendOrderConfirmation({
      to,
      customerName: 'Test Customer',
      orderId: 'test-order-id-12345',
      items: [
        { name: 'Classic Hoodie — Black / M', quantity: 1, price: 4500 },
        { name: 'Drop Tee — White / L', quantity: 2, price: 2200 },
      ],
      total: 8900,
      shippingAddress: '42 Galle Road, Colombo 03, Sri Lanka',
    });
  }

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, type, to });
}
