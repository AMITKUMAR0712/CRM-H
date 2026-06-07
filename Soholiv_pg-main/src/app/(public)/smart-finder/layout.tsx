import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
    'Find Best PG in Noida | Soho Liv Smart Finder',
    'Use Soho Liv Smart Finder to compare affordable PGs in Noida and Greater Noida by sector, budget, room type, AC, WiFi, meals and amenities.',
    '/smart-finder',
    ['find PG in Noida', 'best PG finder Noida', 'Noida PG search', 'affordable PG Noida', 'Sector 168 PG', 'Sector 51 PG', 'Sector 22 PG']
)

export default function SmartFinderLayout({ children }: { children: ReactNode }) {
    return children
}
