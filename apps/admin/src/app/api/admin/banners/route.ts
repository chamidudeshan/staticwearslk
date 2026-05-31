import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { requireAdmin } from '@/lib/require-admin';

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('banners').select('*').order('sort_order').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { image_url, title, subtitle, cta_text, cta_link, sort_order } = body;
  if (!image_url) return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('banners')
    .insert({ image_url, title, subtitle, cta_text, cta_link, sort_order: sort_order ?? 0 })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
