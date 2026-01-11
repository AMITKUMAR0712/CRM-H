import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'

const quickLinks = [
    { href: '/pg-locations', label: 'PG Locations' },
    { href: '/smart-finder', label: 'Smart Finder' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
]

const sectors = [
    { href: '/pg-locations/sector-50', label: 'Sector 50' },
    { href: '/pg-locations/sector-51', label: 'Sector 51' },
    { href: '/pg-locations/sector-52', label: 'Sector 52' },
    { href: '/pg-locations/sector-62', label: 'Sector 62' },
    { href: '/pg-locations/sector-76', label: 'Sector 76' },
]

export default function Footer() {
    return (
        <footer className="bg-[var(--color-graphite)] text-white">
            {/* Main Footer */}
            <div className="container-custom section-padding">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="font-serif text-2xl font-bold">
                                SOHO<span className="text-[var(--color-clay)]">PG</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Premium paying guest accommodation in Noida. Experience comfort, safety, and community living at its finest.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-[var(--color-clay)] transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-[var(--color-clay)] transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-[var(--color-clay)] transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-[var(--color-clay)] transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sectors */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6">Our Locations</h4>
                        <ul className="space-y-3">
                            {sectors.map((sector) => (
                                <li key={sector.href}>
                                    <Link
                                        href={sector.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        PG in {sector.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact - NAP Consistency */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[var(--color-clay)] flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400 text-sm">
                                    A-123, Sector 51, Noida,<br />
                                    Uttar Pradesh 201301
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-[var(--color-clay)]" />
                                <a
                                    href="tel:+919876543210"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    +91 98765 43210
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-[var(--color-clay)]" />
                                <a
                                    href="mailto:info@sohopg.com"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    info@sohopg.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-[var(--color-clay)]" />
                                <a
                                    href="https://wa.me/919876543210"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    WhatsApp Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} SOHO PG. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
