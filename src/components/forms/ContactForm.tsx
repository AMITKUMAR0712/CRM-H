'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2 } from 'lucide-react'

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Enter valid phone number'),
    email: z.string().email('Enter valid email').optional().or(z.literal('')),
    preferredSector: z.string().optional(),
    budget: z.string().optional(),
    moveInDate: z.string().optional(),
    message: z.string().optional(),
    hasConsent: z.boolean().refine(val => val === true, 'You must agree to proceed'),
})

type FormData = z.infer<typeof schema>

const sectors = [
    { value: '', label: 'Select Sector' },
    { value: 'sector-50', label: 'Sector 50' },
    { value: 'sector-51', label: 'Sector 51' },
    { value: 'sector-52', label: 'Sector 52' },
    { value: 'sector-62', label: 'Sector 62' },
    { value: 'sector-76', label: 'Sector 76' },
]

const budgets = [
    { value: '', label: 'Select Budget' },
    { value: '5000-8000', label: '₹5,000 - ₹8,000' },
    { value: '8000-12000', label: '₹8,000 - ₹12,000' },
    { value: '12000-15000', label: '₹12,000 - ₹15,000' },
    { value: '15000+', label: '₹15,000+' },
]

export default function ContactForm() {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { hasConsent: false },
    })

    const onSubmit = async (data: FormData) => {
        setError(null)
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    source: 'contact_page',
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong')
            }

            setSuccess(true)
            reset()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        }
    }

    if (success) {
        return (
            <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h3 className="font-serif text-2xl font-semibold mb-2">Thank You!</h3>
                <p className="text-[var(--color-muted)]">
                    We&apos;ve received your message and will contact you within 24 hours.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Input
                        {...register('name')}
                        placeholder="Your Name *"
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <Input
                        {...register('phone')}
                        placeholder="Phone Number *"
                        className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                </div>
            </div>

            <Input {...register('email')} type="email" placeholder="Email (optional)" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                    {...register('preferredSector')}
                    className="h-12 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 text-base"
                >
                    {sectors.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>

                <select
                    {...register('budget')}
                    className="h-12 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 text-base"
                >
                    {budgets.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                </select>
            </div>

            <Input {...register('moveInDate')} type="date" placeholder="Preferred Move-in Date" />

            <Textarea {...register('message')} placeholder="Your message or requirements..." rows={4} />

            <div className="flex items-start gap-2">
                <input type="checkbox" {...register('hasConsent')} id="consent" className="mt-1" />
                <label htmlFor="consent" className="text-sm text-[var(--color-muted)]">
                    I agree to receive communications and accept the privacy policy. *
                </label>
            </div>
            {errors.hasConsent && (
                <p className="text-red-500 text-xs">{errors.hasConsent.message}</p>
            )}

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                    </>
                ) : (
                    'Send Message'
                )}
            </Button>
        </form>
    )
}
