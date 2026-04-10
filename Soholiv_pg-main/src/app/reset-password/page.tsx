'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

export default function ResetPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const resp = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>

    setPending(false)

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Reset failed')
      return
    }

    router.push('/login')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Enter the OTP and your new password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="text-sm font-medium">OTP</label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" required />
          </div>
          <div>
            <label className="text-sm font-medium">New password</label>
            <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button className="w-full" disabled={pending} type="submit">
            {pending ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <Link className="text-[var(--color-clay)] hover:underline" href="/login">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  )
}
