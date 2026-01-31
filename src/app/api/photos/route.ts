import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { uploadPGPhoto } from '@/lib/upload'
import { z } from 'zod'
import { apiRateLimiter } from '@/middleware/rateLimit'

const photoSchema = z.object({
    pgId: z.string().cuid(),
    altText: z.string().max(255).optional(),
    caption: z.string().max(255).optional(),
    category: z.string().optional(),
    isFeatured: z.boolean().default(false),
    displayOrder: z.number().default(0),
})

/**
 * GET /api/photos - List photos for a PG
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { searchParams } = new URL(req.url)
        const pgId = searchParams.get('pgId')

        if (!pgId) return NextResponse.json(error('PG ID required'), { status: 400 })

        const photos = await prisma.photo.findMany({
            where: { pgId },
            orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
        })

        return NextResponse.json(success(photos))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/photos - Upload photo (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.MEDIA_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const pgId = formData.get('pgId') as string
        const altText = formData.get('altText') as string | null
        const caption = formData.get('caption') as string | null
        const category = formData.get('category') as string | null
        const isFeatured = formData.get('isFeatured') === 'true'

        if (!file) return NextResponse.json(error('File is required'), { status: 400 })
        if (!pgId) return NextResponse.json(error('PG ID is required'), { status: 400 })

        // Verify PG exists and manager assignment
        const pg = await prisma.pG.findFirst({
            where: {
                id: pgId,
                ...(authResult.user.role === 'MANAGER'
                    ? { assignments: { some: { userId: authResult.user.id } } }
                    : {}),
            },
        })
        if (!pg) {
            return NextResponse.json(
                error(authResult.user.role === 'MANAGER' ? 'Insufficient permissions to upload for this PG' : 'PG not found'),
                { status: authResult.user.role === 'MANAGER' ? 403 : 404 }
            )
        }

        // Upload to Cloudinary
        const uploadResult = await uploadPGPhoto(file, pg.slug)
        if (!uploadResult.success || !uploadResult.url) {
            return NextResponse.json(error(uploadResult.error || 'Upload failed'), { status: 500 })
        }

        // Save to database
        const photo = await prisma.photo.create({
            data: {
                pgId,
                url: uploadResult.url,
                altText: altText || undefined,
                caption: caption || undefined,
                category: category || undefined,
                isFeatured,
            },
        })

        return NextResponse.json(success(photo, 'Photo uploaded'), { status: 201 })
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/photos - Delete photo (Admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.MEDIA_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json(error('Photo ID required'), { status: 400 })

        await prisma.photo.delete({ where: { id } })
        return NextResponse.json(success(null, 'Photo deleted'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}
