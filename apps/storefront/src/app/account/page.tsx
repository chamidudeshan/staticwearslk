import { currentUser } from '@clerk/nextjs/server';
import { SignOutButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getOrdersByCustomer } from '@static-wears/order-service';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ChevronRight, ExternalLink, ShoppingBag, User, Settings } from 'lucide-react';
import Image from 'next/image';
import type { OrderStatus } from '@static-wears/shared';

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  confirmed: 'text-emerald-400 bg-emerald-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-sky-400 bg-sky-400/10',
  delivered: 'text-emerald-400 bg-emerald-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/login?redirect=/account');

  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const displayName = user.fullName ?? user.firstName ?? 'Customer';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const isAdmin =
    user.publicMetadata?.role === 'admin' ||
    (process.env.ADMIN_USER_IDS ?? '').split(',').map((s: string) => s.trim()).includes(user.id);

  const orders = await getOrdersByCustomer(user.id);
  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-2">Account</p>
              <h1 className="font-display text-5xl sm:text-6xl text-white">MY ACCOUNT</h1>
            </div>
            <SignOutButton redirectUrl="/">
              <button className="font-mono text-xs uppercase tracking-widest text-[#444] hover:text-red-400 transition-colors border border-[#2a2a2a] px-5 py-2.5 self-start sm:self-auto">
                Sign Out
              </button>
            </SignOutButton>
          </div>

          {/* Profile card */}
          <div className="bg-[#111] border border-[#2a2a2a] p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-[#555]" />
                  )}
                </div>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-[#ff6b35] text-black font-mono font-bold text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded">
                    Admin
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-mono font-bold text-xl text-[#f0f0f0] mb-1">{displayName}</h2>
                <p className="font-mono text-sm text-[#555] mb-4 truncate">{email}</p>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#444] mb-1">Total Orders</p>
                    <p className="font-mono text-2xl font-bold text-[#e8e8f0]">{orders.length}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#444] mb-1">Total Spent</p>
                    <p className="font-mono text-2xl font-bold text-[#ff6b35]">{formatPrice(totalSpent)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#444] mb-1">Member Since</p>
                    <p className="font-mono text-sm text-[#888]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link href="/orders"
              className="bg-[#111] border border-[#2a2a2a] p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} className="text-[#ff6b35]" />
                <div>
                  <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide">Orders</p>
                  <p className="font-mono text-xs text-[#555]">Track & manage</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#444] group-hover:text-[#ff6b35] transition-colors" />
            </Link>

            <Link href="/size-guide"
              className="bg-[#111] border border-[#2a2a2a] p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package size={16} className="text-[#ff6b35]" />
                <div>
                  <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide">Size Guide</p>
                  <p className="font-mono text-xs text-[#555]">Find your fit</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#444] group-hover:text-[#ff6b35] transition-colors" />
            </Link>

            {isAdmin ? (
              <a href={process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'}
                className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings size={16} className="text-[#ff6b35]" />
                  <div>
                    <p className="font-mono font-bold text-sm text-[#ff6b35] uppercase tracking-wide">Admin</p>
                    <p className="font-mono text-xs text-[#555]">Dashboard</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#ff6b35]/50 group-hover:text-[#ff6b35] transition-colors" />
              </a>
            ) : (
              <Link href="/contact"
                className="bg-[#111] border border-[#2a2a2a] p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-[#ff6b35]" />
                  <div>
                    <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide">Help</p>
                    <p className="font-mono text-xs text-[#555]">Contact support</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#444] group-hover:text-[#ff6b35] transition-colors" />
              </Link>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-[#111] border border-[#2a2a2a]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#555]">Recent Orders</h3>
              <Link href="/orders" className="font-mono text-[10px] text-[#ff6b35] hover:underline uppercase tracking-widest">
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShoppingBag size={32} className="text-[#2a2a2a] mx-auto mb-3" />
                <p className="font-mono text-sm text-[#444] mb-4">No orders yet.</p>
                <Link href="/shop" className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest hover:underline">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a]">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-[#1a1a1a] transition-colors gap-2 group">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-mono text-xs font-bold text-[#e8e8f0]">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-[#444]">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-[#ff6b35]">{formatPrice(order.total_amount)}</span>
                      <ChevronRight size={14} className="text-[#444] group-hover:text-[#ff6b35] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer links */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/size-guide', label: 'Size Guide' },
              { href: '/returns', label: 'Returns' },
              { href: '/shipping', label: 'Shipping' },
              { href: '/contact', label: 'Contact Us' },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="font-mono text-[10px] uppercase tracking-widest text-[#444] hover:text-[#ff6b35] transition-colors text-center py-3 border border-[#1a1a1a] hover:border-[#ff6b35]/30">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
