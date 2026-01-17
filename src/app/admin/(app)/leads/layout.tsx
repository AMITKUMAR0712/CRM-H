import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function LeadsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.LEAD_READ)
  return <>{children}</>
}
