import { Resend } from 'resend';
import { orderConfirmationHtml } from './templates/order-confirmation';

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
      from: 'Static Wears <orders@staticwears.lk>',
      to: data.to,
      subject: `Order Confirmed — #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: orderConfirmationHtml(data),
    });
    return { error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { error: msg };
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
      from: 'Static Wears <orders@staticwears.lk>',
      to: data.to,
      subject: `Your Order Has Been ${data.status} — Static Wears`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px;background:#0a0a0a;color:#f0f0f0;">
          <h1 style="color:#ff6b35;">Static Wears</h1>
          <p>Hi ${data.customerName},</p>
          <p>Your order <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> has been updated to: <strong style="color:#ff6b35;">${data.status}</strong>.</p>
          <p>Thank you for shopping with us!</p>
          <p style="color:#888;font-size:12px;margin-top:40px;">© 2026 Static Wears — Sri Lanka</p>
        </div>
      `,
    });
    return { error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { error: msg };
  }
}
