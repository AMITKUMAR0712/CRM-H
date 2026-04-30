'use client'

import { Phone, MessageCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface StickyCtaBarProps {
    phone?: string
    whatsapp?: string
    showBookVisit?: boolean
}

export default function StickyCtaBar({
    phone = '+919871648677',
    whatsapp = '919871648677',
    showBookVisit = true
}: StickyCtaBarProps) {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-(--color-surface)/95 backdrop-blur-md border-t border-(--color-border) shadow-[0_-8px_30px_rgba(0,0,0,0.18)] p-4 md:hidden"
        >
            <div className="container-custom flex gap-3">
                <Button
                    size="lg"
                    className="flex-1"
                    asChild
                >
                    <a href={`tel:${phone}`} className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                    </a>
                </Button>
                <Button
                    size="lg"
                    variant="secondary"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    asChild
                >
                    <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                    </a>
                </Button>
                {showBookVisit && (
                    <Button
                        size="lg"
                        variant="outline"
                        className="flex-1"
                        asChild
                    >
                        <Link href="/contact" className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Visit
                        </Link>
                    </Button>
                )}
            </div>
        </motion.div>
    )
}

// Desktop floating version
export function FloatingCtaDesktop({
    phone = '+919871648677',
    whatsapp = '919871648677'
}: StickyCtaBarProps) {
    return (
        <div className="hidden md:flex fixed bottom-8 right-8 z-40 flex-col gap-3">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <Button
                    size="lg"
                    className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    asChild
                >
                    <a href={`tel:${phone}`} className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Call Now
                    </a>
                </Button>
            </motion.div>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-shadow"
                    asChild
                >
                    <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                    </a>
                </Button>
            </motion.div>
        </div>
    )
}
