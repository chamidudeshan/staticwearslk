import { supabase } from '@/lib/supabase-client';

export function subscribeToOrder(
  orderId: string,
  onStatusChange: (status: string) => void
) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onStatusChange((payload.new as { status: string }).status);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToProductStock(
  productId: string,
  onStockChange: (variant: Record<string, unknown>) => void
) {
  const channel = supabase
    .channel(`stock-${productId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'product_variants',
        filter: `product_id=eq.${productId}`,
      },
      (payload) => {
        onStockChange(payload.new as Record<string, unknown>);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
