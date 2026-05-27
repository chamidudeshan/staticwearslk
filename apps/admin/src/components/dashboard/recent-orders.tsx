'use client';

import Link from 'next/link';
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

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-[#1e1e28]">
        <h2 className="font-bold text-[#e8e8f0]">Recent Orders</h2>
        <Link
          href="/orders"
          className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest hover:underline"
        >
          View all →
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-mono text-xs text-[#444]">No orders yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#12121a]">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#12121a] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono text-xs text-[#e8e8f0] font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-mono text-[10px] text-[#555] mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-full ${
                    STATUS_COLORS[order.status as OrderStatus] ?? 'text-[#666]'
                  }`}
                >
                  {order.status}
                </span>
                <span className="font-mono text-sm font-bold text-[#ff6b35] min-w-[100px] text-right">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
