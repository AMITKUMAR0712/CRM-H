import prisma from '@/lib/prisma'

export type ActiveRestriction = {
  id: string
  type: 'SOFT_BLOCK' | 'HARD_BLOCK' | 'SUSPENSION'
  reason: string | null
  endsAt: Date | null
}

export async function getActiveUserRestriction(userId: string): Promise<ActiveRestriction | null> {
  const now = new Date()

  const restriction = await prisma.userRestriction.findFirst({
    where: {
      userId,
      isActive: true,
      revokedAt: null,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, type: true, reason: true, endsAt: true },
  })

  if (!restriction) return null

  return {
    id: restriction.id,
    type: restriction.type,
    reason: restriction.reason ?? null,
    endsAt: restriction.endsAt ?? null,
  }
}
