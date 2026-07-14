'use client';

import { useEffect } from 'react';
import type { Order } from '@static-wears/shared';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function PrintBill({ order }: { order: Order }) {
  useEffect(() => {
    window.print();
  }, []);

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', Courier, monospace; background: #fff; color: #111; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .page { max-width: 680px; margin: 0 auto; padding: 40px 32px; }
        .divider { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        .divider-thick { border: none; border-top: 2px solid #111; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-bottom: 2px; }
        .value { font-size: 13px; color: #111; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 15px; }
        .badge { display: inline-block; padding: 2px 10px; border: 1px solid #111; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; }
        .print-btn { position: fixed; bottom: 24px; right: 24px; background: #111; color: #fff; border: none; padding: 12px 24px; font-family: 'Courier New', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; cursor: pointer; }
        .print-btn:hover { background: #ff6b35; }
      `}</style>

      <div className="page">

        {/* Header */}
        <div className="row" style={{ alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
              STATIC<span style={{ color: '#ff6b35' }}>WEARS</span>
            </div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4 }}>
              staticwears.com
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Invoice</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.05em' }}>#{shortId}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{formatDate(order.created_at)}</div>
          </div>
        </div>

        <hr className="divider-thick" />

        {/* Status + Payment */}
        <div className="row" style={{ marginBottom: 20 }}>
          <div>
            <div className="label">Order Status</div>
            <span className="badge">{order.status}</span>
          </div>
          {order.payment && (
            <div style={{ textAlign: 'right' }}>
              <div className="label">Payment</div>
              <span className="badge">{order.payment.payment_status}{order.payment.payment_method ? ` · ${order.payment.payment_method}` : ''}</span>
            </div>
          )}
        </div>

        {/* Shipping */}
        <div style={{ background: '#f9f9f9', padding: '16px 20px', marginBottom: 24 }}>
          <div className="label" style={{ marginBottom: 10 }}>Ship To</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="label">Name</div>
              <div className="value">{order.shipping_name}</div>
            </div>
            <div>
              <div className="label">Phone</div>
              <div className="value">{order.shipping_phone}</div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="label">Address</div>
              <div className="value" style={{ whiteSpace: 'pre-line' }}>{order.shipping_addr}</div>
            </div>
          </div>
          {order.notes && (
            <div style={{ marginTop: 12 }}>
              <div className="label">Customer Notes</div>
              <div className="value" style={{ color: '#555', fontStyle: 'italic' }}>{order.notes}</div>
            </div>
          )}
        </div>

        {/* Items */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 16px', padding: '0 0 8px', borderBottom: '2px solid #111' }}>
            <div className="label">Product</div>
            <div className="label" style={{ textAlign: 'center' }}>Qty</div>
            <div className="label" style={{ textAlign: 'right' }}>Amount</div>
          </div>

          {(order.items ?? []).map((item) => (
            <div key={item.id} className="item-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</div>
                {item.variant_desc && (
                  <div style={{ fontSize: 11, color: '#888' }}>{item.variant_desc}</div>
                )}
                <div style={{ fontSize: 11, color: '#aaa' }}>{formatPrice(item.unit_price)} each</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 13 }}>{item.quantity}</div>
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
                {formatPrice(item.unit_price * item.quantity)}
              </div>
            </div>
          ))}

          {/* Total */}
          <div style={{ borderTop: '2px solid #111', marginTop: 4 }}>
            <div className="total-row">
              <span>Total</span>
              <span style={{ color: '#ff6b35' }}>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Thank you for your order · staticwears.com
          </div>
          <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
            Order ID: {order.id}
          </div>
        </div>
      </div>

      {/* Print button — hidden when printing */}
      <button className="print-btn no-print" onClick={() => window.print()}>
        Print / Save PDF
      </button>
    </>
  );
}
