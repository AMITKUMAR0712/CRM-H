import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'
import { updatePasswordSchema } from '@/validators/auth.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const authResult = await requireAuth()
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, updatePasswordSchema)
        if (hasValidationError(validation)) return validation.error

        const data = validation.data

        // Get current user with password
        const user = await prisma.user.findUnique({
            where: { id: authResult.user.id },
            select: { id: true, password: true },
        })

        if (!user) {
            return NextResponse.json(error('User not found'), { status: 404 })
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password)
        if (!isPasswordValid) {
            return NextResponse.json(error('Current password is incorrect'), { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(data.newPassword, 12)

        // Update password
        await prisma.user.update({
            where: { id: authResult.user.id },
            data: { password: hashedPassword },
        })

        return NextResponse.json(success(null, 'Password updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}
