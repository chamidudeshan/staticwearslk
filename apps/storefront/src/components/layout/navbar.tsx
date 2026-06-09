'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { CartSheet } from '@/components/cart/cart-sheet';

export function Navbar() {
  const { cart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=t-shirts', label: 'Tees' },
    { href: '/shop?category=hoodies', label: 'Hoodies' },
    { href: '/shop?category=caps', label: 'Caps' },
    { href: '/shop?category=accessories', label: 'Accessories' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#2a2a2a]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-2xl tracking-tight text-white shrink-0">
            STATIC<span className="text-[#ff6b35]">WEARS</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="font-mono text-xs uppercase tracking-widest text-[#888] hover:text-[#ff6b35] transition-colors whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/login"
              className="hidden md:flex items-center justify-center w-10 h-10 text-[#888] hover:text-[#ff6b35] transition-colors">
              <User size={18} />
            </Link>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 text-[#888] hover:text-[#ff6b35] transition-colors">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff6b35] text-black text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden flex items-center justify-center w-10 h-10 text-[#888] hover:text-[#ff6b35] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 bg-[#080808] flex flex-col pt-20 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col px-6 gap-5 overflow-y-auto pb-10">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="font-display text-4xl text-[#f0f0f0] hover:text-[#ff6b35] transition-colors">
              {link.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-[#2a2a2a] pt-6 flex flex-col gap-4">
            <Link href="/account" onClick={() => setMobileOpen(false)} className="font-mono text-sm text-[#888] hover:text-[#ff6b35] transition-colors">My Account</Link>
            <Link href="/orders" onClick={() => setMobileOpen(false)} className="font-mono text-sm text-[#888] hover:text-[#ff6b35] transition-colors">Track Order</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="font-mono text-sm text-[#888] hover:text-[#ff6b35] transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
