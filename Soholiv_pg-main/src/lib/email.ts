import { Resend } from 'resend'

// Initialize Resend client only if API key is provided
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    replyTo?: string
}

interface EmailResult {
    success: boolean
    id?: string
    error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    try {
        if (!resend) {
            console.warn('Resend API key not configured')
            return { success: false, error: 'Email service not configured' }
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'SOHO PG <noreply@sohopg.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo,
        })

        if (error) {
            console.error('Email send error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, id: data?.id }
    } catch (error) {
        console.error('Email send failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Send a lead notification email to admin
 */
export async function sendLeadNotification(lead: {
    name: string
    phone: string
    email?: string | null
    message?: string | null
    preferredSector?: string | null
    budgetMin?: number | null
    budgetMax?: number | null
}): Promise<EmailResult> {
    const adminEmail = process.env.EMAIL_ADMIN || 'admin@sohopg.com'

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; border-bottom: 2px solid #B07D62; padding-bottom: 10px;">
        🏠 New Lead Received
      </h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <a href="tel:${lead.phone}">${lead.phone}</a>
          </td>
        </tr>
        ${lead.email ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <a href="mailto:${lead.email}">${lead.email}</a>
          </td>
        </tr>
        ` : ''}
        ${lead.preferredSector ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Preferred Sector:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.preferredSector}</td>
        </tr>
        ` : ''}
        ${lead.budgetMin || lead.budgetMax ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Budget:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            ₹${lead.budgetMin || 0} - ₹${lead.budgetMax || 'No limit'}
          </td>
        </tr>
        ` : ''}
        ${lead.message ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Message:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.message}</td>
        </tr>
        ` : ''}
      </table>
      
      <div style="margin-top: 20px; padding: 15px; background: #F2F0E9; border-radius: 8px;">
        <p style="margin: 0; color: #6B705C;">
          📱 <a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color: #B07D62;">
            Contact on WhatsApp
          </a>
        </p>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        This notification was sent from SOHO PG website.
      </p>
    </div>
  `

    return sendEmail({
        to: adminEmail,
        subject: `🏠 New Lead: ${lead.name} - SOHO PG`,
        html,
    })
}

/**
 * Send a welcome/confirmation email to the user
 */
export async function sendLeadConfirmation(lead: {
    name: string
    email: string
}): Promise<EmailResult> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; border-bottom: 2px solid #B07D62; padding-bottom: 10px;">
        Thank You, ${lead.name}!
      </h2>
      
      <p style="color: #2A2A2A; line-height: 1.6;">
        Thank you for your interest in SOHO PG. We have received your inquiry and 
        our team will contact you within 24 hours.
      </p>
      
      <div style="margin: 20px 0; padding: 15px; background: #F2F0E9; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; color: #2A2A2A;"><strong>Need immediate assistance?</strong></p>
        <p style="margin: 0; color: #6B705C;">
          📞 Call us: <a href="tel:+919876543210" style="color: #B07D62;">+91 98765 43210</a><br>
          💬 WhatsApp: <a href="https://wa.me/919876543210" style="color: #B07D62;">Chat Now</a>
        </p>
      </div>
      
      <p style="color: #2A2A2A; line-height: 1.6;">
        Best regards,<br>
        <strong>SOHO PG Team</strong>
      </p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        This is an automated email. Please do not reply directly.
      </p>
    </div>
  `

    return sendEmail({
        to: lead.email,
        subject: 'Thank You for Contacting SOHO PG',
        html,
        replyTo: process.env.EMAIL_ADMIN,
    })
}

export async function sendEnquiryNotification(enquiry: {
    id: string
    type: string
    name: string
    email?: string | null
    phone?: string | null
    subject?: string | null
    message: string
}): Promise<EmailResult> {
    const adminEmail = process.env.EMAIL_ADMIN || 'admin@sohopg.com'

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; border-bottom: 2px solid #B07D62; padding-bottom: 10px;">
        ✉️ New Enquiry Received
      </h2>

      <p style="margin: 0 0 8px 0; color: #6B705C;">Type: <strong>${enquiry.type}</strong></p>
      <p style="margin: 0 0 8px 0; color: #6B705C;">Enquiry ID: <strong>${enquiry.id}</strong></p>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${enquiry.name}</td>
        </tr>
        ${enquiry.phone ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="tel:${enquiry.phone}">${enquiry.phone}</a></td>
        </tr>
        ` : ''}
        ${enquiry.email ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td>
        </tr>
        ` : ''}
        ${enquiry.subject ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${enquiry.subject}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Message:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${enquiry.message}</td>
        </tr>
      </table>

      <p style="margin-top: 20px; font-size: 12px; color: #888;">SOHO PG website enquiry notification.</p>
    </div>
  `

    return sendEmail({
        to: adminEmail,
        subject: `New Enquiry: ${enquiry.name} (${enquiry.type})`,
        html,
    })
}

export async function sendEnquiryConfirmation(enquiry: {
    name: string
    email: string
}): Promise<EmailResult> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; border-bottom: 2px solid #B07D62; padding-bottom: 10px;">Thank you, ${enquiry.name}!</h2>
      <p style="color: #2A2A2A; line-height: 1.6;">We’ve received your enquiry. Our team will get back to you shortly.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">This is an automated email.</p>
    </div>
  `

    return sendEmail({
        to: enquiry.email,
        subject: 'We received your enquiry - SOHO PG',
        html,
        replyTo: process.env.EMAIL_ADMIN,
    })
}

export async function sendPasswordResetOtp(params: {
    email: string
    name: string
    otp: string
}): Promise<EmailResult> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; border-bottom: 2px solid #B07D62; padding-bottom: 10px;">Password Reset Code</h2>
      <p style="color: #2A2A2A; line-height: 1.6;">Hi ${params.name},</p>
      <p style="color: #2A2A2A; line-height: 1.6;">Use the following OTP to reset your password:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 16px; background: #F2F0E9; border-radius: 10px; text-align: center;">${params.otp}</div>
      <p style="color: #6B705C; line-height: 1.6; margin-top: 16px;">This code expires in 10 minutes. If you didn’t request this, you can ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">SOHO PG Security</p>
    </div>
  `

    return sendEmail({
        to: params.email,
        subject: 'Your SOHO PG password reset OTP',
        html,
    })
}
