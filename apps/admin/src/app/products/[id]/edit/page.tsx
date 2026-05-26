'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';

interface Variant {
  id?: string;
  size: string;
  color: string;
  stock_qty: number;
  price_adj: number;
  _deleted?: boolean;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Khaki', 'Olive', 'Red', 'Blue'];
const STATUSES = ['active', 'inactive', 'draft'] as const;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('active');
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) { toast.error('Product not found'); router.push('/products'); return; }
      const product = await res.json();
      setName(product.name);
      setDescription(product.description ?? '');
      setBasePrice(String(product.base_price));
      setStatus(product.status);
      setVariants(product.variants ?? []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  function addVariant() {
    setVariants((v) => [...v, { size: 'M', color: 'Black', stock_qty: 10, price_adj: 0 }]);
  }

  function removeVariant(i: number) {
    setVariants((v) =>
      v.map((item, idx) =>
        idx === i ? (item.id ? { ...item, _deleted: true } : null) : item
      ).filter(Boolean) as Variant[]
    );
  }

  function updateVariant(i: number, field: keyof Variant, value: string | number) {
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !basePrice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          base_price: parseFloat(basePrice),
          status,
          variants: variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock_qty: Number(v.stock_qty),
            price_adj: Number(v.price_adj),
            _deleted: v._deleted,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to update');
      } else {
        toast.success('Product updated');
        router.push('/products');
        router.refresh();
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="font-mono text-xs text-[#444]">Loading product...</p>
      </div>
    );
  }

  const visibleVariants = variants.filter((v) => !v._deleted);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-[#444] hover:text-[#ff6b35] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Header title="Edit Product" subtitle={name} />
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-6 max-w-2xl"
      >
        {/* Basic Info */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Basic Info</h2>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Product Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Base Price (LKR) *</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                min="0"
                step="0.01"
                required
                className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">
              Variants ({visibleVariants.length})
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 font-mono text-xs text-[#ff6b35] hover:text-[#e8ff59] transition-colors"
            >
              <Plus size={13} />Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((variant, i) => variant._deleted ? null : (
              <div key={i} className="grid grid-cols-[1fr_1fr_90px_90px_36px] gap-2 items-center">
                <select
                  value={variant.size}
                  onChange={(e) => updateVariant(i, 'size', e.target.value)}
                  className="bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                >
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select
                  value={variant.color}
                  onChange={(e) => updateVariant(i, 'color', e.target.value)}
                  className="bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                >
                  {COLORS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  value={variant.stock_qty}
                  onChange={(e) => updateVariant(i, 'stock_qty', e.target.value)}
                  placeholder="Qty"
                  min="0"
                  className="bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
                <input
                  type="number"
                  value={variant.price_adj}
                  onChange={(e) => updateVariant(i, 'price_adj', e.target.value)}
                  placeholder="±Price"
                  step="0.01"
                  className="bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="flex items-center justify-center text-[#333] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-[#333]">Size · Color · Stock Qty · Price Adjustment (LKR)</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest px-8 py-3 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/products"
            className="font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors px-4 py-3"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
