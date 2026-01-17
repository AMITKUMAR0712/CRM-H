'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Sparkles, UserPlus, ShieldCheck, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>

    if (!resp.ok || !json.success) {
      setPending(false)
      setError(json.error || json.message || 'Registration failed')
      return
    }

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/user',
    })

    setPending(false)

    if (!res || res.error) {
      router.push('/login')
      return
    }

    router.push(res.url || '/user')
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-(--color-clay)/20 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-(--color-olive)/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -10, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-white/70 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4 text-(--color-clay)" />
            <span className="text-sm font-medium">Join SOHO PG</span>
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-(--color-graphite)">
            Create your <span className="text-(--color-clay)">SOHO</span> account
          </h1>
          <p className="mt-3 text-base text-muted">
            Get access to tickets, chats, enquiry history, and personalized recommendations.
          </p>

          <div className="mt-8 grid gap-4">
            {[{
              icon: <ShieldCheck className="h-5 w-5 text-(--color-olive)" />,
              title: 'OTP reset ready',
              desc: 'Forgot password? OTP email flow available.',
            }, {
              icon: <Building2 className="h-5 w-5 text-(--color-clay)" />,
              title: 'Premium PG access',
              desc: 'Explore sectors and book visits quickly.',
            }].map((f) => (
              <div key={f.title} className="rounded-2xl border border-(--color-border) bg-white/70 p-4 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{f.icon}</div>
                  <div>
                    <div className="font-semibold text-(--color-graphite)">{f.title}</div>
                    <div className="text-sm text-muted">{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md border border-(--color-border) bg-white/80 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-(--color-limestone)">
                <UserPlus className="h-5 w-5 text-(--color-graphite)" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Create account</h1>
                <p className="text-sm text-muted">Create your user account.</p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button className="w-full" disabled={pending} type="submit">
                {pending ? 'Creating…' : 'Create account'}
              </Button>
            </form>

            <div className="mt-5 text-sm">
              <Link className="text-(--color-clay) hover:underline" href="/login">
                Already have an account? Login
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
