'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Grid2x2, User } from 'lucide-react';
import { useCart } from '@/context/cart-context';

const tabs = [
  { href: '/',        label: 'Home',    icon: Home },
  { href: '/shop',    label: 'Shop',    icon: Grid2x2 },
  { href: '/login', label: 'Account', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-md border-t border-[#1a1a1a]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? 'text-[#ff6b35]' : 'text-[#555] hover:text-[#888]'
              }`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}

        {/* Cart tab — separate to show badge */}
        <Link href="/cart"
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative ${
            pathname === '/cart' ? 'text-[#ff6b35]' : 'text-[#555] hover:text-[#888]'
          }`}>
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={pathname === '/cart' ? 2.5 : 1.8} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#ff6b35] text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest">Cart</span>
        </Link>
      </div>
    </nav>
  );
}
