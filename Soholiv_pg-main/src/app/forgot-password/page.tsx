'use client'

import * as React from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const resp = await fetch('/api/auth/forgot-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>

    setPending(false)

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to request OTP')
      return
    }

    setDone(true)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Enter your email and we&apos;ll send an OTP (valid for 10 minutes).
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          {done ? (
            <div className="text-sm text-green-700">If the email exists, an OTP has been sent.</div>
          ) : null}

          <Button className="w-full" disabled={pending} type="submit">
            {pending ? 'Sending…' : 'Send OTP'}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link className="text-[var(--color-clay)] hover:underline" href="/reset-password">
            I have an OTP
          </Link>
          <Link className="text-[var(--color-clay)] hover:underline" href="/login">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  )
}
