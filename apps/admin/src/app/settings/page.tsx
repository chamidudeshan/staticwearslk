'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Store, Bell, CreditCard, Check, Globe, Share2, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Toggle } from '@/components/ui/toggle';

type Tab = 'store' | 'homepage' | 'social';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('store');
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Store settings
  const [storeName, setStoreName] = useState('Static Wears');
  const [storeEmail, setStoreEmail] = useState('hello@staticwears.lk');
  const [adminNotifEmail, setAdminNotifEmail] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [orderNotif, setOrderNotif] = useState(true);
  const [lowStockNotif, setLowStockNotif] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  // Homepage settings
  const [marqueeText, setMarqueeText] = useState('NEW DROP AVAILABLE · FREE SHIPPING OVER LKR 5,000 · MADE IN SRI LANKA · LIMITED STOCK');
  const [contactEmail, setContactEmail] = useState('hello@staticwears.lk');
  const [contactPhone, setContactPhone] = useState('+94 77 000 0000');
  const [contactAddress, setContactAddress] = useState('Colombo, Sri Lanka');

  // Category showcase images
  const CATEGORY_SLUGS = ['t-shirts', 'hoodies', 'caps', 'accessories'] as const;
  type CategorySlug = (typeof CATEGORY_SLUGS)[number];
  const [categoryImages, setCategoryImages] = useState<Record<CategorySlug, string>>({
    't-shirts': '', hoodies: '', caps: '', accessories: '',
  });
  const [uploadingSlug, setUploadingSlug] = useState<CategorySlug | null>(null);
  const fileInputRefs = useRef<Partial<Record<CategorySlug, HTMLInputElement | null>>>({});

  // Social links
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data.marquee_text) setMarqueeText(data.marquee_text);
        if (data.social_instagram) setInstagram(data.social_instagram);
        if (data.social_tiktok) setTiktok(data.social_tiktok);
        if (data.social_facebook) setFacebook(data.social_facebook);
        if (data.social_youtube) setYoutube(data.social_youtube);
        if (data.contact_email) setContactEmail(data.contact_email);
        if (data.contact_phone) setContactPhone(data.contact_phone);
        if (data.contact_address) setContactAddress(data.contact_address);
        if (data.admin_notification_email) setAdminNotifEmail(data.admin_notification_email);
        setCategoryImages((prev) => {
          const next = { ...prev };
          for (const slug of ['t-shirts', 'hoodies', 'caps', 'accessories'] as const) {
            const val = data[`category_img_${slug}`];
            if (val) next[slug] = val;
          }
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  async function saveHomepage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marquee_text: marqueeText,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        ...Object.fromEntries(
          Object.entries(categoryImages)
            .filter(([, v]) => v)
            .map(([slug, url]) => [`category_img_${slug}`, url])
        ),
      }),
    });
    if (res.ok) toast.success('Homepage settings saved');
    else toast.error('Failed to save');
    setSaving(false);
  }

  async function saveSocial(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        social_instagram: instagram,
        social_tiktok: tiktok,
        social_facebook: facebook,
        social_youtube: youtube,
      }),
    });
    if (res.ok) toast.success('Social links saved');
    else toast.error('Failed to save');
    setSaving(false);
  }

  async function saveStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notification_email: adminNotifEmail }),
    });
    if (res.ok) toast.success('Settings saved');
    else toast.error('Failed to save');
    setSaving(false);
  }

  async function handleCategoryImageUpload(slug: CategorySlug, file: File) {
    setUploadingSlug(slug);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) { toast.error('Upload failed'); return; }
      const { url } = await res.json() as { url: string };
      setCategoryImages((prev) => ({ ...prev, [slug]: url }));
      toast.success('Image uploaded — save to apply');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingSlug(null);
    }
  }

  const inputClass = 'w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors';
  const labelClass = 'font-mono text-xs uppercase tracking-widest text-[#555]';

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'store', label: 'Store', icon: <Store size={13} /> },
    { id: 'homepage', label: 'Homepage', icon: <Globe size={13} /> },
    { id: 'social', label: 'Social', icon: <Share2 size={13} /> },
  ];

  const integrations = [
    { name: 'Stripe', description: 'Card payments (international)', env: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, color: '#635bff' },
    { name: 'PayPal', description: 'PayPal wallet & card', env: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, color: '#003087' },
    { name: 'PayHere', description: 'Sri Lanka local payments', env: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID, color: '#00a651' },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <Header title="Settings" subtitle="Configure your store" />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0e0e12] border border-[#1e1e28] p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors rounded-lg ${
              tab === t.id ? 'bg-[#ff6b35] text-black font-bold' : 'text-[#555] hover:text-[#e8e8f0]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loadingSettings ? (
        <p className="font-mono text-xs text-[#444]">Loading settings...</p>
      ) : (
        <>
          {/* Store tab */}
          {tab === 'store' && (
            <form onSubmit={saveStore} className="space-y-6">
              <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Store size={14} className="text-[#ff6b35]" />
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Store Info</h2>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Store Name</label>
                  <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Contact Email</label>
                  <input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Admin Notification Email</label>
                  <input type="email" value={adminNotifEmail} onChange={(e) => setAdminNotifEmail(e.target.value)}
                    placeholder="your@email.com" className={inputClass} />
                  <p className="font-mono text-[10px] text-[#444]">Contact form submissions will be sent to this address.</p>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                    <option value="LKR">LKR — Sri Lankan Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-[#ff6b35]" />
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Notifications</h2>
                </div>
                {[
                  { label: 'New order alerts', desc: 'Email when a new order is placed', value: orderNotif, set: setOrderNotif },
                  { label: 'Low stock alerts', desc: 'Email when stock drops below threshold', value: lowStockNotif, set: setLowStockNotif },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-mono text-sm text-[#e8e8f0]">{item.label}</p>
                      <p className="font-mono text-xs text-[#444]">{item.desc}</p>
                    </div>
                    <Toggle checked={item.value} onChange={item.set} />
                  </label>
                ))}
                {lowStockNotif && (
                  <div className="space-y-1.5 pl-4 border-l border-[#1e1e28]">
                    <label className={labelClass}>Threshold (units)</label>
                    <input type="number" min="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="w-28 bg-[#12121a] border border-[#1e1e28] px-4 py-2 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                  </div>
                )}
              </div>

              <SaveButton saving={saving} />
            </form>
          )}

          {/* Homepage tab */}
          {tab === 'homepage' && (
            <form onSubmit={saveHomepage} className="space-y-6">
              <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-[#ff6b35]" />
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Marquee Strip</h2>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Scrolling Text</label>
                  <textarea value={marqueeText} onChange={(e) => setMarqueeText(e.target.value)} rows={2}
                    className="w-full bg-[#12121a] border border-[#1e1e28] px-4 py-3 font-mono text-sm text-[#e8e8f0] focus:outline-none focus:border-[#ff6b35] transition-colors resize-none"
                    placeholder="NEW DROP · FREE SHIPPING · MADE IN SRI LANKA" />
                  <p className="font-mono text-[10px] text-[#333]">Use · to separate items. This scrolls across the top of the site.</p>
                </div>
              </div>

              <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Contact Page Info</h2>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="hello@staticwears.lk" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone</label>
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+94 77 000 0000" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Address</label>
                  <input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className={inputClass} placeholder="Colombo, Sri Lanka" />
                </div>
              </div>

              {/* Category showcase images */}
              <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-[#ff6b35]" />
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Shop the Drop — Category Images</h2>
                </div>
                <p className="font-mono text-[10px] text-[#444]">Upload images for the 4 category tiles on the homepage. Click Save Changes after uploading.</p>
                <div className="grid grid-cols-2 gap-4">
                  {(['t-shirts', 'hoodies', 'caps', 'accessories'] as const).map((slug) => {
                    const label = { 'T-shirts': 't-shirts', Hoodies: 'hoodies', Caps: 'caps', Accessories: 'accessories' };
                    const displayName = Object.entries(label).find(([, s]) => s === slug)?.[0] ?? slug;
                    const imgUrl = categoryImages[slug];
                    const isUploading = uploadingSlug === slug;
                    return (
                      <div key={slug} className="space-y-2">
                        <p className={labelClass}>{displayName}</p>
                        <div
                          className="relative aspect-[3/4] bg-[#12121a] border border-[#1e1e28] overflow-hidden group cursor-pointer"
                          onClick={() => fileInputRefs.current[slug]?.click()}
                        >
                          {imgUrl ? (
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url('${imgUrl}')` }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon size={28} className="text-[#333]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isUploading ? (
                              <span className="font-mono text-[10px] text-white uppercase tracking-widest animate-pulse">Uploading…</span>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-white">
                                <Upload size={18} />
                                <span className="font-mono text-[10px] uppercase tracking-widest">Change</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[slug] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryImageUpload(slug, file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <SaveButton saving={saving} />
            </form>
          )}

          {/* Social tab */}
          {tab === 'social' && (
            <form onSubmit={saveSocial} className="space-y-6">
              <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Share2 size={14} className="text-[#ff6b35]" />
                  <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Social Links</h2>
                </div>
                <p className="font-mono text-[10px] text-[#444]">Paste the full URL. Leave blank to hide the icon on the storefront.</p>
                {[
                  { label: 'Instagram', value: instagram, set: setInstagram, placeholder: 'https://instagram.com/staticwears' },
                  { label: 'TikTok', value: tiktok, set: setTiktok, placeholder: 'https://tiktok.com/@staticwears' },
                  { label: 'Facebook', value: facebook, set: setFacebook, placeholder: 'https://facebook.com/staticwears' },
                  { label: 'YouTube', value: youtube, set: setYoutube, placeholder: 'https://youtube.com/@staticwears' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <label className={labelClass}>{item.label}</label>
                    <input type="url" value={item.value} onChange={(e) => item.set(e.target.value)}
                      placeholder={item.placeholder} className={inputClass} />
                  </div>
                ))}
              </div>
              <SaveButton saving={saving} />
            </form>
          )}

          {/* Payment integrations — always visible */}
          <div className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-[#ff6b35]" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">Payment Integrations</h2>
            </div>
            <p className="font-mono text-xs text-[#444]">Configure via environment variables in your server.</p>
            <div className="space-y-3">
              {integrations.map((intg) => (
                <div key={intg.name} className="flex items-center justify-between py-3 border-b border-[#12121a] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: intg.color }} />
                    <div>
                      <p className="font-mono text-sm text-[#e8e8f0]">{intg.name}</p>
                      <p className="font-mono text-xs text-[#444]">{intg.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded ${intg.env ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#444] bg-[#12121a]'}`}>
                    {intg.env ? 'Configured' : 'Not set'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <button type="submit" disabled={saving}
      className="flex items-center gap-2 bg-[#ff6b35] text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#e8ff59] transition-colors disabled:opacity-50">
      {saving ? <><Save size={14} />Saving...</> : <><Check size={14} />Save Changes</>}
    </button>
  );
}
