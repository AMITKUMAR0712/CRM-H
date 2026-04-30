import prisma from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

export async function logAudit(params: {
  actorId?: string | null
  actorRole?: UserRole | null
  action: string
  entityType: string
  entityId?: string | null
  summary?: string | null
  metadata?: unknown
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      summary: params.summary ?? null,
      metadata: params.metadata as never,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  })
}
