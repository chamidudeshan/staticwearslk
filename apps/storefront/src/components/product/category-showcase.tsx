'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Category } from '@static-wears/shared';

const CATEGORY_CONFIG: Record<string, { color: string; accent: string; img: string; label: string }> = {
  't-shirts': {
    color: '#ff6b35',
    accent: 'rgba(255,107,53,0.15)',
    img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    label: 'Tee Season',
  },
  'hoodies': {
    color: '#e8ff59',
    accent: 'rgba(232,255,89,0.1)',
    img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    label: 'Winter 2026',
  },
  'caps': {
    color: '#888',
    accent: 'rgba(136,136,136,0.1)',
    img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
    label: 'Top it off',
  },
  'accessories': {
    color: '#ff6b35',
    accent: 'rgba(255,107,53,0.12)',
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    label: 'Complete the fit',
  },
};

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="font-mono text-[10px] text-[#ff6b35] uppercase tracking-[0.5em] block mb-3">
          Browse by Category
        </span>
        <h2 className="font-display text-5xl md:text-6xl text-white">SHOP THE DROP</h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
        {categories.slice(0, 4).map((cat, i) => {
          const cfg = CATEGORY_CONFIG[cat.slug] ?? {
            color: '#ff6b35',
            accent: 'rgba(255,107,53,0.12)',
            img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
            label: cat.name,
          };

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/shop?category=${cat.slug}`}>
                <div className="relative aspect-[3/4] bg-[#111] overflow-hidden group cursor-pointer">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url('${cfg.img}')` }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />
                  {/* Accent gradient */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at bottom left, ${cfg.accent}, transparent 60%)`,
                    }}
                  />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.4em] mb-2 border px-2 py-0.5 w-fit"
                      style={{ color: cfg.color, borderColor: `${cfg.color}40` }}
                    >
                      {cfg.label}
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl text-white leading-tight tracking-tight">
                      {cat.name.toUpperCase()}
                    </h3>
                    <motion.div
                      className="h-[1px] mt-3 origin-left"
                      style={{ backgroundColor: cfg.color }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                    />
                    <span
                      className="font-mono text-[10px] tracking-widest uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: cfg.color }}
                    >
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
