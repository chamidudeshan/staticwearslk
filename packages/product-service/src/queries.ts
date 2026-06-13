import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import type { Product, Category, Brand } from '@static-wears/shared';

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('status', 'active');

  if (filters?.category) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single();
    if (cats) {
      const { data: joins } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', cats.id);
      const ids = (joins ?? []).map((j: { product_id: string }) => j.product_id);
      if (ids.length === 0) return [];
      query = query.in('id', ids);
    }
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.minPrice !== undefined) {
    query = query.gte('base_price', filters.minPrice);
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('base_price', filters.maxPrice);
  }
  if (filters?.sort === 'price_asc') query = query.order('base_price');
  else if (filters?.sort === 'price_desc')
    query = query.order('base_price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset)
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 20) - 1
    );

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  if (error) return null;
  return data;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('id', id)
    .single();
  if (error || !data) return null;

  const { data: cats } = await supabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', id);

  return { ...data, product_categories: cats ?? [] };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'active')
    .order('name');
  return data ?? [];
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('brands')
    .select('*')
    .order('name');
  return data ?? [];
}
