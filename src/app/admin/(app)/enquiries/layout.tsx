import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function EnquiriesLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.ENQUIRY_READ)
  return <>{children}</>
}
