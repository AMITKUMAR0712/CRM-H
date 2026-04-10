'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2, Calendar } from 'lucide-react'
import { useSectors } from '@/lib/hooks'

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Enter valid phone number'),
    email: z.string().email('Enter valid email').optional().or(z.literal('')),
    preferredSector: z.string().optional(),
    budgetMin: z.string().optional(),
    budgetMax: z.string().optional(),
    moveInDate: z.string().optional(),
    visitSlot: z.string().optional(),
    message: z.string().optional(),
    hasConsent: z.boolean().refine(val => val === true, 'You must agree to proceed'),
})

type FormData = z.infer<typeof schema>

interface FullLeadFormProps {
    sectorSlug?: string
    pgSlug?: string
    compact?: boolean
}

export default function FullLeadForm({ sectorSlug, pgSlug, compact = false }: FullLeadFormProps) {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sectorId, setSectorId] = useState<string | undefined>(undefined)

    const { data: sectorsData } = useSectors()

    useEffect(() => {
        if (sectorSlug && sectorsData?.data) {
            const sector = sectorsData.data.find(s => s.slug === sectorSlug)
            if (sector) setSectorId(sector.id)
        }
    }, [sectorSlug, sectorsData])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            hasConsent: false,
            preferredSector: sectorSlug || '',
        },
    })

    const selectedSector = watch('preferredSector')

    useEffect(() => {
        if (selectedSector && sectorsData?.data) {
            const sector = sectorsData.data.find(s => s.slug === selectedSector)
            if (sector) setSectorId(sector.id)
        }
    }, [selectedSector, sectorsData])

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
                    budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
                    budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
                    moveInDate: data.moveInDate || undefined,
                    visitSlot: data.visitSlot || undefined,
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
                <p className="text-(--color-muted)">
                    We&apos;ll contact you within 24 hours.
                </p>
            </div>
        )
    }

    const sectors = sectorsData?.data || []

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input
                        {...register('name')}
                        placeholder="Your Name"
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="text-sm font-medium mb-1 block">Phone *</label>
                    <Input
                        {...register('phone')}
                        placeholder="Phone Number"
                        className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="text-sm font-medium mb-1 block">Email (optional)</label>
                <Input
                    {...register('email')}
                    type="email"
                    placeholder="Email Address"
                />
            </div>

            {!compact && (
                <>
                    {/* Preferred Sector */}
                    <div>
                        <label className="text-sm font-medium mb-1 block">Preferred Sector</label>
                        <select
                            {...register('preferredSector')}
                            className="w-full h-12 rounded-lg border border-(--color-border) bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                            defaultValue={sectorSlug}
                        >
                            <option value="">Select a sector</option>
                            {sectors.map((s) => (
                                <option key={s.id} value={s.slug}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Min Budget</label>
                            <select
                                {...register('budgetMin')}
                                className="w-full h-12 rounded-lg border border-(--color-border) bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                            >
                                <option value="">Min</option>
                                <option value="5000">₹5,000</option>
                                <option value="8000">₹8,000</option>
                                <option value="10000">₹10,000</option>
                                <option value="12000">₹12,000</option>
                                <option value="15000">₹15,000</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Max Budget</label>
                            <select
                                {...register('budgetMax')}
                                className="w-full h-12 rounded-lg border border-(--color-border) bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                            >
                                <option value="">Max</option>
                                <option value="8000">₹8,000</option>
                                <option value="10000">₹10,000</option>
                                <option value="12000">₹12,000</option>
                                <option value="15000">₹15,000</option>
                                <option value="20000">₹20,000</option>
                            </select>
                        </div>
                    </div>

                    {/* Move-in Date and Visit Slot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Move-in Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted)" />
                                <Input
                                    {...register('moveInDate')}
                                    type="date"
                                    className="pl-10"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Preferred Visit Slot</label>
                            <select
                                {...register('visitSlot')}
                                className="w-full h-12 rounded-lg border border-(--color-border) bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                            >
                                <option value="">Select a time</option>
                                <option value="Morning">Morning (9 AM - 12 PM)</option>
                                <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                                <option value="Evening">Evening (4 PM - 7 PM)</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {/* Message */}
            <div>
                <label className="text-sm font-medium mb-1 block">Message (optional)</label>
                <Textarea
                    {...register('message')}
                    placeholder="Any specific requirements?"
                    rows={3}
                />
            </div>

            {/* Consent */}
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    {...register('hasConsent')}
                    id="full-lead-consent"
                    className="mt-1"
                />
                <label htmlFor="full-lead-consent" className="text-xs text-(--color-muted)">
                    I agree to receive communications and accept the privacy policy. *
                </label>
            </div>
            {errors.hasConsent && (
                <p className="text-red-500 text-xs">{errors.hasConsent.message}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                    </>
                ) : (
                    'Submit Enquiry'
                )}
            </Button>
        </form>
    )
}
