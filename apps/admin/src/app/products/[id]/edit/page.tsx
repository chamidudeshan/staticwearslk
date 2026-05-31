'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { ImageUploader, type UploadedImage } from '@/components/products/image-uploader';

interface Variant {
  id?: string;
  size: string;
  color: string;
  stock_qty: number;
  price_adj: number;
  sku: string;
  image: UploadedImage | null;
  _deleted?: boolean;
}

interface Option { id: string; name: string }

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Khaki', 'Olive', 'Red', 'Blue'];
const STATUSES = ['active', 'draft', 'inactive'] as const;

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
  const [brandId, setBrandId] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  useEffect(() => {
    async function load() {
      const [productRes, brandsRes, catsRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch('/api/admin/brands'),
        fetch('/api/admin/categories'),
      ]);
      if (!productRes.ok) { toast.error('Product not found'); router.push('/products'); return; }

      const product = await productRes.json();
      const brandsData = await brandsRes.json();
      const catsData = await catsRes.json();

      setName(product.name);
      setDescription(product.description ?? '');
      setBasePrice(String(product.base_price));
      setStatus(product.status);
      setBrandId(product.brand_id ?? '');
      if (Array.isArray(brandsData)) setBrands(brandsData);
      if (Array.isArray(catsData)) setCategories(catsData);

      if (Array.isArray(product.product_categories)) {
        setCategoryIds(product.product_categories.map((pc: { category_id: string }) => pc.category_id));
      }

      if (Array.isArray(product.images)) {
        setProductImages(
          product.images.map((img: { id: string; image_path: string; is_main: boolean }) => ({
            key: img.id,
            dbId: img.id,
            url: img.image_path,
            is_main: img.is_main,
          }))
        );
      }

      if (Array.isArray(product.variants)) {
        setVariants(
          product.variants.map((v: { id: string; size: string; color: string; stock_qty: number; price_adj: number; sku: string | null; image_url: string | null }) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock_qty: v.stock_qty,
            price_adj: v.price_adj,
            sku: v.sku ?? '',
            image: v.image_url
              ? { key: `existing-${v.id}`, url: v.image_url, is_main: true }
              : null,
          }))
        );
      }

      setLoading(false);
    }
    load();
  }, [id, router]);

  function toggleCategory(catId: string) {
    setCategoryIds((prev) => prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]);
  }

  function handleProductImagesChange(imgs: UploadedImage[]) {
    const removed = productImages.filter(
      (old) => old.dbId && !imgs.find((img) => img.key === old.key)
    );
    if (removed.length > 0) {
      setDeletedImageIds((prev) => [...prev, ...removed.map((r) => r.dbId!)]);
    }
    setProductImages(imgs);
  }

  function addVariant() {
    setVariants((v) => [...v, { size: 'M', color: 'Black', stock_qty: 10, price_adj: 0, sku: '', image: null }]);
  }

  function removeVariant(i: number) {
    setVariants((v) =>
      v.map((item, idx) =>
        idx === i ? (item.id ? { ...item, _deleted: true } : null) : item
      ).filter(Boolean) as Variant[]
    );
  }

  function updateVariant(i: number, field: keyof Variant, value: unknown) {
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !basePrice) return;
    setSaving(true);
    try {
      const newImages = productImages.filter((img) => !img.dbId);
      const mainImage = productImages.find((img) => img.is_main && img.dbId);

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          base_price: parseFloat(basePrice),
          brand_id: brandId || null,
          category_ids: categoryIds,
          status,
          images_to_add: newImages.map((img, i) => ({
            url: img.url,
            is_main: img.is_main,
            sort_order: productImages.findIndex((p) => p.key === img.key) + i,
          })),
          images_to_delete: deletedImageIds,
          main_image_id: mainImage?.dbId ?? null,
          variants: variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock_qty: Number(v.stock_qty),
            price_adj: Number(v.price_adj),
            sku: v.sku || null,
            image_url: v.image?.url ?? null,
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* Basic Info */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Basic Info</h2>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Product Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
              >
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">Categories</label>
            {categories.length === 0 ? (
              <p className="font-mono text-xs text-[#333]">No categories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                      categoryIds.includes(cat.id)
                        ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-[#ff6b35]'
                        : 'bg-[#12121a] border-[#1e1e28] text-[#555] hover:border-[#ff6b35]/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6">
          <ImageUploader
            images={productImages}
            onChange={handleProductImagesChange}
            label="Product Photos"
            maxImages={8}
          />
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
              <Plus size={13} /> Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, i) => variant._deleted ? null : (
              <div key={i} className="bg-[#12121a] border border-[#1e1e28] p-4 space-y-3">
                <div className="grid grid-cols-[1fr_1fr_80px_80px_1fr_32px] gap-2 items-end">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Size</label>
                    <select
                      value={variant.size}
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    >
                      {SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Color</label>
                    <select
                      value={variant.color}
                      onChange={(e) => updateVariant(i, 'color', e.target.value)}
                      className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    >
                      {COLORS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Stock</label>
                    <input
                      type="number"
                      value={variant.stock_qty}
                      onChange={(e) => updateVariant(i, 'stock_qty', e.target.value)}
                      min="0"
                      className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">±Price</label>
                    <input
                      type="number"
                      value={variant.price_adj}
                      onChange={(e) => updateVariant(i, 'price_adj', e.target.value)}
                      step="0.01"
                      className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      placeholder="SW-BLK-M"
                      className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] placeholder:text-[#222] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="mb-0.5 flex items-center justify-center text-[#333] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <ImageUploader
                  images={variant.image ? [variant.image] : []}
                  onChange={(imgs) => updateVariant(i, 'image', imgs[0] ?? null)}
                  label={`Photo for ${variant.color} / ${variant.size}`}
                  single
                />
              </div>
            ))}
          </div>
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
          <Link href="/products" className="font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors px-4 py-3">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
