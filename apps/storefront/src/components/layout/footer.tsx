import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#060606] mt-24 relative overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display text-[22vw] text-[#0a0a0a] leading-none tracking-tight whitespace-nowrap">
          SW
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="font-display text-4xl text-white block mb-5">
              STATIC<span className="text-[#ff6b35]">WEARS</span>
            </Link>
            <p className="font-mono text-xs text-[#444] leading-relaxed max-w-xs mb-8">
              Premium streetwear from the streets of Sri Lanka.
              Built different. Worn bold. Every drop is limited — don&apos;t sleep.
            </p>
            <div className="flex gap-2">
              {[
                { label: 'IG', href: '#' },
                { label: 'TT', href: '#' },
                { label: 'FB', href: '#' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="font-mono text-[10px] text-[#444] hover:text-[#ff6b35] hover:border-[#ff6b35]/50
                             transition-all duration-200 border border-[#1a1a1a] px-4 py-2 tracking-widest"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-6">Shop</div>
            <div className="flex flex-col gap-3">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?category=t-shirts', label: 'T-Shirts' },
                { href: '/shop?category=hoodies', label: 'Hoodies' },
                { href: '/shop?category=caps', label: 'Caps' },
                { href: '/shop?category=accessories', label: 'Accessories' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help links */}
          <div className="md:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-6">Account & Help</div>
            <div className="flex flex-col gap-3">
              {[
                { href: '/account', label: 'My Account' },
                { href: '/orders', label: 'Track Order' },
                { href: '#', label: 'Size Guide' },
                { href: '#', label: 'Returns & Exchanges' },
                { href: '#', label: 'Contact Us' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-4">Stay in the loop</div>
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-[#0e0e0e] border border-[#1a1a1a] text-[#888] font-mono text-xs px-3 py-2.5
                             placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35]/50 transition-colors"
                />
                <button className="bg-[#ff6b35] text-black font-mono text-[10px] tracking-widest uppercase px-4 py-2.5 hover:bg-[#e8ff59] transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#111] pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="font-mono text-[10px] text-[#333]">
            © 2026 Static Wears · All rights reserved
          </span>
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
