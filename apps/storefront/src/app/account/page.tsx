import { currentUser } from '@clerk/nextjs/server';
import { SignOutButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getOrdersByCustomer } from '@static-wears/order-service';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ChevronRight, ExternalLink, ShoppingBag, User, Settings, LogOut } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080808]">

      {/* ── Left brand panel ── */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-[#0a0a0a] border-r border-[#111] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
          <span className="font-display text-[22vw] text-[#0f0f0f] leading-none tracking-tight whitespace-nowrap">SW</span>
        </div>

        <Link href="/" className="relative z-10 font-display text-3xl text-white tracking-tight">
          STATIC<span className="text-[#ff6b35]">WEARS</span>
        </Link>

        <div className="relative z-10 space-y-8">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border-2 border-[#ff6b35]/40 flex items-center justify-center">
              <span className="font-display text-xl text-[#ff6b35]">{initials}</span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff6b35] mb-1">Signed in as</p>
              <p className="font-mono text-sm text-white font-bold">{displayName}</p>
              <p className="font-mono text-xs text-[#444] truncate max-w-[200px]">{email}</p>
            </div>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#ff6b35] block mb-4">— Your Account —</span>
            <h2 className="font-display text-[clamp(2.5rem,4vw,4rem)] text-white leading-[0.9] tracking-tight">
              MY
              <br />
              <span className="text-[#ff6b35]">PROFILE.</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#333] mb-1">Orders</p>
              <p className="font-display text-3xl text-white">{orders.length}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#333] mb-1">Total Spent</p>
              <p className="font-display text-3xl text-[#ff6b35]">{formatPrice(totalSpent)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-1 h-1 bg-[#ff6b35] rounded-full shrink-0" />
              <span className="font-mono text-xs text-[#555] uppercase tracking-wider">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <span className="w-1 h-1 bg-[#ff6b35] rounded-full shrink-0" />
                <span className="font-mono text-xs text-[#ff6b35] uppercase tracking-wider">Admin access</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10">
          <span className="font-mono text-[10px] text-[#2a2a2a] uppercase tracking-widest">
            staticwears.com · Sri Lanka
          </span>
        </div>

        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#ff6b35]/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#ff6b35]/10 pointer-events-none" />
      </div>

      {/* ── Right content panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-[#111]">
          <Link href="/" className="font-display text-2xl text-white">
            STATIC<span className="text-[#ff6b35]">WEARS</span>
          </Link>
          <SignOutButton redirectUrl="/">
            <button className="font-mono text-[10px] uppercase tracking-widest text-[#444] hover:text-red-400 transition-colors flex items-center gap-1.5">
              <LogOut size={12} /> Sign out
            </button>
          </SignOutButton>
        </div>

        <div className="flex-1 px-6 py-10 md:px-12 space-y-6 overflow-y-auto">

          {/* Heading row */}
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff6b35] block mb-2">Welcome back</span>
              <h1 className="font-display text-4xl sm:text-5xl text-white leading-none">MY ACCOUNT</h1>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/shop"
                className="font-mono text-[10px] uppercase tracking-widest text-[#444] hover:text-[#ff6b35] transition-colors border border-[#1a1a1a] hover:border-[#ff6b35]/40 px-4 py-2">
                Shop
              </Link>
              <SignOutButton redirectUrl="/">
                <button className="font-mono text-[10px] uppercase tracking-widest text-[#444] hover:text-red-400 transition-colors border border-[#1a1a1a] px-4 py-2 flex items-center gap-1.5">
                  <LogOut size={10} /> Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>

          {/* Mobile profile stats */}
          <div className="md:hidden bg-[#0e0e12] border border-[#1a1a1a] p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-[#ff6b35]/40 flex items-center justify-center shrink-0">
              <span className="font-display text-lg text-[#ff6b35]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono font-bold text-sm text-[#f0f0f0] truncate">{displayName}</p>
              <p className="font-mono text-xs text-[#444] truncate">{email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-[10px] text-[#333] uppercase">Spent</p>
              <p className="font-mono text-sm font-bold text-[#ff6b35]">{formatPrice(totalSpent)}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/orders"
              className="bg-[#0e0e12] border border-[#1a1a1a] p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} className="text-[#ff6b35]" />
                <div>
                  <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide">Orders</p>
                  <p className="font-mono text-xs text-[#444]">{orders.length} total</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#333] group-hover:text-[#ff6b35] transition-colors" />
            </Link>

            <Link href="/size-guide"
              className="bg-[#0e0e12] border border-[#1a1a1a] p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package size={16} className="text-[#ff6b35]" />
                <div>
                  <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide">Size Guide</p>
                  <p className="font-mono text-xs text-[#444]">Find your fit</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#333] group-hover:text-[#ff6b35] transition-colors" />
            </Link>

            {isAdmin ? (
              <a href={process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'}
                className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings size={16} className="text-[#ff6b35]" />
                  <div>
                    <p className="font-mono font-bold text-sm text-[#ff6b35] uppercase tracking-wide">Admin</p>
                    <p className="font-mono text-xs text-[#444]">Dashboard</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#ff6b35]/50 group-hover:text-[#ff6b35] transition-colors" />
              </a>
            ) : (
              <Link href="/contact"
                className="bg-[#0e0e12] border border-[#1a1a1a] p-5 hover:border-[#ff6b35] transition-colors group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-[#ff6b35]" />
                  <div>
                    <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide">Help</p>
                    <p className="font-mono text-xs text-[#444]">Contact support</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#333] group-hover:text-[#ff6b35] transition-colors" />
              </Link>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-[#0e0e12] border border-[#1a1a1a]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Recent Orders</h3>
              <Link href="/orders" className="font-mono text-[10px] text-[#ff6b35] hover:underline uppercase tracking-widest">
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShoppingBag size={28} className="text-[#1a1a1a] mx-auto mb-3" />
                <p className="font-mono text-sm text-[#333] mb-4">No orders yet.</p>
                <Link href="/shop" className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest hover:underline">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#111]">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-[#111] transition-colors gap-2 group">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-mono text-xs font-bold text-[#e8e8f0]">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-[#333]">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-[#ff6b35]">{formatPrice(order.total_amount)}</span>
                      <ChevronRight size={14} className="text-[#333] group-hover:text-[#ff6b35] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: '/size-guide', label: 'Size Guide' },
              { href: '/returns', label: 'Returns' },
              { href: '/shipping', label: 'Shipping' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="font-mono text-[10px] uppercase tracking-widest text-[#333] hover:text-[#ff6b35] transition-colors text-center py-3 border border-[#111] hover:border-[#ff6b35]/30">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-6 text-center border-t border-[#0f0f0f]">
          <span className="font-mono text-[10px] text-[#1a1a1a] uppercase tracking-widest">
            © 2026 Static Wears · All rights reserved
          </span>
        </div>
      </div>
    </div>
  );
}
