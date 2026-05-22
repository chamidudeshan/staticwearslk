import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCategories } from '@static-wears/product-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const products = await getProducts({
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    sort: (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc') ?? 'newest',
    limit: Number(searchParams.get('limit') ?? 20),
    offset: Number(searchParams.get('offset') ?? 0),
  });
  return NextResponse.json({ products });
}
