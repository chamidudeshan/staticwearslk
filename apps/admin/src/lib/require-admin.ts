import { auth, clerkClient } from '@clerk/nextjs/server';

export async function requireAdmin(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.role === 'admin' ? userId : null;
}
