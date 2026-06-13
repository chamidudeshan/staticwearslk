import { AdminShell } from '@/components/layout/admin-shell';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
