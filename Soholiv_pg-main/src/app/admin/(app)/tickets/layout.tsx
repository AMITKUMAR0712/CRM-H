import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function TicketsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.TICKET_READ)
  return <>{children}</>
}
