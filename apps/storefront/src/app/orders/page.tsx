import { createSupabaseServerClient } from '@static-wears/shared';
import { getOrdersByCustomer } from '@static-wears/order-service';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
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

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/orders');

  const orders = await getOrdersByCustomer(user.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-6xl text-white mb-10">MY ORDERS</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-mono text-[#555] mb-6">No orders yet.</p>
              <Link href="/shop" className="font-mono text-sm text-[#ff6b35] uppercase tracking-widest border border-[#ff6b35]/30 px-6 py-3 hover:bg-[#ff6b35]/10 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-[#111] border border-[#2a2a2a] p-6 hover:border-[#ff6b35] transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-[#555] uppercase tracking-widest mb-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="font-mono text-xs text-[#555]">
                        {formatDate(order.created_at)} · {order.items?.length ?? 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {order.status}
                      </Badge>
                      <span className="font-mono text-lg font-bold text-[#ff6b35]">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                      <p className="font-mono text-xs text-[#555]">
                        {order.items.slice(0, 2).map((item) => item.product_name).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
