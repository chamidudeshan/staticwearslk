import { createSupabaseServerClient } from '@static-wears/shared';
import type { Profile, UserAddress } from '@static-wears/shared';

export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { error: error?.message ?? null };
}

export async function addAddress(
  data: Omit<UserAddress, 'id' | 'created_at'>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (data.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', data.user_id);
  }
  const { error } = await supabase
    .from('user_addresses')
    .insert(data);
  return { error: error?.message ?? null };
}

export async function deleteAddress(
  addressId: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}
