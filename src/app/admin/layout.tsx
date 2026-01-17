import type { Metadata } from 'next'
import AdminProviders from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Admin | SOHO PG',
    template: '%s | Admin | SOHO PG',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        {children}
      </div>
    </AdminProviders>
  )
}
