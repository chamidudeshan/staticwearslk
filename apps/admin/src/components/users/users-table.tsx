'use client';

import { useState } from 'react';
import { Search, Pencil, Trash2, KeyRound, X } from 'lucide-react';
import type { Profile } from '@static-wears/shared';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type Role = 'customer' | 'admin';

interface EditState {
  id: string;
  first_name: string;
  last_name: string;
  role: Role;
}

interface ResetState {
  link: string;
  email: string;
}

export function UsersTable({ users: initial }: { users: Profile[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<ResetState | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(user: Profile) {
    const [first_name, ...rest] = user.full_name.split(' ');
    setEditing({ id: user.id, first_name, last_name: rest.join(' '), role: user.role });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editing.first_name,
          last_name: editing.last_name,
          role: editing.role,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to update');
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? {
                ...u,
                full_name: [editing.first_name, editing.last_name].filter(Boolean).join(' '),
                role: editing.role,
              }
            : u
        )
      );
      toast.success('User updated');
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to delete');
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted');
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  async function sendReset(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-password' }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast.error(d.error ?? 'Failed to generate reset link');
      return;
    }
    setResetInfo({ link: d.reset_link, email: d.email });
  }

  return (
    <div className="space-y-4">
      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 w-full max-w-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Edit User</h3>
              <button onClick={() => setEditing(null)} className="text-[#444] hover:text-[#e8e8f0] transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">First Name</label>
                <input
                  value={editing.first_name}
                  onChange={(e) => setEditing((s) => s && { ...s, first_name: e.target.value })}
                  className="w-full bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Last Name</label>
                <input
                  value={editing.last_name}
                  onChange={(e) => setEditing((s) => s && { ...s, last_name: e.target.value })}
                  className="w-full bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Role</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing((s) => s && { ...s, role: e.target.value as Role })}
                  className="w-full bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest py-2.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors border border-[#1e1e28]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset link modal */}
      {resetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#e8ff59]">Password Reset Link</h3>
              <button onClick={() => setResetInfo(null)} className="text-[#444] hover:text-[#e8e8f0] transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="font-mono text-xs text-[#888]">
              Send this one-time link to <span className="text-[#e8e8f0]">{resetInfo.email}</span>.
              When they open it, they will be signed in automatically and can change their password from account settings.
              Link expires in 24 hours.
            </p>
            <div className="bg-[#12121a] border border-[#1e1e28] rounded p-3 font-mono text-xs text-[#ff6b35] break-all select-all">
              {resetInfo.link}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(resetInfo.link);
                  toast.success('Link copied to clipboard');
                }}
                className="flex-1 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest py-2.5 hover:bg-[#e8ff59] transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setResetInfo(null)}
                className="px-4 font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors border border-[#1e1e28]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 w-full max-w-sm space-y-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-red-400">Delete User?</h3>
            <p className="font-mono text-xs text-[#888]">
              This will permanently delete the user from Clerk. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => confirmDelete(deleting)}
                disabled={saving}
                className="flex-1 bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-widest py-2.5 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="px-4 font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors border border-[#1e1e28]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
              {['Customer', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map((h) => (
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
                <td colSpan={6} className="px-5 py-12 text-center font-mono text-xs text-[#444]">
                  No customers found
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#12121a] transition-colors">
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
                    <span className="font-mono text-xs text-[#555]">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        title="Edit user"
                        className="text-[#444] hover:text-[#ff6b35] transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => sendReset(user.id)}
                        title="Generate password reset link"
                        className="text-[#444] hover:text-[#e8ff59] transition-colors"
                      >
                        <KeyRound size={13} />
                      </button>
                      <button
                        onClick={() => setDeleting(user.id)}
                        title="Delete user"
                        className="text-[#444] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
