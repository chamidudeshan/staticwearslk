import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const sizes = [
  { size: 'XS', chest: '34–36"', waist: '28–30"', length: '26"' },
  { size: 'S',  chest: '36–38"', waist: '30–32"', length: '27"' },
  { size: 'M',  chest: '38–40"', waist: '32–34"', length: '28"' },
  { size: 'L',  chest: '40–42"', waist: '34–36"', length: '29"' },
  { size: 'XL', chest: '42–44"', waist: '36–38"', length: '30"' },
  { size: 'XXL',chest: '44–46"', waist: '38–40"', length: '31"' },
];

export default function SizeGuidePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#ff6b35] uppercase tracking-widest mb-3">Fit Guide</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">SIZE GUIDE</h1>
            <p className="font-mono text-sm text-[#555] leading-relaxed">
              All Static Wears pieces are cut oversized. If you prefer a closer fit, size down one.
            </p>
          </div>

          {/* Size table */}
          <div className="bg-[#111] border border-[#2a2a2a] overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {['Size', 'Chest', 'Waist', 'Length'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#555]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {sizes.map((row) => (
                    <tr key={row.size} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-sm text-[#ff6b35]">{row.size}</td>
                      <td className="px-5 py-4 font-mono text-sm text-[#888]">{row.chest}</td>
                      <td className="px-5 py-4 font-mono text-sm text-[#888]">{row.waist}</td>
                      <td className="px-5 py-4 font-mono text-sm text-[#888]">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#111] border border-[#2a2a2a] p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35] mb-3">How to Measure</h2>
              <ul className="space-y-2 font-mono text-xs text-[#666] leading-relaxed">
                <li><span className="text-[#888]">Chest —</span> Measure around the fullest part of your chest, under your arms.</li>
                <li><span className="text-[#888]">Waist —</span> Measure around your natural waistline, keeping the tape comfortable.</li>
                <li><span className="text-[#888]">Length —</span> Measure from the highest point of the shoulder to the hem.</li>
              </ul>
            </div>

            <div className="bg-[#111] border border-[#2a2a2a] p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#ff6b35] mb-3">Still Unsure?</h2>
              <p className="font-mono text-xs text-[#666]">
                Reach out to us at{' '}
                <a href="mailto:hello@staticwears.lk" className="text-[#ff6b35] hover:underline">
                  hello@staticwears.lk
                </a>{' '}
                and we&apos;ll help you find your perfect fit.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
