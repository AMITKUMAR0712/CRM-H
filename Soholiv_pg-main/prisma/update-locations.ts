import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Validate environment variables
const requiredEnvVars = ['DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_CONNECTION_LIMIT', 'DATABASE_DATABASE']
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v])

if (missingEnvVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`)
    process.exit(1)
}

const adapter = new PrismaMariaDb({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT),
    database: process.env.DATABASE_DATABASE,
})

const prisma = new PrismaClient({ adapter })

// Helper to check if data already exists
async function checkExistingData() {
    const sectorCount = await prisma.sector.count()
    const pgCount = await prisma.pG.count()
    const categoryCount = await prisma.smartCategory.count()
    
    return { sectorCount, pgCount, categoryCount }
}

async function main() {
    try {
        const existing = await checkExistingData()
        
        // Only proceed with full reset if explicitly allowed
        const isFullReset = process.argv.includes('--full-reset')
        const isProduction = process.env.NODE_ENV === 'production'
        
        if (isProduction && !isFullReset && (existing.sectorCount > 0 || existing.pgCount > 0)) {
            console.log('⚠️  Production mode detected with existing data.')
            console.log(`📊 Current data: ${existing.sectorCount} sectors, ${existing.pgCount} PGs, ${existing.categoryCount} categories`)
            console.log('🔒 Data preservation mode active. Use --full-reset to override (not recommended in production).')
            return
        }

        if (!isProduction || isFullReset) {
            console.log('🔄 Cleaning up existing data...')
            
            // Delete in order to satisfy foreign keys
            await prisma.chatMessage.deleteMany({})
            await prisma.chatThread.deleteMany({})
            await prisma.enquiryNote.deleteMany({})
            await prisma.enquiry.deleteMany({})
            await prisma.photo.deleteMany({})
            await prisma.pgAssignment.deleteMany({})
            await prisma.pG.deleteMany({})
            await prisma.bannerEvent.deleteMany({})
            await prisma.bannerTarget.deleteMany({})
            await prisma.lead.deleteMany({})
            await prisma.leadActivity.deleteMany({})
            await prisma.sector.deleteMany({})
            
            console.log('✅ Cleanup complete.')
        }

        // 1. Create or Update Sectors
        console.log('🔄 Syncing sectors...')
        const sectorsData = [
            {
                name: 'Sector 51',
                slug: 'sector-51',
                description: 'Premium co-living hub in Sector 51, Noida with excellent metro connectivity.',
                metroStation: 'Sector 51 Metro',
                metroDistance: 0.5,
                latitude: 28.5847,
                longitude: 77.3734,
                highlights: { highlights: ['Near Metro', 'D-Block Market', 'Safe and Secure'] },
            },
            {
                name: 'Sector 22',
                slug: 'sector-22',
                description: 'Strategic residential location in Sector 22, Noida, close to IT parks and commercial zones.',
                metroStation: 'Noida City Centre',
                metroDistance: 2.5,
                latitude: 28.5956,
                longitude: 77.3456,
                highlights: { highlights: ['Market Proximity', 'Quiet Blocks', 'Well Connected'] },
            },
            {
                name: 'Sector 168',
                slug: 'sector-168',
                description: 'Modern emerging hub in Sector 168, Noida Expressway, ideal for professionals.',
                metroStation: 'Sector 142 Metro',
                metroDistance: 1.5,
                latitude: 28.5047,
                longitude: 77.3917,
                highlights: { highlights: ['Expressway Access', 'Corporate Hubs', 'Clean Environment'] },
            }
        ]

        const sectors: Record<string, string> = {}

        for (const sectorData of sectorsData) {
            const sector = await prisma.sector.upsert({
                where: { slug: sectorData.slug },
                update: {
                    name: sectorData.name,
                    description: sectorData.description,
                    metroStation: sectorData.metroStation,
                    metroDistance: sectorData.metroDistance,
                    latitude: sectorData.latitude,
                    longitude: sectorData.longitude,
                    highlights: sectorData.highlights as any,
                },
                create: sectorData as any
            })
            sectors[sectorData.slug] = sector.id
        }

        console.log('✅ Sectors synced.')

        // 2. Get Admin User
        const superAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        })

        if (!superAdmin) {
            console.warn('⚠️  No SUPER_ADMIN found. Using default for new PGs.')
        }

        // 3. Sync PGs
        console.log('🔄 Syncing PGs...')
        const pgsData = [
            {
                name: 'Soho D-Block PG',
                slug: 'soho-d-block-85-1',
                address: 'D Block, House No 85/1, Sector 51, Noida',
                sectorSlug: 'sector-51',
                monthlyRent: 11000,
                roomType: 'SINGLE',
                occupancyType: 'BOYS',
                mainImage: '/sec51no85.jpeg',
                photos: ['/sec51no85.jpeg', '/sec51badno85.jpeg', '/sec51bathno85.jpeg'],
            },
            {
                name: 'Soho 85/14 PG',
                slug: 'soho-85-14-sector-51',
                address: 'House No 85/14, Sector 51, Noida',
                sectorSlug: 'sector-51',
                monthlyRent: 12000,
                roomType: 'DOUBLE',
                occupancyType: 'BOYS',
                mainImage: '/sec51badno85.jpeg',
                photos: ['/sec51badno85.jpeg', '/sec51no85.jpeg', '/sec51bathno85.jpeg'],
            },
            {
                name: 'Soho A1 PG',
                slug: 'soho-a1-h77-sector-51',
                address: 'House No H77, Sector 51, Noida',
                sectorSlug: 'sector-51',
                monthlyRent: 13000,
                roomType: 'SINGLE',
                occupancyType: 'CO_LIVING',
                mainImage: '/sec51no77.jpeg',
                photos: ['/sec51no77.jpeg', '/sec51pgno77.jpeg', '/sec51bad1no77.jpeg', '/sec51bad2no77.jpeg', '/sec51bad3no77.jpeg', '/sec51bathno77.jpeg'],
            },
            {
                name: 'Soho Light PG',
                slug: 'soho-light-f-block-71-1',
                address: 'F Block, 71/1, Sector 51, Noida',
                sectorSlug: 'sector-51',
                monthlyRent: 10500,
                roomType: 'DOUBLE',
                occupancyType: 'BOYS',
                mainImage: '/Sector 51 f block 71.jpeg',
                photos: ['/Sector 51 f block 71.jpeg', '/Sector 51 f block 71-2.jpeg', '/Sector 51 f block 71-3.jpeg', '/Sector 51 f block 71-4.jpeg'],
            },
            {
                name: 'Soho 3-i Co-living PG',
                slug: 'soho-3-i-co-living-sector-168',
                address: 'Soho 3-i Co-living PG, Sector 168, Noida',
                sectorSlug: 'sector-168',
                monthlyRent: 15000,
                roomType: 'SINGLE',
                occupancyType: 'CO_LIVING',
                mainImage: '/sec51pg.jpeg',
                photos: ['/sec51pg.jpeg', '/sec51pg2.jpeg'],
            },
            {
                name: 'Soho Sector 22 PG',
                slug: 'soho-sector-22-house-10',
                address: 'House No 10, Block I, Sector 22, Noida',
                sectorSlug: 'sector-22',
                monthlyRent: 9500,
                roomType: 'DOUBLE',
                occupancyType: 'BOYS',
                mainImage: '/ouse no 10 sector 22 block i.jpeg',
                photos: ['/ouse no 10 sector 22 block i.jpeg', '/ouse no 10 sector 22 block i-1.jpeg', '/ouse no 10 sector 22 block i-3.jpeg', '/ouse no 10 sector 22 block i-4.jpeg'],
            }
        ]

        for (const pgData of pgsData) {
            const existingPg = await prisma.pG.findUnique({
                where: { slug: pgData.slug }
            })

            const pgCreateData = {
                name: pgData.name,
                slug: pgData.slug,
                address: pgData.address,
                sectorId: sectors[pgData.sectorSlug],
                monthlyRent: pgData.monthlyRent,
                roomType: pgData.roomType as any,
                occupancyType: pgData.occupancyType as any,
                description: `${pgData.name} offers premium co-living near ${pgData.address}. Featuring high-speed WiFi, professional housekeeping, and 24/7 security.`,
                availableRooms: 5,
                totalRooms: 20,
                hasAC: true,
                hasWifi: true,
                hasPowerBackup: true,
                mealsIncluded: true,
                isActive: true,
            }

            if (existingPg) {
                // Update existing PG
                await prisma.pG.update({
                    where: { slug: pgData.slug },
                    data: pgCreateData
                })
            } else {
                // Create new PG
                const createdPg = await prisma.pG.create({
                    data: {
                        ...pgCreateData,
                        approvalStatus: 'APPROVED',
                        approvedAt: new Date(),
                        approvedById: superAdmin?.id,
                        createdById: superAdmin?.id,
                    } as any
                })

                // Add photos for new PG only
                await prisma.photo.createMany({
                    data: pgData.photos.map((url, index) => ({
                        pgId: createdPg.id,
                        url: url,
                        altText: `${pgData.name} - Photo ${index + 1}`,
                        isFeatured: url === pgData.mainImage,
                        displayOrder: index
                    }))
                })
            }
        }

        console.log('✅ PGs synced.')

        console.log('🎉 Successfully synced all locations and settings!')
    } catch (error) {
        console.error('❌ Error during sync:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
