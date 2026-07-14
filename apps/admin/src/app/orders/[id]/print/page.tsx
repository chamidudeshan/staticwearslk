import { getOrderByIdAdmin } from '@static-wears/order-service';
import { notFound } from 'next/navigation';
import { PrintBill } from './print-bill';

export const dynamic = 'force-dynamic';

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderByIdAdmin(id);
  if (!order) notFound();
  return <PrintBill order={order} />;
}
