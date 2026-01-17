import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { contactFormSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { formRateLimiter } from '@/middleware/rateLimit'
import { sendLeadNotification, sendLeadConfirmation } from '@/lib/email'
import { requireOptionalAuth } from '@/middleware/auth'

/**
 * POST /api/contact - Submit contact form
 */
export async function POST(req: NextRequest) {
    try {
        const optionalAuth = await requireOptionalAuth()
        if (optionalAuth instanceof NextResponse) return optionalAuth

        // Apply rate limiting
        const rateLimitResult = formRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const validation = await validateBody(req, contactFormSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Get client info
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        const userAgent = req.headers.get('user-agent') || undefined

        // Create the lead
        const lead = await prisma.lead.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                preferredSectorId: data.preferredSectorId || null,
                visitSlot: data.visitSlot,
                message: data.message,
                source: 'contact_form',
                hasConsent: data.hasConsent,
                ipAddress,
                userAgent,
            },
            include: {
                preferredSector: { select: { name: true } },
            },
        })

        // Send notification email to admin (non-blocking)
        sendLeadNotification({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            message: lead.message,
            preferredSector: lead.preferredSector?.name,
        }).catch(console.error)

        // Send confirmation email if email provided (non-blocking)
        if (lead.email) {
            sendLeadConfirmation({
                name: lead.name,
                email: lead.email,
            }).catch(console.error)
        }

        return NextResponse.json(
            success(
                { id: lead.id },
                'Thank you for contacting us! We will get back to you within 24 hours.'
            ),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}
