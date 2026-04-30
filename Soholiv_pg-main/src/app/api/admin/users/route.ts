import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAnyPermission, requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { hasPermission } from '@/lib/rbac'
import { userCreateSchema } from '@/validators/user.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const authResult = await requireAnyPermission([
      PERMISSIONS.USER_READ,
      PERMISSIONS.USERS_BLOCK,
      PERMISSIONS.LEAD_ASSIGN,
      PERMISSIONS.ENQUIRY_ASSIGN,
      PERMISSIONS.TICKET_ASSIGN,
    ])
    if (authResult instanceof NextResponse) return authResult

    const canSeeRoles = hasPermission(authResult.user.role, PERMISSIONS.USER_READ)

    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true },
    })

    const result = canSeeRoles ? users : users.map((u) => ({ id: u.id, name: u.name, email: u.email }))

    return NextResponse.json(success(result))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.USER_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, userCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json(error('A user with this email already exists'), { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
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
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(success(user, 'User created successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
