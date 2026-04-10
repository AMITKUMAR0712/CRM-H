import 'dotenv/config'
import { PrismaClient, RoomType, OccupancyType, PGApprovalStatus } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT),
    database: process.env.DATABASE_DATABASE,
})
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🔄 Cleaning up existing locations...')
    
    // Delete in order to satisfy foreign keys
    await prisma.photo.deleteMany({})
    await prisma.pGAmenity.deleteMany({})
    await prisma.pgCategory.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.pG.deleteMany({})
    await prisma.fAQ.deleteMany({ where: { sectorId: { not: null } } })
    await prisma.sector.deleteMany({})
    await prisma.galleryImage.deleteMany({})

    console.log('✅ Cleanup complete.')

    // 1. Create Sectors
    const sector51 = await prisma.sector.create({
        data: {
            name: 'Sector 51',
            slug: 'sector-51',
            description: 'Premium co-living hub in Sector 51, Noida with excellent metro connectivity.',
            metroStation: 'Sector 51 Metro',
            metroDistance: 0.5,
            latitude: 28.5847,
            longitude: 77.3734,
            highlights: ['Near Metro', 'D-Block Market', 'Safe and Secure'],
        }
    })

    const sector22 = await prisma.sector.create({
        data: {
            name: 'Sector 22',
            slug: 'sector-22',
            description: 'Strategic residential location in Sector 22, Noida, close to IT parks and commercial zones.',
            metroStation: 'Noida City Centre',
            metroDistance: 2.5,
            latitude: 28.5956,
            longitude: 77.3456,
            highlights: ['Market Proximity', 'Quiet Blocks', 'Well Connected'],
        }
    })

    const sector168 = await prisma.sector.create({
        data: {
            name: 'Sector 168',
            slug: 'sector-168',
            description: 'Modern emerging hub in Sector 168, Noida Expressway, ideal for professionals.',
            metroStation: 'Sector 142 Metro',
            metroDistance: 1.5,
            latitude: 28.5047,
            longitude: 77.3917,
            highlights: ['Expressway Access', 'Corporate Hubs', 'Clean Environment'],
        }
    })

    console.log('✅ Sectors Created.')

    // 2. Smart Categories
    console.log('🔄 Creating Smart Categories...')
    const smartCategoriesData = [
        { name: 'Budget Friendly', slug: 'budget-friendly', description: 'Affordable luxury PGs starting at great value.' },
        { name: 'Premium', slug: 'premium', description: 'Premium PGs with high-end luxury amenities.' },
        { name: 'Near Metro', slug: 'near-metro', description: 'PGs within walking distance of metro stations.' },
        { name: 'Girls Only', slug: 'girls-only', description: 'Safe and secure PGs exclusively for girls.' },
        { name: 'Boys Only', slug: 'boys-only', description: 'PGs exclusively for boys.' },
        { name: 'Co-Living', slug: 'co-living', description: 'Modern co-living spaces for professionals.' },
    ]

    const smartCategoriesMap: Record<string, string> = {}
    for (const c of smartCategoriesData) {
        const cat = await prisma.smartCategory.upsert({
            where: { slug: c.slug },
            update: { name: c.name, description: c.description },
            create: c
        })
        smartCategoriesMap[c.slug] = cat.id
    }
    console.log('✅ Smart Categories ready.')

    // Get a Super Admin user to assign as creator/approver
    const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    })

    if (!superAdmin) {
        console.error('❌ Super Admin not found. Please run seed first or create an admin.')
        return
    }

    // 3. Create PGs
    const pgsData = [
        {
            name: 'Soho D-Block PG',
            slug: 'soho-d-block-85-1',
            address: 'D Block, House No 85/1, Sector 51, Noida',
            sectorId: sector51.id,
            monthlyRent: 11000,
            roomType: RoomType.SINGLE,
            occupancyType: OccupancyType.BOYS,
            mainImage: '/sec51no85.jpeg',
            photos: ['/sec51no85.jpeg', '/sec51badno85.jpeg', '/sec51bathno85.jpeg'],
            categories: ['premium', 'boys-only', 'near-metro']
        },
        {
            name: 'Soho 85/14 PG',
            slug: 'soho-85-14-sector-51',
            address: 'House No 85/14, Sector 51, Noida',
            sectorId: sector51.id,
            monthlyRent: 12000,
            roomType: RoomType.DOUBLE,
            occupancyType: OccupancyType.BOYS,
            mainImage: '/sec51badno85.jpeg',
            photos: ['/sec51badno85.jpeg', '/sec51no85.jpeg', '/sec51bathno85.jpeg'],
            categories: ['premium', 'boys-only', 'near-metro']
        },
        {
            name: 'Soho A1 PG',
            slug: 'soho-a1-h77-sector-51',
            address: 'House No H77, Sector 51, Noida',
            sectorId: sector51.id,
            monthlyRent: 13000,
            roomType: RoomType.SINGLE,
            occupancyType: OccupancyType.CO_LIVING,
            mainImage: '/sec51no77.jpeg',
            photos: ['/sec51no77.jpeg', '/sec51pgno77.jpeg', '/sec51bad1no77.jpeg', '/sec51bad2no77.jpeg', '/sec51bad3no77.jpeg', '/sec51bathno77.jpeg'],
            categories: ['premium', 'co-living', 'near-metro']
        },
        {
            name: 'Soho Light PG',
            slug: 'soho-light-f-block-71-1',
            address: 'F Block, 71/1, Sector 51, Noida',
            sectorId: sector51.id,
            monthlyRent: 10500,
            roomType: RoomType.DOUBLE,
            occupancyType: OccupancyType.BOYS,
            mainImage: '/Sector 51 f block 71.jpeg',
            photos: ['/Sector 51 f block 71.jpeg', '/Sector 51 f block 71-2.jpeg', '/Sector 51 f block 71-3.jpeg', '/Sector 51 f block 71-4.jpeg'],
            categories: ['budget-friendly', 'boys-only', 'near-metro']
        },
        {
            name: 'Soho 3-i Co-living PG',
            slug: 'soho-3-i-co-living-sector-168',
            address: 'Soho 3-i Co-living PG, Sector 168, Noida',
            sectorId: sector168.id,
            monthlyRent: 15000,
            roomType: RoomType.SINGLE,
            occupancyType: OccupancyType.CO_LIVING,
            mainImage: '/sec51pg.jpeg',
            photos: ['/sec51pg.jpeg', '/sec51pg2.jpeg'],
            categories: ['premium', 'co-living']
        },
        {
            name: 'Soho Sector 22 PG',
            slug: 'soho-sector-22-house-10',
            address: 'House No 10, Block I, Sector 22, Noida',
            sectorId: sector22.id,
            monthlyRent: 9500,
            roomType: RoomType.DOUBLE,
            occupancyType: OccupancyType.BOYS,
            mainImage: '/ouse no 10 sector 22 block i.jpeg',
            photos: ['/ouse no 10 sector 22 block i.jpeg', '/ouse no 10 sector 22 block i-1.jpeg', '/ouse no 10 sector 22 block i-3.jpeg', '/ouse no 10 sector 22 block i-4.jpeg'],
            categories: ['budget-friendly', 'boys-only']
        }
    ]

    for (const pg of pgsData) {
        const createdPg = await prisma.pG.create({
            data: {
                name: pg.name,
                slug: pg.slug,
                address: pg.address,
                sectorId: pg.sectorId,
                monthlyRent: pg.monthlyRent,
                roomType: pg.roomType,
                occupancyType: pg.occupancyType,
                description: `${pg.name} offers premium co-living near ${pg.address}. Featuring high-speed WiFi, professional housekeeping, and 24/7 security.`,
                availableRooms: 5,
                totalRooms: 20,
                hasAC: true,
                hasWifi: true,
                hasPowerBackup: true,
                mealsIncluded: true,
                approvalStatus: PGApprovalStatus.APPROVED,
                approvedAt: new Date(),
                approvedById: superAdmin.id,
                createdById: superAdmin.id,
                isActive: true,
            }
        })

        // Add Photos
        await prisma.photo.createMany({
            data: pg.photos.map((url, index) => ({
                pgId: createdPg.id,
                url: url,
                altText: `${pg.name} - Photo ${index + 1}`,
                isFeatured: url === pg.mainImage,
                displayOrder: index
            }))
        })

        // Link to Categories
        await prisma.pgCategory.createMany({
            data: pg.categories.map(catSlug => ({
                pgId: createdPg.id,
                categoryId: smartCategoriesMap[catSlug]
            }))
        })
    }

    console.log('✅ PGs and Photos Created.')

    // 4. Update Gallery Images
    console.log('🔄 Syncing Gallery images (A to Z)...')
    const fs = await import('fs')
    const path = await import('path')
    const publicDir = path.join(process.cwd(), 'public')
    
    const files = fs.readdirSync(publicDir)
    const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp']
    
    const imageFiles = files.filter(file => 
        imageExtensions.includes(path.extname(file).toLowerCase())
    )

    console.log(`📸 Found ${imageFiles.length} images in public folder.`)

    const galleryData = imageFiles.map(img => {
        let album = "Noida"
        let sectorSlug = "noida"

        const lowerImg = img.toLowerCase()
        if (lowerImg.includes("sec51") || lowerImg.includes("sector 51")) {
            album = "Sector 51"
            sectorSlug = "sector-51"
        } else if (lowerImg.includes("sector 22") || lowerImg.includes("sec22") || lowerImg.includes("ouse no 10")) {
            album = "Sector 22"
            sectorSlug = "sector-22"
        } else if (lowerImg.includes("168")) {
            album = "Sector 168"
            sectorSlug = "sector-168"
        }

        return {
            url: `/${img}`,
            altText: img.replace(/\.[^/.]+$/, "").replace(/-/g, " "),
            album: album,
            sectorSlug: sectorSlug,
            isActive: true
        }
    })

    await prisma.galleryImage.createMany({
        data: galleryData
    })
    console.log(`✅ Gallery fully synced with ${galleryData.length} images.`)

    // 5. Update Global Settings
    console.log('🔄 Updating site settings...')
    const settings = [
        { key: 'site_name', value: 'Soho Liv', type: 'text', group: 'general', isPublic: true },
        {
            key: 'site_description',
            value: 'Premium "Budget Luxury" co-living for students and professionals in Noida. Experience comfort, safety, and community at Soho Liv.',
            type: 'text',
            group: 'general',
            isPublic: true,
        },
        { key: 'contact_phone', value: '+91 9871648677, +91 8595099961', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_email', value: 'soholivpg@gmail.com', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_address', value: 'D 85/14, Sector 51, Near Sector 52 Metro Station, Noida, Uttar Pradesh 201301', type: 'text', group: 'contact', isPublic: true },
        { key: 'whatsapp_number', value: '919871648677', type: 'text', group: 'contact', isPublic: true },
    ]

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting
        })
    }
    console.log('✅ Settings Updated.')

    console.log('🎉 Successfully added all requested locations and updated site settings!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
