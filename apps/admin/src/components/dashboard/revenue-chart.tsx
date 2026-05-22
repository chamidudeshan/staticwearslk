'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Order } from '@static-wears/shared';
import { motion } from 'framer-motion';

export function RevenueChart({ orders }: { orders: Order[] }) {
  const data = useMemo(() => {
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      const label = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const day = last30.find((d) => d.date === label);
      if (day) {
        day.revenue += order.total_amount;
        day.orders += 1;
      }
    });
    return last30;
  }, [orders]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#e8e8f0]">Revenue — Last 30 Days</h2>
          <p className="font-mono text-xs text-[#555] mt-1">
            LKR {totalRevenue.toLocaleString()} total
          </p>
        </div>
        <div className="w-3 h-3 rounded-full bg-[#ff6b35] mt-1" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#444', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#444', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: '#12121a',
              border: '1px solid #1e1e28',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
            }}
            formatter={(v: number) => [`LKR ${v.toLocaleString()}`, 'Revenue']}
            labelStyle={{ color: '#888' }}
            itemStyle={{ color: '#ff6b35' }}
            cursor={{ stroke: '#ff6b35', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ff6b35"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ fill: '#ff6b35', strokeWidth: 0, r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
