import { requireAdminAnyPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function PgsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAnyPermission([PERMISSIONS.PG_READ, PERMISSIONS.PG_WRITE])
  return <>{children}</>
}
