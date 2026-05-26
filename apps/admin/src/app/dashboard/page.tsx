import { getAllOrders } from '@static-wears/order-service';
import { getAllUsers } from '@static-wears/user-service';
import { getAllProductsAdmin } from '@static-wears/product-service';
import { DashboardStats } from '@/components/dashboard/stats';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { TopProducts } from '@/components/dashboard/top-products';
import { Header } from '@/components/layout/header';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const [orders, users, products] = await Promise.all([
    getAllOrders(),
    getAllUsers(),
    getAllProductsAdmin(),
  ]);

  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((s, o) => s + o.total_amount, 0);

  const stats = {
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: users.length,
    totalProducts: products.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
  };

  return (
    <div className="space-y-8">
      <Header
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      />

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart orders={orders} />
        </div>
        <TopProducts orders={orders} products={products} />
      </div>

      <RecentOrders orders={orders.slice(0, 8)} />
    </div>
  );
}
