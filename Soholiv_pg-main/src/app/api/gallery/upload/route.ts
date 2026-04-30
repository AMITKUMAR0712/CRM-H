import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { uploadGalleryImage } from '@/lib/upload'
import { Prisma } from '@prisma/client'

const ALBUMS = new Set(['rooms', 'common', 'food', 'neighborhood', 'safety', 'exterior'])

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MEDIA_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const formData = await req.formData()
    const album = String(formData.get('album') || '').trim()

    if (!album || !ALBUMS.has(album)) {
      return NextResponse.json(error('Invalid album'), { status: 400 })
    }

    const pgId = String(formData.get('pgId') || '').trim() || undefined
    const sectorSlug = String(formData.get('sectorSlug') || '').trim() || undefined
    const roomType = String(formData.get('roomType') || '').trim() || undefined
    const floor = formData.get('floor') ? Number(formData.get('floor')) : undefined
    const availability = String(formData.get('availability') || '').trim() || undefined
    const caption = String(formData.get('caption') || '').trim() || undefined
    const altText = String(formData.get('altText') || '').trim() || undefined
    const displayOrder = formData.get('displayOrder') ? Number(formData.get('displayOrder')) : 0
    const isFeatured = formData.get('isFeatured') === 'true'
    const isActive = formData.get('isActive') !== 'false'

    const files = formData.getAll('files').filter((f) => f instanceof File) as File[]
    if (!files.length) return NextResponse.json(error('No files provided'), { status: 400 })

    if (authResult.user.role === 'MANAGER') {
      if (!pgId) return NextResponse.json(error('PG ID is required'), { status: 400 })
      const allowed = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT id FROM pg_assignments WHERE pgId = ${pgId} AND userId = ${authResult.user.id} LIMIT 1
      `)
      if (!allowed.length) {
        return NextResponse.json(error('Insufficient permissions to upload for this PG'), { status: 403 })
      }
    }

    const created = [] as Array<{ id: string; url: string }>

    for (const file of files) {
      const uploadResult = await uploadGalleryImage(file, album)
      if (!uploadResult.success || !uploadResult.url) {
        return NextResponse.json(error(uploadResult.error || 'Upload failed'), { status: 500 })
      }

      const createData = {
        url: uploadResult.url,
        album,
        pgId,
        sectorSlug,
        roomType: roomType as unknown as 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING' | undefined,
        floor,
        availability,
        caption,
        altText,
        displayOrder,
        isFeatured,
        isActive,
      }

      const image = await prisma.galleryImage.create({
        data: createData as unknown as Prisma.GalleryImageCreateInput,
      })

      created.push({ id: image.id, url: image.url })
    }

    return NextResponse.json(success(created, 'Gallery images uploaded'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
