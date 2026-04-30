'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutClient({ callbackUrl }: { callbackUrl: string }) {
  useEffect(() => {
    signOut({ callbackUrl }).catch(() => {
      window.location.href = callbackUrl
    })
  }, [callbackUrl])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Signing you out…</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please wait.</p>
    </div>
  )
}
