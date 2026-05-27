import { SignIn } from '@clerk/nextjs';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">
          Admin Portal
        </div>
        <h1 className="text-3xl font-bold text-[#e8e8f0]">Static Wears</h1>
      </div>

      <SignIn
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: '#ff6b35',
            colorBackground: '#0e0e12',
            colorInputBackground: '#12121a',
            colorInputText: '#e8e8f0',
            colorText: '#e8e8f0',
            colorTextSecondary: '#888',
            borderRadius: '0px',
            fontFamily: 'var(--font-mono)',
          },
          elements: {
            card: 'shadow-none border border-[#1e1e28]',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border border-[#1e1e28] bg-[#12121a] text-[#e8e8f0]',
            dividerLine: 'bg-[#1e1e28]',
            dividerText: 'text-[#444]',
            formFieldLabel: 'text-[#666] font-mono text-xs uppercase tracking-widest',
            footerActionLink: 'text-[#ff6b35]',
          },
        }}
      />
    </div>
  );
}
