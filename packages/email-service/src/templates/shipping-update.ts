const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; message: string }> = {
  processing: {
    label: 'Processing',
    color: '#f59e0b',
    icon: '⚙',
    message: 'Your order is being processed and prepared for dispatch.',
  },
  shipped: {
    label: 'Shipped',
    color: '#3b82f6',
    icon: '🚚',
    message: 'Great news — your order is on its way! Expect delivery soon.',
  },
  delivered: {
    label: 'Delivered',
    color: '#22c55e',
    icon: '✓',
    message: 'Your order has been delivered. Enjoy your Static Wears!',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
    icon: '✕',
    message: 'Your order has been cancelled. Contact us if you have questions.',
  },
};

export function shippingUpdateHtml(data: {
  customerName: string;
  orderId: string;
  status: string;
}): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const cfg = STATUS_CONFIG[data.status.toLowerCase()] ?? {
    label: data.status,
    color: '#ff6b35',
    icon: '→',
    message: `Your order status has been updated to ${data.status}.`,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Update — Static Wears</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:0 0 60px 0;">

    <!-- Header -->
    <div style="background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:32px 40px;text-align:center;">
      <div style="font-size:11px;color:#ff6b35;letter-spacing:6px;text-transform:uppercase;font-family:'Courier New',monospace;margin-bottom:6px;">staticwears.com</div>
      <div style="font-size:32px;font-weight:900;letter-spacing:-2px;color:#ffffff;">STATIC WEARS</div>
    </div>

    <!-- Status Hero -->
    <div style="background:#111;padding:48px 40px;text-align:center;border-bottom:3px solid ${cfg.color};">
      <div style="width:56px;height:56px;background:${cfg.color};border-radius:50%;margin:0 auto 20px;font-size:26px;line-height:56px;text-align:center;">${cfg.icon}</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">Order ${cfg.label}</h1>
      <p style="margin:0 0 24px;color:#888;font-size:15px;line-height:1.5;">Hi ${data.customerName} — ${cfg.message}</p>
      <span style="background:${cfg.color};color:#000000;padding:6px 20px;font-size:12px;font-weight:800;letter-spacing:3px;font-family:'Courier New',monospace;text-transform:uppercase;">
        #${shortId}
      </span>
    </div>

    <div style="padding:40px;">

      <!-- Status Timeline -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:24px;margin-bottom:24px;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:3px;font-family:'Courier New',monospace;margin-bottom:20px;">Order Status</div>

        ${['processing', 'shipped', 'delivered'].map((step) => {
          const stepCfg = STATUS_CONFIG[step];
          const statuses = ['processing', 'shipped', 'delivered'];
          const currentIdx = statuses.indexOf(data.status.toLowerCase());
          const stepIdx = statuses.indexOf(step);
          const isDone = stepIdx <= currentIdx;
          const isCurrent = stepIdx === currentIdx;
          return `
          <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:${step === 'delivered' ? '0' : '16px'};">
            <div style="width:26px;height:26px;border-radius:50%;background:${isCurrent ? stepCfg.color : isDone ? '#333' : '#1a1a1a'};border:2px solid ${isCurrent ? stepCfg.color : isDone ? '#444' : '#222'};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:${isDone ? '#fff' : '#333'};font-weight:800;">${isDone ? '✓' : ''}</div>
            <div style="padding-top:3px;">
              <div style="font-size:13px;font-weight:${isCurrent ? '700' : '400'};color:${isCurrent ? '#fff' : isDone ? '#888' : '#444'};margin-bottom:2px;">${stepCfg.label}</div>
              ${isCurrent ? `<div style="font-size:12px;color:${stepCfg.color};">${stepCfg.message}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="https://staticwears.com/orders" style="display:inline-block;background:#ff6b35;color:#000000;text-decoration:none;padding:14px 36px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">
          VIEW ORDER →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#0d0d0d;border-top:1px solid #1a1a1a;padding:32px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#555;">Need help with your order?</p>
      <a href="mailto:hello@staticwears.lk" style="color:#ff6b35;font-size:13px;text-decoration:none;font-family:'Courier New',monospace;">hello@staticwears.lk</a>
      <p style="margin:24px 0 0;font-size:11px;color:#333;font-family:'Courier New',monospace;letter-spacing:1px;">© 2026 STATIC WEARS — SRI LANKA</p>
    </div>

  </div>
</body>
</html>`;
}
