'use client';

import { motion } from 'framer-motion';

const ITEMS_TOP = [
  'STATIC WEARS', '✦', 'SRI LANKA', '✦', 'STREETWEAR', '✦',
  'LIMITED DROPS', '✦', 'BUILT DIFFERENT', '✦', 'WORN BOLD', '✦',
  'STATIC WEARS', '✦', 'SRI LANKA', '✦', 'STREETWEAR', '✦',
  'LIMITED DROPS', '✦', 'BUILT DIFFERENT', '✦', 'WORN BOLD', '✦',
];

const ITEMS_BOTTOM = [
  'NEW COLLECTION 2026', '◆', 'FREE SHIPPING', '◆', 'PREMIUM FABRIC', '◆',
  '100% COTTON', '◆', 'AUTHENTIC', '◆', 'COLOMBO', '◆',
  'NEW COLLECTION 2026', '◆', 'FREE SHIPPING', '◆', 'PREMIUM FABRIC', '◆',
  '100% COTTON', '◆', 'AUTHENTIC', '◆', 'COLOMBO', '◆',
];

function MarqueeRow({
  items,
  reverse = false,
  accent = false,
}: {
  items: string[];
  reverse?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="relative flex overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-6 items-center pr-6"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className={`font-mono text-[11px] uppercase tracking-[0.35em] whitespace-nowrap ${
              item === '✦' || item === '◆'
                ? accent
                  ? 'text-[#e8ff59]'
                  : 'text-[#ff6b35]'
                : 'text-[#333]'
            }`}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function MarqueeStrip() {
  return (
    <div className="border-y border-[#1a1a1a] bg-[#0a0a0a] py-3 overflow-hidden space-y-3">
      <MarqueeRow items={ITEMS_TOP} />
      <MarqueeRow items={ITEMS_BOTTOM} reverse accent />
    </div>
  );
}
