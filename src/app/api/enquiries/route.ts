import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { created, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { formRateLimiter } from '@/middleware/rateLimit'
import { enquiryCreateSchema } from '@/validators/enquiry.validator'
import { sendEnquiryConfirmation, sendEnquiryNotification } from '@/lib/email'
import { logAudit } from '@/lib/audit'
import { requireOptionalAuth } from '@/middleware/auth'

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = formRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const validation = await validateBody(req, enquiryCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data
    const optionalAuth = await requireOptionalAuth()
    if (optionalAuth instanceof NextResponse) return optionalAuth
    const session = optionalAuth

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    const enquiry = await prisma.enquiry.create({
      data: {
        type: data.type ?? 'CONTACT_US',
        name: data.name,
        email: data.email ? data.email : null,
        phone: data.phone ? data.phone : null,
        subject: data.subject ? data.subject : null,
        message: data.message,
        pgId: data.pgId ?? null,
        sectorId: data.sectorId ?? null,
        userId: session?.user?.id ?? null,
        source: data.source ?? 'website',
        referrer: data.referrer ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        ipAddress,
        userAgent,
      },
    })

    sendEnquiryNotification({
      id: enquiry.id,
      type: enquiry.type,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      subject: enquiry.subject,
      message: enquiry.message,
    }).catch(console.error)

    if (enquiry.email) {
      sendEnquiryConfirmation({ name: enquiry.name, email: enquiry.email }).catch(console.error)
    }

    await logAudit({
      actorId: session?.user?.id ?? null,
      actorRole: session?.user?.role ?? null,
      action: 'enquiry.create',
      entityType: 'Enquiry',
      entityId: enquiry.id,
      summary: `New enquiry from ${enquiry.name}`,
      ipAddress,
      userAgent,
    })

    return NextResponse.json(created({ id: enquiry.id }, 'Enquiry submitted successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
