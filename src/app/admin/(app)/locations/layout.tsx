import { requireAdminAnyPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function LocationsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAnyPermission([PERMISSIONS.SECTOR_READ, PERMISSIONS.SECTOR_WRITE])
  return <>{children}</>
}
