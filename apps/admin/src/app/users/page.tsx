import { getAllUsers } from '@static-wears/user-service';
import { Header } from '@/components/layout/header';
import { UsersTable } from '@/components/users/users-table';

export const revalidate = 60;

export default async function UsersPage() {
  const users = await getAllUsers();
  return (
    <div>
      <Header title="Customers" subtitle={`${users.length} registered`} />
      <UsersTable users={users} />
    </div>
  );
}
