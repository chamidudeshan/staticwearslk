import { SignOutButton } from '@clerk/nextjs';
import { ShieldOff } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldOff size={36} className="text-red-500" />
          </div>
        </div>

        <div>
          <h1 className="font-mono text-4xl font-bold text-white mb-3">
            ACCESS DENIED
          </h1>
          <p className="font-mono text-sm text-[#555] leading-relaxed">
            You do not have permission to access the Static Wears admin panel.
            This area is restricted to administrators only.
          </p>
        </div>

        <div className="border border-[#1a1a1a] p-4 bg-[#0a0a0a]">
          <p className="font-mono text-xs text-[#444]">
            If you believe this is a mistake, contact the site administrator.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="https://staticwears.com"
            className="w-full py-3 font-mono text-xs uppercase tracking-widest text-black bg-[#ff6b35] hover:bg-[#e85d2a] transition-colors"
          >
            Go to Store
          </Link>
          <SignOutButton redirectUrl="/login">
            <button className="w-full py-3 font-mono text-xs uppercase tracking-widest text-[#555] border border-[#1a1a1a] hover:border-[#333] hover:text-[#888] transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        </div>

      </div>
    </div>
  );
}
