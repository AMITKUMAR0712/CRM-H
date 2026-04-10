import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getActiveUserRestriction } from '@/lib/restrictions'

export type AuthSession = {
    user: {
        id: string
        email: string
        name: string
        role: UserRole
    }
}

/**
 * Require authentication for a route
 * Returns the session if authenticated, or an error response
 */
export async function requireAuth(): Promise<AuthSession | NextResponse> {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized. Please login to continue.' },
            { status: 401 }
        )
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
    })

    if (!user || !user.isActive) {
        return NextResponse.json(
            { success: false, error: 'Your account has been deactivated.' },
            { status: 403 }
        )
    }

    const restriction = await getActiveUserRestriction(userId)
    if (restriction) {
        const message =
            restriction.type === 'SUSPENSION'
                ? `Your account is temporarily suspended${restriction.endsAt ? ` until ${restriction.endsAt.toISOString()}` : ''}.`
                : 'Your account has been blocked.'

        return NextResponse.json(
            { success: false, error: restriction.reason ? `${message} Reason: ${restriction.reason}` : message },
            { status: 403 }
        )
    }

    return session as AuthSession
}

/**
 * Optionally check authentication for a route.
 * - If not logged in: returns null
 * - If logged in but inactive/restricted: returns an error response
 * - If logged in and allowed: returns the session
 */
export async function requireOptionalAuth(): Promise<AuthSession | null | NextResponse> {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return null
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
    })

    if (!user || !user.isActive) {
        return NextResponse.json(
            { success: false, error: 'Your account has been deactivated.' },
            { status: 403 }
        )
    }

    const restriction = await getActiveUserRestriction(userId)
    if (restriction) {
        const message =
            restriction.type === 'SUSPENSION'
                ? `Your account is temporarily suspended${restriction.endsAt ? ` until ${restriction.endsAt.toISOString()}` : ''}.`
                : 'Your account has been blocked.'

        return NextResponse.json(
            { success: false, error: restriction.reason ? `${message} Reason: ${restriction.reason}` : message },
            { status: 403 }
        )
    }

    return session as AuthSession
}

/**
 * Check if the user has one of the required roles
 */
export async function requireRole(
    ...allowedRoles: UserRole[]
): Promise<AuthSession | NextResponse> {
    const authResult = await requireAuth()

    if (authResult instanceof NextResponse) {
        return authResult
    }

    const session = authResult as AuthSession

    if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
            { success: false, error: 'Access forbidden. Insufficient permissions.' },
            { status: 403 }
        )
    }

    return session
}

/**
 * Require admin role (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin(): Promise<AuthSession | NextResponse> {
    return requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin(): Promise<AuthSession | NextResponse> {
    return requireRole(UserRole.SUPER_ADMIN)
}

/**
 * Check if result is an auth error response
 */
export function isAuthError(result: AuthSession | NextResponse): result is NextResponse {
    return result instanceof NextResponse
}
