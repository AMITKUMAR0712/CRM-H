import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import HomeBannersClient from './HomeBannersClient'

const getHomeBanners = unstable_cache(
  async () => {
    const now = new Date()

    try {
      return await prisma.banner.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
            { OR: [{ validTill: null }, { validTill: { gte: now } }] },
            { targets: { some: { scope: 'HOME' } } },
          ],
        },
        orderBy: [{ priority: 'desc' }, { displayOrder: 'asc' }],
        select: {
          id: true,
          type: true,
          title: true,
          subtitle: true,
          imageUrl: true,
          ctaLabel: true,
          ctaHref: true,
          discountType: true,
          discountValue: true,
          validFrom: true,
          validTill: true,
        },
        take: 3,
      })
    } catch (err) {
      console.error('[HomeBanners] Failed to load banners:', err)
      return []
    }
  },
  ['home-banners'],
  { revalidate: 60 }
)

export default async function HomeBanners() {
  const banners = await getHomeBanners()

  if (!banners.length) return null

  return <HomeBannersClient banners={banners} />
}
