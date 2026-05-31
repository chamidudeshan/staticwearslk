'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, ChevronLeft, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@static-wears/shared';
import { useCart } from '@/context/cart-context';
import { formatPrice, getSupabaseImageUrl } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
];

const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a', white: '#f0f0f0', navy: '#1a2040',
  khaki: '#c9b99a', grey: '#888', gray: '#888',
  olive: '#6b7c4a', red: '#cc3333', blue: '#2255aa',
};

function imgSrc(path: string, idx = 0) {
  if (!path || path.startsWith('demo/')) return DEMO_IMAGES[idx % DEMO_IMAGES.length];
  return getSupabaseImageUrl(path);
}

function variantPrice(v: ProductVariant, hasVariants: boolean, base: number) {
  return hasVariants ? v.price_adj : base;
}

interface Props { product: Product; related: Product[] }

export function ProductDetailClient({ product, related }: Props) {
  const { dispatch } = useCart();
  const hasVariants = (product.variants?.length ?? 0) > 0;

  // Normalise: DB can return null for color/size even though typed as string
  const allVariants = (product.variants ?? []).map((v) => ({
    ...v,
    color: v.color ?? '',
    size:  v.size  ?? '',
  }));

  // Only show color selector when at least one variant has a non-empty color
  const uniqueColors = Array.from(new Set(allVariants.map((v) => v.color))).filter(Boolean);
  const hasColors = uniqueColors.length > 0;

  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0] ?? '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    allVariants[0] ?? null
  );
  const [qty, setQty] = useState(1);

  const productImages = product.images?.length
    ? product.images
    : [{ id: 'demo', image_path: 'demo/1', is_main: true, sort_order: 0, product_id: product.id, created_at: '' }];

  // Build full gallery: all unique variant images first, then product images
  type GalleryItem = { id: string; image_path: string; is_main: boolean; sort_order: number; product_id: string; created_at: string; variantId?: string };
  const seenUrls = new Set<string>();
  const variantGallery: GalleryItem[] = (product.variants ?? [])
    .filter((v) => v.image_url)
    .reduce<GalleryItem[]>((acc, v) => {
      if (!seenUrls.has(v.image_url!)) {
        seenUrls.add(v.image_url!);
        acc.push({ id: `vimg-${v.id}`, image_path: v.image_url!, is_main: false, sort_order: -1, product_id: product.id, created_at: '', variantId: v.id });
      }
      return acc;
    }, []);

  const galleryImages: GalleryItem[] = [...variantGallery, ...productImages.filter((img) => !seenUrls.has(img.image_path))];
  if (galleryImages.length === 0) galleryImages.push({ id: 'demo', image_path: 'demo/1', is_main: true, sort_order: 0, product_id: product.id, created_at: '' });

  const [activeIdx, setActiveIdx] = useState(0);

  // When no colors used → show every variant as a size option
  // When colors used → filter by selected colour
  const sizesForColor = hasColors
    ? allVariants.filter((v) => v.color === selectedColor)
    : allVariants;
  const selectedSize = selectedVariant?.size ?? null;

  // Price
  const lowestPrice = hasVariants
    ? Math.min(...(product.variants?.map((v) => v.price_adj) ?? [product.base_price]))
    : product.base_price;
  const displayPrice = selectedVariant
    ? variantPrice(selectedVariant, hasVariants, product.base_price)
    : lowestPrice;
  const showFrom = hasVariants && !selectedVariant;

  const isOutOfStock = selectedVariant ? selectedVariant.stock_qty === 0 : false;
  const maxQty = selectedVariant?.stock_qty ?? 0;

  function jumpToVariantImg(variantId: string) {
    const idx = galleryImages.findIndex((img) => img.variantId === variantId);
    if (idx !== -1) setActiveIdx(idx);
    else setActiveIdx(0);
  }

  function pickColor(color: string) {
    setSelectedColor(color);
    const v = allVariants.find((x) => x.color === color && x.size === selectedSize)
      ?? allVariants.find((x) => x.color === color);
    setSelectedVariant(v ?? null);
    if (v) jumpToVariantImg(v.id);
    else setActiveIdx(0);
    setQty(1);
  }

  function pickSize(v: ProductVariant) {
    setSelectedVariant(v);
    jumpToVariantImg(v.id);
    setQty(1);
  }

  function handleAddToCart() {
    if (!selectedVariant) { toast.error('Please select a size'); return; }
    if (isOutOfStock) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product_id: product.id,
        variant_id: selectedVariant.id,
        product_name: product.name,
        variant_desc: `${selectedVariant.size} / ${selectedVariant.color}`,
        image_path: galleryImages[0]?.image_path ?? '',
        unit_price: displayPrice,
        quantity: qty,
      },
    });
    toast.success(`${product.name} added to cart`, {
      description: `${selectedVariant.size} / ${selectedVariant.color} × ${qty}`,
    });
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="py-6">
          <Link href="/shop" className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors flex items-center gap-2">
            <ChevronLeft size={14} /> Back to shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 xl:gap-20">

          {/* ── IMAGE COLUMN ── */}
          <div className="flex gap-3">
            {/* Thumbnail strip */}
            {galleryImages.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {galleryImages.map((img, i) => {
                  const isVariantThumb = !!img.variantId;
                  const isActiveVariant = img.variantId && img.variantId === selectedVariant?.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => {
                        setActiveIdx(i);
                        if (img.variantId) {
                          const v = product.variants?.find((x) => x.id === img.variantId);
                          if (v) { setSelectedVariant(v); setSelectedColor(v.color); setQty(1); }
                        }
                      }}
                      className={`relative w-14 h-[72px] overflow-hidden border-2 shrink-0 transition-colors ${
                        activeIdx === i
                          ? 'border-[#ff6b35]'
                          : isVariantThumb && isActiveVariant
                          ? 'border-[#ff6b35]/50'
                          : 'border-[#2a2a2a] hover:border-[#555]'
                      }`}
                    >
                      <Image src={imgSrc(img.image_path, i)} alt="" fill className="object-cover" sizes="56px" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-[4/5] overflow-hidden bg-[#111]">
              <Image
                key={`${selectedVariant?.id ?? 'base'}-${activeIdx}`}
                src={imgSrc(galleryImages[activeIdx]?.image_path ?? '', activeIdx)}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              {selectedVariant && selectedVariant.stock_qty > 0 && selectedVariant.stock_qty <= 3 && (
                <div className="absolute top-4 left-4 bg-[#ff6b35] text-black font-mono font-bold text-[10px] uppercase tracking-widest px-2.5 py-1">
                  Only {selectedVariant.stock_qty} left
                </div>
              )}
              {isOutOfStock && selectedVariant && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-mono text-xs tracking-widest text-[#888] uppercase border border-[#333] px-4 py-2">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── INFO COLUMN ── */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest">
                {product.brand.name}
              </p>
            )}

            {/* Title */}
            <h1 className="font-display text-4xl xl:text-5xl text-white leading-tight">
              {product.name.toUpperCase()}
            </h1>

            {/* Variant short description */}
            {selectedVariant?.description && (
              <p className="font-mono text-xs text-[#666] border-l-2 border-[#ff6b35]/30 pl-3 -mt-2">
                {selectedVariant.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2">
              {showFrom && (
                <span className="font-mono text-sm text-[#555] uppercase tracking-widest">From</span>
              )}
              <span className="font-mono text-3xl font-bold text-[#ff6b35]">
                {formatPrice(displayPrice)}
              </span>
            </div>

            <div className="border-t border-[#1e1e1e]" />

            {/* Color selector — only when colours are actually set */}
            {hasColors && (
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-widest text-[#555]">
                  Colour: <span className="text-[#e8e8f0]">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((color) => {
                    const hex = COLOR_HEX[color.toLowerCase()];
                    return (
                      <button
                        key={color}
                        onClick={() => pickColor(color)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border font-mono text-xs uppercase tracking-wider transition-all ${
                          selectedColor === color
                            ? 'border-[#ff6b35] text-[#ff6b35] bg-[#ff6b35]/10'
                            : 'border-[#2a2a2a] text-[#888] hover:border-[#ff6b35] hover:text-[#ff6b35]'
                        }`}
                      >
                        {hex && (
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                        )}
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizesForColor.length > 0 && (
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-widest text-[#555]">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {sizesForColor.map((v) => {
                    const inStock = v.stock_qty > 0;
                    const selected = selectedVariant?.id === v.id;
                    const price = variantPrice(v, hasVariants, product.base_price);
                    return (
                      <button
                        key={v.id}
                        onClick={() => inStock && pickSize(v)}
                        disabled={!inStock}
                        className={`relative px-4 py-3 font-mono text-xs uppercase tracking-wider border transition-all ${
                          selected
                            ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]'
                            : inStock
                            ? 'border-[#2a2a2a] text-[#888] hover:border-[#ff6b35] hover:text-[#ff6b35]'
                            : 'border-[#1a1a1a] text-[#333] line-through cursor-not-allowed'
                        }`}
                      >
                        <span className="block">{v.size}</span>
                        {hasVariants && (
                          <span className="block text-[9px] mt-0.5 opacity-70">{formatPrice(price)}</span>
                        )}
                        {!inStock && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#333] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {!hasVariants && selectedVariant && (
                  <p className="font-mono text-[10px] text-[#444]">
                    {selectedVariant.stock_qty} in stock
                  </p>
                )}
              </div>
            )}

            {/* No variant product — stock */}
            {!hasVariants && (
              <p className="font-mono text-xs text-[#555]">
                {(product.variants?.[0]?.stock_qty ?? 0) > 0
                  ? `${product.variants?.[0]?.stock_qty} units available`
                  : 'Out of stock'}
              </p>
            )}

            {/* Quantity */}
            {selectedVariant && !isOutOfStock && (
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-widest text-[#555]">Quantity</p>
                <div className="flex items-center gap-0 border border-[#2a2a2a] w-fit">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#888] hover:text-[#ff6b35] hover:bg-[#ff6b35]/5 transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center font-mono text-sm text-[#e8e8f0]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#888] hover:text-[#ff6b35] hover:bg-[#ff6b35]/5 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || (hasVariants && !selectedVariant)}
              className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest
                         py-5 flex items-center justify-center gap-3
                         hover:bg-[#e8ff59] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              <ShoppingBag size={16} />
              {isOutOfStock
                ? 'Out of Stock'
                : hasVariants && !selectedVariant
                ? 'Select a Size'
                : 'Add to Cart'}
            </button>

            {/* Total if qty > 1 */}
            {qty > 1 && selectedVariant && (
              <p className="font-mono text-xs text-[#555] text-center">
                Total: {formatPrice(displayPrice * qty)}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-[#1e1e1e] pt-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-widest text-[#555]">Description</p>
                <p className="font-mono text-sm text-[#888] leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* SKU */}
            {selectedVariant?.sku && (
              <p className="font-mono text-[10px] text-[#333]">SKU: {selectedVariant.sku}</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-4xl text-white mb-8">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
