'use client'

import * as React from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { ReactQueryProvider } from './ReactQueryProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
