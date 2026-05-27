'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace('/login');
    }
  }, [isLoaded, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await user!.updatePassword({ newPassword: password, signOutOfOtherSessions: false });
      setDone(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password.');
    }
    setLoading(false);
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="font-mono text-xs text-[#444]">Loading...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="font-mono text-sm text-[#e8ff59]">Password set successfully.</p>
          <p className="font-mono text-xs text-[#555]">Redirecting you to the store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="font-display text-5xl text-white mb-2">SET PASSWORD</h1>
          <p className="font-mono text-sm text-[#555]">
            You&apos;re signed in as <span className="text-[#f0f0f0]">{user.emailAddresses[0]?.emailAddress}</span>.
            Choose a new password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
              className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-widest text-[#555]">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              minLength={8}
              required
              className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest py-3.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
