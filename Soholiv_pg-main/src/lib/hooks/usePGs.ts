import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pgApi } from '@/lib/api-client'

export interface PG {
    id: string
    name: string
    slug: string
    monthlyRent: number
    roomType: string
    occupancyType: string
    hasAC: boolean
    hasWifi: boolean
    hasParking: boolean
    hasGym: boolean
    hasPowerBackup?: boolean
    hasLaundry?: boolean
    hasTV?: boolean
    hasFridge?: boolean
    mealsIncluded: boolean
    isFeatured: boolean
    availableRooms: number
    totalRooms: number
    address: string
    description?: string
    securityDeposit?: number
    sector?: {
        name: string
        slug: string
    }
    photos?: {
        id: string
        url: string
        altText?: string
        isFeatured: boolean
    }[]
    amenities?: {
        amenity: {
            name: string
            slug: string
            icon?: string
        }
    }[]
    _count?: {
        reviews: number
    }
    categories?: {
        category: {
            id: string
            name: string
            slug: string
        }
    }[]
}

export interface PGFilters {
    sector?: string
    category?: string
    roomType?: string
    occupancyType?: string
    minRent?: string
    maxRent?: string
    hasAC?: string
    hasWifi?: string
    hasParking?: string
    hasGym?: string
    hasPowerBackup?: string
    hasLaundry?: string
    hasTV?: string
    hasFridge?: string
    mealsIncluded?: string
    isFeatured?: string
    search?: string
    metroDistance?: string
    sortBy?: string
    sortOrder?: string
    page?: string
    limit?: string
}

interface PGResponse {
    success: boolean
    data: PG[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// Fetch all PGs with optional filters
export function usePGs(filters?: PGFilters) {
    const params: Record<string, string> = {}
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value
        })
    }

    return useQuery<PGResponse>({
        queryKey: ['pgs', params],
        queryFn: () => pgApi.getAll(params) as Promise<PGResponse>,
    })
}

// Fetch a single PG by slug
export function usePG(slug: string) {
    return useQuery<{ success: boolean; data: PG }>({
        queryKey: ['pg', slug],
        queryFn: () => pgApi.getById(slug) as Promise<{ success: boolean; data: PG }>,
        enabled: !!slug,
    })
}

// Fetch featured PGs
export function useFeaturedPGs() {
    return useQuery<PGResponse>({
        queryKey: ['pgs', 'featured'],
        queryFn: () => pgApi.getFeatured() as Promise<PGResponse>,
    })
}
