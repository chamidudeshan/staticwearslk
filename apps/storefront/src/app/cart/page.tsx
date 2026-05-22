'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { cart, dispatch } = useCart();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-6xl text-white">YOUR CART</h1>
          </motion.div>

          {cart.items.length === 0 ? (
            <div className="text-center py-24 space-y-6">
              <ShoppingBag size={64} className="mx-auto text-[#2a2a2a]" />
              <h2 className="font-display text-3xl text-[#444]">NOTHING HERE YET</h2>
              <Link href="/shop">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Items */}
              <div className="lg:col-span-2 border border-[#2a2a2a] divide-y divide-[#1a1a1a]">
                {cart.items.map((item) => (
                  <CartItemRow key={item.variant_id} item={item} />
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[#555]">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    {cart.items.map((item) => (
                      <div key={item.variant_id} className="flex justify-between text-xs font-mono">
                        <span className="text-[#888] truncate mr-2">
                          {item.product_name} ×{item.quantity}
                        </span>
                        <span className="text-[#f0f0f0] whitespace-nowrap">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#2a2a2a] pt-4 flex justify-between">
                    <span className="font-mono text-sm text-[#888]">Subtotal</span>
                    <span className="font-mono text-lg font-bold text-[#ff6b35]">
                      {formatPrice(cart.total)}
                    </span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full h-12 mt-2">
                      Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                  <button
                    onClick={() => dispatch({ type: 'CLEAR' })}
                    className="w-full font-mono text-xs uppercase tracking-widest text-[#555] hover:text-red-500 transition-colors py-2"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
