import { NextResponse } from 'next/server'
import { UserRole } from '@/lib/rbac'

import { requireAuth, AuthSession } from '@/middleware/auth'
import { Permission, hasPermission } from '@/lib/rbac'

export async function requirePermission(
  permission: Permission
): Promise<AuthSession | NextResponse> {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const session = authResult as AuthSession
  const role = session.user.role as UserRole

  if (!hasPermission(role, permission)) {
    return NextResponse.json(
      { success: false, error: 'Access forbidden. Insufficient permissions.' },
      { status: 403 }
    )
  }

  return session
}

export async function requireAnyPermission(
  permissions: Permission[]
): Promise<AuthSession | NextResponse> {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const session = authResult as AuthSession
  const role = session.user.role as UserRole

  const allowed = permissions.some((p) => hasPermission(role, p))
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Access forbidden. Insufficient permissions.' },
      { status: 403 }
    )
  }

  return session
}

export async function requireSuperAdmin(): Promise<AuthSession | NextResponse> {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const session = authResult as AuthSession
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Access forbidden. Super Admin only.' },
      { status: 403 }
    )
  }

  return session
}

