import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');
  if (!to) return NextResponse.json({ error: 'Missing ?to=email' }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_placeholder') {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured in .env.production' }, { status: 500 });
  }

  const type = searchParams.get('type') ?? 'order';

  const subjects: Record<string, string> = {
    order:    `Order Confirmed — #TEST1234 | Static Wears`,
    shipping: `Your Order Has Been Shipped — Static Wears`,
    lowstock: `⚠️ Low Stock Alert — Static Wears Admin`,
  };

  const bodies: Record<string, string> = {
    order: `<div style="font-family:sans-serif;background:#0a0a0a;color:#f0f0f0;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#ff6b35;font-size:28px;font-weight:900;letter-spacing:-1px;">STATIC WEARS</h1>
      <h2 style="color:#fff;">✓ Order Confirmed — Test Email</h2>
      <p>Hi Test Customer, your order <strong style="color:#ff6b35;">#TEST1234</strong> is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #333;color:#ccc;">Classic Hoodie — Black / M × 1</td><td style="text-align:right;color:#ccc;">LKR 4,500</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #333;color:#ccc;">Drop Tee — White / L × 2</td><td style="text-align:right;color:#ccc;">LKR 4,400</td></tr>
      </table>
      <p style="font-size:18px;font-weight:700;color:#ff6b35;text-align:right;">Total: LKR 8,900</p>
      <p style="color:#888;font-size:12px;margin-top:40px;">© 2026 Static Wears — Sri Lanka</p>
    </div>`,

    shipping: `<div style="font-family:sans-serif;background:#0a0a0a;color:#f0f0f0;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#ff6b35;font-size:28px;font-weight:900;letter-spacing:-1px;">STATIC WEARS</h1>
      <h2 style="color:#3b82f6;">🚚 Your Order Has Been Shipped — Test Email</h2>
      <p>Hi Test Customer, your order <strong style="color:#ff6b35;">#TEST1234</strong> is on its way!</p>
      <p style="color:#888;font-size:12px;margin-top:40px;">© 2026 Static Wears — Sri Lanka</p>
    </div>`,

    lowstock: `<div style="font-family:sans-serif;background:#0a0a0a;color:#f0f0f0;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#ff6b35;font-size:28px;font-weight:900;letter-spacing:-1px;">STATIC WEARS ADMIN</h1>
      <h2 style="color:#ef4444;">⚠️ Low Stock Alert — Test Email</h2>
      <p>The following variants need restocking:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #333;color:#ccc;">Classic Hoodie — Black / M</td><td style="text-align:right;color:#f59e0b;">2 left</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #333;color:#ccc;">Drop Tee — White / L</td><td style="text-align:right;color:#ef4444;">Out of stock</td></tr>
      </table>
      <p style="color:#888;font-size:12px;margin-top:40px;">© 2026 Static Wears — Sri Lanka</p>
    </div>`,
  };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Static Wears <orders@staticwears.lk>',
        to,
        subject: subjects[type] ?? subjects.order,
        html: bodies[type] ?? bodies.order,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ success: false, error: data }, { status: 500 });
    return NextResponse.json({ success: true, type, to, id: data.id });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
