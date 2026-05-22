import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MarqueeBanner } from '@/components/layout/marquee-banner';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <MarqueeBanner />
      <Footer />
    </>
  );
}
