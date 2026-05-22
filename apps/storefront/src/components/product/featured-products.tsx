'use client';

import { motion } from 'framer-motion';
import type { Product } from '@static-wears/shared';
import { ProductCard } from './product-card';
import Link from 'next/link';

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between mb-12 gap-4"
      >
        <div>
          <span className="font-mono text-[10px] text-[#ff6b35] uppercase tracking-[0.5em] block mb-3">
            Just Dropped
          </span>
          <h2 className="font-display text-5xl md:text-6xl text-white leading-none">
            FEATURED
          </h2>
        </div>
        <Link
          href="/shop"
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]
                     text-[#555] hover:text-[#ff6b35] transition-colors shrink-0 pb-1"
        >
          View All
          <motion.span
            className="inline-block"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        </Link>
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[#1a1a1a]">
          <p className="font-mono text-[#333] text-xs uppercase tracking-widest">
            No products yet — run the seed SQL to load demo data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]
                       text-[#888] border border-[#2a2a2a] px-10 py-4
                       hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all duration-300"
          >
            All {products.length}+ Products →
          </Link>
        </motion.div>
      )}
    </section>
  );
}
