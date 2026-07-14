'use client';

import { useState } from 'react';
import { Search, FileSpreadsheet, Loader2, ChevronDown, ChevronUp, MapPin, Phone, User, Package, StickyNote, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@static-wears/shared';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
  confirmed:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shipped:    'text-violet-400 bg-violet-400/10 border-violet-400/20',
  delivered:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled:  'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_OPTIONS: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
];

async function downloadExport(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) { toast.error('Export failed'); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function OrderRow({
  order,
  updating,
  onStatusChange,
}: {
  order: Order;
  updating: string | null;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ── Summary row ── */}
      <tr
        className="hover:bg-[#12121a] transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronUp size={14} className="text-[#ff6b35] shrink-0" />
              : <ChevronDown size={14} className="text-[#444] shrink-0" />}
            <span className="font-mono text-xs font-bold text-[#e8e8f0]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </td>
        <td className="px-5 py-4">
          <div>
            <p className="font-mono text-xs text-[#e8e8f0]">{order.shipping_name}</p>
            <p className="font-mono text-[10px] text-[#555]">{order.shipping_phone}</p>
          </div>
        </td>
        <td className="px-5 py-4">
          <span className="font-mono text-xs text-[#888]">{formatDate(order.created_at)}</span>
        </td>
        <td className="px-5 py-4">
          <span className="font-mono text-xs text-[#888]">{order.items?.length ?? 0}</span>
        </td>
        <td className="px-5 py-4">
          <span className="font-mono text-sm font-bold text-[#ff6b35]">
            {formatPrice(order.total_amount)}
          </span>
        </td>
        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
          <select
            value={order.status}
            disabled={updating === order.id}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border rounded-full bg-transparent focus:outline-none cursor-pointer disabled:opacity-50 ${
              STATUS_COLORS[order.status as OrderStatus]
            }`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-[#12121a] text-[#e8e8f0]">{s}</option>
            ))}
          </select>
        </td>
      </tr>

      {/* ── Expanded detail row ── */}
      {expanded && (
        <tr className="bg-[#0a0a0f]">
          <td colSpan={6} className="px-5 py-5 border-b border-[#1e1e28]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Shipping info */}
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff6b35] mb-2">
                  Shipping Details
                </p>
                <div className="flex items-start gap-2">
                  <User size={13} className="text-[#444] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Name</p>
                    <p className="font-mono text-xs text-[#e8e8f0]">{order.shipping_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={13} className="text-[#444] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Phone</p>
                    <p className="font-mono text-xs text-[#e8e8f0]">{order.shipping_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#444] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Address</p>
                    <p className="font-mono text-xs text-[#e8e8f0] whitespace-pre-line">{order.shipping_addr}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-2">
                    <StickyNote size={13} className="text-[#444] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Notes</p>
                      <p className="font-mono text-xs text-[#888]">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className="md:col-span-2 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff6b35] mb-2">
                  Items ({order.items?.length ?? 0})
                </p>
                {(order.items ?? []).length === 0 ? (
                  <p className="font-mono text-xs text-[#444]">No item details available</p>
                ) : (
                  <div className="space-y-2">
                    {order.items!.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-[#0e0e12] border border-[#1e1e28] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package size={13} className="text-[#444] shrink-0" />
                          <div>
                            <p className="font-mono text-xs text-[#e8e8f0] font-bold">{item.product_name}</p>
                            {item.variant_desc && (
                              <p className="font-mono text-[10px] text-[#555]">{item.variant_desc}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-mono text-xs text-[#e8e8f0]">
                            {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                          <p className="font-mono text-xs font-bold text-[#ff6b35]">
                            {formatPrice(item.unit_price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Total */}
                    <div className="flex justify-end pt-1">
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Order Total</p>
                        <p className="font-mono text-base font-bold text-[#ff6b35]">{formatPrice(order.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Print button */}
                <div className="pt-3 border-t border-[#1e1e28]">
                  <a
                    href={`/orders/${order.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0e0e12] border border-[#1e1e28] hover:border-[#ff6b35] hover:text-[#ff6b35] text-[#888] font-mono text-[10px] uppercase tracking-widest transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Printer size={12} />
                    Print / Save Bill
                  </a>
                </div>

                {/* Payment info */}
                {order.payment && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1e1e28]">
                    <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Payment</p>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-full ${
                      order.payment.payment_status === 'paid'
                        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    }`}>
                      {order.payment.payment_status}
                    </span>
                    {order.payment.payment_method && (
                      <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">
                        via {order.payment.payment_method}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updating, setUpdating]       = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [exporting, setExporting]     = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadExport('/api/admin/export/orders', `staticwears-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Orders exported successfully');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }

  const filtered = localOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_name.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_phone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLocalOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
        );
        toast.success(`Order updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order');
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters + Export */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
            <input
              placeholder="Search name, phone, order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0e0e12] border border-[#1e1e28] pl-9 pr-4 py-2.5 font-mono text-xs text-[#e8e8f0] placeholder:text-[#444] focus:outline-none focus:border-[#ff6b35] transition-colors w-72"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', ...STATUS_OPTIONS] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as OrderStatus | 'all')}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-2 border transition-colors ${
                  statusFilter === s
                    ? 'border-[#ff6b35] text-[#ff6b35] bg-[#ff6b35]/10'
                    : 'border-[#1e1e28] text-[#555] hover:border-[#333]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-mono font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-60 shrink-0"
        >
          {exporting
            ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
            : <><FileSpreadsheet size={13} /> Export Excel</>}
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e28]">
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12121a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-xs text-[#444]">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    updating={updating}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="font-mono text-[10px] text-[#333] text-center">Click any row to expand order details</p>
    </div>
  );
}
