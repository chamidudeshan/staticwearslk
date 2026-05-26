'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Bell, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Static Wears');
  const [storeEmail, setStoreEmail] = useState('hello@staticwears.lk');
  const [currency, setCurrency] = useState('LKR');
  const [orderNotif, setOrderNotif] = useState(true);
  const [lowStockNotif, setLowStockNotif] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Settings saved');
    setSaving(false);
  }

  const integrations = [
    {
      name: 'Stripe',
      description: 'Card payments (international)',
      env: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      color: '#635bff',
    },
    {
      name: 'PayPal',
      description: 'PayPal wallet & card',
      env: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      color: '#003087',
    },
    {
      name: 'PayHere',
      description: 'Sri Lanka local payments',
      env: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
      color: '#00a651',
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <Header title="Settings" subtitle="Configure your store" />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Store size={14} className="text-[#ff6b35]" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Store Info</h2>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Store Name</label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Contact Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
            >
              <option value="LKR">LKR — Sri Lankan Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-[#ff6b35]" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Notifications</h2>
          </div>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-mono text-sm text-[#e8e8f0]">New order alerts</p>
              <p className="font-mono text-xs text-[#444]">Email when a new order is placed</p>
            </div>
            <button
              type="button"
              onClick={() => setOrderNotif(!orderNotif)}
              className={`relative w-10 h-5 rounded-full transition-colors ${orderNotif ? 'bg-[#ff6b35]' : 'bg-[#1e1e28]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${orderNotif ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-mono text-sm text-[#e8e8f0]">Low stock alerts</p>
              <p className="font-mono text-xs text-[#444]">Email when variant stock drops below threshold</p>
            </div>
            <button
              type="button"
              onClick={() => setLowStockNotif(!lowStockNotif)}
              className={`relative w-10 h-5 rounded-full transition-colors ${lowStockNotif ? 'bg-[#ff6b35]' : 'bg-[#1e1e28]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${lowStockNotif ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          {lowStockNotif && (
            <div className="space-y-1.5 pl-4 border-l border-[#1e1e28]">
              <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Threshold (units)</label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-28 bg-[#12121a] border border-[#1e1e28] px-4 py-2 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
              />
            </div>
          )}
        </motion.div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
        >
          {saving ? <><Save size={14} />Saving...</> : <><Check size={14} />Save Settings</>}
        </button>
      </form>

      {/* Integrations (read-only status) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={14} className="text-[#ff6b35]" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Payment Integrations</h2>
        </div>
        <p className="font-mono text-xs text-[#444]">Configure via environment variables in your server.</p>
        <div className="space-y-3">
          {integrations.map((intg) => (
            <div key={intg.name} className="flex items-center justify-between py-3 border-b border-[#12121a] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: intg.color }} />
                <div>
                  <p className="font-mono text-sm text-[#e8e8f0]">{intg.name}</p>
                  <p className="font-mono text-xs text-[#444]">{intg.description}</p>
                </div>
              </div>
              <span className={`font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded ${intg.env ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#444] bg-[#12121a]'}`}>
                {intg.env ? 'Configured' : 'Not set'}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
