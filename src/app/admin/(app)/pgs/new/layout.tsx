import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function NewPgLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.PG_WRITE)
  return <>{children}</>
}
