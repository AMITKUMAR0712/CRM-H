import { requireAdminPermission } from '@/lib/admin/guard'
import { PERMISSIONS } from '@/lib/rbac'

export default async function ChatsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPermission(PERMISSIONS.CHAT_READ)
  return <>{children}</>
}
