'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, ChevronLeft, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
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
  green: '#3a7a3a', brown: '#7a5533', beige: '#d4bc8a', cream: '#f5f0e0',
};

function imgSrc(path: string, idx = 0) {
  if (!path || path.startsWith('demo/')) return DEMO_IMAGES[idx % DEMO_IMAGES.length];
  return getSupabaseImageUrl(path);
}

interface Props { product: Product; related: Product[] }

export function ProductDetailClient({ product, related }: Props) {
  const { dispatch, openCart } = useCart();
  const hasVariants = (product.variants?.length ?? 0) > 0;

  const allVariants = (product.variants ?? []).map((v) => ({
    ...v,
    color: v.color ?? '',
    size:  v.size  ?? '',
  }));

  const uniqueColors = Array.from(new Set(allVariants.map((v) => v.color))).filter(Boolean);
  const hasColors    = uniqueColors.length > 0;

  const [selectedColor,   setSelectedColor]   = useState<string>(uniqueColors[0] ?? '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(allVariants[0] ?? null);
  const [activeIdx, setActiveIdx]             = useState(0);
  const [qty, setQty]                         = useState(1);

  const colorImageMap: Record<string, string[]> = {};
  for (const v of allVariants) {
    if (v.color && v.image_url) {
      if (!colorImageMap[v.color]) colorImageMap[v.color] = [];
      if (!colorImageMap[v.color].includes(v.image_url)) colorImageMap[v.color].push(v.image_url);
    }
  }
  const productImgPaths = (product.images ?? []).map((img) => img.image_path);
  const colorPaths      = selectedColor ? (colorImageMap[selectedColor] ?? []) : [];
  const colorPathSet    = new Set(colorPaths);
  const galleryPaths: string[] = [
    ...colorPaths,
    ...productImgPaths.filter((p) => !colorPathSet.has(p)),
  ];
  if (galleryPaths.length === 0) DEMO_IMAGES.forEach((_, i) => galleryPaths.push(`demo/${i}`));

  const sizesForColor = hasColors ? allVariants.filter((v) => v.color === selectedColor) : allVariants;
  const selectedSize  = selectedVariant?.size ?? null;

  function pickColor(color: string) {
    setSelectedColor(color);
    setActiveIdx(0);
    const v = allVariants.find((x) => x.color === color && x.size === selectedSize)
           ?? allVariants.find((x) => x.color === color);
    setSelectedVariant(v ?? null);
    setQty(1);
  }

  function pickSize(v: ProductVariant) {
    setSelectedVariant(v);
    setQty(1);
  }

  const lowestPrice  = hasVariants
    ? Math.min(...(product.variants?.map((v) => v.price_adj) ?? [product.base_price]))
    : product.base_price;
  const displayPrice = selectedVariant
    ? (hasVariants ? selectedVariant.price_adj : product.base_price)
    : lowestPrice;

  const isOutOfStock  = selectedVariant ? selectedVariant.stock_qty === 0 : false;
  const maxQty        = selectedVariant?.stock_qty ?? 0;
  const cartImagePath = colorPaths[0] ?? productImgPaths[0] ?? 'demo/0';

  const activeImgSrc = imgSrc(galleryPaths[activeIdx] ?? 'demo/0', activeIdx);

  function handleAddToCart() {
    if (hasVariants && !selectedVariant) return;
    if (isOutOfStock) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product_id:   product.id,
        variant_id:   selectedVariant?.id ?? '',
        product_name: product.name,
        variant_desc: selectedVariant
          ? `${selectedVariant.size}${selectedVariant.color ? ` / ${selectedVariant.color}` : ''}`
          : '',
        image_path:   cartImagePath,
        unit_price:   displayPrice,
        quantity:     qty,
      },
    });
    openCart();
  }

  return (
    <div className="min-h-screen bg-[#060608]">

      {/* ── Breadcrumb ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pt-24 pb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#444] hover:text-[#ff6b35] transition-colors"
        >
          <ChevronLeft size={12} strokeWidth={2} />
          Shop
        </Link>
      </div>

      {/* ── Main grid: left thumbnails + main image | right info ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 xl:gap-16 items-start">

          {/* ═══ LEFT: thumbnail strip + main image ═══ */}
          <div className="lg:sticky lg:top-24 flex gap-3">

            {/* Vertical thumbnail strip */}
            {galleryPaths.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {galleryPaths.map((path, i) => (
                  <button
                    key={`${path}-${i}`}
                    onClick={() => setActiveIdx(i)}
                    className={`relative w-[72px] h-[72px] shrink-0 overflow-hidden border transition-all duration-150 ${
                      activeIdx === i
                        ? 'border-[#ff6b35]'
                        : 'border-[#1e1e28] hover:border-[#555]'
                    }`}
                  >
                    {/* blurred bg fill */}
                    <div
                      className="absolute inset-0 scale-110 blur-sm"
                      style={{
                        backgroundImage: `url(${imgSrc(path, i)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.35,
                      }}
                    />
                    <Image
                      src={imgSrc(path, i)}
                      alt=""
                      fill
                      className="object-contain relative z-10"
                      sizes="72px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-square overflow-hidden bg-[#111]">
              {/* Blurred background of same image for smart fill */}
              <div
                key={`bg-${selectedColor}-${activeIdx}`}
                className="absolute inset-0 scale-110 blur-xl"
                style={{
                  backgroundImage: `url(${activeImgSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.25,
                }}
              />
              <Image
                key={`${selectedColor}-${activeIdx}`}
                src={activeImgSrc}
                alt={product.name}
                fill
                priority
                className="object-contain relative z-10"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              {/* Low stock badge */}
              {selectedVariant && selectedVariant.stock_qty > 0 && selectedVariant.stock_qty <= 5 && (
                <div className="absolute top-3 left-3 z-20 bg-[#ff6b35] text-black font-mono font-bold text-[9px] uppercase tracking-[0.2em] px-2 py-1">
                  {selectedVariant.stock_qty} LEFT
                </div>
              )}
              {isOutOfStock && selectedVariant && (
                <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-[#666] uppercase border border-[#2a2a2a] px-5 py-2.5">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: info panel ═══ */}
          <div className="space-y-5">

            {/* Brand */}
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#ff6b35]">
              {product.brand?.name ?? 'Static Wears'}
            </p>

            {/* Name */}
            <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-white leading-[1] tracking-tight">
              {product.name.toUpperCase()}
            </h1>

            {/* Variant short desc */}
            {selectedVariant?.description && (
              <p className="font-mono text-[11px] text-[#555] leading-relaxed">
                {selectedVariant.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-[#ff6b35] tracking-tight">
                {formatPrice(displayPrice)}
              </span>
              {hasVariants && !selectedVariant && (
                <span className="font-mono text-xs text-[#444] uppercase tracking-widest">from</span>
              )}
            </div>

            <div className="h-px bg-[#1a1a22]" />

            {/* ── Colour selector ── */}
            {hasColors && (
              <div className="space-y-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#555]">
                  Colour — <span className="text-[#ccc]">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((color) => {
                    const hex    = COLOR_HEX[color.toLowerCase()];
                    const imgUrl = colorImageMap[color]?.[0];
                    const active = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => pickColor(color)}
                        title={color}
                        className={`relative w-10 h-10 overflow-hidden border-2 transition-all ${
                          active ? 'border-[#ff6b35]' : 'border-[#1e1e28] hover:border-[#555]'
                        }`}
                      >
                        {imgUrl ? (
                          <>
                            <div
                              className="absolute inset-0 scale-110 blur-sm"
                              style={{
                                backgroundImage: `url(${imgSrc(imgUrl)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.4,
                              }}
                            />
                            <Image
                              src={imgSrc(imgUrl)}
                              alt={color}
                              fill
                              className="object-contain relative z-10"
                              sizes="40px"
                            />
                          </>
                        ) : (
                          <span className="absolute inset-0" style={{ backgroundColor: hex ?? '#333' }} />
                        )}
                        {active && <span className="absolute inset-0 ring-1 ring-inset ring-[#ff6b35] z-20" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Size selector ── */}
            {sizesForColor.length > 0 && (
              <div className="space-y-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#555]">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {sizesForColor.map((v) => {
                    const inStock  = v.stock_qty > 0;
                    const selected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => inStock && pickSize(v)}
                        disabled={!inStock}
                        className={`relative min-w-[3rem] px-3 py-2.5 font-mono text-xs uppercase tracking-wider border transition-all ${
                          selected
                            ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white'
                            : inStock
                            ? 'border-[#1e1e28] text-[#777] hover:border-[#555] hover:text-[#ccc]'
                            : 'border-[#111] text-[#2a2a2a] line-through cursor-not-allowed'
                        }`}
                      >
                        {v.size}
                        {!inStock && <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-[#333] rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No-variant availability */}
            {!hasVariants && (
              <p className="font-mono text-[11px] text-[#555] uppercase tracking-widest">
                {(product.variants?.[0]?.stock_qty ?? 0) > 0 ? 'In stock' : 'Out of stock'}
              </p>
            )}

            {/* ── Quantity ── */}
            {selectedVariant && !isOutOfStock && (
              <div className="flex items-center border border-[#1e1e28] w-fit">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#555] hover:text-[#ff6b35] transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-mono text-sm text-[#e8e8f0] border-x border-[#1e1e28]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#555] hover:text-[#ff6b35] transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}

            {/* ── Add to cart ── */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || (hasVariants && !selectedVariant)}
              className="w-full bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-[0.25em]
                         py-4 flex items-center justify-center gap-2.5
                         hover:bg-[#e8ff59] active:scale-[0.99]
                         transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} />
              {isOutOfStock
                ? 'Out of Stock'
                : hasVariants && !selectedVariant
                ? 'Select a Size'
                : `Add to Cart${qty > 1 ? ` — ${formatPrice(displayPrice * qty)}` : ''}`}
            </button>

            {/* Description */}
            {product.description && (
              <div className="pt-2 space-y-2 border-t border-[#1a1a22]">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#444]">Details</p>
                <p className="font-mono text-[12px] text-[#555] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* SKU */}
            {selectedVariant?.sku && (
              <p className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest pt-1">
                SKU: {selectedVariant.sku}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="border-t border-[#111] py-20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff6b35] mb-3">You might also like</p>
            <h2 className="font-display text-4xl text-white mb-10 leading-none">MORE DROPS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
