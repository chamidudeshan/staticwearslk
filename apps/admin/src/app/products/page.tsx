import { getAllProductsAdmin } from '@static-wears/product-service';
import { Header } from '@/components/layout/header';
import { ProductsTable } from '@/components/products/products-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div>
      <Header
        title="Products"
        subtitle={`${products.length} products`}
      />
      <ProductsTable products={products} />
    </div>
  );
}
