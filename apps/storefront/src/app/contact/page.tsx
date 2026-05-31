'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  }

  const info = [
    { icon: <Mail size={16} />, label: 'Email', value: 'hello@staticwears.lk', href: 'mailto:hello@staticwears.lk' },
    { icon: <Phone size={16} />, label: 'Phone', value: '+94 77 000 0000', href: 'tel:+94770000000' },
    { icon: <MapPin size={16} />, label: 'Location', value: 'Colombo, Sri Lanka', href: null },
    { icon: <Clock size={16} />, label: 'Hours', value: 'Mon–Sat, 9am–6pm', href: null },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">Get in Touch</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">CONTACT US</h1>
            <p className="font-mono text-sm text-[#555] leading-relaxed max-w-xl">
              Have a question about your order, sizing, or a collaboration? We&apos;re here for it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Your Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Chamidu"
                    className="w-full bg-[#111] border border-[#2a2a2a] px-4 py-3 font-mono text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                    className="w-full bg-[#111] border border-[#2a2a2a] px-4 py-3 font-mono text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} required
                  className="w-full bg-[#111] border border-[#2a2a2a] px-4 py-3 font-mono text-sm text-[#f0f0f0] focus:outline-none focus:border-[#ff6b35] transition-colors">
                  <option value="">Select a topic...</option>
                  <option value="order">Order Issue</option>
                  <option value="returns">Returns & Exchanges</option>
                  <option value="sizing">Sizing Help</option>
                  <option value="collab">Collaboration</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={6}
                  placeholder="Tell us what's up..."
                  className="w-full bg-[#111] border border-[#2a2a2a] px-4 py-3 font-mono text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#ff6b35] transition-colors resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#ff6b35] text-black font-mono font-bold text-sm uppercase tracking-widest py-4 hover:bg-[#e8ff59] transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {/* Info */}
            <div className="lg:col-span-2 space-y-4">
              {info.map((item) => (
                <div key={item.label} className="bg-[#111] border border-[#2a2a2a] p-5 flex gap-4 items-start">
                  <div className="w-8 h-8 bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center shrink-0 text-[#ff6b35]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#555] mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-mono text-sm text-[#e8e8f0] hover:text-[#ff6b35] transition-colors">{item.value}</a>
                    ) : (
                      <p className="font-mono text-sm text-[#e8e8f0]">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="bg-[#ff6b35]/5 border border-[#ff6b35]/20 p-5">
                <p className="font-mono text-xs text-[#888] leading-relaxed">
                  We reply to all messages within <span className="text-[#ff6b35]">24 hours</span> on business days.
                  For urgent order issues, include your order number in the subject.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
