import { RoomType, OccupancyType, UserRole, PostStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

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
    console.log('🌱 Seeding database...')

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('Admin@123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sohopg.com' },
        update: {},
        create: {
            name: 'SOHO Admin',
            email: 'admin@sohopg.com',
            password: adminPassword,
            role: UserRole.SUPER_ADMIN,
        },
    })
    console.log('✅ Admin user created')

    // 2. Create Sectors
    const sectors = await Promise.all([
        prisma.sector.upsert({
            where: { slug: 'sector-51' },
            update: {},
            create: {
                name: 'Sector 51',
                slug: 'sector-51',
                description: 'Prime tech hub near Noida City Centre. Close to major IT companies and metro station.',
                metroStation: 'Sector 51 Metro',
                metroDistance: 0.5,
                latitude: 28.4303,
                longitude: 77.3784,
                highlights: ['Near Metro', 'IT Hub', 'Markets Nearby'],
            },
        }),
        prisma.sector.upsert({
            where: { slug: 'sector-62' },
            update: {},
            create: {
                name: 'Sector 62',
                slug: 'sector-62',
                description: 'Major corporate hub with excellent connectivity. Home to top IT companies.',
                metroStation: 'Sector 62 Metro',
                metroDistance: 0.8,
                latitude: 28.6279,
                longitude: 77.3649,
                highlights: ['Corporate Hub', 'Restaurants', 'Good Transport'],
            },
        }),
        prisma.sector.upsert({
            where: { slug: 'sector-50' },
            update: {},
            create: {
                name: 'Sector 50',
                slug: 'sector-50',
                description: 'Peaceful residential area with good amenities and parks.',
                metroStation: 'Sector 50 Metro',
                metroDistance: 1.2,
                latitude: 28.4285,
                longitude: 77.3721,
                highlights: ['Residential', 'Parks', 'Quiet Area'],
            },
        }),
    ])
    console.log(`✅ ${sectors.length} sectors created`)

    // 3. Create Amenities
    const amenitiesData = [
        { name: 'Attached Bathroom', slug: 'attached-bathroom', category: 'Room', icon: 'bath' },
        { name: 'Air Conditioning', slug: 'ac', category: 'Room', icon: 'snowflake' },
        { name: 'Wi-Fi', slug: 'wifi', category: 'Room', icon: 'wifi' },
        { name: 'Study Table', slug: 'study-table', category: 'Room', icon: 'desk' },
        { name: 'Wardrobe', slug: 'wardrobe', category: 'Room', icon: 'archive' },
        { name: 'CCTV', slug: 'cctv', category: 'Safety', icon: 'camera' },
        { name: 'Biometric Entry', slug: 'biometric', category: 'Safety', icon: 'fingerprint' },
        { name: 'Housekeeping', slug: 'housekeeping', category: 'Services', icon: 'sparkles' },
        { name: 'Laundry', slug: 'laundry', category: 'Services', icon: 'shirt' },
        { name: 'Gym', slug: 'gym', category: 'Common', icon: 'dumbbell' },
        { name: 'Common Lounge', slug: 'lounge', category: 'Common', icon: 'sofa' },
        { name: 'Parking', slug: 'parking', category: 'Common', icon: 'car' },
    ]

    for (const amenity of amenitiesData) {
        await prisma.amenity.upsert({
            where: { slug: amenity.slug },
            update: {},
            create: amenity,
        })
    }
    console.log(`✅ ${amenitiesData.length} amenities created`)

    // 4. Create Sample PGs
    const pg1 = await prisma.pG.upsert({
        where: { slug: 'soho-premium-sector-51' },
        update: {},
        create: {
            name: 'SOHO Premium - Sector 51',
            slug: 'soho-premium-sector-51',
            sectorId: sectors[0].id,
            address: 'A-123, Block A, Sector 51, Noida, UP 201301',
            roomType: RoomType.SINGLE,
            occupancyType: OccupancyType.BOYS,
            monthlyRent: 12000,
            securityDeposit: 12000,
            totalRooms: 20,
            availableRooms: 5,
            hasAC: true,
            hasWifi: true,
            hasGym: true,
            hasPowerBackup: true,
            mealsIncluded: true,
            mealsPerDay: 3,
            gateClosingTime: '11:00 PM',
            isFeatured: true,
            metaTitle: 'Premium Single Room PG in Sector 51 Noida',
            metaDescription: 'Fully furnished AC single room PG with meals, gym & WiFi near Sector 51 Metro.',
        },
    })

    const pg2 = await prisma.pG.upsert({
        where: { slug: 'soho-comfort-sector-62' },
        update: {},
        create: {
            name: 'SOHO Comfort - Sector 62',
            slug: 'soho-comfort-sector-62',
            sectorId: sectors[1].id,
            address: 'B-45, Block B, Sector 62, Noida, UP 201309',
            roomType: RoomType.DOUBLE,
            occupancyType: OccupancyType.CO_LIVING,
            monthlyRent: 8000,
            securityDeposit: 8000,
            totalRooms: 30,
            availableRooms: 8,
            hasAC: true,
            hasWifi: true,
            hasPowerBackup: true,
            mealsIncluded: true,
            mealsPerDay: 2,
            gateClosingTime: '10:30 PM',
            isFeatured: true,
        },
    })
    console.log('✅ 2 sample PGs created')

    // 5. Create Blog Category & Post
    const category = await prisma.category.upsert({
        where: { slug: 'pg-tips' },
        update: {},
        create: { name: 'PG Tips', slug: 'pg-tips', description: 'Tips for finding and living in a PG' },
    })

    await prisma.blogPost.upsert({
        where: { slug: '10-tips-choosing-pg-noida' },
        update: {},
        create: {
            title: '10 Essential Tips for Choosing a PG in Noida',
            slug: '10-tips-choosing-pg-noida',
            excerpt: 'Finding the perfect PG can be overwhelming. Here are 10 tips to help you make the right choice.',
            content: `# 10 Essential Tips for Choosing a PG in Noida

Finding the right PG accommodation is crucial for your comfort and productivity. Here's what to look for:

## 1. Location & Connectivity
Choose a PG near your workplace or college. Check metro connectivity and bus routes.

## 2. Safety & Security
Look for CCTV cameras, biometric entry, and 24/7 security guards.

## 3. Room Quality
Check ventilation, natural light, and furniture condition before finalizing.

## 4. Food Quality
If meals are included, taste the food before committing.

## 5. WiFi Speed
Essential for work-from-home. Test the internet speed during your visit.`,
            categoryId: category.id,
            authorId: admin.id,
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
            readTime: 5,
            isFeatured: true,
        },
    })
    console.log('✅ Blog category & post created')

    // 6. Create FAQs
    const faqs = [
        { question: 'What documents are required for PG admission?', answer: 'You need a valid ID proof (Aadhar/PAN), passport-size photos, and office/college ID.', category: 'General' },
        { question: 'Is there a lock-in period?', answer: 'Yes, typically 1 month notice period is required before vacating.', category: 'Booking' },
        { question: 'Are meals included in the rent?', answer: 'It varies by PG. Most of our PGs offer 2-3 meals per day included in rent.', category: 'Facilities' },
        { question: 'What are the payment options?', answer: 'We accept UPI, bank transfer, and cash. Rent is due by 5th of each month.', category: 'Payments' },
    ]

    for (let i = 0; i < faqs.length; i++) {
        await prisma.fAQ.create({
            data: { ...faqs[i], order: i + 1 },
        })
    }
    console.log(`✅ ${faqs.length} FAQs created`)

    // 7. Create Settings
    const settings = [
        { key: 'site_name', value: 'SOHO PG', type: 'text', group: 'general', isPublic: true },
        { key: 'site_tagline', value: 'Premium PG Accommodation in Noida', type: 'text', group: 'general', isPublic: true },
        { key: 'contact_phone', value: '+91 98765 43210', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_email', value: 'info@sohopg.com', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_address', value: 'A-123, Sector 51, Noida, UP 201301', type: 'text', group: 'contact', isPublic: true },
        { key: 'whatsapp_number', value: '+919876543210', type: 'text', group: 'contact', isPublic: true },
    ]

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
        })
    }
    console.log(`✅ ${settings.length} settings created`)

    // 8. Create Sample Review
    await prisma.review.create({
        data: {
            pgId: pg1.id,
            name: 'Rahul Sharma',
            occupation: 'Software Engineer',
            rating: 5,
            comment: 'Excellent PG with great food and facilities. The rooms are clean and well-maintained. Staff is very helpful.',
            isVerified: true,
            isFeatured: true,
            isApproved: true,
        },
    })
    console.log('✅ Sample review created')

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📝 Admin Login:')
    console.log('   Email: admin@sohopg.com')
    console.log('   Password: Admin@123')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
