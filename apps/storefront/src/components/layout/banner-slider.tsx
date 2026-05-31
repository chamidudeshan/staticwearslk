'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SliderBanner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
}

const INTERVAL = 6000;

export function BannerSlider({ banners }: { banners: SliderBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const go = useCallback((idx: number) => {
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => go((current + 1) % banners.length), [current, banners.length, go]);
  const prev = useCallback(() => go((current - 1 + banners.length) % banners.length), [current, banners.length, go]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const t = setTimeout(next, INTERVAL);
    return () => clearTimeout(t);
  }, [paused, banners.length, next, current]);

  if (banners.length === 0) return null;
  const banner = banners[current];

  return (
    <section
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#080808]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — fade crossfade */}
      {banners.map((b, i) => (
        <div key={b.id} className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
          <Image src={b.image_url} alt={b.title ?? 'Banner'} fill priority={i === 0}
            className="object-cover" sizes="100vw" />
          {/* Layered overlays for depth */}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080808]/80 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <div key={animKey} style={{ animation: 'bannerFadeUp 0.7s ease-out both' }}>
          {/* Badge */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <span className="h-px w-8 sm:w-12 bg-[#ff6b35]/60" />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-[#ff6b35]">
              Static Wears
            </span>
            <span className="h-px w-8 sm:w-12 bg-[#ff6b35]/60" />
          </div>

          {/* Heading */}
          {banner.title ? (
            <h1 className="font-display text-white leading-[0.88] tracking-tight mb-4 sm:mb-6"
              style={{ fontSize: 'clamp(3rem,11vw,9rem)' }}>
              {banner.title}
            </h1>
          ) : (
            <div className="font-display leading-[0.85] tracking-tight text-white mb-4 sm:mb-6"
              style={{ fontSize: 'clamp(4rem,14vw,13rem)' }}>
              <div>STATIC</div>
              <div className="text-[#ff6b35]">WEARS</div>
            </div>
          )}

          {/* Subtitle */}
          {banner.subtitle ? (
            <p className="font-mono text-[#ccc] text-xs sm:text-sm tracking-[0.25em] mb-8 sm:mb-10 max-w-lg mx-auto">
              {banner.subtitle.toUpperCase()}
            </p>
          ) : (
            <p className="font-mono text-[#666] text-xs sm:text-sm tracking-[0.2em] mb-8 sm:mb-10">
              PREMIUM STREETWEAR · BORN IN SRI LANKA · BUILT DIFFERENT
            </p>
          )}

          {/* CTA */}
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
            <Link href={banner.cta_link ?? '/shop'}
              className="group relative bg-[#ff6b35] text-black font-mono font-bold
                         px-8 sm:px-10 py-3.5 sm:py-4 tracking-[0.2em] text-xs uppercase overflow-hidden
                         transition-transform hover:scale-[1.03] active:scale-95">
              <span className="relative z-10">{(banner.cta_text ?? 'SHOP NOW').toUpperCase()}</span>
              <span className="absolute inset-0 bg-[#e8ff59] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all duration-200">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all duration-200">
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dot nav */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 ${
                i === current
                  ? 'w-7 sm:w-8 h-1.5 bg-[#ff6b35]'
                  : 'w-1.5 h-1.5 rounded-full bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {banners.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/10">
          <div key={`${current}-${animKey}`} className="h-full bg-[#ff6b35] origin-left"
            style={{ animation: `progressBar ${INTERVAL}ms linear forwards` }} />
        </div>
      )}

      {/* Corner accents */}
      <div className="absolute top-20 left-5 w-6 h-6 sm:w-8 sm:h-8 border-l border-t border-[#ff6b35]/25 pointer-events-none z-10" />
      <div className="absolute top-20 right-5 w-6 h-6 sm:w-8 sm:h-8 border-r border-t border-[#ff6b35]/25 pointer-events-none z-10" />
      <div className="absolute bottom-16 left-5 w-6 h-6 sm:w-8 sm:h-8 border-l border-b border-[#ff6b35]/25 pointer-events-none z-10" />
      <div className="absolute bottom-16 right-5 w-6 h-6 sm:w-8 sm:h-8 border-r border-b border-[#ff6b35]/25 pointer-events-none z-10" />

      <style>{`
        @keyframes bannerFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
