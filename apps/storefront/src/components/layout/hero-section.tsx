import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* Animated orbs */}
        <div
          className="absolute left-1/4 top-1/3 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b35] blur-[120px]"
          style={{ animation: 'orb-pulse 7s ease-in-out infinite' }}
        />
        <div
          className="absolute right-1/4 bottom-1/3 w-[360px] h-[360px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#e8ff59] blur-[100px]"
          style={{ animation: 'orb-drift 10s ease-in-out infinite 2s' }}
        />

        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-hero" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M 72 0 L 0 0 0 72" fill="none" stroke="#ff6b35" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-hero)" />
        </svg>

        {/* Vignette + fades */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#080808_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080808] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#080808] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="h-px w-12 bg-[#ff6b35]/50" />
          <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#ff6b35]">
            New Collection 2026
          </span>
          <span className="h-px w-12 bg-[#ff6b35]/50" />
        </div>

        <div className="font-display leading-[0.85] tracking-tight text-white"
          style={{ fontSize: 'clamp(4.5rem,15vw,14rem)' }}
        >
          <div>STATIC</div>
          <div className="text-[#ff6b35]">WEARS</div>
        </div>

        <p className="font-mono text-[#666] text-sm tracking-[0.2em] mt-8 mb-12">
          PREMIUM STREETWEAR · BORN IN SRI LANKA · BUILT DIFFERENT
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/shop"
            className="group relative bg-[#ff6b35] text-black font-mono font-bold
                       px-10 py-4 tracking-[0.2em] text-xs uppercase overflow-hidden
                       transition-transform hover:scale-[1.03] active:scale-95"
          >
            <span className="relative z-10">SHOP NOW</span>
            <span className="absolute inset-0 bg-[#e8ff59] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          </Link>
          <Link
            href="/shop?sort=newest"
            className="font-mono text-xs uppercase tracking-[0.2em] px-10 py-4
                       border border-[#2a2a2a] text-[#666]
                       hover:border-[#ff6b35]/60 hover:text-[#ff6b35] transition-all duration-300"
          >
            NEW DROPS
          </Link>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-20 left-6 w-8 h-8 border-l border-t border-[#ff6b35]/20 pointer-events-none" />
      <div className="absolute top-20 right-6 w-8 h-8 border-r border-t border-[#ff6b35]/20 pointer-events-none" />
      <div className="absolute bottom-20 left-6 w-8 h-8 border-l border-b border-[#ff6b35]/20 pointer-events-none" />
      <div className="absolute bottom-20 right-6 w-8 h-8 border-r border-b border-[#ff6b35]/20 pointer-events-none" />
    </section>
  );
}
