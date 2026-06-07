'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  X,
  Send,
  MapPin,
  Phone,
  Sparkles,
  Shield,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, getPhoneLink, getWhatsAppLink } from '@/lib/utils'

type ChatRole = 'user' | 'bot'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  ts: number
}

type Sector = {
  id: string
  name: string
  slug: string
  pgCount?: number
  priceRange?: { min: number | null; max: number | null }
}

type ApiSuccess<T> = {
  success?: boolean
  data?: T
}

const DEFAULT_PHONE = '+91 9871648677'

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalize(text: string) {
  return text.trim().toLowerCase()
}

function containsAny(text: string, needles: string[]) {
  return needles.some((n) => text.includes(n))
}

function formatINR(amount: number | null | undefined) {
  if (!amount && amount !== 0) return null
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `₹${amount}`
  }
}

function isSector(value: unknown): value is Sector {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<Sector>
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.slug === 'string'
}

export default function ChatbotWidget({
  className,
  phone = DEFAULT_PHONE,
}: {
  className?: string
  phone?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [sectors, setSectors] = React.useState<Sector[]>([])
  const [loadingSectors, setLoadingSectors] = React.useState(false)

  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: 'bot',
      ts: Date.now(),
      text:
        "Hi! I'm SoholiV PG Assistant. Ask me about PG locations, rent range, amenities, or booking a visit.",
    },
  ])

  React.useEffect(() => {
    if (!open) return
    if (sectors.length) return

    let cancelled = false
    const load = async () => {
      try {
        setLoadingSectors(true)
        const res = await fetch('/api/sectors', { cache: 'no-store' })
        const json: unknown = await res.json()
        const data = (json as ApiSuccess<unknown>)?.data
        const list = Array.isArray(data) ? data.filter(isSector) : []
        if (!cancelled && list.length) setSectors(list)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingSectors(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, sectors.length])

  const pushBot = React.useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), role: 'bot', text, ts: Date.now() }])
  }, [])

  const pushUser = React.useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text, ts: Date.now() }])
  }, [])

  const answer = React.useCallback(
    (raw: string) => {
      const text = normalize(raw)

      if (!text) return

      // Greetings / small talk
      if (containsAny(text, ['hi', 'hello', 'hey', 'hii', 'namaste'])) {
        pushBot('Hello! Tell me your preferred sector (e.g., Sector 51/168/22) and your monthly budget.')
        return
      }

      // Booking / contact
      if (containsAny(text, ['book', 'visit', 'call', 'contact', 'whatsapp', 'enquiry', 'enquire'])) {
        pushBot(
          `Sure. You can book a visit via Contact page or message on WhatsApp. Quick tip: share your sector + budget + move-in date for fastest options.`
        )
        return
      }

      // Amenities
      if (containsAny(text, ['amenities', 'facility', 'facilities', 'wifi', 'meal', 'food', 'security', 'ac', 'parking'])) {
        pushBot(
          'Popular amenities: 24/7 security, WiFi, meals, housekeeping, power backup, parking. Tell me what you need (AC/WiFi/Meals) and I will suggest the best match.'
        )
        return
      }

      // Locations / sectors
      if (
        containsAny(text, ['location', 'locations', 'sector', 'sectors', 'near metro', 'metro', 'where'])
      ) {
        if (!sectors.length) {
          pushBot('We have PGs in prime Noida sectors like 51, 168, 22. Opening the locations list…')
          return
        }

        const top = sectors
          .filter((s) => s?.name && s?.slug)
          .slice(0, 6)
          .map((s) => {
            const min = formatINR(s.priceRange?.min)
            const max = formatINR(s.priceRange?.max)
            const range = min && max ? `${min} – ${max}` : null
            const count = typeof s.pgCount === 'number' ? `${s.pgCount} PGs` : null
            return `• ${s.name}${count ? ` (${count})` : ''}${range ? ` | ${range}` : ''}`
          })
          .join('\n')

        pushBot(`Top locations:\n${top}\n\nYou can also open Locations page to browse all.`)
        return
      }

      // Budget hints
      const budgetMatch = text.match(/(\d{4,6})/g)
      if (containsAny(text, ['budget', 'rent', 'price', 'per month', 'monthly', '₹', 'rs']) || budgetMatch) {
        const budget = budgetMatch ? Number(budgetMatch[0]) : null
        if (budget && Number.isFinite(budget)) {
          pushBot(
            `Got it. Budget around ₹${budget.toLocaleString('en-IN')}/month. Tell me your preferred sector (51/168/22) and room type (single/double/triple).`
          )
        } else {
          pushBot('Tell me your monthly budget (example: 9000) and preferred sector (51/168/22).')
        }
        return
      }

      // Try to match a sector name directly
      if (sectors.length) {
        const hit = sectors.find((s) => normalize(s.name).includes(text) || text.includes(normalize(s.name)))
        if (hit) {
          const min = formatINR(hit.priceRange?.min)
          const max = formatINR(hit.priceRange?.max)
          const range = min && max ? `${min} – ${max}` : 'varies'
          const count = typeof hit.pgCount === 'number' ? hit.pgCount : null
          pushBot(
            `${hit.name} is a popular area. Approx rent range: ${range}.${count !== null ? ` Available PGs: ${count}.` : ''} You can explore the sector page now.`
          )
          return
        }
      }

      pushBot(
        "I can help with: locations, rent/budget, amenities, and booking. Try: 'Sector 51 PG under 10k' or 'PG with meals and WiFi'."
      )
    },
    [pushBot, sectors]
  )

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    pushUser(t)
    setInput('')
    answer(t)
  }

  return (
    <div className={cn('fixed bottom-6 left-6 z-[60]', className)}>
      {/* Launcher */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'group flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-md',
          'hover:-translate-y-0.5 hover:shadow-xl transition-all',
          open ? 'pointer-events-none opacity-0' : 'opacity-100'
        )}
        aria-label="Open SoholiV PG chatbot"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-clay)] text-white shadow-md shadow-[var(--color-clay)]/30">
          <Bot className="h-4 w-4" />
        </span>
        <div className="leading-tight text-left">
          <p className="text-xs font-semibold text-[var(--color-graphite)]">SoholiV Assistant</p>
          <p className="text-[10px] text-[var(--color-muted)]">Ask about PGs • Locations</p>
        </div>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'w-[min(420px,calc(100vw-48px))] overflow-hidden rounded-3xl border border-[var(--color-border)]',
              'bg-[var(--color-surface)] shadow-2xl'
            )}
            role="dialog"
            aria-label="SoholiV PG chatbot"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-clay)] text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-graphite)]">SoholiV PG Assistant</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {loadingSectors ? 'Loading locations…' : 'Instant answers about PGs'}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => send('Show PG locations')}
              >
                <MapPin className="h-4 w-4" />
                Locations
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => send('What amenities do you provide?')}
              >
                <Shield className="h-4 w-4" />
                Amenities
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={getPhoneLink(phone)}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a
                  href={getWhatsAppLink(phone, 'Hi! Please share best PG options for my budget and sector.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {/* Messages */}
            <div className="max-h-[360px] space-y-3 overflow-y-auto px-5 pb-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex',
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'bg-[var(--color-clay)] text-white'
                        : 'bg-[var(--color-background-alt)] text-[var(--color-graphite)]'
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/pg-locations">
                    Explore Locations
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/contact">
                    Book a Visit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-[var(--color-border)] p-4"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask: 'Sector 62 under 10k'…"
                className={cn(
                  'h-11 flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4',
                  'text-sm text-[var(--color-graphite)] placeholder:text-[var(--color-muted)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]'
                )}
              />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-2xl">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
