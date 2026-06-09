import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080808]">

      {/* ── Left brand panel ── */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-[#0a0a0a] border-r border-[#111] overflow-hidden">
        {/* Background giant text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
          <span className="font-display text-[22vw] text-[#0f0f0f] leading-none tracking-tight whitespace-nowrap">
            SW
          </span>
        </div>

        {/* Top logo */}
        <Link href="/" className="relative z-10 font-display text-3xl text-white tracking-tight">
          STATIC<span className="text-[#ff6b35]">WEARS</span>
        </Link>

        {/* Centre content */}
        <div className="relative z-10 space-y-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#ff6b35] block mb-4">
              — Drop Culture Sri Lanka —
            </span>
            <h2 className="font-display text-[clamp(2.5rem,4vw,4rem)] text-white leading-[0.9] tracking-tight">
              DROP.
              <br />
              COLLECT.
              <br />
              <span className="text-[#ff6b35]">WEAR.</span>
            </h2>
          </div>

          <p className="font-mono text-[#444] text-sm leading-relaxed max-w-xs">
            Premium streetwear born in Colombo. Limited runs, no restocks.
            Every piece is a statement.
          </p>

          <div className="space-y-3">
            {[
              'Limited edition drops',
              'Exclusive member early access',
              'Order tracking & history',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-1 h-1 bg-[#ff6b35] rounded-full shrink-0" />
                <span className="font-mono text-xs text-[#555] uppercase tracking-wider">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <span className="font-mono text-[10px] text-[#2a2a2a] uppercase tracking-widest">
            staticwears.com · Sri Lanka
          </span>
        </div>

        {/* Orange corner accent */}
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#ff6b35]/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#ff6b35]/10 pointer-events-none" />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile logo */}
        <div className="md:hidden p-6 border-b border-[#111]">
          <Link href="/" className="font-display text-2xl text-white">
            STATIC<span className="text-[#ff6b35]">WEARS</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        <div className="p-6 text-center border-t border-[#0f0f0f]">
          <span className="font-mono text-[10px] text-[#222] uppercase tracking-widest">
            © 2026 Static Wears · All rights reserved
          </span>
        </div>
      </div>
    </div>
  );
}
