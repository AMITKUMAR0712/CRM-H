'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { cn, getWhatsAppLink } from '@/lib/utils'

const DEFAULT_PHONE = '+91 9871648677'

export default function FloatingActions({
  className,
  phone = DEFAULT_PHONE,
}: {
  className?: string
  phone?: string
}) {
  return (
    <div className={cn('fixed bottom-6 right-6 z-[60] flex flex-col gap-3', className)}>
      <motion.a
        href={getWhatsAppLink(phone, 'Hi! I want to know about available PG rooms in Noida.')}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={cn(
          'group flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-md',
          'hover:-translate-y-0.5 hover:shadow-xl transition-all'
        )}
        aria-label="Chat on WhatsApp"
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-green-500 text-white shadow-md shadow-green-500/30 glow-whatsapp">
          <span className="absolute inset-0 rounded-full bg-green-500/60 animate-ping" />
          <MessageCircle className="relative h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-[var(--color-graphite)]">WhatsApp</p>
          <p className="text-[10px] text-[var(--color-muted)]">Instant reply • Book visit</p>
        </div>
      </motion.a>
    </div>
  )
}
