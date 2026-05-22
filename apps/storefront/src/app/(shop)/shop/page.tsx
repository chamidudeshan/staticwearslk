import { getProducts, getCategories } from '@static-wears/product-service';
import { ProductCard } from '@/components/product/product-card';
import { PageTransition } from '@/components/ui/page-transition';

export const revalidate = 60;

interface ShopPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, categories] = await Promise.all([
    getProducts({
      sort: searchParams.sort ?? 'newest',
      search: searchParams.search,
      limit: 24,
    }),
    getCategories(),
  ]);

  const activeSort = searchParams.sort ?? 'newest';
  const activeCategory = searchParams.category ?? '';

  return (
    <PageTransition>
      <div className="min-h-screen pt-16">
        {/* Hero banner */}
        <div className="relative border-b border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-end pr-8 overflow-hidden" aria-hidden>
            <span className="font-display text-[18vw] text-[#0f0f0f] leading-none whitespace-nowrap">
              SHOP
            </span>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#ff6b35] block mb-4">
              {activeCategory ? categories.find(c => c.slug === activeCategory)?.name ?? 'Category' : 'All Products'}
            </span>
            <h1 className="font-display text-6xl md:text-8xl text-white leading-none mb-4">
              {activeCategory
                ? (categories.find(c => c.slug === activeCategory)?.name ?? 'Shop').toUpperCase()
                : 'SHOP ALL'}
            </h1>
            <p className="font-mono text-sm text-[#444]">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar */}
            <aside className="w-full md:w-52 shrink-0">
              <div className="sticky top-24 space-y-10">
                {/* Categories */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#1a1a1a]" />
                    Category
                    <span className="h-px flex-1 bg-[#1a1a1a]" />
                  </h3>
                  <div className="flex flex-col gap-1">
                    <a
                      href="/shop"
                      className={`font-mono text-xs uppercase tracking-wider py-1.5 px-3 transition-all duration-200 ${
                        !activeCategory
                          ? 'text-[#ff6b35] bg-[#ff6b35]/8 border-l-2 border-[#ff6b35]'
                          : 'text-[#555] hover:text-[#ff6b35] border-l-2 border-transparent hover:border-[#ff6b35]/40'
                      }`}
                    >
                      All Products
                    </a>
                    {categories.map((cat) => (
                      <a
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        className={`font-mono text-xs uppercase tracking-wider py-1.5 px-3 transition-all duration-200 ${
                          activeCategory === cat.slug
                            ? 'text-[#ff6b35] bg-[#ff6b35]/8 border-l-2 border-[#ff6b35]'
                            : 'text-[#555] hover:text-[#ff6b35] border-l-2 border-transparent hover:border-[#ff6b35]/40'
                        }`}
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#333] mb-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#1a1a1a]" />
                    Sort
                    <span className="h-px flex-1 bg-[#1a1a1a]" />
                  </h3>
                  <div className="flex flex-col gap-1">
                    {[
                      { value: 'newest', label: 'Newest' },
                      { value: 'price_asc', label: 'Price: Low → High' },
                      { value: 'price_desc', label: 'Price: High → Low' },
                    ].map((opt) => (
                      <a
                        key={opt.value}
                        href={`/shop?sort=${opt.value}${activeCategory ? `&category=${activeCategory}` : ''}`}
                        className={`font-mono text-xs uppercase tracking-wider py-1.5 px-3 transition-all duration-200 ${
                          activeSort === opt.value
                            ? 'text-[#ff6b35] bg-[#ff6b35]/8 border-l-2 border-[#ff6b35]'
                            : 'text-[#555] hover:text-[#ff6b35] border-l-2 border-transparent hover:border-[#ff6b35]/40'
                        }`}
                      >
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
                <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
                  <span className="font-display text-6xl text-[#111] block mb-4">EMPTY</span>
                  <p className="font-mono text-[#333] text-xs uppercase tracking-widest">
                    No products found in this collection
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
