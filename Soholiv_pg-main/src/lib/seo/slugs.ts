const SECTOR_SEO_SLUGS: Record<string, string> = {
    'sector-51': 'best-pg-in-sector-51-noida',
    'sector-168': 'best-pg-in-sector-168-noida-expressway',
    'sector-22': 'best-pg-in-sector-22-noida',
}

const SECTOR_LEGACY_SLUGS = Object.fromEntries(
    Object.entries(SECTOR_SEO_SLUGS).map(([legacySlug, seoSlug]) => [seoSlug, legacySlug])
)

export function getSectorSeoSlug(slug: string) {
    return SECTOR_SEO_SLUGS[slug] || slug
}

export function resolveSectorSlug(slug: string) {
    return SECTOR_LEGACY_SLUGS[slug] || slug
}

export function getPGSeoSlug(pgSlug: string, sectorSlug?: string | null) {
    const sectorSeoSlug = sectorSlug ? getSectorSeoSlug(sectorSlug) : 'best-pg-in-noida'
    return pgSlug.includes(sectorSeoSlug) ? pgSlug : `${pgSlug}-${sectorSeoSlug}`
}

export function resolvePGSlug(slug: string) {
    const seoSuffix = Object.values(SECTOR_SEO_SLUGS).find((suffix) => slug.endsWith(`-${suffix}`))

    if (seoSuffix) {
        return slug.replace(`-${seoSuffix}`, '')
    }

    if (slug.endsWith('-best-pg-in-noida')) {
        return slug.replace('-best-pg-in-noida', '')
    }

    return slug
}
