'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, getWhatsAppLink } from '@/lib/utils'

const DEFAULT_PHONE = '+91 98765 43210'

export default function FloatingActions({
  className,
  phone = DEFAULT_PHONE,
}: {
  className?: string
  phone?: string
}) {
  const [showTop, setShowTop] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 650)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={cn('fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-2 md:bottom-6 md:right-6 md:gap-3', className)}>
      <motion.a
        href={getWhatsAppLink(phone, 'Hi! I want to know about available PG rooms in Noida.')}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={cn(
          'group flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg md:gap-3 md:px-4 md:py-3',
          'hover:-translate-y-0.5 hover:shadow-2xl transition-all'
        )}
        aria-label="Chat on WhatsApp"
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-green-500 text-white shadow-md shadow-green-500/30 glow-whatsapp md:h-10 md:w-10">
          <span className="absolute inset-0 rounded-full bg-green-500/60 animate-ping" />
          <MessageCircle className="relative h-4 w-4 md:h-5 md:w-5" />
        </span>
        <div className="hidden leading-tight md:block">
          <p className="text-sm font-semibold text-[var(--color-graphite)]">WhatsApp</p>
          <p className="text-xs text-[var(--color-muted)]">Instant reply • Book visit</p>
        </div>
      </motion.a>

      <AnimatePresence>
        {showTop && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              variant="outline"
              className={cn(
                'h-10 w-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg md:h-12 md:w-12',
                'hover:-translate-y-0.5 hover:shadow-2xl'
              )}
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
