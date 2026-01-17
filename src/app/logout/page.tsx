import { Suspense } from 'react'

import LogoutClient from './logout-client'

export default function LogoutPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const raw = searchParams?.callbackUrl
  const callbackUrl = typeof raw === 'string' && raw.length > 0 ? raw : '/'

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-semibold">Signing you out…</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please wait.</p>
        </div>
      }
    >
      <LogoutClient callbackUrl={callbackUrl} />
    </Suspense>
  )
}
