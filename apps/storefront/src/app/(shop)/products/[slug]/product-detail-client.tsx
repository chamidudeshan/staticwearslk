'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@static-wears/shared';
import { useCart } from '@/context/cart-context';
import { formatPrice, getSupabaseImageUrl } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';
import { Badge } from '@/components/ui/badge';

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
];

function getImageSrc(path: string, idx: number = 0): string {
  if (!path || path.startsWith('demo/')) return DEMO_IMAGES[idx % DEMO_IMAGES.length];
  return getSupabaseImageUrl(path);
}

interface Props {
  product: Product;
  related: Product[];
}

export function ProductDetailClient({ product, related }: Props) {
  const { dispatch } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants?.[0]?.color ?? null
  );

  const images = product.images?.length
    ? product.images
    : [{ id: 'demo', image_path: 'demo/1', is_main: true, sort_order: 0, product_id: product.id, created_at: '' }];

  const uniqueColors = Array.from(new Set(product.variants?.map((v) => v.color) ?? []));
  const uniqueSizes = Array.from(new Set(product.variants?.map((v) => v.size) ?? []));

  const variantForSelection = product.variants?.find(
    (v) => v.color === selectedColor && v.id === selectedVariant?.id
  );

  const finalPrice = selectedVariant
    ? product.base_price + selectedVariant.price_adj
    : product.base_price;

  const isOutOfStock = !selectedVariant || selectedVariant.stock_qty === 0;

  function handleAddToCart() {
    if (!selectedVariant) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product_id: product.id,
        variant_id: selectedVariant.id,
        product_name: product.name,
        variant_desc: `${selectedVariant.size} / ${selectedVariant.color}`,
        image_path: images[0]?.image_path ?? '',
        unit_price: finalPrice,
        quantity: 1,
      },
    });
    toast.success(`${product.name} added to cart!`);
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="py-6">
          <Link
            href="/shop"
            className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={14} />
            Back to shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
              <Image
                src={getImageSrc(images[activeImage]?.image_path, activeImage)}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {selectedVariant && selectedVariant.stock_qty <= 3 && selectedVariant.stock_qty > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge>Only {selectedVariant.stock_qty} left</Badge>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-20 overflow-hidden border-2 transition-colors ${
                      activeImage === i
                        ? 'border-[#ff6b35]'
                        : 'border-[#2a2a2a] hover:border-[#555]'
                    }`}
                  >
                    <Image
                      src={getImageSrc(img.image_path, i)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            {product.brand && (
              <span className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest">
                {product.brand.name}
              </span>
            )}
            <h1 className="font-display text-5xl text-white leading-tight">{product.name.toUpperCase()}</h1>
            <div className="font-mono text-3xl text-[#ff6b35] font-bold">
              {formatPrice(finalPrice)}
            </div>

            {product.description && (
              <p className="font-mono text-sm text-[#888] leading-relaxed border-t border-[#2a2a2a] pt-6">
                {product.description}
              </p>
            )}

            {/* Color selector */}
            {uniqueColors.length > 0 && (
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#555] mb-3">
                  Color: <span className="text-[#f0f0f0]">{selectedColor}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        const v = product.variants?.find(
                          (x) => x.color === color && x.size === selectedVariant?.size
                        ) ?? product.variants?.find((x) => x.color === color);
                        if (v) setSelectedVariant(v);
                      }}
                      title={color}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-[#ff6b35] scale-110'
                          : 'border-[#2a2a2a] hover:border-[#555]'
                      }`}
                      style={{
                        backgroundColor:
                          color.toLowerCase() === 'black'
                            ? '#1a1a1a'
                            : color.toLowerCase() === 'white'
                            ? '#f0f0f0'
                            : color.toLowerCase() === 'navy'
                            ? '#1a2040'
                            : color.toLowerCase() === 'khaki'
                            ? '#c9b99a'
                            : color,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {uniqueSizes.length > 0 && (
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#555] mb-3">
                  Size
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const v = product.variants?.find(
                      (x) => x.size === size && x.color === selectedColor
                    );
                    const inStock = (v?.stock_qty ?? 0) > 0;
                    const isSelected = selectedVariant?.size === size;

                    return (
                      <button
                        key={size}
                        onClick={() => { if (v) setSelectedVariant(v); }}
                        disabled={!inStock}
                        className={`w-12 h-12 font-mono text-xs uppercase tracking-wider border
                          transition-all duration-200
                          ${isSelected
                            ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]'
                            : inStock
                            ? 'border-[#2a2a2a] text-[#888] hover:border-[#ff6b35] hover:text-[#ff6b35]'
                            : 'border-[#1a1a1a] text-[#333] line-through cursor-not-allowed'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest
                         py-5 flex items-center justify-center gap-3
                         hover:bg-[#e8ff59] transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-transform"
            >
              <ShoppingBag size={16} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {selectedVariant && (
              <p className="font-mono text-xs text-[#555] text-center">
                {selectedVariant.stock_qty > 0
                  ? `${selectedVariant.stock_qty} units in stock`
                  : 'Currently out of stock'}
              </p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-4xl text-white mb-8">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
