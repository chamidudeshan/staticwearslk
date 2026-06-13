'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#060608]">

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0e0e12] border-b border-[#1e1e28] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#666] hover:text-[#e8e8f0] transition-colors p-1"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="text-center">
            <div className="font-mono text-[9px] text-[#ff6b35] uppercase tracking-widest">Admin</div>
            <div className="font-bold text-sm text-[#e8e8f0] leading-tight">Static Wears</div>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
