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
  price: number | string;
  stock_qty: number | string;
  sku: string;
  description: string;
  _deleted?: boolean;
}

interface Option { id: string; name: string }

const STATUSES = ['active', 'draft', 'inactive'] as const;
const SUGGEST_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const SUGGEST_COLORS = ['Black', 'White', 'Navy', 'Grey', 'Khaki', 'Olive', 'Red', 'Blue', 'Green', 'Brown', 'Beige', 'Cream'];

function emptyVariant(): Variant {
  return { size: '', color: '', price: '', stock_qty: 10, sku: '', description: '' };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [name, setName]         = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [status, setStatus]     = useState<typeof STATUSES[number]>('active');
  const [brandId, setBrandId]   = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, UploadedImage[]>>({});
  const [brands, setBrands]     = useState<Option[]>([]);
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
        setProductImages(product.images.map((img: { id: string; image_path: string; is_main: boolean }) => ({
          key: img.id, dbId: img.id, url: img.image_path, is_main: img.is_main,
        })));
      }
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        setHasVariants(true);
        setVariants(product.variants.map((v: { id: string; size: string; color: string; price_adj: number; stock_qty: number; sku: string | null; description: string | null; image_url: string | null }) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          price: v.price_adj,
          stock_qty: v.stock_qty,
          sku: v.sku ?? '',
          description: v.description ?? '',
        })));
        // Build colorImages from existing variant image_urls (deduplicated per color)
        const imgMap: Record<string, UploadedImage[]> = {};
        for (const v of product.variants as { id: string; color: string; image_url: string | null }[]) {
          if (!v.image_url || !v.color) continue;
          if (!imgMap[v.color]) imgMap[v.color] = [];
          if (!imgMap[v.color].some((img) => img.url === v.image_url)) {
            imgMap[v.color].push({ key: `existing-${v.id}`, url: v.image_url, is_main: imgMap[v.color].length === 0 });
          }
        }
        setColorImages(imgMap);
      } else {
        setVariants([emptyVariant()]);
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  function toggleCategory(catId: string) {
    setCategoryIds((p) => p.includes(catId) ? p.filter((c) => c !== catId) : [...p, catId]);
  }

  function handleProductImagesChange(imgs: UploadedImage[]) {
    const removed = productImages.filter((old) => old.dbId && !imgs.find((img) => img.key === old.key));
    if (removed.length > 0) setDeletedImageIds((p) => [...p, ...removed.map((r) => r.dbId!)]);
    setProductImages(imgs);
  }

  function addVariant() { setVariants((v) => [...v, emptyVariant()]); }
  function removeVariant(i: number) {
    setVariants((v) =>
      v.map((item, idx) => idx === i ? (item.id ? { ...item, _deleted: true } : null) : item).filter(Boolean) as Variant[]
    );
  }
  function updateVariant(i: number, field: keyof Variant, value: unknown) {
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (hasVariants && variants.filter((v) => !v._deleted).some((v) => !v.size || !v.price)) {
      toast.error('Each variant needs a size and price'); return;
    }
    setSaving(true);
    try {
      const activeVariants = variants.filter((v) => !v._deleted);
      const newImages = productImages.filter((img) => !img.dbId);
      const mainImage = productImages.find((img) => img.is_main && img.dbId);

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          base_price: hasVariants
            ? Math.min(...activeVariants.map((v) => Number(v.price) || 0))
            : parseFloat(basePrice),
          brand_id: brandId || null,
          category_ids: categoryIds,
          status,
          images_to_add: newImages.map((img, i) => ({ url: img.url, is_main: img.is_main, sort_order: i })),
          images_to_delete: deletedImageIds,
          main_image_id: mainImage?.dbId ?? null,
          variants: variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            price_adj: Number(v.price),
            stock_qty: Number(v.stock_qty),
            sku: v.sku || null,
            description: v.description || null,
            image_url: colorImages[v.color]?.[0]?.url ?? null,
            _deleted: v._deleted,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed to update'); }
      else { toast.success('Product updated'); router.push('/products'); router.refresh(); }
    } catch { toast.error('Network error'); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-64"><p className="font-mono text-xs text-[#444]">Loading...</p></div>;
  }

  const inputClass = 'w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors';
  const labelClass = 'font-mono text-xs uppercase tracking-widest text-[#555]';
  const visibleVariants = variants.filter((v) => !v._deleted);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-[#444] hover:text-[#ff6b35] transition-colors"><ArrowLeft size={18} /></Link>
        <Header title="Edit Product" subtitle={name} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* Basic Info */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Basic Info</h2>
          <div className="space-y-1.5">
            <label className={labelClass}>Product Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Brand</label>
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
                <option value="">— None —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Base Price{hasVariants ? ' (auto)' : ' *'}</label>
              <input type="number" value={hasVariants ? Math.min(...visibleVariants.map((v) => Number(v.price) || 0)) || '' : basePrice}
                onChange={(e) => !hasVariants && setBasePrice(e.target.value)}
                readOnly={hasVariants} min="0" step="0.01" required={!hasVariants}
                className={`${inputClass} ${hasVariants ? 'opacity-40 cursor-not-allowed' : ''}`} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Categories</label>
            {categories.length === 0 ? <p className="font-mono text-xs text-[#333]">No categories yet.</p> : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                    className={`font-mono text-xs px-3 py-1.5 border transition-colors ${categoryIds.includes(cat.id) ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-[#ff6b35]' : 'bg-[#12121a] border-[#1e1e28] text-[#555] hover:border-[#ff6b35]/50'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6">
          <ImageUploader images={productImages} onChange={handleProductImagesChange} label="Product Photos" maxImages={8} />
        </div>

        {/* Variants */}
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Variants</h2>
              <p className="font-mono text-[10px] text-[#333] mt-1">
                {hasVariants ? `${visibleVariants.length} variant${visibleVariants.length !== 1 ? 's' : ''} — each has its own price.` : 'No variants — base price applies.'}
              </p>
            </div>
            <button type="button" onClick={() => setHasVariants((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${hasVariants ? 'bg-[#ff6b35]' : 'bg-[#1e1e28]'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hasVariants ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {hasVariants && (
            <div className="space-y-4">
              <datalist id="suggest-sizes-edit">{SUGGEST_SIZES.map((s) => <option key={s} value={s} />)}</datalist>
              <datalist id="suggest-colors-edit">{SUGGEST_COLORS.map((c) => <option key={c} value={c} />)}</datalist>

              {variants.map((variant, i) => variant._deleted ? null : (
                <div key={i} className="bg-[#12121a] border border-[#1e1e28] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Variant {i + 1}</span>
                    <button type="button" onClick={() => removeVariant(i)}
                      className="text-[#333] hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Size / Type *</label>
                      <input list="suggest-sizes-edit" value={variant.size} onChange={(e) => updateVariant(i, 'size', e.target.value)}
                        placeholder="M, XL, 32..." required
                        className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] placeholder:text-[#222] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Color / Style</label>
                      <input list="suggest-colors-edit" value={variant.color} onChange={(e) => updateVariant(i, 'color', e.target.value)}
                        placeholder="Black, Washed..."
                        className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] placeholder:text-[#222] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Price (LKR) *</label>
                      <input type="number" value={variant.price} onChange={(e) => updateVariant(i, 'price', e.target.value)}
                        placeholder="2500" min="0" step="0.01" required
                        className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Stock Qty</label>
                      <input type="number" value={variant.stock_qty} onChange={(e) => updateVariant(i, 'stock_qty', e.target.value)}
                        min="0"
                        className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">SKU</label>
                      <input value={variant.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                        placeholder="SW-BLK-M"
                        className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] placeholder:text-[#222] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Short Description (optional)</label>
                    <input value={variant.description} onChange={(e) => updateVariant(i, 'description', e.target.value)}
                      placeholder="e.g. Limited colourway, stonewash finish..."
                      className="w-full bg-[#0e0e12] border border-[#1e1e28] px-3 py-2 font-mono text-xs text-[#e8e8f0] placeholder:text-[#222] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                  </div>
                </div>
              ))}

              <button type="button" onClick={addVariant}
                className="flex items-center gap-2 font-mono text-xs text-[#ff6b35] hover:text-[#e8ff59] transition-colors">
                <Plus size={13} /> Add Another Variant
              </button>

              {/* Color Photos — one uploader per unique color */}
              {(() => {
                const uniqueColors = Array.from(new Set(visibleVariants.map((v) => v.color).filter(Boolean)));
                if (uniqueColors.length === 0) return null;
                return (
                  <div className="border-t border-[#1e1e28] pt-4 space-y-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
                      Color Photos — shared across all sizes of the same colour
                    </p>
                    {uniqueColors.map((color) => (
                      <div key={color} className="bg-[#0e0e12] border border-[#1e1e28] rounded-lg p-3">
                        <ImageUploader
                          images={colorImages[color] ?? []}
                          onChange={(imgs) => setColorImages((prev) => ({ ...prev, [color]: imgs }))}
                          label={`${color} Photos`}
                          maxImages={6}
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest px-8 py-3 hover:bg-[#e8ff59] transition-colors disabled:opacity-50">
            <Save size={14} />{saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/products" className="font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors px-4 py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
