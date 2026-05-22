'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Package, Clock, TrendingDown } from 'lucide-react';

const statConfig = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: TrendingUp, format: 'currency', color: '#ff6b35' },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, format: 'number', color: '#7c3aed' },
  { key: 'totalCustomers', label: 'Customers', icon: Users, format: 'number', color: '#0ea5e9' },
  { key: 'totalProducts', label: 'Products', icon: Package, format: 'number', color: '#22c55e' },
  { key: 'pendingOrders', label: 'Pending', icon: Clock, format: 'number', color: '#f59e0b' },
];

export function DashboardStats({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon;
        const value = stats[stat.key] ?? 0;
        const formatted =
          stat.format === 'currency'
            ? `LKR ${value.toLocaleString()}`
            : value.toLocaleString();

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-5 relative overflow-hidden"
          >
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-15"
              style={{ backgroundColor: stat.color }}
            />
            <div className="relative z-10">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${stat.color}18`,
                  border: `1px solid ${stat.color}35`,
                }}
              >
                <Icon size={15} style={{ color: stat.color }} />
              </div>
              <div className="font-mono text-[10px] text-[#555] uppercase tracking-widest mb-1.5">
                {stat.label}
              </div>
              <div className="font-bold text-xl text-[#e8e8f0] leading-none">
                {formatted}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
