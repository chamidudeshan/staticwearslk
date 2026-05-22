'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Category } from '@static-wears/shared';

const CATEGORY_ICONS: Record<string, string> = {
  't-shirts': '👕',
  hoodies: '🧥',
  caps: '🧢',
  accessories: '🎒',
};

export function CategoryBar({ categories }: { categories: Category[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/shop"
          className="font-mono text-xs uppercase tracking-widest px-5 py-2.5
                     border border-[#2a2a2a] text-[#888]
                     hover:border-[#ff6b35] hover:text-[#ff6b35]
                     transition-all duration-200"
        >
          All
        </Link>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/shop?category=${cat.slug}`}
              className="font-mono text-xs uppercase tracking-widest px-5 py-2.5
                         border border-[#2a2a2a] text-[#888]
                         hover:border-[#ff6b35] hover:text-[#ff6b35]
                         transition-all duration-200 flex items-center gap-2"
            >
              <span>{CATEGORY_ICONS[cat.slug] ?? '•'}</span>
              {cat.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
