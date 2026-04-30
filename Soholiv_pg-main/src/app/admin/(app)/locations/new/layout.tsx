import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function NewLocationLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.SECTOR_WRITE)
  return <>{children}</>
}
