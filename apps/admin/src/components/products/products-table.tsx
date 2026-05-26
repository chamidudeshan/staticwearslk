'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import type { Product } from '@static-wears/shared';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CLASSES = {
  active: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  inactive: 'text-red-400 bg-red-400/10 border border-red-400/20',
  draft: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
};

export function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Archive "${name}"?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`${name} archived`);
      } else {
        toast.error('Failed to archive product');
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0e0e12] border border-[#1e1e28] pl-9 pr-4 py-2.5 font-mono text-xs text-[#e8e8f0] placeholder:text-[#444] focus:outline-none focus:border-[#ff6b35] transition-colors w-64"
          />
        </div>
        <a
          href="/products/new"
          className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#e8ff59] transition-colors"
        >
          <Plus size={14} />
          Add Product
        </a>
      </div>

      {/* Table */}
      <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e28]">
                {['Product', 'Price', 'Variants', 'Status', 'Actions'].map((h) => (
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
                  <td colSpan={5} className="px-5 py-12 text-center font-mono text-xs text-[#444]">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#12121a] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-mono text-sm font-bold text-[#e8e8f0]">{product.name}</p>
                        <p className="font-mono text-[10px] text-[#555] mt-0.5">/{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-[#ff6b35] font-bold">
                        {formatPrice(product.base_price)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-[#888]">
                        {product.variants?.length ?? 0} variants
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          STATUS_CLASSES[product.status]
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors"
                        >
                          <Eye size={14} />
                        </a>
                        <a
                          href={`/products/${product.id}/edit`}
                          className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors"
                        >
                          <Edit size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
