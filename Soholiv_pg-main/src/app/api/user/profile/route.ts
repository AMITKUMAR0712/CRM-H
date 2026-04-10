import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'
import { updateProfileSchema, updatePasswordSchema } from '@/validators/auth.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        const authResult = await requireAuth()
        if (authResult instanceof NextResponse) return authResult

        const user = await prisma.user.findUnique({
            where: { id: authResult.user.id },
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

export async function PUT(req: NextRequest) {
    try {
        const authResult = await requireAuth()
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, updateProfileSchema)
        if (hasValidationError(validation)) return validation.error

        const data = validation.data

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: authResult.user.id },
            data: {
                name: data.name,
                phone: data.phone,
                avatar: data.avatar,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(success(updatedUser, 'Profile updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}
