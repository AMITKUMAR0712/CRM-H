'use client'

import * as React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams?.toString()

  React.useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    const path = search ? `${pathname}?${search}` : pathname

    void fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname, search])

  return null
}
