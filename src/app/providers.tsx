'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { ReactQueryProvider } from './ReactQueryProvider'
import PageViewTracker from '@/components/analytics/PageViewTracker'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <ReactQueryProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          {children}
        </ReactQueryProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
