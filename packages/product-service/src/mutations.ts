import { createSupabaseAdminClient } from '@static-wears/shared';
import type { Product, ProductVariant } from '@static-wears/shared';

export async function createProduct(data: {
  name: string;
  description?: string;
  base_price: number;
  status?: 'active' | 'inactive' | 'draft';
  brand_id?: string;
  category_ids?: string[];
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>[];
  images?: { url: string; is_main: boolean; sort_order: number }[];
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
      status: data.status ?? 'active',
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

  if (data.images?.length) {
    await supabase
      .from('product_images')
      .insert(
        data.images.map((img) => ({
          product_id: product.id,
          image_path: img.url,
          is_main: img.is_main,
          sort_order: img.sort_order,
        }))
      );
  }

  return { product, error: null };
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    base_price: number;
    brand_id: string | null;
    category_ids: string[];
    status: 'active' | 'inactive' | 'draft';
    images_to_add: { url: string; is_main: boolean; sort_order: number }[];
    images_to_delete: string[];
    main_image_id: string | null;
  }>
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  const { category_ids, images_to_add, images_to_delete, main_image_id, ...fields } = data;
  const { error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };

  if (category_ids !== undefined) {
    await supabase.from('product_categories').delete().eq('product_id', id);
    if (category_ids.length > 0) {
      await supabase
        .from('product_categories')
        .insert(category_ids.map((cid) => ({ product_id: id, category_id: cid })));
    }
  }

  if (images_to_delete?.length) {
    await supabase.from('product_images').delete().in('id', images_to_delete);
  }

  if (main_image_id) {
    await supabase.from('product_images').update({ is_main: false }).eq('product_id', id);
    await supabase.from('product_images').update({ is_main: true }).eq('id', main_image_id);
  }

  if (images_to_add?.length) {
    await supabase.from('product_images').insert(
      images_to_add.map((img) => ({
        product_id: id,
        image_path: img.url,
        is_main: img.is_main,
        sort_order: img.sort_order,
      }))
    );
  }

  return { error: null };
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
