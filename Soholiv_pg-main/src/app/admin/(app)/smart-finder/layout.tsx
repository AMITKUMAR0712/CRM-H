import { requireAdminAnyPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function SmartFinderLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAnyPermission([PERMISSIONS.SMART_CATEGORY_READ, PERMISSIONS.SMART_CATEGORY_WRITE])
  return children
}
