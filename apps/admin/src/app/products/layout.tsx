import { AdminShell } from '@/components/layout/admin-shell';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
