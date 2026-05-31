import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createProduct } from '@static-wears/product-service';

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, base_price, status, brand_id, category_ids, variants, images } = body;

  if (!name || !base_price) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const { product, error } = await createProduct({
    name,
    description,
    base_price: Number(base_price),
    status: status ?? 'active',
    brand_id: brand_id || undefined,
    category_ids: category_ids || [],
    variants: variants || [],
    images: images || [],
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ product }, { status: 201 });
}
