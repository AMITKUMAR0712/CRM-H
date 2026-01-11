import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContactForm from '@/components/forms/ContactForm'

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with SOHO PG. Book a visit, enquire about rooms, or get directions to our PG accommodations in Noida.',
}

export default function ContactPage() {
    return (
        <div className="section-padding">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-4">
                        Contact Us
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
                        Have questions? Fill out the form and we'll get back to you within 24 hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <div className="bg-[var(--color-limestone)] rounded-2xl p-8 mb-8">
                            <h2 className="font-serif text-2xl font-semibold mb-6">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-[var(--color-clay)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Address</h3>
                                        <p className="text-[var(--color-muted)]">
                                            A-123, Sector 51, Noida,<br />
                                            Uttar Pradesh 201301
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-[var(--color-clay)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone</h3>
                                        <a href="tel:+919876543210" className="text-[var(--color-muted)] hover:text-[var(--color-clay)]">
                                            +91 98765 43210
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-[var(--color-clay)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <a href="mailto:info@sohopg.com" className="text-[var(--color-muted)] hover:text-[var(--color-clay)]">
                                            info@sohopg.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-[var(--color-clay)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Office Hours</h3>
                                        <p className="text-[var(--color-muted)]">
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
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8">
                        <h2 className="font-serif text-2xl font-semibold mb-6">Send us a Message</h2>
                        <ContactForm />
                    </div>
                </div>

                {/* Map */}
                <div className="mt-12">
                    <div className="bg-[var(--color-limestone)] rounded-2xl h-80 flex items-center justify-center">
                        <p className="text-[var(--color-muted)]">Google Map Embed</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
