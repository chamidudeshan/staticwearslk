'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Award,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/users', label: 'Customers', icon: Users },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/brands', label: 'Brands', icon: Award },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-[#0e0e12] border-r border-[#1e1e28] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e1e28]">
        <div className="font-mono text-[10px] text-[#ff6b35] uppercase tracking-widest mb-1">
          Admin
        </div>
        <div className="font-bold text-lg text-[#e8e8f0] tracking-tight">
          Static Wears
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm transition-all ${
                isActive
                  ? 'text-[#ff6b35] bg-[#ff6b35]/10'
                  : 'text-[#666] hover:text-[#e8e8f0] hover:bg-[#12121a]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#ff6b35] rounded-full"
                />
              )}
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e1e28] space-y-2">
        <a
          href={process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 text-[#444] hover:text-[#666] font-mono text-xs transition-colors"
        >
          <ExternalLink size={14} />
          View Storefront
        </a>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-[#444] hover:text-red-400 font-mono text-xs transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
