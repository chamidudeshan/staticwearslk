'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Link from 'next/link';

const LETTERS_STATIC = 'STATIC'.split('');
const LETTERS_WEARS = 'WEARS'.split('');

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const orbX = useTransform(springX, (v) => v * 0.04);
  const orbY = useTransform(springY, (v) => v * 0.04);

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  const letterVariants = {
    hidden: { opacity: 0, y: 80, rotateX: -40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax bg layer */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {/* Animated grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-hero" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M 72 0 L 0 0 0 72" fill="none" stroke="#ff6b35" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-hero)" />
        </svg>
        {/* Diagonal accent lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="100%" x2="60%" y2="0" stroke="#ff6b35" strokeWidth="1" />
          <line x1="40%" y1="100%" x2="100%" y2="0" stroke="#e8ff59" strokeWidth="0.5" />
        </svg>
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#080808_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080808] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#080808] to-transparent" />
      </motion.div>

      {/* Mouse-tracking orbs */}
      <motion.div
        className="absolute z-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          top: '15%',
          right: '10%',
          x: orbX,
          y: orbY,
          background: 'radial-gradient(circle, rgba(255,107,53,0.14) 0%, transparent 65%)',
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute z-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          bottom: '10%',
          left: '5%',
          x: useTransform(orbX, (v) => -v),
          y: useTransform(orbY, (v) => -v),
          background: 'radial-gradient(circle, rgba(232,255,89,0.07) 0%, transparent 65%)',
        }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Main content */}
      <motion.div
        style={{ opacity, y: textY }}
        className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="h-px w-12 bg-[#ff6b35]/50" />
          <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#ff6b35]">
            New Collection 2026
          </span>
          <span className="h-px w-12 bg-[#ff6b35]/50" />
        </motion.div>

        {/* Letter-by-letter headline */}
        <div className="perspective-[1200px]">
          <div className="font-display leading-[0.85] tracking-tight text-white overflow-hidden"
            style={{ fontSize: 'clamp(4.5rem,15vw,14rem)' }}
          >
            {/* STATIC */}
            <div className="flex justify-center">
              {LETTERS_STATIC.map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate={mounted ? 'visible' : 'hidden'}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            {/* WEARS */}
            <div className="flex justify-center">
              {LETTERS_WEARS.map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i + 6}
                  variants={letterVariants}
                  initial="hidden"
                  animate={mounted ? 'visible' : 'hidden'}
                  className="inline-block text-[#ff6b35]"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Tagline */}
        <motion.p
          className="font-mono text-[#666] text-sm tracking-[0.2em] mt-8 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          PREMIUM STREETWEAR · BORN IN SRI LANKA · BUILT DIFFERENT
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/shop"
            className="group relative bg-[#ff6b35] text-black font-mono font-bold
                       px-10 py-4 tracking-[0.2em] text-xs uppercase overflow-hidden
                       transition-transform hover:scale-[1.03] active:scale-95"
          >
            <span className="relative z-10 group-hover:text-black transition-colors">SHOP NOW</span>
            <span className="absolute inset-0 bg-[#e8ff59] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          </Link>
          <Link
            href="/shop?sort=newest"
            className="font-mono text-xs uppercase tracking-[0.2em] px-10 py-4
                       border border-[#2a2a2a] text-[#666]
                       hover:border-[#ff6b35]/60 hover:text-[#ff6b35]
                       transition-all duration-300"
          >
            NEW DROPS
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="flex items-center justify-center gap-8 mt-14 flex-wrap"
        >
          {[
            { value: '10+', label: 'Products' },
            { value: '4', label: 'Categories' },
            { value: 'LKR', label: 'Currency' },
            { value: 'SL', label: 'Origin' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl text-[#ff6b35]">{stat.value}</div>
              <div className="font-mono text-[10px] text-[#444] uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.div
          className="w-[1px] h-12 origin-top"
          style={{ background: 'linear-gradient(to bottom, #ff6b35, transparent)' }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-mono text-[9px] text-[#333] tracking-[0.5em] uppercase">Scroll</span>
      </motion.div>

      {/* Corner accents */}
      <div className="absolute top-20 left-6 w-8 h-8 border-l border-t border-[#ff6b35]/20 pointer-events-none" />
      <div className="absolute top-20 right-6 w-8 h-8 border-r border-t border-[#ff6b35]/20 pointer-events-none" />
      <div className="absolute bottom-20 left-6 w-8 h-8 border-l border-b border-[#ff6b35]/20 pointer-events-none" />
      <div className="absolute bottom-20 right-6 w-8 h-8 border-r border-b border-[#ff6b35]/20 pointer-events-none" />
    </section>
  );
}
