import 'server-only'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getActiveUserRestriction } from '@/lib/restrictions'
import type { UserRole } from '@prisma/client'

export type UserGuardSession = {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

export async function requireUserSession(): Promise<UserGuardSession> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  })

  if (!user || !user.isActive) {
    redirect('/forbidden')
  }

  const restriction = await getActiveUserRestriction(userId)
  if (restriction) {
    redirect('/logout?callbackUrl=/login')
  }

  return session as UserGuardSession
}
