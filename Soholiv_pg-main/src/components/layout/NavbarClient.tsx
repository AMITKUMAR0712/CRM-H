'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu as MenuIcon, Phone } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { motion, useReducedMotion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import MobileMenu from './MobileMenu'
import ThemeToggle from './ThemeToggle'

export type MenuNode = {
  id: string
  title: string
  href: string
  openInNewTab: boolean
  children: MenuNode[]
}

function flattenMenu(menu: MenuNode[]) {
  const flat: Array<{ href: string; label: string }> = []
  const visit = (nodes: MenuNode[]) => {
    for (const n of nodes) {
      flat.push({ href: n.href, label: n.title })
      if (n.children?.length) visit(n.children)
    }
  }
  visit(menu)
  return flat
}

export default function NavbarClient({ headerMenu }: { headerMenu: MenuNode[] }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname() ?? ''
  const prefersReducedMotion = useReducedMotion()

  const user = session?.user
  const dashboardHref = user?.role === 'USER' ? '/user' : '/admin'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActiveHref = (href: string) => {
    if (!href) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const mobileLinks = flattenMenu(headerMenu)

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out',
          'supports-backdrop-filter:backdrop-blur-xl',
          isScrolled
            ? 'py-3 navbar-scrolled'
            : 'py-5 bg-(--color-alabaster)/70 border-b border-(--color-border)/60 shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
        )}
      >
        {/* Premium gradient hairline */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/35 to-transparent" />

        {/* Subtle sheen sweep */}
        {!prefersReducedMotion ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-x-1/3 top-0 h-full rotate-12 bg-[linear-gradient(90deg,transparent,rgba(160,120,90,0.05),transparent)]"
            animate={{ x: ['-35%', '35%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
        ) : null}

        <nav className="container-custom relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative font-serif text-2xl font-bold text-(--color-graphite)">
              <span
                aria-hidden
                className="absolute -inset-x-3 -inset-y-2 rounded-full bg-(--color-clay)/10 blur-xl"
              />
              <span className="relative">
                SOHO<span className="text-(--color-clay)">PG</span>
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {headerMenu.map((item) => {
              const hasChildren = item.children?.length
              const isActive = isActiveHref(item.href)
              const isAnyChildActive = hasChildren ? item.children.some((c) => isActiveHref(c.href)) : false
              const activeTop = isActive || isAnyChildActive
              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'relative rounded-full px-3 py-2 text-sm font-medium transition-all',
                      activeTop
                        ? 'text-(--color-clay) bg-(--color-clay)/10 shadow-[0_10px_25px_rgba(160,120,90,0.18)]'
                        : 'text-(--color-graphite) hover:text-(--color-clay) hover:bg-(--color-limestone)'
                    )}
                  >
                    {item.title}
                  </Link>
                )
              }

              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    className={cn(
                      'relative rounded-full px-3 py-2 text-sm font-medium transition-all',
                      activeTop
                        ? 'text-(--color-clay) bg-(--color-clay)/10 shadow-[0_10px_25px_rgba(160,120,90,0.18)]'
                        : 'text-(--color-graphite) hover:text-(--color-clay) hover:bg-(--color-limestone)'
                    )}
                  >
                    {item.title}
                  </button>
                  <div className="absolute left-0 top-full hidden min-w-60 pt-3 group-hover:block">
                    <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/85 backdrop-blur-xl shadow-[0_22px_60px_rgba(0,0,0,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/35 to-transparent" />
                      <div className="p-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={cn(
                              'block rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                              isActiveHref(child.href)
                                ? 'bg-(--color-clay)/10 text-(--color-clay)'
                                : 'text-(--color-graphite) hover:bg-(--color-limestone)'
                            )}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />

            <Button variant="outline" size="sm" asChild>
              <a href="tel:+919876543210" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={dashboardHref}>My Account</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild disabled={status === 'loading'}>
                <Link href="/login">Login</Link>
              </Button>
            )}

            <Button size="sm" asChild>
              <Link href="/contact">Book a Visit</Link>
            </Button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-(--color-border)/60 bg-(--color-alabaster)/70 backdrop-blur-md shadow-sm hover:bg-(--color-limestone) transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </nav>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} links={mobileLinks} user={user ?? null} />
    </>
  )
}
