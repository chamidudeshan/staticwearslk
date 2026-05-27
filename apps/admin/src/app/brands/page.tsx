'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';

interface Brand { id: string; name: string; description?: string; logo_url?: string; }

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/brands');
    if (res.ok) setBrands(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch('/api/admin/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    if (res.ok) { toast.success('Brand added'); setNewName(''); setNewDesc(''); setShowForm(false); load(); }
    else { const d = await res.json(); toast.error(d.error); }
    setAdding(false);
  }

  async function handleEdit(id: string) {
    const res = await fetch(`/api/admin/brands/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (res.ok) { toast.success('Brand updated'); setEditId(null); load(); }
    else { const d = await res.json(); toast.error(d.error); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete brand "${name}"?`)) return;
    const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Brand deleted'); load(); }
    else { const d = await res.json(); toast.error(d.error); }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Header title="Brands" subtitle={`${brands.length} brands`} />
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#e8ff59] transition-colors">
          <Plus size={14} />Add Brand
        </button>
      </div>

      {showForm && (
          <form
            onSubmit={handleAdd} className="bg-[#0e0e12] border border-[#ff6b35]/30 rounded-xl p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">New Brand</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Brand name *" required
                className="bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors" />
              <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
                className="bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={adding} className="bg-[#ff6b35] text-black font-mono text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50">
                {adding ? 'Adding...' : 'Add'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="font-mono text-xs text-[#444] hover:text-[#888] transition-colors px-4">Cancel</button>
            </div>
          </form>
      )}

      <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-[#444]">Loading...</div>
        ) : brands.length === 0 ? (
          <div className="p-12 text-center">
            <Award size={32} className="text-[#222] mx-auto mb-4" />
            <p className="font-mono text-xs text-[#444]">No brands yet. Add your first one.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e28]">
                {['Brand', 'Description', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12121a]">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-[#12121a] transition-colors">
                  <td className="px-5 py-4">
                    {editId === brand.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="bg-[#12121a] border border-[#ff6b35] px-3 py-1.5 font-mono text-sm text-[#e8e8f0] focus:outline-none w-full" />
                    ) : (
                      <span className="font-mono text-sm font-bold text-[#e8e8f0]">{brand.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editId === brand.id ? (
                      <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                        className="bg-[#12121a] border border-[#ff6b35] px-3 py-1.5 font-mono text-sm text-[#e8e8f0] focus:outline-none w-full" />
                    ) : (
                      <span className="font-mono text-xs text-[#555]">{brand.description || '—'}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {editId === brand.id ? (
                        <>
                          <button onClick={() => handleEdit(brand.id)} className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors"><Check size={14} /></button>
                          <button onClick={() => setEditId(null)} className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-[#888] transition-colors"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(brand.id); setEditName(brand.name); setEditDesc(brand.description || ''); }}
                            className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(brand.id, brand.name)}
                            className="w-7 h-7 flex items-center justify-center text-[#444] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
