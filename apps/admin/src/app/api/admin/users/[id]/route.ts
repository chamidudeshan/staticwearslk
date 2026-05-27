import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/require-admin';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const client = await clerkClient();

  const updates: Record<string, unknown> = {};
  if (body.first_name !== undefined) updates.firstName = body.first_name;
  if (body.last_name !== undefined) updates.lastName = body.last_name;
  if (body.role !== undefined) updates.publicMetadata = { role: body.role };

  try {
    await client.users.updateUser(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await clerkClient();
  try {
    await client.users.deleteUser(params.id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await req.json();
  if (action !== 'reset-password') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const client = await clerkClient();
  try {
    const user = await client.users.getUser(params.id);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: 'User has no email' }, { status: 400 });

    const token = await client.signInTokens.createSignInToken({ userId: params.id, expiresInSeconds: 86400 });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const link = `${appUrl}/set-password?__clerk_ticket=${token.token}`;
    return NextResponse.json({ reset_link: link, email });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create reset link';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
