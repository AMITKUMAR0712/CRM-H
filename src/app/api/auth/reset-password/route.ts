import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { resetPasswordSchema } from '@/validators/passwordReset.validator'
import { authRateLimiter } from '@/middleware/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = authRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const validation = await validateBody(req, resetPasswordSchema)
    if (hasValidationError(validation)) return validation.error

    const { email, otp, newPassword } = validation.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json(error('Invalid OTP'), { status: 400 })

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!token) return NextResponse.json(error('Invalid or expired OTP'), { status: 400 })
    if (token.attempts >= 5) return NextResponse.json(error('Too many attempts. Please request a new OTP.'), { status: 429 })

    const ok = await bcrypt.compare(otp, token.otpHash)

    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { attempts: token.attempts + 1 },
    })

    if (!ok) return NextResponse.json(error('Invalid or expired OTP'), { status: 400 })

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    ])

    return NextResponse.json(success({ ok: true }, 'Password reset successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
