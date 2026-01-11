import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

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
