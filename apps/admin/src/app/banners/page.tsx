'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';

interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

interface BannerForm {
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
}

const EMPTY: BannerForm = { image_url: '', title: '', subtitle: '', cta_text: 'Shop Now', cta_link: '/shop' };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BannerForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BannerForm>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/banners').then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setBanners(d);
    }).finally(() => setLoading(false));
  }, []);

  async function uploadImage(file: File, onDone: (url: string) => void) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const signRes = await fetch(`/api/admin/upload/sign?ext=${ext}`);
      if (!signRes.ok) { toast.error('Upload failed'); return; }
      const { signedUrl, url } = await signRes.json() as { signedUrl: string; url: string };

      const upload = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!upload.ok) { toast.error('Upload failed'); return; }
      onDone(url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) { toast.error('Upload an image first'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: banners.length }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? 'Failed'); setSaving(false); return; }
    setBanners((b) => [...b, data]);
    setForm(EMPTY);
    setShowForm(false);
    toast.success('Banner added');
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this banner?')) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (res.ok) { setBanners((b) => b.filter((x) => x.id !== id)); toast.success('Deleted'); }
    else toast.error('Failed to delete');
  }

  async function toggleActive(banner: Banner) {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    if (res.ok) setBanners((b) => b.map((x) => x.id === banner.id ? { ...x, is_active: !x.is_active } : x));
  }

  function startEdit(banner: Banner) {
    setEditingId(banner.id);
    setEditForm({
      image_url: banner.image_url,
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      cta_text: banner.cta_text ?? 'Shop Now',
      cta_link: banner.cta_link ?? '/shop',
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setBanners((b) => b.map((x) => x.id === id ? { ...x, ...editForm } : x));
      setEditingId(null);
      toast.success('Banner updated');
    } else toast.error('Failed to update');
    setSaving(false);
  }

  const inputClass = 'w-full bg-[#12121a] border border-[#1e1e28] px-3 py-2.5 font-mono text-xs text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header title="Banners" subtitle={`${banners.length} banner${banners.length !== 1 ? 's' : ''}`} />
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#e8ff59] transition-colors">
          <Plus size={14} /> Add Banner
        </button>
      </div>

      <p className="font-mono text-[10px] text-[#444]">
        Banners appear as a full-screen hero slider on the homepage. Upload striking images (recommended: 1920×1080px or wider). Leave title blank to show the default STATIC WEARS branding.
      </p>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#0e0e12] border border-[#ff6b35]/30 rounded-xl p-6 space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">New Banner</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Banner Image *</label>
              {form.image_url ? (
                <div className="relative w-full aspect-[16/5] overflow-hidden border border-[#1e1e28]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 flex items-center justify-center text-white hover:text-red-400 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full aspect-[16/5] border-2 border-dashed border-[#1e1e28] hover:border-[#ff6b35] transition-colors flex flex-col items-center justify-center gap-2 text-[#333] hover:text-[#ff6b35] disabled:opacity-50">
                  <Upload size={24} />
                  <span className="font-mono text-xs">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                  <span className="font-mono text-[10px] text-[#333]">Recommended: 1920×1080px JPG or WebP</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], (url) => setForm((f) => ({ ...f, image_url: url })))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Heading (optional)</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="NEW DROP: SHADOW SERIES" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Subtitle (optional)</label>
                <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Limited to 200 pieces" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Button Text</label>
                <input value={form.cta_text} onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))} placeholder="Shop Now" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Button Link</label>
                <input value={form.cta_link} onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))} placeholder="/shop" className={inputClass} />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving || uploading}
                className="bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-[#e8ff59] transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Banner'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }}
                className="font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors px-4 py-2.5 border border-[#1e1e28]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners list */}
      {loading ? (
        <p className="font-mono text-xs text-[#444]">Loading...</p>
      ) : banners.length === 0 ? (
        <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-12 text-center">
          <p className="font-mono text-xs text-[#444] mb-2">No banners yet.</p>
          <p className="font-mono text-[10px] text-[#333]">The homepage will show the default hero until you add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className={`bg-[#0e0e12] border rounded-xl overflow-hidden transition-all ${banner.is_active ? 'border-[#1e1e28]' : 'border-[#1e1e28] opacity-60'}`}>
              {editingId === banner.id ? (
                /* Edit mode */
                <div className="p-5 space-y-4">
                  <div className="relative w-full aspect-[16/4] overflow-hidden border border-[#1e1e28] mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editForm.image_url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => editFileRef.current?.click()} disabled={uploading}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white font-mono text-xs">
                      <Upload size={20} />
                      {uploading ? 'Uploading...' : 'Change Image'}
                    </button>
                  </div>
                  <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], (url) => setEditForm((f) => ({ ...f, image_url: url })))} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Heading</label>
                      <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="Heading..." />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Subtitle</label>
                      <input value={editForm.subtitle} onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))} className={inputClass} placeholder="Subtitle..." />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Button Text</label>
                      <input value={editForm.cta_text} onChange={(e) => setEditForm((f) => ({ ...f, cta_text: e.target.value }))} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Button Link</label>
                      <input value={editForm.cta_link} onChange={(e) => setEditForm((f) => ({ ...f, cta_link: e.target.value }))} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(banner.id)} disabled={saving}
                      className="flex items-center gap-1.5 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest px-5 py-2 hover:bg-[#e8ff59] transition-colors disabled:opacity-50">
                      <Save size={12} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="font-mono text-xs text-[#444] hover:text-[#e8e8f0] transition-colors px-4 py-2 border border-[#1e1e28]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                  <div className="relative w-full sm:w-40 aspect-[16/9] overflow-hidden shrink-0 bg-[#12121a]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                    {!banner.is_active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Hidden</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-sm text-[#e8e8f0] mb-1">
                      {banner.title || <span className="text-[#444] italic">Default STATIC WEARS text</span>}
                    </p>
                    {banner.subtitle && <p className="font-mono text-xs text-[#555] mb-1">{banner.subtitle}</p>}
                    <p className="font-mono text-[10px] text-[#333]">
                      CTA: {banner.cta_text ?? 'Shop Now'} / {banner.cta_link ?? '/shop'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(banner)} title={banner.is_active ? 'Hide' : 'Show'}
                      className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors">
                      {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => startEdit(banner)} title="Edit"
                      className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-[#ff6b35] transition-colors">
                      <GripVertical size={14} />
                    </button>
                    <button onClick={() => startEdit(banner)}
                      className="font-mono text-[10px] text-[#555] hover:text-[#ff6b35] transition-colors uppercase tracking-widest px-3 py-1.5 border border-[#1e1e28] hover:border-[#ff6b35]/50">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(banner.id)}
                      className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
