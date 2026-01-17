'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, ArrowRight } from 'lucide-react'

export default function CTASection() {
    return (
        <section className="section-padding bg-gradient-to-br from-[var(--color-clay)] to-[var(--color-olive)] text-white">
            <div className="container-custom text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        Ready to Find Your Perfect PG?
                    </h2>
                    <p className="text-white/80 text-lg mb-8">
                        Book a visit today and experience the SOHO PG difference.
                        Limited rooms available in prime locations.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Button size="xl" variant="white" asChild>
                            <Link href="/contact" className="flex items-center gap-2">
                                Book a Visit
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--color-clay)]" asChild>
                            <Link href="/smart-finder">Find My Perfect PG</Link>
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <a
                            href="tel:+919876543210"
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        >
                            <Phone className="w-5 h-5" />
                            <span>+91 98765 43210</span>
                        </a>
                        <a
                            href="https://wa.me/919876543210"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors glow-whatsapp"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
