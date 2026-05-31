import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const sections = [
  { title: 'Acceptance of Terms', body: 'By accessing or purchasing from Static Wears, you agree to these Terms of Service. If you do not agree, please do not use our website.' },
  { title: 'Products & Pricing', body: 'All prices are listed in Sri Lankan Rupees (LKR). We reserve the right to change prices at any time. Product images are for illustrative purposes — minor colour variations may occur.' },
  { title: 'Orders & Payment', body: 'Orders are confirmed once payment is received. We accept Stripe (card), PayPal, and PayHere. In the event we cannot fulfil an order, we will contact you and issue a full refund.' },
  { title: 'Shipping', body: 'We ship within Sri Lanka only. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon handover to the courier.' },
  { title: 'Returns', body: 'Please see our Returns & Exchanges policy for full details on eligibility and the returns process.' },
  { title: 'Intellectual Property', body: 'All content on this site — logos, design, text, and images — is owned by Static Wears. You may not reproduce or use our content without written permission.' },
  { title: 'Limitation of Liability', body: 'Static Wears is not liable for indirect, incidental, or consequential damages arising from the use of our products or website to the extent permitted by law.' },
  { title: 'Contact', body: 'For any questions about these terms, email hello@staticwears.lk.' },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">Legal</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">TERMS OF SERVICE</h1>
            <p className="font-mono text-xs text-[#444]">Last updated: January 2026</p>
          </div>
          <div className="space-y-4">
            {sections.map((s) => (
              <div key={s.title} className="bg-[#111] border border-[#2a2a2a] p-6">
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35] mb-3">{s.title}</h2>
                <p className="font-mono text-xs text-[#666] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
