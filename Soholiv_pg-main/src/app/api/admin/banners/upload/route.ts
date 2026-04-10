import { NextRequest, NextResponse } from 'next/server'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { uploadBannerImage } from '@/lib/upload'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BANNERS_MANAGE)
    if (authResult instanceof NextResponse) return authResult

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(error('No file provided'), { status: 400 })
    }

    const uploadResult = await uploadBannerImage(file)
    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json(error(uploadResult.error || 'Upload failed'), { status: 500 })
    }

    return NextResponse.json(success({ url: uploadResult.url }, 'Banner image uploaded'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
