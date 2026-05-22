export function MarqueeBanner() {
  const text = Array(10).fill(
    'NEW DROP — STATIC WEARS 2026 — SRI LANKA STREETWEAR — '
  );
  return (
    <div className="bg-[#ff6b35] text-black py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {text.map((t, i) => (
          <span key={i} className="font-display text-xl tracking-wider mx-6">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
