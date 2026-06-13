import { AdminShell } from '@/components/layout/admin-shell';

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
