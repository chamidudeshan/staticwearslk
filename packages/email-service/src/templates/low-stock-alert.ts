export function lowStockAlertHtml(data: {
  items: { productName: string; color: string; size: string; currentStock: number; threshold: number }[];
}): string {
  const rows = data.items.map((item) => {
    const urgentColor = item.currentStock === 0 ? '#ef4444' : item.currentStock <= 2 ? '#f59e0b' : '#ff6b35';
    const urgentLabel = item.currentStock === 0 ? 'OUT OF STOCK' : `${item.currentStock} LEFT`;
    return `
    <tr>
      <td style="padding:14px 12px;border-bottom:1px solid #1e1e1e;font-size:13px;color:#d0d0d0;font-family:'Courier New',monospace;">
        ${item.productName}
        <span style="display:block;font-size:11px;color:#666;margin-top:2px;">${item.color} / ${item.size}</span>
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #1e1e1e;text-align:center;">
        <span style="background:${urgentColor};color:#000;padding:3px 10px;font-size:10px;font-weight:800;letter-spacing:2px;font-family:'Courier New',monospace;text-transform:uppercase;border-radius:3px;">
          ${urgentLabel}
        </span>
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #1e1e1e;font-size:12px;color:#555;text-align:right;font-family:'Courier New',monospace;">
        Threshold: ${item.threshold}
      </td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Low Stock Alert — Static Wears Admin</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:0 0 60px 0;">

    <!-- Header -->
    <div style="background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:11px;color:#ff6b35;letter-spacing:6px;text-transform:uppercase;font-family:'Courier New',monospace;margin-bottom:4px;">Admin Alert</div>
        <div style="font-size:24px;font-weight:900;letter-spacing:-1px;color:#ffffff;">STATIC WEARS</div>
      </div>
      <span style="background:#ef4444;color:#fff;padding:4px 12px;font-size:10px;font-weight:800;letter-spacing:2px;font-family:'Courier New',monospace;border-radius:3px;">STOCK ALERT</span>
    </div>

    <!-- Alert Hero -->
    <div style="background:#111;border-bottom:3px solid #ef4444;padding:36px 40px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#ffffff;">Low Stock Warning</h1>
      <p style="margin:0;color:#888;font-size:14px;line-height:1.5;">
        ${data.items.length} variant${data.items.length > 1 ? 's' : ''} need${data.items.length === 1 ? 's' : ''} restocking. Take action before items run out.
      </p>
    </div>

    <div style="padding:32px 40px;">

      <!-- Items Table -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;overflow:hidden;margin-bottom:28px;">
        <div style="padding:16px 12px 12px;border-bottom:1px solid #1e1e1e;">
          <span style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:3px;font-family:'Courier New',monospace;">Variants Requiring Attention</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#0d0d0d;">
            <th style="padding:10px 12px;text-align:left;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:2px;font-family:'Courier New',monospace;font-weight:400;">Product / Variant</th>
            <th style="padding:10px 12px;text-align:center;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:2px;font-family:'Courier New',monospace;font-weight:400;">Stock</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:2px;font-family:'Courier New',monospace;font-weight:400;">Setting</th>
          </tr>
          ${rows}
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:16px;">
        <a href="https://admin.staticwears.com/products" style="display:inline-block;background:#ff6b35;color:#000000;text-decoration:none;padding:14px 36px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">
          MANAGE INVENTORY →
        </a>
      </div>
      <p style="text-align:center;font-size:12px;color:#444;margin:0;">
        Update stock levels in your admin panel to keep products available for customers.
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#0d0d0d;border-top:1px solid #1a1a1a;padding:28px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#444;font-family:'Courier New',monospace;">This alert was sent to your admin account.</p>
      <p style="margin:0 0 16px;font-size:11px;color:#333;font-family:'Courier New',monospace;">Adjust alert thresholds in Admin → Settings → Notifications.</p>
      <p style="margin:0;font-size:11px;color:#333;font-family:'Courier New',monospace;letter-spacing:1px;">© 2026 STATIC WEARS — SRI LANKA</p>
    </div>

  </div>
</body>
</html>`;
}
