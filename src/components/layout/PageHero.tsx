import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageHeroProps = {
  kicker?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  actions?: ReactNode
}

export default function PageHero({ kicker, title, subtitle, align = 'center', actions }: PageHeroProps) {
  const isCentered = align === 'center'

  return (
    <section className="relative overflow-hidden pb-10 pt-10 md:pb-12 md:pt-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(176,125,98,0.20),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_12%_30%,rgba(107,112,92,0.14),transparent_58%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(42,42,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(42,42,42,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="container-custom">
        <div className={cn('mx-auto max-w-3xl', isCentered ? 'text-center' : 'text-left')}>
          {kicker ? (
            <div
              className={cn(
                'mb-4 inline-flex items-center rounded-full border border-(--color-border)/70 bg-(--color-alabaster)/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-(--color-graphite) backdrop-blur-md',
                'shadow-[0_12px_30px_rgba(0,0,0,0.06)]'
              )}
            >
              <span className="text-(--color-clay)">{kicker}</span>
            </div>
          ) : null}

          <h1 className="font-serif text-4xl font-bold leading-tight text-(--color-graphite) md:text-5xl">
            {title}
          </h1>

          {subtitle ? (
            <p className={cn('mt-4 text-base text-(--color-muted) md:text-lg', isCentered ? 'mx-auto max-w-2xl' : '')}>
              {subtitle}
            </p>
          ) : null}

          {actions ? (
            <div className={cn('mt-7 flex flex-wrap gap-3', isCentered ? 'justify-center' : 'justify-start')}>
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
