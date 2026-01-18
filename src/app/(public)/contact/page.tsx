import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContactForm from '@/components/forms/ContactForm'
import PageHero from '@/components/layout/PageHero'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with SOHO PG. Book a visit, enquire about rooms, or get directions to our PG accommodations in Noida.',
}

async function getSettings() {
    const settings = await prisma.setting.findMany({
        where: { isPublic: true },
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
        settingsMap[s.key] = s.value
    })

    return settingsMap
}

export default async function ContactPage() {
    const settings = await getSettings()

    const phone = settings.contact_phone || '+919876543210'
    const email = settings.contact_email || 'info@sohopg.com'
    const address = settings.contact_address || 'A-123, Sector 51, Noida, Uttar Pradesh 201301'
    const whatsapp = settings.whatsapp_number || '919876543210'

    // Parse address for display
    const [addressLine1, ...rest] = address.split(',')
    const addressLine2 = rest.join(',').trim()

    return (
        <div>
            <PageHero
                kicker="Contact"
                title="Talk to SOHO PG"
                subtitle="Questions, pricing, availability, or a site visit—send a message and we'll respond soon."
                actions={
                    <>
                        <Button asChild>
                            <a href={`tel:${phone}`}>Call Now</a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </a>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-14">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Contact Info */}
                    <div>
                        <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)] mb-8">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                            <h2 className="font-serif text-2xl font-semibold text-(--color-graphite) mb-6">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <MapPin className="w-6 h-6 text-(--color-clay)" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Address</h3>
                                        <p className="text-(--color-muted)">
                                            {addressLine1}<br />
                                            {addressLine2}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <Phone className="w-6 h-6 text-(--color-clay)" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone</h3>
                                        <a href={`tel:${phone}`} className="text-(--color-muted) hover:text-(--color-clay)">
                                            {phone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3')}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <Mail className="w-6 h-6 text-(--color-clay)" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <a href={`mailto:${email}`} className="text-(--color-muted) hover:text-(--color-clay)">
                                            {email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <Clock className="w-6 h-6 text-(--color-clay)" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Office Hours</h3>
                                        <p className="text-(--color-muted)">
                                            Mon - Sat: 9:00 AM - 7:00 PM<br />
                                            Sunday: 10:00 AM - 5:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button size="lg" className="w-full" asChild>
                                <a href={`tel:${phone}`} className="flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Call Now
                                </a>
                            </Button>
                            <Button size="lg" variant="secondary" className="w-full bg-green-600 hover:bg-green-700" asChild>
                                <a
                                    href={`https://wa.me/${whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>

                        <div className="mt-6 text-sm text-(--color-muted)">
                            Prefer exploring first? Try <Link href="/smart-finder" className="text-(--color-clay) font-semibold hover:underline">Smart Finder</Link>.
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                        <h2 className="font-serif text-2xl font-semibold text-(--color-graphite) mb-6">Send us a Message</h2>
                        <ContactForm />
                    </div>
                </div>

                {/* Map */}
                <div className="mt-12">
                    <h2 className="font-serif text-2xl font-semibold text-(--color-graphite) mb-6">Our Location</h2>
                    <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 h-80">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.7325977876447!2d77.3784!3d28.4303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5e123456789%3A0xabcdef1234567890!2sSector%2051%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="SOHO PG Location"
                        />
                    </div>
                </div>

                {/* FAQs Quick Link */}
                <div className="mt-12 relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md text-center">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                    <h3 className="font-serif text-xl font-semibold text-(--color-graphite)">Have more questions?</h3>
                    <p className="mt-2 text-(--color-muted)">Check our frequently asked questions or explore our PG options.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Button asChild>
                            <Link href="/smart-finder">Find Your PG</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/pg-locations">View All Locations</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
