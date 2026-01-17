'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type ShellUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

const navItems = [
  { href: '/admin', label: 'Dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
  { href: '/admin/pgs', label: 'PGs', permission: PERMISSIONS.PG_WRITE },
  { href: '/admin/leads', label: 'Leads', permission: PERMISSIONS.LEAD_READ },
  { href: '/admin/banners', label: 'Banners', permission: PERMISSIONS.BANNERS_MANAGE },
  { href: '/admin/enquiries', label: 'Enquiries', permission: PERMISSIONS.ENQUIRY_READ },
  { href: '/admin/menus', label: 'Menus', permission: PERMISSIONS.MENU_WRITE },
  { href: '/admin/tickets', label: 'Tickets', permission: PERMISSIONS.TICKET_READ },
  { href: '/admin/chats', label: 'Chats', permission: PERMISSIONS.CHAT_READ },
  { href: '/admin/users', label: 'Users', permission: PERMISSIONS.USERS_BLOCK },
  { href: '/admin/blog/posts', label: 'Blog', permission: PERMISSIONS.BLOG_WRITE },
] as const

export default function AdminShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname()
  const visibleNavItems = navItems.filter((item) => hasPermission(user.role, item.permission))

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-[var(--color-border)] bg-white">
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="font-semibold leading-tight">SOHO PG</div>
          <div className="text-sm text-[var(--color-muted)]">Admin Panel</div>
        </div>

        <nav className="p-2">
          {visibleNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--color-limestone)] text-[var(--color-foreground)]'
                    : 'hover:bg-[var(--color-limestone)]/60'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="h-14 border-b border-[var(--color-border)] bg-white flex items-center justify-between px-4">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-[var(--color-muted)] truncate">{user.email} • {user.role}</div>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            Logout
          </Button>
        </header>

        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
