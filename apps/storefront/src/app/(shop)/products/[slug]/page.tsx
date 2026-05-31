import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@static-wears/product-service';
import { ProductDetailClient } from './product-detail-client';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getProducts({ limit: 4 });
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} related={relatedProducts} />;
}
