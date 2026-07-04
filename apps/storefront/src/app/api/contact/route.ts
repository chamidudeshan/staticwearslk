import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { sendContactNotification } from '@static-wears/email-service';

// In-memory rate limit: IP → timestamp of last accepted submission
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 submission per IP per minute

function getIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  // ── Rate limit ─────────────────────────────────────────
  const last = rateLimitMap.get(ip) ?? 0;
  const now  = Date.now();
  if (now - last < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  const body = await req.json() as {
    name: string; email: string; subject: string; message: string;
    _hp?: string; // honeypot
  };

  const { name, email, subject, message, _hp } = body;

  // ── Honeypot: bots fill hidden fields, humans don't ───
  if (_hp) {
    // Silently accept so bots don't know they were blocked
    return NextResponse.json({ success: true });
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Basic sanity: cap field lengths to block payload floods
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 });
  }

  // Record this submission for rate limiting
  rateLimitMap.set(ip, now);
  // Prevent unbounded memory growth — prune old entries occasionally
  if (rateLimitMap.size > 1000) {
    const cutoff = now - RATE_LIMIT_MS;
    for (const [k, v] of rateLimitMap) {
      if (v < cutoff) rateLimitMap.delete(k);
    }
  }

  // ── Fetch admin email from site_settings ───────────────
  const supabase = createSupabaseAdminClient();
  const { data: rows } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'admin_notification_email')
    .single();

  const adminEmail = (rows as { value: string } | null)?.value ?? process.env.ADMIN_EMAIL ?? '';

  if (!adminEmail) {
    return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 });
  }

  const { error } = await sendContactNotification({ name, email, subject, message, adminEmail });
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
