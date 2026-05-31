import { createSupabaseAdminClient } from '@static-wears/shared';

const DEFAULT = 'NEW DROP AVAILABLE · FREE SHIPPING OVER LKR 5,000 · MADE IN SRI LANKA · LIMITED STOCK';

async function getMarqueeText() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'marquee_text').single();
    return data?.value || DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export async function MarqueeStrip() {
  const text = await getMarqueeText();
  const repeated = `${text} · ${text} · ${text} · ${text} · ${text} · ${text}`;

  return (
    <div className="bg-[#ff6b35] overflow-hidden py-2.5">
      <div
        className="whitespace-nowrap font-mono text-[11px] text-black font-bold uppercase tracking-widest"
        style={{ animation: 'marquee 28s linear infinite' }}
      >
        {repeated}&nbsp;&nbsp;&nbsp;&nbsp;{repeated}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
