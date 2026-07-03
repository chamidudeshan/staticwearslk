import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff6b35] block mb-3">
          Welcome back
        </span>
        <h1 className="font-display text-5xl text-white leading-none mb-2">SIGN IN</h1>
        <p className="font-mono text-sm text-[#444]">
          Drop back in and shop the latest.
        </p>
      </div>

      {/* Clerk form */}
      <SignIn
        fallbackRedirectUrl="/"
        appearance={{
          variables: {
            colorPrimary: '#ff6b35',
            colorBackground: '#0d0d0d',
            colorInputBackground: '#111',
            colorInputText: '#f0f0f0',
            colorText: '#f0f0f0',
            colorTextSecondary: '#888',
            borderRadius: '0px',
            fontFamily: 'var(--font-mono)',
          },
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none bg-transparent border-0 p-0 w-full',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton:
              'border border-[#1e1e1e] bg-[#111] text-[#f0f0f0] hover:bg-[#1a1a1a] hover:border-[#ff6b35]/40 transition-colors font-mono text-xs uppercase tracking-widest',
            dividerLine: 'bg-[#1a1a1a]',
            dividerText: 'text-[#333] font-mono text-[10px] uppercase tracking-widest',
            formFieldLabel: 'text-[#555] font-mono text-[10px] uppercase tracking-widest',
            formFieldInput:
              'bg-[#111] border border-[#1e1e1e] text-[#f0f0f0] focus:border-[#ff6b35] font-mono text-sm transition-colors',
            formButtonPrimary:
              'bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#e8ff59] transition-colors',
            footerActionLink: 'text-[#ff6b35] hover:text-[#e8ff59] font-mono text-xs',
            footer: 'hidden',
            identityPreviewText: 'text-[#888] font-mono text-xs',
            formResendCodeLink: 'text-[#ff6b35] font-mono text-xs',
          },
        }}
      />

      {/* Footer link */}
      <p className="font-mono text-xs text-[#444] text-center pt-2 border-t border-[#111]">
        No account?{' '}
        <Link href="/register" className="text-[#ff6b35] hover:text-[#e8ff59] transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}
