import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const zones = [
  { zone: 'Colombo & Western Province', time: '1–2 business days', cost: 'LKR 350' },
  { zone: 'Other Provinces', time: '2–4 business days', cost: 'LKR 450' },
  { zone: 'Remote Areas', time: '3–5 business days', cost: 'LKR 550' },
];

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">Delivery</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">SHIPPING INFO</h1>
            <p className="font-mono text-sm text-[#555] leading-relaxed">
              All orders are processed within 1–2 business days. Free shipping on orders over LKR 5,000.
            </p>
          </div>

          <div className="bg-[#111] border border-[#2a2a2a] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Zone', 'Delivery Time', 'Cost'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {zones.map((row) => (
                    <tr key={row.zone} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-5 py-4 font-mono text-sm text-[#e8e8f0]">{row.zone}</td>
                      <td className="px-5 py-4 font-mono text-sm text-[#888]">{row.time}</td>
                      <td className="px-5 py-4 font-mono text-sm text-[#ff6b35] font-bold">{row.cost}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#ff6b35]/5">
                    <td className="px-5 py-4 font-mono text-sm text-[#e8e8f0]">Orders over LKR 5,000</td>
                    <td className="px-5 py-4 font-mono text-sm text-[#888]">Same as zone</td>
                    <td className="px-5 py-4 font-mono text-sm text-[#e8ff59] font-bold">FREE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111] border border-[#2a2a2a] p-6 space-y-2">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35] mb-3">Notes</h2>
              <ul className="font-mono text-xs text-[#666] space-y-2 leading-relaxed">
                <li>· Orders placed before 12pm (noon) on weekdays are processed same day.</li>
                <li>· We ship Monday to Saturday. No deliveries on Sundays or public holidays.</li>
                <li>· You&apos;ll receive a tracking number via email once your order ships.</li>
                <li>· Delivery times are estimates and may vary during peak periods.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
