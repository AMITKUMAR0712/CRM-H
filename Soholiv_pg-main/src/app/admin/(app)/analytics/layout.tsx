import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.LOGS_READ)
  return children
}
