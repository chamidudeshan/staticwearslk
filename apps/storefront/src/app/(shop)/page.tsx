import { getProducts, getCategories } from '@static-wears/product-service';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { HeroSection } from '@/components/layout/hero-section';
import { BannerSlider, type SliderBanner } from '@/components/layout/banner-slider';
import { MarqueeStrip } from '@/components/layout/marquee-strip';
import { FeaturedProducts } from '@/components/product/featured-products';
import { CategoryShowcase } from '@/components/product/category-showcase';

export const revalidate = 60;

async function getActiveBanners(): Promise<SliderBanner[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('banners')
      .select('id, image_url, title, subtitle, cta_text, cta_link')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at');
    return (data ?? []) as SliderBanner[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, categories, banners] = await Promise.all([
    getProducts({ limit: 8, sort: 'newest' }),
    getCategories(),
    getActiveBanners(),
  ]);

  return (
    <>
      {banners.length > 0 ? <BannerSlider banners={banners} /> : <HeroSection />}
      <MarqueeStrip />
      <FeaturedProducts products={products} />
      <CategoryShowcase categories={categories} />
      <BrandManifesto />
    </>
  );
}

function BrandManifesto() {
  return (
    <section className="relative overflow-hidden border-t border-[#1a1a1a] py-32">
      {/* Background text */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-display text-[20vw] text-[#0f0f0f] leading-none tracking-tight whitespace-nowrap"
        >
          STATIC
        </span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#ff6b35] block mb-8">
          — Our Story —
        </span>
        <p className="font-display text-[clamp(2.5rem,6vw,5rem)] text-white leading-[1] mb-8 tracking-tight">
          NOT JUST CLOTHES.
          <br />
          <span className="text-[#ff6b35]">A STATEMENT.</span>
        </p>
        <p className="font-mono text-[#555] text-sm leading-relaxed max-w-xl mx-auto mb-12">
          Static Wears was born in the streets of Colombo. Every piece is designed
          to carry the energy of Sri Lanka — raw, bold, and unapologetically real.
          Limited runs. No restocks. Own it before it's gone.
        </p>
        <a
          href="/shop"
          className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]
                     text-[#ff6b35] border border-[#ff6b35]/30 px-8 py-3
                     hover:bg-[#ff6b35] hover:text-black transition-all duration-300"
        >
          Browse Collection
        </a>
      </div>
    </section>
  );
}
