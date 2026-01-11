import { RoomType, OccupancyType, UserRole, PostStatus, LeadStatus, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

import 'dotenv/config'

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
    console.log('🌱 Seeding database...\n')

    // ========== 1. USER ==========
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sohopg.com' },
        update: {},
        create: {
            name: 'SOHO Admin',
            email: 'admin@sohopg.com',
            password: await bcrypt.hash('Admin@123', 10),
            role: UserRole.SUPER_ADMIN,
            phone: '+919876543210',
        },
    })
    console.log('✅ User')

    // ========== 2. SECTORS ==========
    const [sector51, sector62, sector50] = await Promise.all([
        prisma.sector.upsert({
            where: { slug: 'sector-51' },
            update: {},
            create: { name: 'Sector 51', slug: 'sector-51', description: 'Tech hub near metro', metroStation: 'Sector 51 Metro', metroDistance: 0.5, latitude: 28.4303, longitude: 77.3784, highlights: ['Near Metro', 'IT Hub'] },
        }),
        prisma.sector.upsert({
            where: { slug: 'sector-62' },
            update: {},
            create: { name: 'Sector 62', slug: 'sector-62', description: 'Corporate hub', metroStation: 'Sector 62 Metro', metroDistance: 0.8, latitude: 28.6279, longitude: 77.3649, highlights: ['Corporate', 'Restaurants'] },
        }),
        prisma.sector.upsert({
            where: { slug: 'sector-50' },
            update: {},
            create: { name: 'Sector 50', slug: 'sector-50', description: 'Residential area', metroStation: 'Sector 50 Metro', metroDistance: 1.2, latitude: 28.4285, longitude: 77.3721, highlights: ['Quiet', 'Parks'] },
        }),
    ])
    console.log('✅ Sectors')

    // ========== 3. AMENITIES ==========
    const amenitiesData = [
        { name: 'Attached Bathroom', slug: 'attached-bathroom', category: 'Room', icon: 'bath' },
        { name: 'AC', slug: 'ac', category: 'Room', icon: 'snowflake' },
        { name: 'Wi-Fi', slug: 'wifi', category: 'Room', icon: 'wifi' },
        { name: 'Study Table', slug: 'study-table', category: 'Room', icon: 'desk' },
        { name: 'CCTV', slug: 'cctv', category: 'Safety', icon: 'camera' },
        { name: 'Biometric', slug: 'biometric', category: 'Safety', icon: 'fingerprint' },
        { name: 'Housekeeping', slug: 'housekeeping', category: 'Services', icon: 'sparkles' },
        { name: 'Laundry', slug: 'laundry', category: 'Services', icon: 'shirt' },
        { name: 'Gym', slug: 'gym', category: 'Common', icon: 'dumbbell' },
        { name: 'Parking', slug: 'parking', category: 'Common', icon: 'car' },
    ]
    const amenities = await Promise.all(amenitiesData.map(a => prisma.amenity.upsert({ where: { slug: a.slug }, update: {}, create: a })))
    console.log('✅ Amenities')

    // ========== 4. PGs ==========
    const pg1 = await prisma.pG.upsert({
        where: { slug: 'soho-premium-51' },
        update: {},
        create: {
            name: 'SOHO Premium', slug: 'soho-premium-51', sectorId: sector51.id, address: 'A-123, Sector 51, Noida',
            roomType: RoomType.SINGLE, occupancyType: OccupancyType.BOYS, monthlyRent: 12000, securityDeposit: 12000,
            totalRooms: 20, availableRooms: 5, hasAC: true, hasWifi: true, hasGym: true, mealsIncluded: true, mealsPerDay: 3, isFeatured: true,
        },
    })
    const pg2 = await prisma.pG.upsert({
        where: { slug: 'soho-comfort-62' },
        update: {},
        create: {
            name: 'SOHO Comfort', slug: 'soho-comfort-62', sectorId: sector62.id, address: 'B-45, Sector 62, Noida',
            roomType: RoomType.DOUBLE, occupancyType: OccupancyType.CO_LIVING, monthlyRent: 8000, securityDeposit: 8000,
            totalRooms: 30, availableRooms: 8, hasAC: true, hasWifi: true, mealsIncluded: true, mealsPerDay: 2, isFeatured: true,
        },
    })
    console.log('✅ PGs')

    // ========== 5. PG_AMENITIES (Junction) ==========
    await prisma.pGAmenity.createMany({
        data: [
            { pgId: pg1.id, amenityId: amenities[0].id }, { pgId: pg1.id, amenityId: amenities[1].id },
            { pgId: pg1.id, amenityId: amenities[2].id }, { pgId: pg1.id, amenityId: amenities[4].id },
            { pgId: pg2.id, amenityId: amenities[0].id }, { pgId: pg2.id, amenityId: amenities[2].id },
        ],
        skipDuplicates: true,
    })
    console.log('✅ PG Amenities')

    // ========== 6. PHOTOS ==========
    await prisma.photo.createMany({
        data: [
            { pgId: pg1.id, url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', altText: 'Room view', category: 'Room', isFeatured: true },
            { pgId: pg1.id, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', altText: 'Common area', category: 'Common' },
            { pgId: pg2.id, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', altText: 'Double room', category: 'Room', isFeatured: true },
        ],
        skipDuplicates: true,
    })
    console.log('✅ Photos')

    // ========== 7. LEADS ==========
    const lead = await prisma.lead.create({
        data: {
            name: 'Amit Kumar', phone: '+919123456789', email: 'amit@example.com',
            preferredSectorId: sector51.id, budgetMin: 8000, budgetMax: 12000,
            roomType: RoomType.SINGLE, occupancyType: OccupancyType.BOYS, visitSlot: 'Morning',
            message: 'Looking for PG near metro', source: 'website', status: LeadStatus.NEW, priority: Priority.HIGH, hasConsent: true,
        },
    })
    console.log('✅ Leads')

    // ========== 8. LEAD_ACTIVITIES ==========
    await prisma.leadActivity.create({
        data: { leadId: lead.id, activityType: 'NOTE', description: 'Initial inquiry received', performedById: admin.id },
    })
    console.log('✅ Lead Activities')

    // ========== 9. CATEGORIES ==========
    const category = await prisma.category.upsert({
        where: { slug: 'pg-tips' },
        update: {},
        create: { name: 'PG Tips', slug: 'pg-tips', description: 'Tips for PG living' },
    })
    console.log('✅ Categories')

    // ========== 10. TAGS ==========
    const [tag1, tag2] = await Promise.all([
        prisma.tag.upsert({ where: { slug: 'noida' }, update: {}, create: { name: 'Noida', slug: 'noida' } }),
        prisma.tag.upsert({ where: { slug: 'tips' }, update: {}, create: { name: 'Tips', slug: 'tips' } }),
    ])
    console.log('✅ Tags')

    // ========== 11. BLOG_POSTS ==========
    const post = await prisma.blogPost.upsert({
        where: { slug: '10-tips-pg-noida' },
        update: {},
        create: {
            title: '10 Tips for Choosing PG in Noida', slug: '10-tips-pg-noida',
            excerpt: 'Essential tips for finding perfect PG',
            content: '# 10 Tips\n\n1. Check location\n2. Verify amenities\n3. Taste food\n4. Check WiFi\n5. Meet residents',
            categoryId: category.id, authorId: admin.id, status: PostStatus.PUBLISHED, publishedAt: new Date(), readTime: 5, isFeatured: true,
        },
    })
    console.log('✅ Blog Posts')

    // ========== 12. POST_TAGS (Junction) ==========
    await prisma.postTag.createMany({
        data: [{ postId: post.id, tagId: tag1.id }, { postId: post.id, tagId: tag2.id }],
        skipDuplicates: true,
    })
    console.log('✅ Post Tags')

    // ========== 13. REVIEWS ==========
    await prisma.review.create({
        data: { pgId: pg1.id, name: 'Rahul Sharma', occupation: 'Engineer', rating: 5, comment: 'Great place!', isVerified: true, isFeatured: true, isApproved: true },
    })
    console.log('✅ Reviews')

    // ========== 14. FAQs ==========
    await prisma.fAQ.createMany({
        data: [
            { question: 'What documents are required?', answer: 'Aadhar, PAN, and office ID.', category: 'General', order: 1 },
            { question: 'Is food included?', answer: 'Yes, 2-3 meals per day.', category: 'Facilities', order: 2 },
            { question: 'What is the notice period?', answer: '1 month notice required.', category: 'Booking', order: 3 },
        ],
    })
    console.log('✅ FAQs')

    // ========== 15. SETTINGS ==========
    const settings = [
        { key: 'site_name', value: 'SOHO PG', type: 'text', group: 'general', isPublic: true },
        { key: 'contact_phone', value: '+91 98765 43210', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_email', value: 'info@sohopg.com', type: 'text', group: 'contact', isPublic: true },
        { key: 'whatsapp', value: '+919876543210', type: 'text', group: 'contact', isPublic: true },
    ]
    await Promise.all(settings.map(s => prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s })))
    console.log('✅ Settings')

    // ========== 16. PAGE_VIEWS ==========
    await prisma.pageView.createMany({
        data: [
            { path: '/', referrer: 'https://google.com' },
            { path: '/pg-locations/sector-51', referrer: 'https://google.com' },
            { path: '/smart-finder' },
        ],
    })
    console.log('✅ Page Views')

    // ========== 17. EMAIL_TEMPLATES ==========
    await prisma.emailTemplate.upsert({
        where: { name: 'lead_notification' },
        update: {},
        create: {
            name: 'lead_notification', subject: 'New Lead: {{name}}',
            body: '<h2>New Lead</h2><p>Name: {{name}}</p><p>Phone: {{phone}}</p>',
            variables: ['name', 'phone', 'email', 'message'],
        },
    })
    console.log('✅ Email Templates')

    // ========== 18. NOTIFICATIONS ==========
    await prisma.notification.create({
        data: { userId: admin.id, title: 'Welcome!', message: 'Your admin account is ready.', type: 'success' },
    })
    console.log('✅ Notifications')

    // ========== 19. GALLERY_IMAGES ==========
    await prisma.galleryImage.createMany({
        data: [
            { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', album: 'rooms', altText: 'Single room', isFeatured: true },
            { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', album: 'common', altText: 'Lounge' },
            { url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800', album: 'food', altText: 'Dining' },
        ],
    })
    console.log('✅ Gallery Images')

    // ========== 20. COMPARISONS ==========
    await prisma.comparison.create({
        data: { pgIds: [pg1.id, pg2.id], shareCode: 'abc12345', expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) },
    })
    console.log('✅ Comparisons')

    console.log('\n🎉 All tables seeded!\n')
    console.log('📝 Admin: admin@sohopg.com / Admin@123')
}

main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
