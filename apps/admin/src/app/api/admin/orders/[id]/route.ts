import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@static-wears/shared';
import { getProfile } from '@static-wears/user-service';
import { updateOrderStatus } from '@static-wears/order-service';
import type { OrderStatus } from '@static-wears/shared';

async function requireAdmin(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await req.json();
  const result = await updateOrderStatus(params.id, status as OrderStatus);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
