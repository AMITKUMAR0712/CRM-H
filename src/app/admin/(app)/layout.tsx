import { requireAdminSession } from '@/lib/admin/guard'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession()

  return <AdminShell user={session.user}>{children}</AdminShell>
}
