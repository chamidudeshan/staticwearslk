import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ext = req.nextUrl.searchParams.get('ext') ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from('product-images')
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create upload URL' }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);

  // Replace internal Docker URL with public URL so the browser can reach it
  const internalUrl = process.env.SUPABASE_INTERNAL_URL ?? '';
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const signedUrl = internalUrl
    ? data.signedUrl.replace(internalUrl, publicUrl)
    : data.signedUrl;
  const url = internalUrl
    ? pub.publicUrl.replace(internalUrl, publicUrl)
    : pub.publicUrl;

  return NextResponse.json({ signedUrl, path, url });
}
