import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const sections = [
  { title: 'Information We Collect', body: 'We collect information you provide directly — name, email, phone number, and delivery address when you place an order or create an account. We also collect payment information, which is processed securely by our payment providers (Stripe, PayPal, PayHere) and never stored on our servers.' },
  { title: 'How We Use Your Information', body: 'We use your information to process and deliver orders, send order confirmations and shipping updates, respond to customer service enquiries, and improve our products and services. We do not sell your data to third parties.' },
  { title: 'Data Security', body: 'All transactions are encrypted using SSL. Passwords are hashed and never stored in plain text. We use Clerk for authentication, which meets industry security standards.' },
  { title: 'Cookies', body: 'We use essential cookies to keep you signed in and manage your shopping cart. We do not use third-party advertising cookies.' },
  { title: 'Your Rights', body: 'You can request access to, correction of, or deletion of your personal data at any time by contacting us at hello@staticwears.lk. We will respond within 30 days.' },
  { title: 'Contact', body: 'For privacy questions, email us at hello@staticwears.lk.' },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">Legal</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">PRIVACY POLICY</h1>
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
