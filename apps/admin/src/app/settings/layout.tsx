import { AdminShell } from '@/components/layout/admin-shell';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
