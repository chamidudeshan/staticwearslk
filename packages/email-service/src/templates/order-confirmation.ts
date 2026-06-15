export function orderConfirmationHtml(data: {
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const itemRows = data.items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #222;font-size:14px;color:#d0d0d0;font-family:'Courier New',monospace;">
        ${item.name}
        <span style="display:block;font-size:11px;color:#666;margin-top:2px;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #222;font-size:14px;color:#d0d0d0;text-align:right;font-family:'Courier New',monospace;white-space:nowrap;">
        LKR ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Confirmed — Static Wears</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:0 0 60px 0;">

    <!-- Header -->
    <div style="background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:32px 40px;text-align:center;">
      <div style="font-size:11px;color:#ff6b35;letter-spacing:6px;text-transform:uppercase;font-family:'Courier New',monospace;margin-bottom:6px;">staticwears.com</div>
      <div style="font-size:32px;font-weight:900;letter-spacing:-2px;color:#ffffff;">STATIC WEARS</div>
    </div>

    <!-- Hero -->
    <div style="background:#111;padding:48px 40px;text-align:center;border-bottom:3px solid #ff6b35;">
      <div style="width:56px;height:56px;background:#ff6b35;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:26px;line-height:56px;">✓</div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Order Confirmed!</h1>
      <p style="margin:0 0 24px;color:#888;font-size:15px;line-height:1.5;">Thanks ${data.customerName}, your order is confirmed and being prepared.</p>
      <span style="background:#ff6b35;color:#000000;padding:6px 20px;font-size:12px;font-weight:800;letter-spacing:3px;font-family:'Courier New',monospace;text-transform:uppercase;">
        #${shortId}
      </span>
    </div>

    <div style="padding:40px;">

      <!-- Items -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:24px;margin-bottom:20px;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:3px;font-family:'Courier New',monospace;margin-bottom:16px;">Items Ordered</div>
        <table style="width:100%;border-collapse:collapse;">${itemRows}</table>
        <div style="margin-top:20px;padding-top:16px;border-top:2px solid #ff6b35;display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:#666;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:2px;">Total</span>
          <span style="font-size:20px;font-weight:800;color:#ff6b35;font-family:'Courier New',monospace;">LKR ${data.total.toLocaleString()}</span>
        </div>
      </div>

      <!-- Shipping -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:24px;margin-bottom:20px;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:3px;font-family:'Courier New',monospace;margin-bottom:12px;">Shipping To</div>
        <div style="font-size:14px;color:#ccc;line-height:1.7;">${data.shippingAddress}</div>
      </div>

      <!-- What happens next -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:24px;margin-bottom:32px;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:3px;font-family:'Courier New',monospace;margin-bottom:16px;">What Happens Next</div>
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <span style="width:22px;height:22px;background:#ff6b35;color:#000;border-radius:50%;font-size:11px;font-weight:800;text-align:center;line-height:22px;flex-shrink:0;">1</span>
          <span style="font-size:13px;color:#aaa;padding-top:3px;">We're packing your order with care.</span>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <span style="width:22px;height:22px;background:#333;color:#888;border-radius:50%;font-size:11px;font-weight:800;text-align:center;line-height:22px;flex-shrink:0;">2</span>
          <span style="font-size:13px;color:#aaa;padding-top:3px;">You'll get a shipping notification with tracking details.</span>
        </div>
        <div style="display:flex;gap:12px;">
          <span style="width:22px;height:22px;background:#333;color:#888;border-radius:50%;font-size:11px;font-weight:800;text-align:center;line-height:22px;flex-shrink:0;">3</span>
          <span style="font-size:13px;color:#aaa;padding-top:3px;">Drop. Collect. Wear. — Enjoy your Static Wears.</span>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:40px;">
        <a href="https://staticwears.com/orders" style="display:inline-block;background:#ff6b35;color:#000000;text-decoration:none;padding:14px 36px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">
          VIEW MY ORDER →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#0d0d0d;border-top:1px solid #1a1a1a;padding:32px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#555;">Questions? We're here for you.</p>
      <a href="mailto:hello@staticwears.com" style="color:#ff6b35;font-size:13px;text-decoration:none;font-family:'Courier New',monospace;">hello@staticwears.com</a>
      <p style="margin:24px 0 0;font-size:11px;color:#333;font-family:'Courier New',monospace;letter-spacing:1px;">© 2026 STATIC WEARS — SRI LANKA</p>
    </div>

  </div>
</body>
</html>`;
}
