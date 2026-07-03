import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import type { Order } from '@static-wears/shared';

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();
  return data ?? null;
}

export async function getOrderByIdAdmin(orderId: string): Promise<Order | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();
  return data ?? null;
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  return data ?? [];
}
