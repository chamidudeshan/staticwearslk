import { getProducts, getCategories } from '@static-wears/product-service';
import { ProductCard } from '@/components/product/product-card';
import { PageTransition } from '@/components/ui/page-transition';
import Link from 'next/link';

export const revalidate = 60;

interface ShopPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
  };
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, categories] = await Promise.all([
    getProducts({
      sort: searchParams.sort ?? 'newest',
      search: searchParams.search,
      category: searchParams.category,
      limit: 24,
    }),
    getCategories(),
  ]);

  const activeSort = searchParams.sort ?? 'newest';
  const activeCategory = searchParams.category ?? '';
  const activeCategoryName = categories.find(c => c.slug === activeCategory)?.name;

  function sortLink(s: string) {
    return `/shop?sort=${s}${activeCategory ? `&category=${activeCategory}` : ''}`;
  }
  function catLink(slug: string) {
    return slug ? `/shop?category=${slug}${activeSort !== 'newest' ? `&sort=${activeSort}` : ''}` : `/shop${activeSort !== 'newest' ? `?sort=${activeSort}` : ''}`;
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-16 pb-24 md:pb-0">

        {/* Hero */}
        <div className="relative border-b border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-end pr-8 overflow-hidden" aria-hidden>
            <span className="font-display text-[18vw] text-[#0f0f0f] leading-none whitespace-nowrap">SHOP</span>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#ff6b35] block mb-2">
              {activeCategoryName ?? 'All Products'}
            </span>
            <h1 className="font-display text-5xl sm:text-8xl text-white leading-none mb-2">
              {activeCategoryName ? activeCategoryName.toUpperCase() : 'SHOP ALL'}
            </h1>
            <p className="font-mono text-xs text-[#444]">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* ── MOBILE FILTER BAR ── */}
        <div className="md:hidden border-b border-[#1a1a1a] bg-[#080808] sticky top-16 z-30">
          {/* Category chips — horizontal scroll */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
            <Link href={catLink('')}
              className={`shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors whitespace-nowrap ${
                !activeCategory ? 'border-[#ff6b35] text-[#ff6b35] bg-[#ff6b35]/10' : 'border-[#1a1a1a] text-[#555]'
              }`}>
              All
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={catLink(cat.slug)}
                className={`shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors whitespace-nowrap ${
                  activeCategory === cat.slug ? 'border-[#ff6b35] text-[#ff6b35] bg-[#ff6b35]/10' : 'border-[#1a1a1a] text-[#555]'
                }`}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort row */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
            {SORT_OPTIONS.map((opt) => (
              <Link key={opt.value} href={sortLink(opt.value)}
                className={`shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors whitespace-nowrap ${
                  activeSort === opt.value ? 'border-[#ff6b35] text-[#ff6b35]' : 'border-transparent text-[#444]'
                }`}>
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col md:flex-row gap-10">

            {/* Sidebar — desktop only */}
            <aside className="hidden md:block w-52 shrink-0">
              <div className="sticky top-24 space-y-10">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#1a1a1a]" />Category<span className="h-px flex-1 bg-[#1a1a1a]" />
                  </h3>
                  <div className="flex flex-col gap-1">
                    <a href={catLink('')} className={`font-mono text-xs uppercase tracking-wider py-1.5 px-3 transition-all border-l-2 ${!activeCategory ? 'text-[#ff6b35] border-[#ff6b35]' : 'text-[#555] border-transparent hover:text-[#ff6b35] hover:border-[#ff6b35]/40'}`}>
                      All Products
                    </a>
                    {categories.map((cat) => (
                      <a key={cat.id} href={catLink(cat.slug)} className={`font-mono text-xs uppercase tracking-wider py-1.5 px-3 transition-all border-l-2 ${activeCategory === cat.slug ? 'text-[#ff6b35] border-[#ff6b35]' : 'text-[#555] border-transparent hover:text-[#ff6b35] hover:border-[#ff6b35]/40'}`}>
                        {cat.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#1a1a1a]" />Sort<span className="h-px flex-1 bg-[#1a1a1a]" />
                  </h3>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map((opt) => (
                      <a key={opt.value} href={sortLink(opt.value)} className={`font-mono text-xs uppercase tracking-wider py-1.5 px-3 transition-all border-l-2 ${activeSort === opt.value ? 'text-[#ff6b35] border-[#ff6b35]' : 'text-[#555] border-transparent hover:text-[#ff6b35] hover:border-[#ff6b35]/40'}`}>
                        {opt.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {products.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-[#1a1a1a]">
                  <span className="font-display text-5xl text-[#111] block mb-3">EMPTY</span>
                  <p className="font-mono text-[#333] text-xs uppercase tracking-widest">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
