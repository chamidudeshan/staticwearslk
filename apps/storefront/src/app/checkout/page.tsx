'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/context/cart-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { CreditCard, Wallet, Landmark } from 'lucide-react';

type PaymentMethod = 'stripe' | 'paypal' | 'payhere';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => { render: (selector: string) => void };
    };
  }
}

export default function CheckoutPage() {
  const { cart, dispatch } = useCart();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Redirect unauthenticated users to login, then back to checkout
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/login?redirect_url=/checkout');
    }
  }, [isLoaded, isSignedIn, router]);
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('stripe');
  const [orderId, setOrderId] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

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

  async function createOrder(): Promise<string | null> {
    const res = await fetch('/api/orders', {
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
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? 'Failed to create order'); return null; }
    return data.order.id as string;
  }

  async function handleStripe(e: React.FormEvent) {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setLoading(true);
    try {
      const oid = await createOrder();
      if (!oid) return;

      const sessionRes = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oid,
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
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayHere(e: React.FormEvent) {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setLoading(true);
    try {
      const oid = await createOrder();
      if (!oid) return;

      const hashRes = await fetch('/api/payments/payhere/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: oid, amount: cart.total }),
      });
      const ph = await hashRes.json();
      if (!hashRes.ok) { toast.error(ph.error); return; }

      dispatch({ type: 'CLEAR' });

      const f = document.createElement('form');
      f.method = 'POST';
      f.action = ph.payhereUrl;
      const fields: Record<string, string> = {
        merchant_id: ph.merchantId,
        return_url: ph.returnUrl,
        cancel_url: ph.cancelUrl,
        notify_url: ph.notifyUrl,
        order_id: ph.orderId,
        items: cart.items.map((i) => i.product_name).join(', '),
        currency: ph.currency,
        amount: ph.amount,
        first_name: form.name.split(' ')[0] || form.name,
        last_name: form.name.split(' ').slice(1).join(' ') || '-',
        email: '',
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: 'Sri Lanka',
        hash: ph.hash,
      };
      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        f.appendChild(input);
      });
      document.body.appendChild(f);
      f.submit();
    } catch {
      toast.error('Something went wrong');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (payMethod !== 'paypal' || paypalRendered.current) return;

    async function setupPayPal() {
      const formValid = form.name && form.phone && form.address && form.city && form.district;
      if (!formValid) return;

      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      if (!clientId) return;

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.onload = () => {
        if (!window.paypal || !paypalRef.current || paypalRendered.current) return;
        paypalRendered.current = true;
        window.paypal.Buttons({
          createOrder: async () => {
            const oid = await createOrder();
            if (!oid) throw new Error('Order creation failed');
            setOrderId(oid);
            const res = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: oid, amount: cart.total }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.paypalOrderId;
          },
          onApprove: async (data: { orderID: string }) => {
            if (!orderId) return;
            const res = await fetch('/api/payments/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paypalOrderId: data.orderID, orderId }),
            });
            const result = await res.json();
            if (result.success) {
              dispatch({ type: 'CLEAR' });
              router.push(`/orders/${orderId}?success=true`);
            } else {
              toast.error(result.error ?? 'Payment failed');
            }
          },
          onError: () => toast.error('PayPal error. Please try again.'),
        }).render('#paypal-button-container');
      };
      document.head.appendChild(script);
    }

    setupPayPal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payMethod]);

  // Show nothing while Clerk is loading or while redirecting unauthenticated users
  if (!isLoaded || !isSignedIn) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <p className="font-mono text-xs text-[#444] tracking-widest uppercase">Loading...</p>
        </main>
        <Footer />
      </>
    );
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

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'stripe', label: 'Card', icon: <CreditCard size={16} />, desc: 'Visa, Mastercard via Stripe' },
    { id: 'paypal', label: 'PayPal', icon: <Wallet size={16} />, desc: 'Pay with your PayPal account' },
    { id: 'payhere', label: 'PayHere', icon: <Landmark size={16} />, desc: 'Sri Lanka local payments' },
  ];

  const activeForm = payMethod === 'stripe' ? handleStripe : payMethod === 'payhere' ? handlePayHere : undefined;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-6xl text-white mb-10">CHECKOUT</h1>

          <form onSubmit={activeForm ?? ((e) => e.preventDefault())}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Left: Shipping + Payment */}
              <div className="lg:col-span-3 space-y-6">
                {/* Shipping */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-5">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Shipping Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="Chamidu Jayaneththi" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="+94 77 000 0000" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" placeholder="123 Main Street" value={form.address} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="Colombo" value={form.city} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input id="district" name="district" placeholder="Colombo" value={form.district} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Order Notes (optional)</Label>
                      <Input id="notes" name="notes" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-4">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Payment Method</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayMethod(m.id)}
                        className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all font-mono text-xs ${
                          payMethod === m.id
                            ? 'border-[#ff6b35] text-[#ff6b35] bg-[#ff6b35]/5'
                            : 'border-[#2a2a2a] text-[#555] hover:border-[#444] hover:text-[#888]'
                        }`}
                      >
                        {m.icon}
                        <span className="font-bold uppercase tracking-wider">{m.label}</span>
                        <span className="text-[10px] text-center opacity-70">{m.desc}</span>
                      </button>
                    ))}
                  </div>

                  {payMethod === 'paypal' && (
                    <div>
                      <div
                        id="paypal-button-container"
                        ref={paypalRef}
                        className="pt-2 min-h-[50px]"
                      />
                      <p className="font-mono text-[10px] text-[#444] text-center mt-2">
                        You will be redirected to PayPal to complete payment.
                      </p>
                    </div>
                  )}
                  {payMethod === 'stripe' && (
                    <p className="font-mono text-[10px] text-[#444]">
                      Test card: 4242 4242 4242 4242 · any future date · any CVC
                    </p>
                  )}
                  {payMethod === 'payhere' && (
                    <p className="font-mono text-[10px] text-[#444]">
                      You will be redirected to PayHere to complete payment securely.
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Order summary */}
              <div className="lg:col-span-2">
                <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-5 sticky top-24">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#555]">Order Summary</h2>
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
                  {payMethod !== 'paypal' && (
                    <Button type="submit" className="w-full h-12" disabled={loading}>
                      {loading
                        ? 'Processing...'
                        : payMethod === 'stripe'
                        ? 'Pay with Card'
                        : 'Pay with PayHere'}
                    </Button>
                  )}
                  {payMethod === 'paypal' && (
                    <p className="font-mono text-[10px] text-[#444] text-center">
                      Use the PayPal button above to complete your order.
                    </p>
                  )}
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
