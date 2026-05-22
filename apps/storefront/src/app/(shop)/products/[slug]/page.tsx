import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@static-wears/product-service';
import { ProductDetailClient } from './product-detail-client';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts({ limit: 50 });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getProducts({ limit: 4 });
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} related={relatedProducts} />;
}
