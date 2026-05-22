'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/context/cart-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, dispatch } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    notes: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setLoading(true);

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          shipping: {
            name: form.name,
            phone: form.phone,
            address: `${form.address}, ${form.city}, ${form.district}`,
          },
          notes: form.notes,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? 'Failed to create order');

      const sessionRes = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.id,
          items: cart.items.map((item) => ({
            name: `${item.product_name} (${item.variant_desc})`,
            price: item.unit_price,
            quantity: item.quantity,
          })),
        }),
      });

      const sessionData = await sessionRes.json();

      if (sessionData.sessionUrl) {
        dispatch({ type: 'CLEAR' });
        window.location.href = sessionData.sessionUrl;
      } else {
        toast.error(sessionData.error ?? 'Payment setup failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-[#555] mb-4">Your cart is empty.</p>
            <Button onClick={() => router.push('/shop')}>Shop Now</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-6xl text-white mb-10"
          >
            CHECKOUT
          </motion.h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Shipping form */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-5">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Chamidu Jayaneththi"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+94 77 000 0000"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="123 Main Street"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Colombo"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        name="district"
                        placeholder="Colombo"
                        value={form.district}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Order Notes (optional)</Label>
                      <Input
                        id="notes"
                        name="notes"
                        placeholder="Any special instructions..."
                        value={form.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-2">
                <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-5 sticky top-24">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">
                    Order Summary
                  </h2>
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.variant_id} className="flex justify-between gap-4 text-xs font-mono">
                        <div>
                          <p className="text-[#f0f0f0] font-bold">{item.product_name}</p>
                          <p className="text-[#555]">{item.variant_desc} ×{item.quantity}</p>
                        </div>
                        <span className="text-[#f0f0f0] whitespace-nowrap">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#2a2a2a] pt-4 flex justify-between">
                    <span className="font-mono text-sm text-[#888]">Total</span>
                    <span className="font-mono text-xl font-bold text-[#ff6b35]">
                      {formatPrice(cart.total)}
                    </span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Pay with Stripe'}
                  </Button>
                  <p className="font-mono text-[10px] text-[#444] text-center">
                    Test card: 4242 4242 4242 4242
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
