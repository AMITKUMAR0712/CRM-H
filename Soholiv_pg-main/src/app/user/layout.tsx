import { requireUserSession } from '@/lib/user/guard'
import UserShell from '@/components/user/UserShell'
import { UserRole } from '@/lib/rbac'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUserSession()

  return (
    <UserShell user={{ ...session.user, role: session.user.role as UserRole }}>
      {children}
    </UserShell>
  )
}

