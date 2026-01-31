import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function NewPostLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.BLOG_WRITE)
  return <>{children}</>
}
