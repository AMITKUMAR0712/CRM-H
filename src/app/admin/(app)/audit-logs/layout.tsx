import { requireAdminAnyPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function AuditLogsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAnyPermission([PERMISSIONS.LOGS_READ])
  return children
}
