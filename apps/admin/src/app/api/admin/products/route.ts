import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@static-wears/shared';
import { createProduct } from '@static-wears/product-service';

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' ? user : null;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, base_price, brand_id, category_ids, variants } = body;

  if (!name || !base_price) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const { product, error } = await createProduct({
    name,
    description,
    base_price: Number(base_price),
    brand_id: brand_id || undefined,
    category_ids: category_ids || [],
    variants: variants || [],
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ product }, { status: 201 });
}
