'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { formatPrice, getSupabaseImageUrl } from '@/lib/utils';
import type { CartItem } from '@static-wears/shared';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&q=80';

export function CartItemRow({ item }: { item: CartItem }) {
  const { dispatch } = useCart();

  const imageSrc =
    item.image_path && !item.image_path.startsWith('demo/')
      ? getSupabaseImageUrl(item.image_path)
      : FALLBACK_IMAGE;

  return (
    <div className="flex gap-4 p-5">
      <div className="relative w-16 h-20 flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
        <Image
          src={imageSrc}
          alt={item.product_name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs font-bold text-[#f0f0f0] uppercase tracking-wide truncate">
          {item.product_name}
        </p>
        <p className="font-mono text-xs text-[#555] mt-0.5">{item.variant_desc}</p>
        <p className="font-mono text-sm text-[#ff6b35] font-bold mt-2">
          {formatPrice(item.unit_price)}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 border border-[#2a2a2a]">
            <button
              onClick={() =>
                dispatch({
                  type: 'UPDATE_QTY',
                  payload: { variant_id: item.variant_id, quantity: item.quantity - 1 },
                })
              }
              className="w-7 h-7 flex items-center justify-center text-[#888] hover:text-[#ff6b35] transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="font-mono text-xs w-4 text-center text-[#f0f0f0]">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                dispatch({
                  type: 'UPDATE_QTY',
                  payload: { variant_id: item.variant_id, quantity: item.quantity + 1 },
                })
              }
              className="w-7 h-7 flex items-center justify-center text-[#888] hover:text-[#ff6b35] transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() =>
              dispatch({
                type: 'REMOVE_ITEM',
                payload: { variant_id: item.variant_id },
              })
            }
            className="text-[#444] hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
