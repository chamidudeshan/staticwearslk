import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { requireAdmin } from '@/lib/require-admin';
import { deleteProduct, updateProduct, getProductById } from '@static-wears/product-service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const result = await deleteProduct(id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { variants, images_to_add, images_to_delete, main_image_id, ...productFields } = body;

  const result = await updateProduct(id, {
    ...productFields,
    images_to_add,
    images_to_delete,
    main_image_id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  if (Array.isArray(variants)) {
    const supabase = createSupabaseAdminClient();

    // Delete marked variants
    const toDelete = variants
      .filter((v: { id?: string; _deleted?: boolean }) => v.id && v._deleted)
      .map((v: { id: string }) => v.id);
    if (toDelete.length) {
      await supabase.from('product_variants').delete().in('id', toDelete);
    }

    const active = variants.filter((v: { _deleted?: boolean }) => !v._deleted);

    // Existing variants (have id) → update individually
    const existing = active.filter((v: { id?: string }) => v.id);
    for (const v of existing) {
      const { _deleted, id: vid, ...fields } = v as { _deleted?: boolean; id: string; [k: string]: unknown };
      await supabase.from('product_variants').update(fields).eq('id', vid);
    }

    // New variants (no id) → insert individually so each is independent
    const fresh = active.filter((v: { id?: string }) => !v.id);
    for (const v of fresh) {
      const { _deleted, id: _vid, ...fields } = v as { _deleted?: boolean; id?: string; [k: string]: unknown };
      await supabase.from('product_variants').insert({
        ...fields,
        product_id: id,
      });
    }
  }

  return NextResponse.json({ success: true });
}
