import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import { getProfile } from '@static-wears/user-service';
import { updateOrderStatus, getOrderByIdAdmin } from '@static-wears/order-service';
import { sendShippingUpdate } from '@static-wears/email-service';
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
  const adminUser = await requireAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await req.json();
  const result = await updateOrderStatus(params.id, status as OrderStatus);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  const order = await getOrderByIdAdmin(params.id);
  if (order) {
    const supabase = createSupabaseAdminClient();
    const { data: authUser } = await supabase.auth.admin.getUserById(order.customer_id);
    const email = authUser?.user?.email;
    const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', order.customer_id).single();
    if (email) {
      sendShippingUpdate({
        to: email,
        customerName: profileData?.full_name ?? 'Customer',
        orderId: order.id,
        status: status.charAt(0).toUpperCase() + status.slice(1),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
