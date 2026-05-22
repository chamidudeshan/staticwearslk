'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@static-wears/shared';
import { useCart } from '@/context/cart-context';
import { formatPrice, getSupabaseImageUrl } from '@/lib/utils';

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
  'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80',
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80',
];

const COLOR_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f0f0f0',
  navy: '#1a2040',
  khaki: '#c9b99a',
  grey: '#888888',
  gray: '#888888',
  red: '#cc3333',
  green: '#2d6a4f',
};

function getImageSrc(path: string, index: number = 0): string {
  if (!path || path.startsWith('demo/')) {
    return DEMO_IMAGES[index % DEMO_IMAGES.length];
  }
  return getSupabaseImageUrl(path);
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { dispatch } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [4, -4]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-4, 4]), { stiffness: 200, damping: 25 });

  const mainImage = product.images?.find((i) => i.is_main) ?? product.images?.[0];
  const secondImage = product.images?.[1];
  const isLowStock = product.variants?.some((v) => v.stock_qty > 0 && v.stock_qty <= 3);
  const isOutOfStock = product.variants?.every((v) => v.stock_qty === 0);
  const uniqueColors = Array.from(new Set(product.variants?.map((v) => v.color) ?? []));

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    const variant = product.variants?.find((v) => v.stock_qty > 0);
    if (!variant) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_desc: `${variant.size} / ${variant.color}`,
        image_path: mainImage?.image_path ?? '',
        unit_price: product.base_price + variant.price_adj,
        quantity: 1,
      },
    });
    toast.success(`${product.name} added`, {
      description: `${variant.size} / ${variant.color}`,
    });
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#111] mb-4">
          {/* Main image */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: hovered && secondImage ? 0 : 1, scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={getImageSrc(mainImage?.image_path ?? '', index)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </motion.div>

          {/* Hover image */}
          {secondImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 1.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={getImageSrc(secondImage.image_path, index + 1)}
                alt={`${product.name} alternate`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </motion.div>
          )}

          {/* Orange shimmer on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: hovered
                ? 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, transparent 60%)'
                : 'linear-gradient(135deg, transparent 0%, transparent 60%)',
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Sold out */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="font-mono text-xs tracking-widest text-[#555] uppercase border border-[#2a2a2a] px-3 py-1.5">
                Sold Out
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isLowStock && !isOutOfStock && (
              <span className="font-mono text-[9px] bg-[#ff6b35] text-black px-2 py-0.5 tracking-widest uppercase font-bold">
                Low Stock
              </span>
            )}
            {index < 3 && !isOutOfStock && (
              <span className="font-mono text-[9px] bg-[#e8ff59] text-black px-2 py-0.5 tracking-widest uppercase font-bold">
                New
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 right-0 flex">
            <motion.button
              className="flex-1 bg-[#ff6b35] text-black font-mono font-bold text-[10px]
                         tracking-widest uppercase py-3 flex items-center justify-center gap-1.5"
              animate={{ y: hovered ? 0 : '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={11} />
              Quick Add
            </motion.button>
            <motion.div
              className="w-12 bg-[#1a1a1a] border-l border-[#ff6b35]/30 flex items-center justify-center shrink-0"
              animate={{ y: hovered ? 0 : '100%' }}
              transition={{ duration: 0.3, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Eye size={13} className="text-[#888]" />
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono font-bold text-xs text-[#e8e8e8] uppercase tracking-wide leading-tight">
              {product.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="font-mono text-[#ff6b35] text-xs font-bold">
                {formatPrice(product.base_price)}
              </span>
            </div>
          </div>

          {/* Color swatches */}
          {uniqueColors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {uniqueColors.slice(0, 6).map((color) => (
                <div
                  key={color}
                  title={color}
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-[#2a2a2a] ring-offset-1 ring-offset-[#080808]"
                  style={{
                    backgroundColor: COLOR_MAP[color.toLowerCase()] ?? color,
                  }}
                />
              ))}
              {uniqueColors.length > 6 && (
                <span className="font-mono text-[9px] text-[#444]">+{uniqueColors.length - 6}</span>
              )}
            </div>
          )}

          {/* Sizes preview */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {Array.from(new Set(product.variants.map((v) => v.size))).slice(0, 5).map((size) => (
                <span key={size} className="font-mono text-[9px] text-[#444] uppercase tracking-wider">
                  {size}
                </span>
              )).reduce<React.ReactNode[]>((acc, el, i) => {
                if (i > 0) acc.push(<span key={`sep-${i}`} className="text-[#2a2a2a] text-[9px]">/</span>);
                acc.push(el);
                return acc;
              }, [])}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
