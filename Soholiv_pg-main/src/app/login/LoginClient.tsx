'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, KeyRound, ShieldCheck, Sparkles, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams?.get('callbackUrl') || '/user'

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const demoAccounts = [
    { label: 'User Demo', email: 'user@sohopg.com', password: 'User@123' },
    { label: 'Admin Demo', email: 'admin@sohopg.com', password: 'Admin@123' },
  ]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setPending(false)

    if (!res || res.error) {
      setError(res?.error || 'Login failed')
      return
    }

    router.push(res.url || callbackUrl)
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-(--color-clay)/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-(--color-olive)/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2">
        {/* Left: Branding / PG vibe */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
<<<<<<< HEAD
          <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface)\/70 px-4 py-2 backdrop-blur">
=======
          <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-white/70 px-4 py-2 backdrop-blur">
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
            <Sparkles className="h-4 w-4 text-(--color-clay)" />
            <span className="text-sm font-medium">Premium PG experience</span>
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-(--color-graphite)">
            Welcome back to <span className="text-(--color-clay)">SOHO PG</span>
          </h1>
          <p className="mt-3 text-base text-muted">
            Login to manage visits, tickets, chats and your bookings—fast, secure and smooth.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5 text-(--color-olive)" />,
                title: 'Secure login',
                desc: 'JWT session + account restrictions enforced.',
              },
              {
                icon: <Building2 className="h-5 w-5 text-(--color-clay)" />,
                title: 'PG dashboard',
                desc: 'Everything you need in one place.',
              },
              {
                icon: <MapPin className="h-5 w-5 text-(--color-graphite)" />,
                title: 'Locations & Smart Finder',
                desc: 'Find the right sector, faster.',
              },
            ].map((f) => (
<<<<<<< HEAD
              <div key={f.title} className="rounded-2xl border border-(--color-border) bg-(--color-surface)\/70 p-4 backdrop-blur">
=======
              <div key={f.title} className="rounded-2xl border border-(--color-border) bg-white/70 p-4 backdrop-blur">
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
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
<<<<<<< HEAD
          <Card className="w-full max-w-md border border-(--color-border) bg-(--color-surface)\/80 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface)\/70 px-3 py-2 text-sm font-medium text-(--color-graphite) backdrop-blur transition-colors hover:bg-(--color-limestone)"
=======
          <Card className="w-full max-w-md border border-(--color-border) bg-white/80 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-white/70 px-3 py-2 text-sm font-medium text-(--color-graphite) backdrop-blur transition-colors hover:bg-(--color-limestone)"
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Home
              </Link>

              <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-(--color-limestone) px-3 py-2 text-xs font-medium text-(--color-graphite)">
                Secure Login
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-(--color-limestone)">
                <KeyRound className="h-5 w-5 text-(--color-graphite)" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Login</h1>
                <p className="text-sm text-muted">Sign in to access your panel.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {demoAccounts.map((a) => (
                <Button
                  key={a.label}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmail(a.email)
                    setPassword(a.password)
                    setError(null)
                  }}
                >
                  {a.label}
                </Button>
              ))}
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              ) : null}

              <Button className="w-full" disabled={pending} type="submit">
                {pending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link className="text-(--color-clay) hover:underline" href="/forgot-password">
                Forgot password?
              </Link>
              <Link className="text-(--color-clay) hover:underline" href="/register">
                Create account
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
