'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Order, Product } from '@static-wears/shared';
import { formatPrice } from '@/lib/utils';

export function TopProducts({
  orders,
  products,
}: {
  orders: Order[];
  products: Product[];
}) {
  const topProducts = useMemo(() => {
    const salesMap = new Map<string, { name: string; qty: number; revenue: number }>();

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      order.items?.forEach((item) => {
        const existing = salesMap.get(item.product_id);
        if (existing) {
          existing.qty += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          salesMap.set(item.product_id, {
            name: item.product_name,
            qty: item.quantity,
            revenue: item.subtotal,
          });
        }
      });
    });

    return Array.from(salesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6"
    >
      <h2 className="font-bold text-[#e8e8f0] mb-6">Top Products</h2>
      {topProducts.length === 0 ? (
        <p className="font-mono text-xs text-[#444] text-center py-8">
          No sales data yet
        </p>
      ) : (
        <div className="space-y-4">
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#444] w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-[#e8e8f0] truncate font-bold">
                  {p.name}
                </p>
                <div className="mt-1.5 h-1 bg-[#1e1e28] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff6b35] rounded-full"
                    style={{
                      width: `${Math.min(100, (p.qty / (topProducts[0]?.qty || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs text-[#ff6b35] font-bold">
                  {formatPrice(p.revenue)}
                </p>
                <p className="font-mono text-[10px] text-[#555]">{p.qty} sold</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
