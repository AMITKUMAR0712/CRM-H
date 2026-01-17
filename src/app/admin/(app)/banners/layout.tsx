import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function BannersLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.BANNERS_MANAGE)
  return <>{children}</>
}
