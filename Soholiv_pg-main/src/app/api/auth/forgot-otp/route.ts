import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { created, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { forgotPasswordSchema } from '@/validators/passwordReset.validator'
import { sendPasswordResetOtp } from '@/lib/email'
import { formRateLimiter } from '@/middleware/rateLimit'

function generateOtp(length = 6): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)]
  return otp
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = formRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const validation = await validateBody(req, forgotPasswordSchema)
    if (hasValidationError(validation)) return validation.error

    const { email } = validation.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return 201 to prevent account enumeration
    if (!user) {
      return NextResponse.json(created({ ok: true }, 'If the email exists, an OTP has been sent'), { status: 201 })
    }

    const otp = generateOtp(6)
    const otpHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { userId: user.id, otpHash, expiresAt },
    })

    sendPasswordResetOtp({ email: user.email, name: user.name, otp }).catch(console.error)

    return NextResponse.json(created({ ok: true }, 'If the email exists, an OTP has been sent'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
