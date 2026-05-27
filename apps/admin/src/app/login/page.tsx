'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';

type View = 'login' | 'forgot' | 'reset';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Sign-in incomplete. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.');
    }
    setLoading(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      setView('reset');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Could not complete reset. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code or password.');
    }
    setLoading(false);
  }

  const inputClass =
    'w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors';
  const labelClass = 'font-mono text-xs uppercase tracking-widest text-[#666]';

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">
            Admin Portal
          </div>
          <h1 className="text-3xl font-bold text-[#e8e8f0]">Static Wears</h1>
        </div>

        <div className="bg-[#0e0e12] border border-[#1e1e28] p-8 space-y-5">
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@staticwears.lk"
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="font-mono text-[10px] text-[#555] hover:text-[#ff6b35] transition-colors uppercase tracking-widest"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                />
              </div>
              {error && (
                <p className="font-mono text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest py-3.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="font-mono text-xs text-[#555]">Enter your email and we&apos;ll send a reset code.</p>
              <div className="space-y-1.5">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@staticwears.lk"
                  className={inputClass}
                  required
                />
              </div>
              {error && (
                <p className="font-mono text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest py-3.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); }}
                className="w-full font-mono text-xs text-[#555] hover:text-[#e8e8f0] transition-colors"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="font-mono text-xs text-[#555]">Check your email for the 6-digit code.</p>
              <div className="space-y-1.5">
                <label className={labelClass}>Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                  minLength={8}
                />
              </div>
              {error && (
                <p className="font-mono text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest py-3.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Set New Password'}
              </button>
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(''); }}
                className="w-full font-mono text-xs text-[#555] hover:text-[#e8e8f0] transition-colors"
              >
                ← Resend code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
