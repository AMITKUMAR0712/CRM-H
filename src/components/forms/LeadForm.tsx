'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useSectors } from '@/lib/hooks'

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Enter valid phone number'),
    email: z.string().email('Enter valid email').optional().or(z.literal('')),
    message: z.string().optional(),
    hasConsent: z.boolean().refine(val => val === true, 'You must agree to proceed'),
})

type FormData = z.infer<typeof schema>

interface LeadFormProps {
    sectorSlug?: string
    pgSlug?: string
}

export default function LeadForm({ sectorSlug, pgSlug }: LeadFormProps) {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sectorId, setSectorId] = useState<string | undefined>(undefined)

    // Fetch sectors to get the ID from slug
    const { data: sectorsData } = useSectors()

    useEffect(() => {
        if (sectorSlug && sectorsData?.data) {
            const sector = sectorsData.data.find(s => s.slug === sectorSlug)
            if (sector) {
                setSectorId(sector.id)
            }
        }
    }, [sectorSlug, sectorsData])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            hasConsent: false,
        },
    })

    const onSubmit = async (data: FormData) => {
        setError(null)
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                    email: data.email || undefined,
                    message: data.message,
                    hasConsent: data.hasConsent,
                    preferredSectorId: sectorId,
                    source: 'website',
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong')
            }

            setSuccess(true)
            reset()
            setTimeout(() => setSuccess(false), 5000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        }
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">Thank You!</h3>
                <p className="text-[var(--color-muted)]">
                    We&apos;ll contact you within 24 hours.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

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

            <div>
                <Input
                    {...register('email')}
                    type="email"
                    placeholder="Email (optional)"
                />
            </div>

            <div>
                <Textarea
                    {...register('message')}
                    placeholder="Any specific requirements?"
                    rows={3}
                />
            </div>

            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    {...register('hasConsent')}
                    id="lead-consent"
                    className="mt-1"
                />
                <label htmlFor="lead-consent" className="text-xs text-[var(--color-muted)]">
                    I agree to receive communications and accept the privacy policy. *
                </label>
            </div>
            {errors.hasConsent && (
                <p className="text-red-500 text-xs">{errors.hasConsent.message}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                    </>
                ) : (
                    'Get Callback'
                )}
            </Button>
        </form>
    )
}
