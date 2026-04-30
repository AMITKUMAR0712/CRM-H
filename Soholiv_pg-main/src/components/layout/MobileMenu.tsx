'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Phone, MessageCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    links: Array<{ href: string; label: string }>
    user?: Session['user'] | null
}

export default function MobileMenu({ isOpen, onClose, links, user = null }: MobileMenuProps) {
    const pathname = usePathname() ?? ''
    const prefersReducedMotion = useReducedMotion()

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
                        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm lg:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            'fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm lg:hidden',
                            'border-l border-(--color-border)/70',
                            'bg-(--color-alabaster)/90 backdrop-blur-xl',
                            'shadow-[0_30px_80px_rgba(0,0,0,0.22)]'
                        )}
                    >
                        {/* Premium hairline + subtle sheen */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-(--color-clay)/25 to-transparent" />
                        {!prefersReducedMotion ? (
                            <motion.div
                                aria-hidden
                                className="pointer-events-none absolute -inset-y-8 -inset-x-1/2 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(160,120,90,0.06),transparent)]"
                                animate={{ x: ['-40%', '40%'] }}
                                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : null}

                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="relative flex items-center justify-between p-6 border-b border-(--color-border)/70">
                                <span className="relative font-serif text-xl font-bold text-(--color-graphite)">
                                    <span aria-hidden className="absolute -inset-x-3 -inset-y-2 rounded-full bg-(--color-clay)/10 blur-xl" />
                                    <span className="relative">
                                        SOHO<span className="text-(--color-clay)">PG</span>
                                    </span>
                                </span>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl border border-(--color-border)/70 bg-(--color-alabaster)/70 backdrop-blur-md shadow-sm hover:bg-(--color-limestone) transition-colors"
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
                                                className={cn(
                                                    'block rounded-2xl px-4 py-3 text-[15px] font-medium transition-all',
                                                    pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`))
                                                        ? 'bg-(--color-clay)/10 text-(--color-clay) shadow-[0_18px_45px_rgba(160,120,90,0.16)]'
                                                        : 'text-(--color-graphite) hover:bg-(--color-limestone)'
                                                )}
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Footer CTAs */}
                            <div className="p-6 border-t border-[var(--color-border)] space-y-3">
                                <div className="flex items-center justify-between rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md px-4 py-3 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium text-(--color-graphite)">Theme</p>
                                        <p className="text-xs text-(--color-muted)">Light / Dark</p>
                                    </div>
                                    <ThemeToggle />
                                </div>

                                {user ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" asChild>
                                            <Link href={user.role === 'USER' ? '/user' : '/admin'} onClick={onClose}>
                                                My Account
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                onClose()
                                                signOut({ callbackUrl: '/' })
                                            }}
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" asChild>
                                            <Link href="/login" onClick={onClose}>
                                                Login
                                            </Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/register" onClick={onClose}>
                                                Register
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                <Button className="w-full" size="lg" asChild>
                                    <Link href="/contact" onClick={onClose}>
                                        Book a Visit
                                    </Link>
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" asChild>
<<<<<<< HEAD
                                        <a href="tel:+919871648677" className="flex items-center justify-center gap-2">
=======
                                        <a href="tel:+919876543210" className="flex items-center justify-center gap-2">
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                                            <Phone className="w-4 h-4" />
                                            Call
                                        </a>
                                    </Button>
                                    <Button variant="secondary" asChild>
                                        <a
<<<<<<< HEAD
                                            href="https://wa.me/919871648677"
=======
                                            href="https://wa.me/919876543210"
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 glow-whatsapp"
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
