import { useQuery } from '@tanstack/react-query'
import { sectorApi } from '@/lib/api-client'

export interface Sector {
    id: string
    name: string
    slug: string
    description?: string
    metroStation?: string
    metroDistance?: number
    highlights?: string[]
    latitude?: number
    longitude?: number
    isActive: boolean
    pgCount: number
    priceRange: {
        min: number | null
        max: number | null
    }
    _count?: {
        pgs: number
    }
}

interface SectorsResponse {
    success: boolean
    data: Sector[]
}

interface SectorResponse {
    success: boolean
    data: Sector & {
        pgs?: Array<{
            id: string
            name: string
            slug: string
            monthlyRent: number
            roomType: string
            occupancyType: string
            hasAC: boolean
            hasWifi: boolean
            mealsIncluded: boolean
            isFeatured: boolean
            availableRooms: number
        }>
        faqs?: Array<{
            id: string
            question: string
            answer: string
        }>
    }
}

// Fetch all sectors
export function useSectors() {
    return useQuery<SectorsResponse>({
        queryKey: ['sectors'],
        queryFn: () => sectorApi.getAll() as Promise<SectorsResponse>,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

// Fetch a single sector by slug
export function useSector(slug: string) {
    return useQuery<SectorResponse>({
        queryKey: ['sector', slug],
        queryFn: () => sectorApi.getBySlug(slug) as Promise<SectorResponse>,
        enabled: !!slug,
    })
}
