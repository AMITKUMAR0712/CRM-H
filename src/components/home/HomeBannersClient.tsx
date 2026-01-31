'use client'

import * as React from 'react'
import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Banner = {
  id: string
  type: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaHref: string | null
  discountType: string | null
  discountValue: number | null
  validFrom: string | Date | null
  validTill: string | Date | null
}

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

function getSessionId(): string {
  try {
    const key = 'soho_banner_session_id'
    const existing = window.localStorage.getItem(key)
    if (existing) return existing

    const generated = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    window.localStorage.setItem(key, generated)
    return generated
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

async function track(bannerId: string, type: 'IMPRESSION' | 'CLICK') {
  const sessionId = getSessionId()

  const resp = await fetch('/api/banners/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bannerId,
      type,
      path: window.location.pathname,
      sessionId,
    }),
  })

  const json = (await resp.json()) as ApiEnvelope<unknown>
  if (!resp.ok || !json.success) {
    // best-effort tracking
  }
}

export default function HomeBannersClient({ banners }: { banners: Banner[] }) {
  React.useEffect(() => {
    banners.forEach((b) => {
      track(b.id, 'IMPRESSION').catch(() => undefined)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="bg-white border-b border-[var(--color-border)]">
      <div className="container-custom py-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((b) => (
            <Card key={b.id} className="group overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              {b.imageUrl ? (
                <div className="relative w-full overflow-hidden">
                  <div className="aspect-[16/9] w-full bg-[var(--color-muted)]/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={b.title}
                      src={b.imageUrl}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              ) : null}

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-base sm:text-lg truncate">{b.title}</div>
                    {b.subtitle ? (
                      <div className="text-sm text-[var(--color-muted)] mt-1 line-clamp-2">{b.subtitle}</div>
                    ) : null}
                  </div>

                  {b.discountType && b.discountValue ? (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-[var(--color-limestone)] px-2.5 py-1 text-xs font-medium">
                      {b.discountType === 'PERCENT' ? `${b.discountValue}% OFF` : `₹${b.discountValue} OFF`}
                    </span>
                  ) : null}
                </div>

                {b.ctaHref ? (
                  <div className="mt-4">
                    <Button asChild size="sm" className="rounded-full px-5" onClick={() => track(b.id, 'CLICK').catch(() => undefined)}>
                      <Link href={b.ctaHref}>{b.ctaLabel || 'Explore'}</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
