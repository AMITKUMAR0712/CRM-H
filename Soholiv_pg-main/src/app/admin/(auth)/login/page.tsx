import { Suspense } from 'react'

import AdminLoginClient from './AdminLoginClient'

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="h-64 w-full max-w-md rounded-2xl border border-(--color-border) bg-surface" />
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  )
}

