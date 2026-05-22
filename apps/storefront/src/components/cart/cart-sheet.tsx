'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { CartItemRow } from './cart-item-row';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const { cart } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md
                       bg-[#0e0e0e] border-l border-[#2a2a2a] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-[#ff6b35]" />
                <span className="font-display text-xl">
                  CART
                  {cart.items.length > 0 && (
                    <span className="font-mono text-sm text-[#888] ml-2">
                      ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#ff6b35] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <ShoppingBag size={48} className="text-[#2a2a2a]" />
                  <p className="font-mono text-sm text-[#555]">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest border border-[#ff6b35]/30 px-4 py-2 hover:bg-[#ff6b35]/10 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {cart.items.map((item) => (
                    <CartItemRow key={item.variant_id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="p-6 border-t border-[#2a2a2a] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#888]">
                    Subtotal
                  </span>
                  <span className="font-mono text-lg font-bold text-[#ff6b35]">
                    {formatPrice(cart.total)}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#444]">
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-[#ff6b35] text-black
                             font-mono font-bold text-sm uppercase tracking-widest py-4
                             hover:bg-[#e8ff59] transition-colors"
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-center w-full border border-[#2a2a2a]
                             text-[#888] font-mono text-xs uppercase tracking-widest py-3
                             hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all"
                >
                  View Cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
