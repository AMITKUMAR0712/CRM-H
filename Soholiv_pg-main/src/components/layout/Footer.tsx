import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

type FooterLink = { href: string; label: string }

const FALLBACK_FOOTER_LINKS: FooterLink[] = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pg-locations', label: 'Locations' },
    { href: '/smart-finder', label: 'Smart Finder' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/faqs', label: 'FAQs' },
    { href: '/contact', label: 'Contact Us' },
]

export default async function Footer() {
    let menuItems: Prisma.MenuItemGetPayload<{ include: { page: { select: { slug: true } } } }>[] = []
    let sectors: Array<{ slug: string; name: string }> = []
    let settings: Array<{ key: string; value: string }> = []

    try {
        ;[menuItems, sectors, settings] = await Promise.all([
            prisma.menuItem.findMany({
                where: { deletedAt: null, isActive: true, visibility: { in: ['FOOTER', 'BOTH'] } },
                orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
                include: { page: { select: { slug: true } } },
            }),
            prisma.sector.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
                select: { slug: true, name: true },
                take: 8,
            }),
            prisma.setting.findMany({
                where: { isPublic: true, group: { in: ['contact', 'social', 'general'] } },
                select: { key: true, value: true },
            }),
        ])
    } catch (err) {
        // Keep the page alive with fallbacks if the DB is unreachable.
        console.error('[Footer] Failed to load footer data', err)
    }

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]))
    const siteName = settingsMap.get('site_name') || 'SOHO PG'
    const siteDescription =
        settingsMap.get('site_description') ||
        'Premium paying guest accommodation in Noida. Experience comfort, safety, and community living at its finest.'
    const contactPhone = settingsMap.get('contact_phone') || '+919871648677'
    const contactEmail = settingsMap.get('contact_email') || 'info@sohopg.com'
    const contactAddress = settingsMap.get('contact_address') || 'A-123, Sector 51, Noida, Uttar Pradesh 201301'
    const whatsappNumber = (settingsMap.get('whatsapp_number') || settingsMap.get('whatsapp') || '919871648677').replace(/^\+/, '')

    const socialFacebook = settingsMap.get('facebook_url') || 'https://facebook.com'
    const socialInstagram = settingsMap.get('instagram_url') || 'https://instagram.com'
    const socialLinkedin = settingsMap.get('linkedin_url') || 'https://linkedin.com'
    const socialYoutube = settingsMap.get('youtube_url') || 'https://youtube.com'

    const candidateItems = menuItems.filter((i) => i.parentId === null)
    const sourceItems = candidateItems.length ? candidateItems : menuItems

    const quickLinks: FooterLink[] = sourceItems
        .map((i) => {
            const href = i.type === 'PAGE' ? (i.page?.slug ? `/p/${i.page.slug}` : '') : (i.href ?? '')
            return href ? { href, label: i.title } : null
        })
        .filter(Boolean)
        .slice(0, 12) as FooterLink[]

    const sectorLinks: FooterLink[] = sectors.map((s) => ({ href: `/pg-locations/${s.slug}`, label: s.name }))

    return (
        <footer className="footer-dark-bg text-white">
            {/* Main Footer */}
            <div className="container-custom section-padding">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="font-serif text-2xl font-bold">{siteName}</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {siteDescription}
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href={socialFacebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-(--color-clay) transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href={socialInstagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-(--color-clay) transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href={socialLinkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-(--color-clay) transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href={socialYoutube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-(--color-clay) transition-colors"
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
                            {(quickLinks.length ? quickLinks : FALLBACK_FOOTER_LINKS).map((link) => (
                                <li key={`${link.href}:${link.label}`}>
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
                            {sectorLinks.map((sector) => (
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
                                <MapPin className="w-5 h-5 text-(--color-clay) shrink-0 mt-0.5" />
                                <span className="text-gray-400 text-sm">
                                    {(() => {
                                        const parts = contactAddress.split(',').map((p) => p.trim()).filter(Boolean)
                                        if (parts.length <= 2) return contactAddress
                                        return (
                                            <>
                                                {parts.slice(0, 2).join(', ')},<br />
                                                {parts.slice(2).join(', ')}
                                            </>
                                        )
                                    })()}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-(--color-clay)" />
                                <a
                                    href={`tel:${contactPhone}`}
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    {contactPhone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-(--color-clay)" />
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    {contactEmail}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-(--color-clay)" />
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
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
                        © {new Date().getFullYear()} Soho Liv Co-living. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                            Terms & Conditions
                        </Link>
                        <Link href="/faqs" className="text-gray-400 hover:text-white transition-colors">
                            FAQs
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
