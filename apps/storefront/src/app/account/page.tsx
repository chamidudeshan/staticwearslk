import { createSupabaseServerClient } from '@static-wears/shared';
import { getProfile } from '@static-wears/user-service';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/account');

  const profile = await getProfile(user.id);

  async function signOut() {
    'use server';
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect('/');
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-6xl text-white mb-10">MY ACCOUNT</h1>

          {/* Profile card */}
          <div className="bg-[#111] border border-[#2a2a2a] p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#ff6b35]/20 border border-[#ff6b35]/30 flex items-center justify-center">
                <span className="font-display text-2xl text-[#ff6b35]">
                  {(profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-mono font-bold text-[#f0f0f0]">
                  {profile?.full_name ?? 'Customer'}
                </p>
                <p className="font-mono text-xs text-[#555]">{user.email}</p>
                {profile?.role === 'admin' && (
                  <span className="font-mono text-[10px] bg-[#ff6b35] text-black px-2 py-0.5 mt-1 inline-block uppercase tracking-widest">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-[#1a1a1a] pt-4">
              <div>
                <p className="text-[#555] uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-[#888]">
                  {profile ? formatDate(profile.created_at) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[#555] uppercase tracking-wider mb-1">Phone</p>
                <p className="text-[#888]">{profile?.phone ?? 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Link
              href="/orders"
              className="bg-[#111] border border-[#2a2a2a] p-5 hover:border-[#ff6b35] transition-colors"
            >
              <p className="font-mono font-bold text-sm text-[#f0f0f0] uppercase tracking-wide mb-1">
                My Orders
              </p>
              <p className="font-mono text-xs text-[#555]">Track & manage orders</p>
            </Link>
            {profile?.role === 'admin' && (
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'}
                className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 p-5 hover:border-[#ff6b35] transition-colors"
              >
                <p className="font-mono font-bold text-sm text-[#ff6b35] uppercase tracking-wide mb-1">
                  Admin Dashboard
                </p>
                <p className="font-mono text-xs text-[#555]">Manage products, orders</p>
              </a>
            )}
          </div>

          {/* Sign out */}
          <form action={signOut}>
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-widest text-[#555] hover:text-red-500 transition-colors border border-[#2a2a2a] px-6 py-3"
            >
              Sign Out
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
