import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('site_settings').select('*');
  const settings: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => { settings[row.key] = row.value; });
  return NextResponse.json(settings);
}
