'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type View = 'login' | 'forgot' | 'reset';

export default function LoginPage() {
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
        router.push('/');
        router.refresh();
      } else {
        setError('Sign-in incomplete. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
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
        router.push('/');
        router.refresh();
      } else {
        setError('Could not complete reset. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code or password.');
    }
    setLoading(false);
  }

  if (view === 'forgot') {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="font-display text-5xl text-white mb-2">RESET</h1>
          <p className="font-mono text-sm text-[#555]">Enter your email and we&apos;ll send a code.</p>
        </div>

        <form onSubmit={handleForgot} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-12" disabled={loading || !isLoaded}>
            {loading ? 'Sending...' : 'Send Code'}
          </Button>
        </form>

        <button
          onClick={() => { setView('login'); setError(''); }}
          className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors mt-8 block"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  if (view === 'reset') {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="font-display text-5xl text-white mb-2">NEW PASSWORD</h1>
          <p className="font-mono text-sm text-[#555]">Check your email for the 6-digit code.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-12" disabled={loading || !isLoaded}>
            {loading ? 'Resetting...' : 'Set New Password'}
          </Button>
        </form>

        <button
          onClick={() => { setView('forgot'); setError(''); }}
          className="font-mono text-xs text-[#555] hover:text-[#ff6b35] transition-colors mt-8 block"
        >
          ← Resend code
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10">
        <h1 className="font-display text-5xl text-white mb-2">SIGN IN</h1>
        <p className="font-mono text-sm text-[#555]">Welcome back, drop in.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => { setView('forgot'); setError(''); }}
              className="font-mono text-[10px] text-[#555] hover:text-[#ff6b35] transition-colors uppercase tracking-widest"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-12" disabled={loading || !isLoaded}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="font-mono text-xs text-[#555] mt-8 text-center">
        No account?{' '}
        <Link href="/register" className="text-[#ff6b35] hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
