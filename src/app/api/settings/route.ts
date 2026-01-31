import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { settingUpdateSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * GET /api/settings - Get settings
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { searchParams } = new URL(req.url)
        const publicOnly = searchParams.get('public') === 'true'

        const where = publicOnly ? { isPublic: true } : {}

        // For public, no auth required
        if (!publicOnly) {
            const authResult = await requirePermission(PERMISSIONS.SETTINGS_READ)
            if (authResult instanceof NextResponse) return authResult
        }

        const settings = await prisma.setting.findMany({
            where,
        })

        // Transform to key-value object
        const settingsObject = settings.reduce((acc, setting) => {
            let value: string | number | boolean | object = setting.value

            // Parse based on type
            if (setting.type === 'number') {
                value = parseFloat(setting.value)
            } else if (setting.type === 'boolean') {
                value = setting.value === 'true'
            } else if (setting.type === 'json') {
                try {
                    value = JSON.parse(setting.value)
                } catch {
                    // Keep as string if parse fails
                }
            }

            acc[setting.key] = value
            return acc
        }, {} as Record<string, unknown>)

        return NextResponse.json(success(settingsObject))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PUT /api/settings - Update multiple settings (Admin only)
 */
export async function PUT(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.SETTINGS_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const body = await req.json()

        if (typeof body !== 'object' || !body) {
            return NextResponse.json(error('Invalid settings data'), { status: 400 })
        }

        // Update each setting
        const updates = Object.entries(body).map(([key, value]) =>
            prisma.setting.upsert({
                where: { key },
                create: {
                    key,
                    value: String(value),
                    type: typeof value === 'number' ? 'number' :
                        typeof value === 'boolean' ? 'boolean' :
                            typeof value === 'object' ? 'json' : 'text',
                },
                update: {
                    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                },
            })
        )

        await Promise.all(updates)

        return NextResponse.json(success(null, 'Settings updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}
