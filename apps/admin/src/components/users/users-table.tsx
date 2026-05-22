'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { Profile } from '@static-wears/shared';
import { formatDate } from '@/lib/utils';

export function UsersTable({ users }: { users: Profile[] }) {
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
        <input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0e0e12] border border-[#1e1e28] pl-9 pr-4 py-2.5 font-mono text-xs text-[#e8e8f0] placeholder:text-[#444] focus:outline-none focus:border-[#ff6b35] transition-colors w-72"
        />
      </div>

      <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e28]">
              {['Customer', 'Email', 'Phone', 'Role', 'Joined'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#12121a]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center font-mono text-xs text-[#444]">
                  No customers found
                </td>
              </tr>
            ) : (
              filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[#12121a] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#ff6b35]/20 border border-[#ff6b35]/20 flex items-center justify-center shrink-0">
                        <span className="font-mono text-xs text-[#ff6b35] font-bold">
                          {user.full_name[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#e8e8f0]">
                        {user.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-[#888]">{user.email}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-[#888]">{user.phone ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-full ${
                        user.role === 'admin'
                          ? 'text-[#ff6b35] bg-[#ff6b35]/10 border-[#ff6b35]/20'
                          : 'text-[#555] border-[#1e1e28]'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-[#555]">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
