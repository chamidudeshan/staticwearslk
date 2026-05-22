export function orderConfirmationHtml(data: {
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#e0e0e0;">${item.name} × ${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#e0e0e0;text-align:right;">LKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#ff6b35;margin-bottom:8px;">STATIC WEARS</div>
      <div style="font-size:22px;font-weight:700;color:#f0f0f0;margin-bottom:8px;">Order Confirmed!</div>
      <div style="color:#888;font-size:14px;margin-bottom:16px;">Thanks ${data.customerName}, your order is on its way.</div>
      <span style="background:#ff6b35;color:#000;padding:4px 14px;border-radius:6px;font-size:12px;font-weight:700;letter-spacing:1px;">
        #${data.orderId.slice(0, 8).toUpperCase()}
      </span>
    </div>

    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">Items Ordered</div>
      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
      </table>
      <div style="font-size:18px;font-weight:700;color:#ff6b35;text-align:right;margin-top:16px;">
        Total: LKR ${data.total.toLocaleString()}
      </div>
    </div>

    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Shipping To</div>
      <div style="font-size:14px;color:#e0e0e0;line-height:1.6;">${data.shippingAddress}</div>
    </div>

    <div style="text-align:center;color:#555;font-size:12px;margin-top:40px;">
      <p>Questions? <a href="mailto:hello@staticwears.lk" style="color:#ff6b35;">hello@staticwears.lk</a></p>
      <p style="margin-top:8px;">© 2026 Static Wears — Sri Lanka</p>
    </div>
  </div>
</body>
</html>`;
}
