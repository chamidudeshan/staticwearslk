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
  useEffect(() => { window.print(); }, []);

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #060608;
          color: #e8e8f0;
          font-family: 'Space Mono', 'Courier New', monospace;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          .no-print { display: none !important; }
          body { background: #060608 !important; }
          @page { margin: 0; size: A4; }
        }

        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 52px 48px;
          min-height: 100vh;
        }

        /* ── Header ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        .logo-mark {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #e8e8f0;
        }
        .logo-mark span { color: #ff6b35; }
        .logo-sub {
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #444;
          margin-top: 6px;
        }
        .invoice-meta { text-align: right; }
        .invoice-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 4px;
        }
        .invoice-id {
          font-size: 22px;
          font-weight: 700;
          color: #ff6b35;
          letter-spacing: 0.05em;
        }
        .invoice-date {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
        }

        /* ── Dividers ── */
        .rule { border: none; border-top: 1px solid #1e1e28; margin: 28px 0; }
        .rule-accent { border: none; border-top: 2px solid #ff6b35; margin: 0 0 28px; }

        /* ── Status bar ── */
        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0e0e12;
          border: 1px solid #1e1e28;
          padding: 14px 20px;
          margin-bottom: 28px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 4px 12px;
          border: 1px solid;
        }
        .badge-orange { color: #ff6b35; border-color: #ff6b35; background: rgba(255,107,53,0.08); }
        .badge-green  { color: #4ade80; border-color: #4ade8033; background: rgba(74,222,128,0.08); }
        .badge-amber  { color: #fbbf24; border-color: #fbbf2433; background: rgba(251,191,36,0.08); }

        /* ── Section label ── */
        .section-label {
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #ff6b35;
          margin-bottom: 14px;
        }

        /* ── Shipping block ── */
        .ship-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          background: #0e0e12;
          border: 1px solid #1e1e28;
          padding: 20px;
          margin-bottom: 28px;
        }
        .field-label {
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 5px;
        }
        .field-value {
          font-size: 12px;
          color: #e8e8f0;
          line-height: 1.5;
        }
        .notes-block {
          background: #0a0a0f;
          border: 1px solid #1e1e28;
          border-top: 2px solid #ff6b35;
          padding: 14px 20px;
          margin-bottom: 28px;
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        /* ── Items table ── */
        .items-header {
          display: grid;
          grid-template-columns: 1fr 60px 80px 100px;
          gap: 0 16px;
          padding: 10px 16px;
          background: #0e0e12;
          border: 1px solid #1e1e28;
          border-bottom: 2px solid #ff6b35;
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
        }
        .items-header span:not(:first-child) { text-align: right; }

        .item-row {
          display: grid;
          grid-template-columns: 1fr 60px 80px 100px;
          gap: 0 16px;
          padding: 14px 16px;
          border: 1px solid #1e1e28;
          border-top: none;
        }
        .item-row:nth-child(odd) { background: #0a0a0f; }
        .item-row:nth-child(even) { background: #060608; }

        .item-name { font-size: 12px; font-weight: 700; color: #e8e8f0; }
        .item-variant { font-size: 10px; color: #555; margin-top: 2px; }
        .item-unit { font-size: 10px; color: #444; margin-top: 2px; }
        .item-qty { font-size: 13px; color: #e8e8f0; text-align: right; align-self: center; }
        .item-sub { font-size: 13px; color: #e8e8f0; text-align: right; align-self: center; }
        .item-total-cell { font-size: 13px; font-weight: 700; color: #ff6b35; text-align: right; align-self: center; }

        /* ── Total row ── */
        .total-block {
          display: flex;
          justify-content: flex-end;
          margin-top: 2px;
        }
        .total-inner {
          background: #ff6b35;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 40px;
          min-width: 280px;
        }
        .total-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.6);
          flex: 1;
        }
        .total-value {
          font-size: 20px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.02em;
        }

        /* ── Footer ── */
        .footer {
          margin-top: 48px;
          padding-top: 20px;
          border-top: 1px solid #1e1e28;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .footer-brand { font-size: 9px; color: #333; letter-spacing: 0.25em; text-transform: uppercase; }
        .footer-id { font-size: 9px; color: #2a2a2a; letter-spacing: 0.1em; }

        /* ── Print button ── */
        .print-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          background: #ff6b35;
          color: #000;
          border: none;
          padding: 14px 28px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .print-btn:hover { background: #e8ff59; }
      `}</style>

      <div className="page">

        {/* ── Header ── */}
        <div className="header">
          <div>
            <div className="logo-mark">STATIC<span>WEARS</span></div>
            <div className="logo-sub">staticwears.com</div>
          </div>
          <div className="invoice-meta">
            <div className="invoice-label">Invoice</div>
            <div className="invoice-id">#{shortId}</div>
            <div className="invoice-date">{formatDate(order.created_at)}</div>
          </div>
        </div>

        <div className="rule-accent" />

        {/* ── Status bar ── */}
        <div className="status-bar">
          <div>
            <div className="field-label">Order Status</div>
            <span className={`badge ${order.status === 'delivered' || order.status === 'shipped' ? 'badge-green' : order.status === 'cancelled' ? 'badge-amber' : 'badge-orange'}`}>
              {order.status}
            </span>
          </div>
          {order.payment && (
            <div style={{ textAlign: 'right' }}>
              <div className="field-label">Payment</div>
              <span className={`badge ${order.payment.payment_status === 'paid' ? 'badge-green' : 'badge-amber'}`}>
                {order.payment.payment_status}
                {order.payment.payment_method ? ` · ${order.payment.payment_method}` : ''}
              </span>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div className="field-label">Customer ID</div>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.05em' }}>
              {order.customer_id.slice(0, 20)}...
            </div>
          </div>
        </div>

        {/* ── Shipping ── */}
        <div className="section-label">Ship To</div>
        <div className="ship-grid">
          <div>
            <div className="field-label">Full Name</div>
            <div className="field-value">{order.shipping_name}</div>
          </div>
          <div>
            <div className="field-label">Phone</div>
            <div className="field-value">{order.shipping_phone}</div>
          </div>
          <div>
            <div className="field-label">Delivery Address</div>
            <div className="field-value" style={{ whiteSpace: 'pre-line' }}>{order.shipping_addr}</div>
          </div>
        </div>

        {order.notes && (
          <div className="notes-block">
            <div className="field-label" style={{ marginBottom: 6 }}>Customer Notes</div>
            {order.notes}
          </div>
        )}

        {/* ── Items ── */}
        <div className="section-label">Order Items</div>
        <div className="items-header">
          <span>Product</span>
          <span style={{ textAlign: 'right' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Unit Price</span>
          <span style={{ textAlign: 'right' }}>Subtotal</span>
        </div>

        {(order.items ?? []).map((item) => (
          <div key={item.id} className="item-row">
            <div>
              <div className="item-name">{item.product_name}</div>
              {item.variant_desc && <div className="item-variant">{item.variant_desc}</div>}
              <div className="item-unit">{formatPrice(item.unit_price)} each</div>
            </div>
            <div className="item-qty">{item.quantity}</div>
            <div className="item-sub">{formatPrice(item.unit_price)}</div>
            <div className="item-total-cell">{formatPrice(item.unit_price * item.quantity)}</div>
          </div>
        ))}

        {/* ── Total ── */}
        <div className="total-block">
          <div className="total-inner">
            <div className="total-label">Order Total</div>
            <div className="total-value">{formatPrice(order.total_amount)}</div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="footer">
          <div className="footer-brand">Thank you for your order · Static Wears</div>
          <div className="footer-id">{order.id}</div>
        </div>
      </div>

      {/* Print trigger button */}
      <button className="print-btn no-print" onClick={() => window.print()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print / Save PDF
      </button>
    </>
  );
}
