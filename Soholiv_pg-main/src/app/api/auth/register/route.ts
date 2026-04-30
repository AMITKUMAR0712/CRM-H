import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { created, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { registerSchema } from '@/validators/passwordReset.validator'
import { authRateLimiter } from '@/middleware/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = authRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const validation = await validateBody(req, registerSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json(error('An account with this email already exists'), { status: 409 })

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        phone: data.phone ? data.phone : null,
        role: 'USER',
      },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json(created(user, 'Account created successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
