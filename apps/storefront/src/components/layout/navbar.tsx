'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
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
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#2a2a2a]'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl tracking-tight text-white">
            STATIC<span className="text-[#ff6b35]">WEARS</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-widest text-[#888]
                           hover:text-[#ff6b35] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="hidden md:flex items-center justify-center w-10 h-10
                         text-[#888] hover:text-[#ff6b35] transition-colors"
            >
              <Search size={18} />
            </Link>
            <Link
              href="/account"
              className="flex items-center justify-center w-10 h-10
                         text-[#888] hover:text-[#ff6b35] transition-colors"
            >
              <User size={18} />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10
                         text-[#888] hover:text-[#ff6b35] transition-colors"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff6b35] text-black
                             text-[10px] font-mono font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10
                         text-[#888] hover:text-[#ff6b35] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#080808] pt-20 px-6"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-4xl text-[#f0f0f0] hover:text-[#ff6b35] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 border-t border-[#2a2a2a] pt-8">
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm text-[#888]"
                >
                  My Account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
