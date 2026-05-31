'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);

const shopLinks = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?category=t-shirts', label: 'T-Shirts' },
  { href: '/shop?category=hoodies', label: 'Hoodies' },
  { href: '/shop?category=caps', label: 'Caps' },
  { href: '/shop?category=accessories', label: 'Accessories' },
];

const helpLinks = [
  { href: '/account', label: 'My Account' },
  { href: '/orders', label: 'Track Order' },
  { href: '/size-guide', label: 'Size Guide' },
  { href: '/returns', label: 'Returns & Exchanges' },
  { href: '/contact', label: 'Contact Us' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/shipping', label: 'Shipping Info' },
];

const socialItems = [
  { key: 'social_instagram', icon: <Instagram size={16} />, label: 'Instagram' },
  { key: 'social_tiktok', icon: <TikTokIcon />, label: 'TikTok' },
  { key: 'social_facebook', icon: <Facebook size={16} />, label: 'Facebook' },
  { key: 'social_youtube', icon: <Youtube size={16} />, label: 'YouTube' },
];

export function Footer() {
  const [social, setSocial] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d: Record<string, string>) => setSocial(d))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-[#1a1a1a] bg-[#060606] mt-24 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display text-[22vw] text-[#0a0a0a] leading-none tracking-tight whitespace-nowrap">SW</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="font-display text-3xl sm:text-4xl text-white block mb-4">
              STATIC<span className="text-[#ff6b35]">WEARS</span>
            </Link>
            <p className="font-mono text-xs text-[#444] leading-relaxed mb-6 max-w-xs">
              Premium streetwear from the streets of Sri Lanka.
              Built different. Worn bold. Every drop is limited.
            </p>
            <div className="flex gap-2 flex-wrap">
              {socialItems.map((s) => (
                social[s.key] ? (
                  <a key={s.key} href={social[s.key]} target="_blank" rel="noopener noreferrer" title={s.label}
                    className="w-9 h-9 border border-[#1a1a1a] flex items-center justify-center text-[#444] hover:text-[#ff6b35] hover:border-[#ff6b35]/50 transition-all">
                    {s.icon}
                  </a>
                ) : (
                  <div key={s.key} className="w-9 h-9 border border-[#1e1e1e] flex items-center justify-center text-[#222]">
                    {s.icon}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="col-span-1 md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5">Shop</div>
            <div className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <Link key={link.href} href={link.href} className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="col-span-1 md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5">Help</div>
            <div className="flex flex-col gap-3">
              {helpLinks.map((link) => (
                <Link key={link.href} href={link.href} className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5">Legal</div>
            <div className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#111] pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="font-mono text-[10px] text-[#333]">© 2026 Static Wears · All rights reserved</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#333]">Made in Sri Lanka 🇱🇰</span>
            <span className="h-3 w-px bg-[#1a1a1a]" />
            <span className="font-mono text-[10px] text-[#ff6b35]">HND Project 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
