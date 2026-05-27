import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-10 self-start">
        <h1 className="font-display text-5xl text-white mb-2">SIGN IN</h1>
        <p className="font-mono text-sm text-[#555]">Welcome back, drop in.</p>
      </div>

      <SignIn
        forceRedirectUrl="/"
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
            card: 'shadow-none border border-[#1a1a1a] w-full',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border border-[#1a1a1a] bg-[#111] text-[#f0f0f0]',
            dividerLine: 'bg-[#1a1a1a]',
            dividerText: 'text-[#444]',
            formFieldLabel: 'text-[#555] font-mono text-xs uppercase tracking-widest',
            footerActionLink: 'text-[#ff6b35]',
            footer: 'hidden',
          },
        }}
      />

      <p className="font-mono text-xs text-[#555] mt-6 text-center">
        No account?{' '}
        <a href="/register" className="text-[#ff6b35] hover:underline">
          Create one
        </a>
      </p>
    </div>
  );
}
