import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <div className="p-6">
        <Link href="/" className="font-display text-2xl text-white">
          STATIC<span className="text-[#ff6b35]">WEARS</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}
