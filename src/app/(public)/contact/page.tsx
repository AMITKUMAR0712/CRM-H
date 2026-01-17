import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContactForm from '@/components/forms/ContactForm'
import PageHero from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with SOHO PG. Book a visit, enquire about rooms, or get directions to our PG accommodations in Noida.',
}

export default function ContactPage() {
    return (
        <div>
            <PageHero
                kicker="Contact"
                title="Talk to SOHO PG"
                subtitle="Questions, pricing, availability, or a site visit—send a message and we’ll respond soon."
                actions={
                    <>
                        <Button asChild>
                            <a href="tel:+919876543210">Call Now</a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
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
                                            A-123, Sector 51, Noida,<br />
                                            Uttar Pradesh 201301
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <Phone className="w-6 h-6 text-(--color-clay)" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone</h3>
                                        <a href="tel:+919876543210" className="text-(--color-muted) hover:text-(--color-clay)">
                                            +91 98765 43210
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <Mail className="w-6 h-6 text-(--color-clay)" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <a href="mailto:info@sohopg.com" className="text-(--color-muted) hover:text-(--color-clay)">
                                            info@sohopg.com
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
                                <a href="tel:+919876543210" className="flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Call Now
                                </a>
                            </Button>
                            <Button size="lg" variant="secondary" className="w-full bg-green-600 hover:bg-green-700" asChild>
                                <a
                                    href="https://wa.me/919876543210"
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
                    <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 h-80 flex items-center justify-center backdrop-blur-md">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                        <p className="text-(--color-muted)">Google Map Embed</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
