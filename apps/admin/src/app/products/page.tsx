import { getAllProductsAdmin } from '@static-wears/product-service';
import { Header } from '@/components/layout/header';
import { ProductsTable } from '@/components/products/products-table';

export const revalidate = 30;

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
