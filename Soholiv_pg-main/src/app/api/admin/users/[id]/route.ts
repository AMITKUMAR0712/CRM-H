import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission, requireSuperAdmin } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { userUpdateSchema } from '@/validators/user.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { UserRole } from '@prisma/client'

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.USER_READ)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        assignedLeads: true,
                        blogPosts: true,
                        enquiriesAssigned: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(error('User not found'), { status: 404 })
        }

        return NextResponse.json(success(user))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.USER_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const validation = await validateBody(req, userUpdateSchema)
        if (hasValidationError(validation)) return validation.error

        const data = validation.data

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id } })
        if (!existingUser) {
            return NextResponse.json(error('User not found'), { status: 404 })
        }

        // Prevent self-role modification (users cannot change their own role)
        if (data.role && id === authResult.user.id) {
            return NextResponse.json(error('You cannot change your own role'), { status: 403 })
        }

        // Only SUPER_ADMIN can change roles or modify other SUPER_ADMINs
        if (data.role || existingUser.role === UserRole.SUPER_ADMIN) {
            const superAdminCheck = await requireSuperAdmin()
            if (superAdminCheck instanceof NextResponse) return superAdminCheck
        }

        // Check if email is being changed and if it's already taken
        if (data.email && data.email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({ where: { email: data.email } })
            if (emailTaken) {
                return NextResponse.json(error('Email is already in use'), { status: 409 })
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(success(updatedUser, 'User updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.USER_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        // Prevent self-deletion
        if (id === authResult.user.id) {
            return NextResponse.json(error('You cannot delete your own account'), { status: 403 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id } })
        if (!existingUser) {
            return NextResponse.json(error('User not found'), { status: 404 })
        }

        // Only SUPER_ADMIN can delete SUPER_ADMINs
        if (existingUser.role === UserRole.SUPER_ADMIN) {
            const superAdminCheck = await requireSuperAdmin()
            if (superAdminCheck instanceof NextResponse) return superAdminCheck
        }

        // Soft delete (set isActive to false)
        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        })

        return NextResponse.json(success(null, 'User deactivated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}
