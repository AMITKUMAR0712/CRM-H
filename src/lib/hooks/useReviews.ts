import { useQuery } from '@tanstack/react-query'
import { reviewApi, faqApi } from '@/lib/api-client'

export interface Review {
    id: string
    pgId?: string
    name: string
    occupation?: string
    rating: number
    comment: string
    photo?: string
    isVerified: boolean
    isFeatured: boolean
    isApproved: boolean
    createdAt: string
    pg?: {
        name: string
        slug: string
    }
}

export interface FAQ {
    id: string
    question: string
    answer: string
    category?: string
    sectorId?: string
    order: number
    isActive: boolean
}

interface ReviewsResponse {
    success: boolean
    data: {
        reviews: Review[]
        stats: {
            averageRating: number
            totalReviews: number
        }
    }
}

interface FAQsResponse {
    success: boolean
    data: FAQ[]
}

// Fetch approved reviews
export function useReviews() {
    return useQuery<ReviewsResponse>({
        queryKey: ['reviews'],
        queryFn: () => reviewApi.getAll() as Promise<ReviewsResponse>,
        staleTime: 1000 * 60 * 60, // 1 hour
        select: (data) => ({
            ...data,
            data: {
                reviews: data.data.reviews || [],
                stats: data.data.stats,
            }
        })
    })
}

// Fetch FAQs
export function useFAQs() {
    return useQuery<FAQsResponse>({
        queryKey: ['faqs'],
        queryFn: () => faqApi.getAll() as Promise<FAQsResponse>,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}
