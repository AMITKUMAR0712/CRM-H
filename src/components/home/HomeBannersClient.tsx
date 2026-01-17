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
        <div className="grid gap-3 md:grid-cols-3">
          {banners.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex items-start gap-4">
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={b.title}
                    src={b.imageUrl}
                    className="w-16 h-16 rounded-md object-cover border border-[var(--color-border)]"
                  />
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{b.title}</div>
                  {b.subtitle ? <div className="text-sm text-[var(--color-muted)] mt-1 line-clamp-2">{b.subtitle}</div> : null}

                  {b.discountType && b.discountValue ? (
                    <div className="mt-2 text-sm">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-limestone)] px-2 py-1">
                        {b.discountType === 'PERCENT' ? `${b.discountValue}% OFF` : `₹${b.discountValue} OFF`}
                      </span>
                    </div>
                  ) : null}

                  {b.ctaHref ? (
                    <div className="mt-3">
                      <Button asChild size="sm" onClick={() => track(b.id, 'CLICK').catch(() => undefined)}>
                        <Link href={b.ctaHref}>{b.ctaLabel || 'Explore'}</Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
