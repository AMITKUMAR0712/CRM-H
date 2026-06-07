import 'server-only'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getActiveUserRestriction } from '@/lib/restrictions'
import { hasPermission, type Permission, type UserRole } from '@/lib/rbac'

export type AdminGuardSession = {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

export async function requireAdminSession(): Promise<AdminGuardSession> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/admin/login')
  }

  const userId = session.user.id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  })

  if (!user || !user.isActive) {
    redirect('/admin/login')
  }

  const restriction = await getActiveUserRestriction(userId)
  if (restriction) {
    redirect('/logout?callbackUrl=/admin/login')
  }

  return session as AdminGuardSession
}

export async function requireAdminPermission(permission: Permission): Promise<AdminGuardSession> {
  const session = await requireAdminSession()

  if (!hasPermission(session.user.role, permission)) {
    redirect('/admin/forbidden')
  }

  return session
}

export async function requireAdminAnyPermission(permissions: Permission[]): Promise<AdminGuardSession> {
  const session = await requireAdminSession()

  if (!permissions.some((p) => hasPermission(session.user.role, p))) {
    redirect('/admin/forbidden')
  }

  return session
}
