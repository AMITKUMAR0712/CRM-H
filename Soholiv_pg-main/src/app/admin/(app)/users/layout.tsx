import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.USERS_BLOCK)
  return <>{children}</>
}
