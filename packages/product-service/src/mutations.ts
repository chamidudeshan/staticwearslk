import { createSupabaseAdminClient } from '@static-wears/shared';
import type { Product, ProductVariant } from '@static-wears/shared';

export async function createProduct(data: {
  name: string;
  description?: string;
  base_price: number;
  brand_id?: string;
  category_ids?: string[];
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>[];
}): Promise<{ product: Product | null; error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const slug =
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString(36);

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      slug,
      description: data.description,
      base_price: data.base_price,
      brand_id: data.brand_id,
    })
    .select()
    .single();

  if (error || !product)
    return { product: null, error: error?.message ?? 'Failed to create' };

  if (data.category_ids?.length) {
    await supabase
      .from('product_categories')
      .insert(
        data.category_ids.map((id) => ({
          product_id: product.id,
          category_id: id,
        }))
      );
  }

  if (data.variants?.length) {
    await supabase
      .from('product_variants')
      .insert(data.variants.map((v) => ({ ...v, product_id: product.id })));
  }

  return { product, error: null };
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    base_price: number;
    status: 'active' | 'inactive' | 'draft';
  }>
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('products')
    .update({ status: 'inactive' })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function updateProductStock(
  variantId: string,
  quantity: number
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('product_variants')
    .update({ stock_qty: quantity })
    .eq('id', variantId);
  return { error: error?.message ?? null };
}

export async function decreaseStock(
  variantId: string,
  quantity: number
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc('decrease_stock', {
    p_variant_id: variantId,
    p_quantity: quantity,
  });
  return { error: error?.message ?? null };
}
