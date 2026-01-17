import { requireUserSession } from '@/lib/user/guard'
import UserShell from '@/components/user/UserShell'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUserSession()

  return <UserShell user={session.user}>{children}</UserShell>
}
