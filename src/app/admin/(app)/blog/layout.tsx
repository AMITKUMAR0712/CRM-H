import { requireAdminAnyPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAnyPermission([PERMISSIONS.BLOG_READ, PERMISSIONS.BLOG_WRITE])
  return <>{children}</>
}
