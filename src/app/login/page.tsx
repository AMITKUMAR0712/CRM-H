import { Suspense } from 'react'

import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="h-12 w-48 rounded-xl bg-(--color-limestone)" />
          <div className="mt-6 h-64 rounded-2xl border border-(--color-border) bg-(--color-surface)" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
