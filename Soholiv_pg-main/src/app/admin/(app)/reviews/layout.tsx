import { requireAdminAnyPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function ReviewsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAnyPermission([PERMISSIONS.REVIEW_READ, PERMISSIONS.REVIEW_MODERATE])
  return <>{children}</>
}
