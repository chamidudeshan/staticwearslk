import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { requireAdmin } from '@/lib/require-admin';
import { deleteProduct, updateProduct, getProductById } from '@static-wears/product-service';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const product = await getProductById(params.id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const result = await deleteProduct(params.id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { variants, images_to_add, images_to_delete, main_image_id, ...productFields } = body;

  const result = await updateProduct(params.id, {
    ...productFields,
    images_to_add,
    images_to_delete,
    main_image_id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  if (Array.isArray(variants)) {
    const supabase = createSupabaseAdminClient();
    const toDelete = variants
      .filter((v: { id?: string; _deleted?: boolean }) => v.id && v._deleted)
      .map((v: { id: string }) => v.id);
    const toUpsert = variants
      .filter((v: { _deleted?: boolean }) => !v._deleted)
      .map(({ _deleted, ...v }: { _deleted?: boolean; [k: string]: unknown }) => ({
        ...v,
        product_id: params.id,
      }));

    if (toDelete.length) {
      await supabase.from('product_variants').delete().in('id', toDelete);
    }
    if (toUpsert.length) {
      await supabase.from('product_variants').upsert(toUpsert, { onConflict: 'id' });
    }
  }

  return NextResponse.json({ success: true });
}
