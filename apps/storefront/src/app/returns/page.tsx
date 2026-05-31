import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

const steps = [
  { num: '01', title: 'Contact Us', desc: 'Email us at hello@staticwears.lk within 7 days of receiving your order. Include your order number and reason for return.' },
  { num: '02', title: 'Pack It Up', desc: 'Pack items in their original condition — unworn, unwashed, with tags attached. We cannot accept items that have been worn or altered.' },
  { num: '03', title: 'Ship It Back', desc: 'Ship to our address below. Return shipping is at the customer\'s cost unless the item is defective or we made an error.' },
  { num: '04', title: 'Get Refunded', desc: 'Once received and inspected, we\'ll process your refund or exchange within 3–5 business days.' },
];

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">Policy</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">RETURNS & EXCHANGES</h1>
            <p className="font-mono text-sm text-[#555] leading-relaxed">
              We want you to love what you wear. If something isn&apos;t right, we&apos;ll make it right.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-10">
            {steps.map((step) => (
              <div key={step.num} className="bg-[#111] border border-[#2a2a2a] p-6 flex gap-5">
                <span className="font-display text-3xl text-[#ff6b35]/30 shrink-0">{step.num}</span>
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#e8e8f0] uppercase tracking-wide mb-2">{step.title}</h3>
                  <p className="font-mono text-xs text-[#666] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Policy details */}
          <div className="space-y-4">
            <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">What We Accept</h2>
              <ul className="font-mono text-xs text-[#666] space-y-1.5 leading-relaxed">
                <li>✓ Items returned within 7 days of delivery</li>
                <li>✓ Unworn, unwashed items with original tags</li>
                <li>✓ Defective or incorrect items (fully covered by us)</li>
              </ul>
            </div>
            <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35]">What We Don&apos;t Accept</h2>
              <ul className="font-mono text-xs text-[#666] space-y-1.5 leading-relaxed">
                <li>✗ Items returned after 7 days</li>
                <li>✗ Worn, washed, or altered items</li>
                <li>✗ Sale or discounted items (final sale)</li>
                <li>✗ Items without original packaging</li>
              </ul>
            </div>
            <div className="bg-[#111] border border-[#2a2a2a] p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35] mb-3">Questions?</h2>
              <p className="font-mono text-xs text-[#666]">
                <Link href="/contact" className="text-[#ff6b35] hover:underline">Contact us</Link> and we&apos;ll sort it out.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
