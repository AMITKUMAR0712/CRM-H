'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    links: Array<{ href: string; label: string }>
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[var(--color-background)] shadow-2xl lg:hidden"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                                <span className="font-serif text-xl font-bold">
                                    SOHO<span className="text-[var(--color-clay)]">PG</span>
                                </span>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[var(--color-limestone)] rounded-lg transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Links */}
                            <nav className="flex-1 overflow-y-auto p-6">
                                <ul className="space-y-2">
                                    {links.map((link, index) => (
                                        <motion.li
                                            key={link.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={onClose}
                                                className="block py-3 px-4 text-lg font-medium text-[var(--color-graphite)] hover:bg-[var(--color-limestone)] rounded-lg transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Footer CTAs */}
                            <div className="p-6 border-t border-[var(--color-border)] space-y-3">
                                <Button className="w-full" size="lg" asChild>
                                    <Link href="/contact" onClick={onClose}>
                                        Book a Visit
                                    </Link>
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" asChild>
                                        <a href="tel:+919876543210" className="flex items-center justify-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Call
                                        </a>
                                    </Button>
                                    <Button variant="secondary" asChild>
                                        <a
                                            href="https://wa.me/919876543210"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            WhatsApp
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
