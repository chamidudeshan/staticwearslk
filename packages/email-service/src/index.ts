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

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  adminEmail: string;
}): Promise<{ error: string | null }> {
  const adminEmail = data.adminEmail;
  if (!adminEmail) return { error: 'No admin email configured' };
  const subjectLabel: Record<string, string> = {
    order: 'Order Issue', returns: 'Returns & Exchanges',
    sizing: 'Sizing Help', collab: 'Collaboration', other: 'Other',
  };
  const label = subjectLabel[data.subject] ?? data.subject;
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>New Contact Message</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:0 0 60px 0;">
    <div style="background:#E26B35;padding:32px 40px;">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#000;opacity:.7;">STATIC WEARS</p>
      <h1 style="margin:8px 0 0;font-family:'Courier New',monospace;font-size:22px;color:#000;font-weight:900;letter-spacing:1px;">NEW CONTACT MESSAGE</h1>
    </div>
    <div style="background:#111;padding:36px 40px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:11px;color:#555;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:2px;width:110px;">From</td>
            <td style="padding:10px 0;border-bottom:1px solid #222;font-size:14px;color:#e8e8f0;font-family:'Courier New',monospace;">${data.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:11px;color:#555;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:2px;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #222;font-size:14px;color:#E26B35;font-family:'Courier New',monospace;"><a href="mailto:${data.email}" style="color:#E26B35;text-decoration:none;">${data.email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:11px;color:#555;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:2px;">Topic</td>
            <td style="padding:10px 0;border-bottom:1px solid #222;font-size:14px;color:#e8e8f0;font-family:'Courier New',monospace;">${label}</td></tr>
      </table>
      <div style="margin-top:28px;">
        <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Message</p>
        <div style="background:#0d0d0d;border:1px solid #222;padding:20px 24px;border-left:3px solid #E26B35;">
          <p style="margin:0;font-size:14px;color:#d0d0d0;font-family:'Courier New',monospace;line-height:1.7;white-space:pre-wrap;">${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
      </div>
      <div style="margin-top:28px;text-align:center;">
        <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(label)}"
           style="display:inline-block;background:#E26B35;color:#000;font-family:'Courier New',monospace;font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:14px 32px;">
          REPLY TO ${data.name.toUpperCase()}
        </a>
      </div>
    </div>
    <div style="background:#080808;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#333;letter-spacing:2px;text-transform:uppercase;">Static Wears Admin Notification</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: 'Static Wears <notifications@staticwears.com>',
      to: adminEmail,
      reply_to: data.email,
      subject: `[Contact] ${label} — from ${data.name}`,
      html,
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
