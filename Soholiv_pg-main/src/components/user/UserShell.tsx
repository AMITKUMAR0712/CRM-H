'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { UserRole } from '@/lib/rbac'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'


type ShellUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

const navItems = [
  { href: '/user', label: 'Dashboard' },
  { href: '/user/enquiries', label: 'My Enquiries' },
  { href: '/user/tickets', label: 'Support Tickets' },
  { href: '/user/chats', label: 'Chat' },
]

export default function UserShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-(--color-border) bg-(--color-surface)">
        <div className="p-4 border-b border-(--color-border)">
          <div className="font-semibold leading-tight">SOHO PG</div>
          <div className="text-sm text-muted">User Panel</div>
        </div>

        <nav className="p-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-(--color-limestone) text-(--color-foreground)'
                    : 'hover:bg-(--color-limestone)/60'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="h-14 border-b border-(--color-border) bg-(--color-surface) flex items-center justify-between px-4">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted truncate">{user.email} • {user.role}</div>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
            Logout
          </Button>
        </header>

        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
