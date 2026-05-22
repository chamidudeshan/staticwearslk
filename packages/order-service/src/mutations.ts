import { createSupabaseAdminClient } from '@static-wears/shared';
import { decreaseStock } from '@static-wears/product-service';
import type { Order, CartItem } from '@static-wears/shared';

export async function createOrder(data: {
  customer_id: string;
  items: CartItem[];
  shipping: { name: string; phone: string; address: string };
  notes?: string;
}): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const total_amount = data.items.reduce(
    (sum, i) => sum + i.unit_price * i.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      total_amount,
      shipping_name: data.shipping.name,
      shipping_phone: data.shipping.phone,
      shipping_addr: data.shipping.address,
      notes: data.notes,
    })
    .select()
    .single();

  if (orderError || !order)
    return {
      order: null,
      error: orderError?.message ?? 'Failed to create order',
    };

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    variant_desc: item.variant_desc,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) return { order: null, error: itemsError.message };

  for (const item of data.items) {
    if (item.variant_id) {
      const { error: stockError } = await decreaseStock(
        item.variant_id,
        item.quantity
      );
      if (stockError) {
        await updateOrderStatus(order.id, 'cancelled');
        return { order: null, error: `Stock error: ${stockError}` };
      }
    }
  }

  return { order, error: null };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  return { error: error?.message ?? null };
}
