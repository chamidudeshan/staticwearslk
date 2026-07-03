import { createSupabaseAdminClient } from '@static-wears/shared';
import type { Profile, UserAddress } from '@static-wears/shared';

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}
