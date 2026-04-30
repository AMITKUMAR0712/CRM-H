import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_PREFIX = '/admin'
const ADMIN_LOGIN = '/admin/login'

const USER_PREFIX = '/user'
const USER_LOGIN = '/login'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)
  const isAdminLogin = pathname === ADMIN_LOGIN

  const isAdminApi = pathname.startsWith('/api/admin')

  const isUserRoute = pathname === USER_PREFIX || pathname.startsWith(`${USER_PREFIX}/`)
  const isUserApi = pathname.startsWith('/api/user')

  if (!isAdminRoute && !isAdminApi && !isUserRoute && !isUserApi) {
    return NextResponse.next()
  }

  // Allow admin login page through without token
  if (isAdminRoute && isAdminLogin) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    if (isAdminApi || isUserApi) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login to continue.' },
        { status: 401 }
      )
    }

    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = isAdminRoute ? ADMIN_LOGIN : USER_LOGIN
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'VIEWER' | 'USER'
  const role = token.role as UserRole | undefined

  const allowedAdminRoles = new Set<UserRole>(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'])
  const allowedUserRoles = new Set<UserRole>(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER', 'USER'])

  const allowed = isAdminRoute || isAdminApi ? allowedAdminRoles : allowedUserRoles

  if (!role || !allowed.has(role)) {
    if (isAdminApi || isUserApi) {
      return NextResponse.json(
        { success: false, error: 'Access forbidden. Insufficient permissions.' },
        { status: 403 }
      )
    }

    const forbiddenUrl = req.nextUrl.clone()
    forbiddenUrl.pathname = isAdminRoute ? '/admin/forbidden' : '/forbidden'
    return NextResponse.redirect(forbiddenUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/user/:path*', '/api/user/:path*'],
}
