import { Resend } from 'resend';
import { orderConfirmationHtml } from './templates/order-confirmation';
import { shippingUpdateHtml } from './templates/shipping-update';
import { lowStockAlertHtml } from './templates/low-stock-alert';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmation(data: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}): Promise<{ error: string | null }> {
  try {
    await resend.emails.send({
      from: 'Static Wears <orders@staticwears.com>',
      to: data.to,
      subject: `Order Confirmed — #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: orderConfirmationHtml(data),
    });
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendShippingUpdate(data: {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
}): Promise<{ error: string | null }> {
  try {
    await resend.emails.send({
      from: 'Static Wears <orders@staticwears.com>',
      to: data.to,
      subject: `Your Order Is ${data.status} — Static Wears`,
      html: shippingUpdateHtml(data),
    });
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendLowStockAlert(data: {
  items: { productName: string; color: string; size: string; currentStock: number; threshold: number }[];
}): Promise<{ error: string | null }> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { error: 'ADMIN_EMAIL not set' };
  try {
    await resend.emails.send({
      from: 'Static Wears Alerts <alerts@staticwears.com>',
      to: adminEmail,
      subject: `⚠️ Low Stock Alert — ${data.items.length} variant${data.items.length > 1 ? 's' : ''} need restocking`,
      html: lowStockAlertHtml(data),
    });
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
