'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, Plus, Search, AlertTriangle } from 'lucide-react';
import type { Product } from '@static-wears/shared';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CLASSES = {
  active:   'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  inactive: 'text-red-400    bg-red-400/10    border border-red-400/20',
  draft:    'text-amber-400  bg-amber-400/10  border border-amber-400/20',
};

export function ProductsTable({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [search, setSearch]     = useState('');
  const [confirm, setConfirm]   = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${confirm.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== confirm.id));
        toast.success(`"${confirm.name}" deleted`);
        setConfirm(null);
      } else {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to delete');
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Delete confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-red-500/30 rounded-xl p-6 w-full max-w-sm space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 rounded-lg">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-[#e8e8f0] mb-1">Delete Product?</h3>
                <p className="font-mono text-xs text-[#666] leading-relaxed">
                  <span className="text-[#e8e8f0]">&ldquo;{confirm.name}&rdquo;</span> will be permanently deleted including all variants and images. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-widest py-2.5 hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
              <button onClick={() => setConfirm(null)}
                className="px-4 font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors border border-[#1e1e28]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0e0e12] border border-[#1e1e28] pl-9 pr-4 py-2.5 font-mono text-xs text-[#e8e8f0] placeholder:text-[#444] focus:outline-none focus:border-[#ff6b35] transition-colors w-64" />
        </div>
        <a href="/products/new"
          className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#e8ff59] transition-colors">
          <Plus size={14} /> Add Product
        </a>
      </div>

      {/* Table */}
      <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e28]">
                {['', 'Product', 'Price', 'Stock', 'Variants', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12121a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center font-mono text-xs text-[#444]">No products found</td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const mainImg = product.images?.find((i) => i.is_main) ?? product.images?.[0];
                  const totalStock = product.variants?.reduce((s, v) => s + v.stock_qty, 0) ?? 0;
                  const hasVariants = (product.variants?.length ?? 0) > 0;
                  const displayPrice = hasVariants
                    ? Math.min(...product.variants!.map((v) => v.price_adj))
                    : product.base_price;

                  return (
                    <tr key={product.id} className="hover:bg-[#12121a] transition-colors">
                      <td className="pl-4 py-3 w-14">
                        <div className="w-10 h-10 bg-[#12121a] border border-[#1e1e28] overflow-hidden shrink-0">
                          {mainImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mainImg.image_path} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333] font-display text-lg">
                              {product.name[0]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-bold text-[#e8e8f0]">{product.name}</p>
                        <p className="font-mono text-[10px] text-[#444] mt-0.5 truncate max-w-[180px]">/{product.slug}</p>
                        {product.brand && (
                          <p className="font-mono text-[10px] text-[#ff6b35]/60 mt-0.5">{product.brand.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-[#ff6b35] font-bold">
                          {hasVariants ? <span className="text-[#555] text-[10px] font-normal">from </span> : null}
                          {formatPrice(displayPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs font-bold ${totalStock === 0 ? 'text-red-400' : totalStock <= 5 ? 'text-amber-400' : 'text-[#888]'}`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[#555]">{product.variants?.length ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_CLASSES[product.status]}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`}
                            target="_blank" rel="noopener noreferrer" title="View on site"
                            className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors">
                            <Eye size={14} />
                          </a>
                          <a href={`/products/${product.id}/edit`} title="Edit"
                            className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors">
                            <Edit size={14} />
                          </a>
                          <button onClick={() => setConfirm({ id: product.id, name: product.name })} title="Delete"
                            className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
