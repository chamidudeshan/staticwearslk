import { clerkClient } from '@clerk/nextjs/server';
import { Header } from '@/components/layout/header';
import { UsersTable } from '@/components/users/users-table';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const client = await clerkClient();
  const { data: clerkUsers } = await client.users.getUserList({ limit: 200, orderBy: '-created_at' });

  const adminIds = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const users = clerkUsers.map((u) => {
    const isAdmin =
      adminIds.includes(u.id) || (u.publicMetadata?.role as string) === 'admin';
    return {
      id: u.id,
      full_name: [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Unknown',
      email: u.emailAddresses[0]?.emailAddress ?? '',
      phone: u.phoneNumbers[0]?.phoneNumber ?? null,
      avatar_url: u.imageUrl ?? null,
      role: (isAdmin ? 'admin' : 'customer') as 'customer' | 'admin',
      created_at: new Date(u.createdAt).toISOString(),
      updated_at: new Date(u.updatedAt).toISOString(),
    };
  });

  return (
    <div>
      <Header title="Customers" subtitle={`${users.length} registered`} />
      <UsersTable users={users} />
    </div>
  );
}
