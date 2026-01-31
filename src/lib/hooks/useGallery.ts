import { useQuery } from '@tanstack/react-query'
import { galleryApi } from '@/lib/api-client'

export interface GalleryImage {
    id: string
    url: string
    altText?: string
    caption?: string
    album: string
    sectorSlug?: string
    pgId?: string
    roomType?: string
    floor?: number
    availability?: string
    isFeatured: boolean
    isActive: boolean
    displayOrder: number
}

interface GalleryResponse {
    success: boolean
    data: GalleryImage[]
}

export function useGallery(params?: { album?: string; sectorSlug?: string }) {
    const queryParams: Record<string, string> = {}
    if (params?.album) queryParams.album = params.album
    if (params?.sectorSlug) queryParams.sectorSlug = params.sectorSlug

    return useQuery<GalleryResponse>({
        queryKey: ['gallery', queryParams],
        queryFn: () => galleryApi.getImages(queryParams) as Promise<GalleryResponse>,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}
