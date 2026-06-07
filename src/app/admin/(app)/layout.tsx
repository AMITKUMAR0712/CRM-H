import { requireAdminSession } from '@/lib/admin/guard'
import AdminShell from '@/components/admin/AdminShell'
import { UserRole } from '@/lib/rbac'

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession()

  return (
    <AdminShell user={{ ...session.user, role: session.user.role as UserRole }}>
      {children}
    </AdminShell>
  )
}

