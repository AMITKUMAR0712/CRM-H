import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function MenusLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.MENU_WRITE)
  return <>{children}</>
}
