import { getAllOrders } from '@static-wears/order-service';
import { Header } from '@/components/layout/header';
import { OrdersTable } from '@/components/orders/orders-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrdersPage() {
  const orders = await getAllOrders();
  return (
    <div>
      <Header title="Orders" subtitle={`${orders.length} total orders`} />
      <OrdersTable orders={orders} />
    </div>
  );
}
