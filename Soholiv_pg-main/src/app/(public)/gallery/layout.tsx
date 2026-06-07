import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
    'Noida PG Photos | Soho Liv Rooms, Food & Facilities',
    'View real Soho Liv PG photos from Noida Sector 51, Sector 168 and Sector 22 including rooms, food, common areas, safety features and neighborhood facilities.',
    '/gallery',
    ['Noida PG photos', 'Soho Liv gallery', 'PG rooms in Noida', 'Sector 51 PG photos', 'Sector 168 PG photos', 'Sector 22 PG photos']
)

export default function GalleryLayout({ children }: { children: ReactNode }) {
    return children
}
