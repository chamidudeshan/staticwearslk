import { auth } from '@clerk/nextjs/server';
import { getOrderById } from '@static-wears/order-service';
import { notFound, redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@static-wears/shared';

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline'> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'danger',
};

const STATUS_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const { id } = await params;
  const { success } = await searchParams;
  const order = await getOrderById(id);
  if (!order || order.customer_id !== userId) notFound();

  const currentStep = STATUS_STEPS.indexOf(order.status as OrderStatus);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/orders"
            className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors flex items-center gap-2 mb-8"
          >
            <ChevronLeft size={14} />
            My Orders
          </Link>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 mb-8">
              <p className="font-mono text-sm text-emerald-400">
                Payment confirmed! Your order is being processed.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl text-white">
                ORDER #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="font-mono text-xs text-[#555] mt-2">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status as OrderStatus]}>
              {order.status}
            </Badge>
          </div>

          {/* Progress tracker */}
          {order.status !== 'cancelled' && (
            <div className="bg-[#111] border border-[#2a2a2a] p-6 mb-6">
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-full h-0.5 ${i === 0 ? 'hidden' : ''} ${i <= currentStep ? 'bg-[#ff6b35]' : 'bg-[#2a2a2a]'}`} />
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                      ${i <= currentStep ? 'border-[#ff6b35] bg-[#ff6b35]/20' : 'border-[#2a2a2a]'}`}>
                      {i < currentStep ? (
                        <span className="text-[#ff6b35] text-xs">✓</span>
                      ) : (
                        <span className={`text-xs font-mono ${i === currentStep ? 'text-[#ff6b35]' : 'text-[#444]'}`}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className={`w-full h-0.5 ${i === STATUS_STEPS.length - 1 ? 'hidden' : ''} ${i < currentStep ? 'bg-[#ff6b35]' : 'bg-[#2a2a2a]'}`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {STATUS_STEPS.map((step, i) => (
                  <span
                    key={step}
                    className={`font-mono text-[10px] uppercase tracking-wider capitalize ${
                      i <= currentStep ? 'text-[#ff6b35]' : 'text-[#444]'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-[#111] border border-[#2a2a2a] divide-y divide-[#1a1a1a] mb-6">
            {order.items?.map((item) => (
              <div key={item.id} className="p-5 flex justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-bold text-[#f0f0f0] uppercase">
                    {item.product_name}
                  </p>
                  <p className="font-mono text-xs text-[#555] mt-0.5">
                    {item.variant_desc} · Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-mono text-sm text-[#f0f0f0] whitespace-nowrap">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-3">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-[#888]">Subtotal</span>
              <span className="text-[#f0f0f0]">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-[#888]">Shipping</span>
              <span className="text-[#888]">Free</span>
            </div>
            <div className="border-t border-[#2a2a2a] pt-3 flex justify-between font-mono">
              <span className="font-bold text-[#f0f0f0]">Total</span>
              <span className="text-xl font-bold text-[#ff6b35]">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Shipping info */}
          <div className="mt-6 bg-[#111] border border-[#2a2a2a] p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#555] mb-4">
              Shipping To
            </h3>
            <p className="font-mono text-sm text-[#888]">{order.shipping_name}</p>
            <p className="font-mono text-sm text-[#888]">{order.shipping_phone}</p>
            <p className="font-mono text-sm text-[#888]">{order.shipping_addr}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
