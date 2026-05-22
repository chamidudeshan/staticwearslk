import { getAllOrders } from '@static-wears/order-service';
import { Header } from '@/components/layout/header';
import { OrdersTable } from '@/components/orders/orders-table';

export const revalidate = 30;

export default async function OrdersPage() {
  const orders = await getAllOrders();
  return (
    <div>
      <Header title="Orders" subtitle={`${orders.length} total orders`} />
      <OrdersTable orders={orders} />
    </div>
  );
}
