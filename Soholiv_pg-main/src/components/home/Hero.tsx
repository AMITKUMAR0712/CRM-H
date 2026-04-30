'use client'

import { Button } from '@/components/ui/button'
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'
import {
    BedDouble,
    Building2,
    ChevronDown,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    Wifi,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const headlines = [
    { main: 'Find Your', accent: 'Perfect PG', sub: 'in Noida' },
    { main: 'Premium', accent: 'Accommodation', sub: 'for Professionals' },
    { main: 'Safe &', accent: 'Comfortable', sub: 'Living Spaces' },
    { main: 'Metro-Connected', accent: 'Modern PGs', sub: 'in Every Sector' },
]

type TypewriterPart = { text: string; className?: string }

function TypewriterHeadline({
    parts,
    className,
    loop = false,
    typingDelayMs = 70,
    deletingDelayMs = 40,
    pauseAfterTypedMs = 1200,
    pauseAfterDeletedMs = 450,
}: {
    parts: TypewriterPart[]
    className?: string
    loop?: boolean
    typingDelayMs?: number
    deletingDelayMs?: number
    pauseAfterTypedMs?: number
    pauseAfterDeletedMs?: number
}) {
    const prefersReducedMotion = useReducedMotion()
    const fullText = useMemo(() => parts.map((p) => p.text).join(''), [parts])

    if (prefersReducedMotion) {
        return (
            <span className={className}>
                {parts.map((p, idx) => (
                    <span key={idx} className={p.className}>
                        {p.text}
                    </span>
                ))}
            </span>
        )
    }

    return (
        <TypewriterAnimated
            key={fullText}
            parts={parts}
            className={className}
            loop={loop}
            typingDelayMs={typingDelayMs}
            deletingDelayMs={deletingDelayMs}
            pauseAfterTypedMs={pauseAfterTypedMs}
            pauseAfterDeletedMs={pauseAfterDeletedMs}
        />
    )
}

function TypewriterAnimated({
    parts,
    className,
    loop,
    typingDelayMs,
    deletingDelayMs,
    pauseAfterTypedMs,
    pauseAfterDeletedMs,
}: {
    parts: TypewriterPart[]
    className?: string
    loop: boolean
    typingDelayMs: number
    deletingDelayMs: number
    pauseAfterTypedMs: number
    pauseAfterDeletedMs: number
}) {
    const fullText = useMemo(() => parts.map((p) => p.text).join(''), [parts])
    const [visibleCount, setVisibleCount] = useState(0)
    const [mode, setMode] = useState<'typing' | 'deleting'>('typing')

    useEffect(() => {
        let timeoutId: number | undefined

        if (mode === 'typing') {
            if (visibleCount < fullText.length) {
                timeoutId = window.setTimeout(() => setVisibleCount((c) => c + 1), typingDelayMs)
            } else if (loop) {
                timeoutId = window.setTimeout(() => setMode('deleting'), pauseAfterTypedMs)
            }
        } else {
            if (visibleCount > 0) {
                timeoutId = window.setTimeout(
                    () => setVisibleCount((c) => Math.max(0, c - 1)),
                    deletingDelayMs
                )
            } else {
                timeoutId = window.setTimeout(() => setMode('typing'), pauseAfterDeletedMs)
            }
        }

        return () => {
            if (timeoutId) window.clearTimeout(timeoutId)
        }
    }, [
        mode,
        visibleCount,
        fullText.length,
        loop,
        typingDelayMs,
        deletingDelayMs,
        pauseAfterTypedMs,
        pauseAfterDeletedMs,
    ])

    const done = visibleCount >= fullText.length
    const renderedParts = useMemo(() => {
        return parts.reduce<{ cursor: number; nodes: ReactNode[] }>(
            (acc, p, idx) => {
                const start = acc.cursor
                const visibleInThisPart = Math.max(0, Math.min(visibleCount - start, p.text.length))
                const shown = p.text.slice(0, visibleInThisPart)

                return {
                    cursor: start + p.text.length,
                    nodes: [
                        ...acc.nodes,
                        <span key={idx} className={p.className}>
                            {shown}
                        </span>,
                    ],
                }
            },
            { cursor: 0, nodes: [] }
        ).nodes
    }, [parts, visibleCount])

    return (
        <span className={className}>
            {renderedParts}
            {!done || loop ? (
                <motion.span
                    aria-hidden
                    className="inline-block w-[0.08em] -mb-[0.06em] ml-[0.08em] rounded-sm bg-(--color-graphite)"
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                >
                    &nbsp;
                </motion.span>
            ) : null}
        </span>
    )
}

function HeroBackgroundAnimation({
    targetRef,
    sheenDurationSec = 14,
}: {
    targetRef: React.RefObject<HTMLElement | null>
    sheenDurationSec?: number
}) {
    const prefersReducedMotion = useReducedMotion()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const mqSmall = window.matchMedia('(max-width: 768px)')
        const mqCoarse = window.matchMedia('(pointer: coarse)')
        const update = () => setIsMobile(mqSmall.matches || mqCoarse.matches)
        update()
        mqSmall.addEventListener('change', update)
        mqCoarse.addEventListener('change', update)
        return () => {
            mqSmall.removeEventListener('change', update)
            mqCoarse.removeEventListener('change', update)
        }
    }, [])

    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)
    const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24, mass: 0.8 })
    const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24, mass: 0.8 })

    // Scroll-based parallax (depth shift on scroll)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start end', 'end start'],
    })
    const scrollShift = useSpring(useTransform(scrollYProgress, [0, 1], [-1, 1]), {
        stiffness: 80,
        damping: 20,
    })

    const pointerFactor = prefersReducedMotion || isMobile ? 0 : 1
    const depthSmX = useTransform(smoothX, (v) => v * 10 * pointerFactor)
    const depthSmY = useTransform(smoothY, (v) => v * 10 * pointerFactor)
    const depthMdX = useTransform(smoothX, (v) => v * 18 * pointerFactor)
    const depthMdY = useTransform(smoothY, (v) => v * 18 * pointerFactor)
    const depthLgX = useTransform(smoothX, (v) => v * 26 * pointerFactor)
    const depthLgY = useTransform(smoothY, (v) => v * 26 * pointerFactor)

    const scrollSmY = useTransform(scrollShift, (v) => v * 10)
    const scrollMdY = useTransform(scrollShift, (v) => v * 18)
    const scrollLgY = useTransform(scrollShift, (v) => v * 26)

    const orbSmY = useTransform([depthSmY, scrollSmY], (input: number[]) => (input[0] ?? 0) + (input[1] ?? 0))
    const orbMdY = useTransform([depthMdY, scrollMdY], (input: number[]) => (input[0] ?? 0) + (input[1] ?? 0))
    const orbLgY = useTransform([depthLgY, scrollLgY], (input: number[]) => (input[0] ?? 0) + (input[1] ?? 0))

    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        if (prefersReducedMotion || isMobile) return

        const onMove = (e: PointerEvent) => {
            if (rafRef.current) return
            rafRef.current = window.requestAnimationFrame(() => {
                rafRef.current = null
                const w = window.innerWidth || 1
                const h = window.innerHeight || 1
                const nx = (e.clientX / w) * 2 - 1
                const ny = (e.clientY / h) * 2 - 1
                pointerX.set(nx)
                pointerY.set(ny)
            })
        }

        window.addEventListener('pointermove', onMove, { passive: true })
        return () => {
            window.removeEventListener('pointermove', onMove)
            if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [prefersReducedMotion, isMobile, pointerX, pointerY])

    const floaters = useMemo(() => {
        const m = isMobile ? 0.75 : 1
        const amp = isMobile ? 0.65 : 1
        return [
            {
                Icon: BedDouble,
                top: '16%',
                left: '8%',
                size: 52 * m,
                color: 'text-(--color-clay)',
                blur: 'blur-[0.4px]',
                o: 'opacity-15',
                d: 18,
                dx: 14 * amp,
                dy: -18 * amp,
                t: 13,
            },
            {
                Icon: Building2,
                top: '22%',
                left: '78%',
                size: 54 * m,
                color: 'text-(--color-olive)',
                blur: 'blur-[0.6px]',
                o: 'opacity-12',
                d: 22,
                dx: -16 * amp,
                dy: 16 * amp,
                t: 15,
            },
            {
                Icon: MapPin,
                top: '64%',
                left: '12%',
                size: 46 * m,
                color: 'text-(--color-graphite)',
                blur: 'blur-[0.5px]',
                o: 'opacity-10',
                d: 16,
                dx: 10 * amp,
                dy: 18 * amp,
                t: 14,
            },
            {
                Icon: Wifi,
                top: '70%',
                left: '80%',
                size: 46 * m,
                color: 'text-(--color-clay)',
                blur: 'blur-[0.4px]',
                o: 'opacity-10',
                d: 20,
                dx: -12 * amp,
                dy: -14 * amp,
                t: 16,
            },
            {
                Icon: ShieldCheck,
                top: '42%',
                left: '48%',
                size: 62 * m,
                color: 'text-(--color-olive)',
                blur: 'blur-[0.7px]',
                o: 'opacity-10',
                d: 24,
                dx: 18 * amp,
                dy: -12 * amp,
                t: 18,
            },
        ]
    }, [isMobile])

    const particles = useMemo(() => {
        const count = isMobile ? 14 : 26
        return Array.from({ length: count }).map((_, i) => {
            const r1 = (Math.sin(i * 999) + 1) / 2
            const r2 = (Math.sin(i * 1337 + 1.5) + 1) / 2
            const r3 = (Math.sin(i * 777 + 2.2) + 1) / 2
            return {
                id: i,
                top: `${10 + r1 * 80}%`,
                left: `${6 + r2 * 88}%`,
                size: 2 + Math.round(r3 * 3),
                opacity: (isMobile ? 0.04 : 0.05) + r2 * (isMobile ? 0.09 : 0.12),
                driftX: (-18 + r1 * 36) * (isMobile ? 0.75 : 1),
                driftY: (-22 + r3 * 44) * (isMobile ? 0.75 : 1),
                dur: 10 + r1 * 10,
            }
        })
    }, [isMobile])

    // Subtle light sweep speed control; slightly slower on mobile.
    const effectiveSheenDuration = isMobile ? sheenDurationSec * 1.2 : sheenDurationSec

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {!prefersReducedMotion ? (
                <motion.div
                    className="absolute -inset-x-1/3 top-0 h-full rotate-12 bg-[linear-gradient(90deg,transparent,rgba(160,120,90,0.06),transparent)]"
                    animate={{ x: ['-35%', '35%'] }}
                    transition={{ duration: effectiveSheenDuration, repeat: Infinity, ease: 'linear' }}
                />
            ) : null}

            <div
                className="absolute inset-0 opacity-[0.14] mix-blend-multiply"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 4px)',
                }}
            />

            <motion.div
                className="absolute -inset-x-20 -top-24 h-130 rounded-full bg-(--color-clay)/16 blur-3xl"
                style={{ x: depthLgX, y: orbLgY }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.22, 0.32, 0.22] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -left-24 top-24 h-115 w-115 rounded-full bg-(--color-olive)/14 blur-3xl"
                style={{ x: depthMdX, y: orbMdY }}
                animate={{ x: ['-2%', '2%', '-2%'], y: ['0%', '3%', '0%'] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -right-24 bottom-10 h-130 w-130 rounded-full bg-(--color-clay)/12 blur-3xl"
                style={{ x: depthSmX, y: orbSmY }}
                animate={{ x: ['2%', '-2%', '2%'], y: ['0%', '-3%', '0%'] }}
                transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div className="absolute inset-0" style={{ x: depthSmX, y: orbSmY }}>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-black"
                        style={{
                            top: p.top,
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            opacity: p.opacity,
                        }}
                        animate={{ x: [0, p.driftX, 0], y: [0, p.driftY, 0] }}
                        transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </motion.div>

            <motion.div className="absolute inset-0" style={{ x: depthMdX, y: orbMdY }}>
                {floaters.map((f, idx) => {
                    const Icon = f.Icon

                    if (prefersReducedMotion) {
                        return (
                            <div
                                key={idx}
                                className={`absolute ${f.color} ${f.o} ${f.blur}`}
                                style={{ top: f.top, left: f.left, transform: 'translate(-50%, -50%)' }}
                            >
                                <Icon style={{ width: f.size, height: f.size }} />
                            </div>
                        )
                    }

                    return (
                        <motion.div
                            key={idx}
                            className="absolute"
                            style={{ top: f.top, left: f.left, transform: 'translate(-50%, -50%)' }}
                            animate={{
                                x: [0, f.dx, 0, -f.dx, 0],
                                y: [0, f.dy, 0, -f.dy, 0],
                                rotate: [0, f.d / 2, 0, -f.d / 2, 0],
                            }}
                            transition={{ duration: f.t, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div
                                className={`${f.color} ${f.o} ${f.blur} drop-shadow-[0_12px_30px_rgba(0,0,0,0.08)]`}
                            >
                                <Icon style={{ width: f.size, height: f.size }} />
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}

export default function Hero() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const prefersReducedMotion = useReducedMotion()
    const [headlineIndex, setHeadlineIndex] = useState(0)

    // Cycle through headlines
    useEffect(() => {
        if (prefersReducedMotion) return
        const interval = setInterval(() => {
            setHeadlineIndex((prev) => (prev + 1) % headlines.length)
        }, 6000) // Change every 6 seconds
        return () => clearInterval(interval)
    }, [prefersReducedMotion])

    const headlineParts = useMemo(
        () => [
            { text: `${headlines[headlineIndex].main} ` },
            { text: headlines[headlineIndex].accent, className: 'text-gradient' },
            { text: `\n${headlines[headlineIndex].sub}` },
        ],
        [headlineIndex]
    )

    const scrollToContent = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-(--color-alabaster) via-(--color-limestone) to-(--color-alabaster)"
        >
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-soft-grey) 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <HeroBackgroundAnimation targetRef={sectionRef} sheenDurationSec={14} />

            <div className="pointer-events-none absolute -top-24 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-(--color-clay)/25 blur-3xl" />
            <div className="pointer-events-none absolute top-20 left-10 h-90 w-90 rounded-full bg-(--color-olive)/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 right-10 h-105 w-105 rounded-full bg-(--color-clay)/15 blur-3xl" />

            <div className="container-custom relative z-10 text-center py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="group relative inline-flex rounded-full p-px mb-8"
                    >
                        {/* Ambient glow */}
                        <motion.span
                            aria-hidden
                            className="absolute -inset-2 rounded-full bg-(--color-clay)/25 blur-xl"
                            animate={prefersReducedMotion ? undefined : { opacity: [0.25, 0.5, 0.25] }}
                            transition={prefersReducedMotion ? undefined : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Gradient border */}
                        <span
                            aria-hidden
                            className="absolute inset-0 rounded-full bg-linear-to-r from-(--color-clay)/55 via-(--color-olive)/25 to-(--color-clay)/55 opacity-80"
                        />

                        <span className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-(--color-clay) bg-(--color-alabaster)/75 backdrop-blur-md border border-white/40 shadow-sm overflow-hidden">
                            {/* Shimmer sweep */}
                            {!prefersReducedMotion ? (
                                <motion.span
                                    aria-hidden
                                    className="absolute -inset-x-1/3 top-0 h-full rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-40"
                                    animate={{ x: ['-35%', '35%'] }}
                                    transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : null}

                            <span
                                className="relative h-2.5 w-2.5 rounded-full bg-linear-to-br from-(--color-clay) to-(--color-olive) shadow-[0_0_0_3px_rgba(160,120,90,0.16),0_0_18px_rgba(160,120,90,0.35)]"
                                aria-hidden
                            />
                            <span className="relative tracking-wide">Premium PG Accommodation</span>
                        </span>
                    </motion.div>

                    <h1
                        className="font-serif font-bold text-(--color-graphite) mb-8 leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                        style={{ textWrap: 'balance' }}
                    >
                        <span className="block min-h-[2.2em] md:min-h-[2.35em]">
                            <TypewriterHeadline
                                parts={headlineParts}
                                className="whitespace-pre-wrap"
                                loop
                                typingDelayMs={85}
                                deletingDelayMs={45}
                                pauseAfterTypedMs={1400}
                                pauseAfterDeletedMs={550}
                            />
                        </span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10"
                    >
                        Experience comfort, safety, and community living in Noida&apos;s finest paying guest
                        accommodations. AC rooms, meals included, 24/7 security.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button size="xl" asChild>
                            <Link href="/smart-finder">Find My Perfect PG</Link>
                        </Button>
                        <Button size="xl" variant="outline" asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center gap-6 mt-8"
                    >
                        <a
<<<<<<< HEAD
                            href="tel:+919871648677"
                            className="flex items-center gap-2 text-sm text-muted hover:text-(--color-clay) transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            +91 9871648677
                        </a>
                        <a
                            href="https://wa.me/919871648677"
=======
                            href="tel:+919876543210"
                            className="flex items-center gap-2 text-sm text-muted hover:text-(--color-clay) transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            +91 98765 43210
                        </a>
                        <a
                            href="https://wa.me/919876543210"
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted hover:text-green-400 transition-colors glow-whatsapp"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </a>
                    </motion.div>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={scrollToContent}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted hover:text-(--color-clay) transition-colors"
                >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-(--color-background) to-transparent" />
        </section>
    )
}
