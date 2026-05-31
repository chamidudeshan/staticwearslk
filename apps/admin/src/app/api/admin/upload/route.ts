import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { requireAdmin } from '@/lib/require-admin';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
