import { auth, clerkClient } from '@clerk/nextjs/server';

export async function requireAdmin(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const adminIds = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (adminIds.includes(userId)) return userId;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.role === 'admin' ? userId : null;
}
