'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@static-wears/shared';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shipped: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_OPTIONS: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_name.toLowerCase().includes(search.toLowerCase());
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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0e0e12] border border-[#1e1e28] pl-9 pr-4 py-2.5 font-mono text-xs text-[#e8e8f0] placeholder:text-[#444] focus:outline-none focus:border-[#ff6b35] transition-colors w-64"
          />
        </div>
        <div className="flex gap-2">
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

      {/* Table */}
      <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e28]">
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]"
                  >
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
                filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#12121a] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-[#e8e8f0]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-mono text-xs text-[#e8e8f0]">{order.shipping_name}</p>
                        <p className="font-mono text-[10px] text-[#555]">{order.shipping_phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-[#888]">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-[#888]">
                        {order.items?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-bold text-[#ff6b35]">
                        {formatPrice(order.total_amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border rounded-full bg-transparent focus:outline-none cursor-pointer disabled:opacity-50 ${
                          STATUS_COLORS[order.status as OrderStatus]
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-[#12121a] text-[#e8e8f0]">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
