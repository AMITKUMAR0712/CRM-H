import {
    RoomType,
    OccupancyType,
    UserRole,
    PostStatus,
    LeadStatus,
    Priority,
    PageStatus,
    MenuItemType,
    MenuVisibility,
    PGApprovalStatus,
    type User
} from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'node:crypto'

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

    // ========== 1. USERS (MOCK LOGINS) ==========
    const seedDemoUsers =
        process.env.SEED_DEMO_USERS != null
            ? process.env.SEED_DEMO_USERS === 'true'
            : process.env.NODE_ENV !== 'production'

    const printCreds = process.env.SEED_PRINT_CREDENTIALS === 'true'

    const mkPassword = (prefix: string) => {
        // Generates a strong password with mixed chars (safe for copy/paste).
        const rnd = randomBytes(12).toString('base64url')
        return `${prefix}-${rnd}`
    }

    const getEnv = (key: string) => {
        const v = process.env[key]
        return v && v.trim().length ? v.trim() : null
    }

    const demoUsers = {
        SUPER_ADMIN: {
            name: getEnv('SEED_SUPER_ADMIN_NAME') ?? 'SOHO Super Admin',
            email: getEnv('SEED_SUPER_ADMIN_EMAIL') ?? 'admin@sohopg.com',
            password: getEnv('SEED_SUPER_ADMIN_PASSWORD'),
            phone: getEnv('SEED_SUPER_ADMIN_PHONE') ?? '+919876543210',
            role: UserRole.SUPER_ADMIN,
            passwordPrefix: 'SuperAdmin',
        },
        ADMIN: {
            name: getEnv('SEED_ADMIN_NAME') ?? 'SOHO Admin',
            email: getEnv('SEED_ADMIN_EMAIL') ?? 'admin2@sohopg.com',
            password: getEnv('SEED_ADMIN_PASSWORD'),
            role: UserRole.ADMIN,
            passwordPrefix: 'Admin',
        },
        MANAGER: {
            name: getEnv('SEED_MANAGER_NAME') ?? 'SOHO Manager',
            email: getEnv('SEED_MANAGER_EMAIL') ?? 'manager@sohopg.com',
            password: getEnv('SEED_MANAGER_PASSWORD'),
            role: UserRole.MANAGER,
            passwordPrefix: 'Manager',
        },
        VIEWER: {
            name: getEnv('SEED_VIEWER_NAME') ?? 'SOHO Viewer',
            email: getEnv('SEED_VIEWER_EMAIL') ?? 'viewer@sohopg.com',
            password: getEnv('SEED_VIEWER_PASSWORD'),
            role: UserRole.VIEWER,
            passwordPrefix: 'Viewer',
        },
        USER: {
            name: getEnv('SEED_USER_NAME') ?? 'SOHO User',
            email: getEnv('SEED_USER_EMAIL') ?? 'user@sohopg.com',
            password: getEnv('SEED_USER_PASSWORD'),
            role: UserRole.USER,
            passwordPrefix: 'User',
        },
    } as const

    async function ensureDemoUser(params: {
        name: string
        email: string
        role: UserRole
        passwordPlain?: string | null
        passwordPrefix: string
        phone?: string
    }) {
        const existing = await prisma.user.findUnique({ where: { email: params.email } })

        // Only set/update password when:
        // - creating the user, OR
        // - an explicit env password is provided.
        const shouldSetPassword = !existing || !!params.passwordPlain

        const resolvedPasswordPlain = shouldSetPassword
            ? (params.passwordPlain ?? mkPassword(params.passwordPrefix))
            : null

        const passwordHash = resolvedPasswordPlain ? await bcrypt.hash(resolvedPasswordPlain, 10) : null

        const user = existing
            ? await prisma.user.update({
                where: { email: params.email },
                data: {
                    name: params.name,
                    role: params.role,
                    phone: params.phone,
                    isActive: true,
                    ...(passwordHash ? { password: passwordHash } : {}),
                },
            })
            : await prisma.user.create({
                data: {
                    name: params.name,
                    email: params.email,
                    password: passwordHash!,
                    role: params.role,
                    phone: params.phone,
                },
            })

        return { user, passwordPlain: resolvedPasswordPlain }
    }

    let superAdmin: User | null = null
    let user: User | null = null

    const resolvedPasswords: Partial<Record<keyof typeof demoUsers, string | null>> = {}

    if (seedDemoUsers) {
        const [superAdminRes, adminRes, managerRes, viewerRes, userRes] = await Promise.all([
            ensureDemoUser({
                name: demoUsers.SUPER_ADMIN.name,
                email: demoUsers.SUPER_ADMIN.email,
                role: demoUsers.SUPER_ADMIN.role,
                passwordPlain: demoUsers.SUPER_ADMIN.password,
                passwordPrefix: demoUsers.SUPER_ADMIN.passwordPrefix,
                phone: demoUsers.SUPER_ADMIN.phone,
            }),
            ensureDemoUser({
                name: demoUsers.ADMIN.name,
                email: demoUsers.ADMIN.email,
                role: demoUsers.ADMIN.role,
                passwordPlain: demoUsers.ADMIN.password,
                passwordPrefix: demoUsers.ADMIN.passwordPrefix,
            }),
            ensureDemoUser({
                name: demoUsers.MANAGER.name,
                email: demoUsers.MANAGER.email,
                role: demoUsers.MANAGER.role,
                passwordPlain: demoUsers.MANAGER.password,
                passwordPrefix: demoUsers.MANAGER.passwordPrefix,
            }),
            ensureDemoUser({
                name: demoUsers.VIEWER.name,
                email: demoUsers.VIEWER.email,
                role: demoUsers.VIEWER.role,
                passwordPlain: demoUsers.VIEWER.password,
                passwordPrefix: demoUsers.VIEWER.passwordPrefix,
            }),
            ensureDemoUser({
                name: demoUsers.USER.name,
                email: demoUsers.USER.email,
                role: demoUsers.USER.role,
                passwordPlain: demoUsers.USER.password,
                passwordPrefix: demoUsers.USER.passwordPrefix,
            }),
        ])

        superAdmin = superAdminRes.user
        user = userRes.user

        resolvedPasswords.SUPER_ADMIN = superAdminRes.passwordPlain
        resolvedPasswords.ADMIN = adminRes.passwordPlain
        resolvedPasswords.MANAGER = managerRes.passwordPlain
        resolvedPasswords.VIEWER = viewerRes.passwordPlain
        resolvedPasswords.USER = userRes.passwordPlain

        console.log('✅ Users (demo logins)')

        if (printCreds) {
            console.log('\n🔐 Demo login credentials (DEV only)')
            console.log('Admin panel: /admin/login')
            console.log('User panel:  /login')
            console.log('--------------------------------')
            console.log(`SUPER_ADMIN  ${demoUsers.SUPER_ADMIN.email}  ${resolvedPasswords.SUPER_ADMIN ?? '(unchanged)'}`)
            console.log(`ADMIN        ${demoUsers.ADMIN.email}        ${resolvedPasswords.ADMIN ?? '(unchanged)'}`)
            console.log(`MANAGER      ${demoUsers.MANAGER.email}      ${resolvedPasswords.MANAGER ?? '(unchanged)'}`)
            console.log(`VIEWER       ${demoUsers.VIEWER.email}       ${resolvedPasswords.VIEWER ?? '(unchanged)'}`)
            console.log(`USER         ${demoUsers.USER.email}         ${resolvedPasswords.USER ?? '(unchanged)'}`)
            console.log('--------------------------------\n')
        } else {
            console.log('\nℹ️ Demo users created/updated. Set SEED_PRINT_CREDENTIALS=true to print passwords in console.\n')
        }
    } else {
        // Still need the seed to have an author/actor for later records.
        superAdmin = await prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } })
        user = await prisma.user.findFirst({ where: { role: UserRole.USER } })

        if (!superAdmin || !user) {
            throw new Error(
                'Demo user seeding is disabled, but required users are missing. Set SEED_DEMO_USERS=true (or create a SUPER_ADMIN and USER manually) and re-run seed.'
            )
        }

        console.log('⏭️ Skipping demo user seeding (using existing SUPER_ADMIN/USER).\n')
    }

    if (!superAdmin || !user) {
        throw new Error('Seed requires SUPER_ADMIN and USER to exist.')
    }

    const superAdminUser = superAdmin
    const endUser = user

    // ========== 2. SECTORS ==========
    const [sector51, sector62, sector50] = await Promise.all([
        prisma.sector.upsert({
            where: { slug: 'sector-51' },
            update: {},
            create: {
                name: 'Sector 51',
                slug: 'sector-51',
                description: 'Tech hub near metro',
                metroStation: 'Sector 51 Metro',
                metroDistance: 0.5,
                latitude: 28.4303,
                longitude: 77.3784,
                highlights: ['Near Metro', 'IT Hub']
            },
        }),
        prisma.sector.upsert({
            where: { slug: 'sector-62' },
            update: {},
            create: {
                name: 'Sector 62',
                slug: 'sector-62',
                description: 'Corporate hub',
                metroStation: 'Sector 62 Metro',
                metroDistance: 0.8,
                latitude: 28.6279,
                longitude: 77.3649,
                highlights: ['Corporate', 'Restaurants']
            },
        }),
        prisma.sector.upsert({
            where: { slug: 'sector-50' },
            update: {},
            create: {
                name: 'Sector 50',
                slug: 'sector-50',
                description: 'Residential area',
                metroStation: 'Sector 50 Metro',
                metroDistance: 1.2,
                latitude: 28.4285,
                longitude: 77.3721,
                highlights: ['Quiet', 'Parks']
            },
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

    // ========== 4. SMART CATEGORIES ==========
    const smartCategoriesData = [
        { name: 'Budget Friendly', slug: 'budget-friendly', description: 'Affordable PGs under ₹8000' },
        { name: 'Premium', slug: 'premium', description: 'Premium PGs with luxury amenities' },
        { name: 'Near Metro', slug: 'near-metro', description: 'PGs within 500m of metro stations' },
        { name: 'Girls Only', slug: 'girls-only', description: 'Safe and secure PGs for girls' },
        { name: 'Boys Only', slug: 'boys-only', description: 'PGs exclusively for boys' },
        { name: 'Co-Living', slug: 'co-living', description: 'Modern co-living spaces' },
    ]
    const smartCategories = await Promise.all(
        smartCategoriesData.map(c =>
            prisma.smartCategory.upsert({
                where: { slug: c.slug },
                update: {},
                create: c
            })
        )
    )
    console.log('✅ Smart Categories')

    // ========== 5. PGs ==========
    const pg1 = await prisma.pG.upsert({
        where: { slug: 'soho-premium-51' },
        update: {},
        create: {
            name: 'SOHO Premium',
            slug: 'soho-premium-51',
            sectorId: sector51.id,
            address: 'A-123, Sector 51, Noida',
            roomType: RoomType.SINGLE,
            occupancyType: OccupancyType.BOYS,
            monthlyRent: 12000,
            securityDeposit: 12000,
            totalRooms: 20,
            availableRooms: 5,
            hasAC: true,
            hasWifi: true,
            hasGym: true,
            mealsIncluded: true,
            mealsPerDay: 3,
            isFeatured: true,
            approvalStatus: PGApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedById: superAdminUser.id,
            createdById: superAdminUser.id,
        },
    })
    const pg2 = await prisma.pG.upsert({
        where: { slug: 'soho-comfort-62' },
        update: {},
        create: {
            name: 'SOHO Comfort',
            slug: 'soho-comfort-62',
            sectorId: sector62.id,
            address: 'B-45, Sector 62, Noida',
            roomType: RoomType.DOUBLE,
            occupancyType: OccupancyType.CO_LIVING,
            monthlyRent: 8000,
            securityDeposit: 8000,
            totalRooms: 30,
            availableRooms: 8,
            hasAC: true,
            hasWifi: true,
            mealsIncluded: true,
            mealsPerDay: 2,
            isFeatured: true,
            approvalStatus: PGApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedById: superAdminUser.id,
            createdById: superAdminUser.id,
        },
    })
    const pg3 = await prisma.pG.upsert({
        where: { slug: 'soho-girls-50' },
        update: {},
        create: {
            name: 'SOHO Girls Haven',
            slug: 'soho-girls-50',
            sectorId: sector50.id,
            address: 'C-78, Sector 50, Noida',
            roomType: RoomType.TRIPLE,
            occupancyType: OccupancyType.GIRLS,
            monthlyRent: 7000,
            securityDeposit: 7000,
            totalRooms: 25,
            availableRooms: 10,
            hasAC: false,
            hasWifi: true,
            hasParking: true,
            mealsIncluded: true,
            mealsPerDay: 3,
            isFeatured: false,
            approvalStatus: PGApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedById: superAdminUser.id,
            createdById: superAdminUser.id,
        },
    })
    console.log('✅ PGs')

    // ========== 6. PG_AMENITIES (Junction) ==========
    await prisma.pGAmenity.createMany({
        data: [
            { pgId: pg1.id, amenityId: amenities[0].id },
            { pgId: pg1.id, amenityId: amenities[1].id },
            { pgId: pg1.id, amenityId: amenities[2].id },
            { pgId: pg1.id, amenityId: amenities[4].id },
            { pgId: pg1.id, amenityId: amenities[8].id },
            { pgId: pg2.id, amenityId: amenities[0].id },
            { pgId: pg2.id, amenityId: amenities[2].id },
            { pgId: pg2.id, amenityId: amenities[6].id },
            { pgId: pg3.id, amenityId: amenities[0].id },
            { pgId: pg3.id, amenityId: amenities[2].id },
            { pgId: pg3.id, amenityId: amenities[4].id },
            { pgId: pg3.id, amenityId: amenities[5].id },
        ],
        skipDuplicates: true,
    })
    console.log('✅ PG Amenities')

    // ========== 7. PG_CATEGORIES (Junction) ==========
    await prisma.pgCategory.createMany({
        data: [
            { pgId: pg1.id, categoryId: smartCategories[1].id }, // Premium
            { pgId: pg1.id, categoryId: smartCategories[2].id }, // Near Metro
            { pgId: pg1.id, categoryId: smartCategories[4].id }, // Boys Only
            { pgId: pg2.id, categoryId: smartCategories[0].id }, // Budget Friendly
            { pgId: pg2.id, categoryId: smartCategories[2].id }, // Near Metro
            { pgId: pg2.id, categoryId: smartCategories[5].id }, // Co-Living
            { pgId: pg3.id, categoryId: smartCategories[0].id }, // Budget Friendly
            { pgId: pg3.id, categoryId: smartCategories[3].id }, // Girls Only
        ],
        skipDuplicates: true,
    })
    console.log('✅ PG Categories')

    // ========== 8. PHOTOS ==========
    await prisma.photo.createMany({
        data: [
            { pgId: pg1.id, url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', altText: 'Room view', category: 'Room', isFeatured: true },
            { pgId: pg1.id, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', altText: 'Common area', category: 'Common' },
            { pgId: pg2.id, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', altText: 'Double room', category: 'Room', isFeatured: true },
            { pgId: pg3.id, url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', altText: 'Girls room', category: 'Room', isFeatured: true },
        ],
        skipDuplicates: true,
    })
    console.log('✅ Photos')

    // ========== 9. LEADS ==========
    const lead = await prisma.lead.create({
        data: {
            name: 'Amit Kumar',
            phone: '+919123456789',
            email: 'amit@example.com',
            preferredSectorId: sector51.id,
            budgetMin: 8000,
            budgetMax: 12000,
            roomType: RoomType.SINGLE,
            occupancyType: OccupancyType.BOYS,
            visitSlot: 'Morning',
            message: 'Looking for PG near metro',
            source: 'website',
            status: LeadStatus.NEW,
            priority: Priority.HIGH,
            hasConsent: true,
        },
    })
    console.log('✅ Leads')

    // ========== 10. LEAD_ACTIVITIES ==========
    await prisma.leadActivity.create({
        data: {
            leadId: lead.id,
            activityType: 'NOTE',
            description: 'Initial inquiry received',
            performedById: superAdminUser.id
        },
    })
    console.log('✅ Lead Activities')

    // ========== 11. CATEGORIES ==========
    const category = await prisma.category.upsert({
        where: { slug: 'pg-tips' },
        update: {},
        create: { name: 'PG Tips', slug: 'pg-tips', description: 'Tips for PG living' },
    })
    console.log('✅ Categories')

    // ========== 12. TAGS ==========
    const [tag1, tag2] = await Promise.all([
        prisma.tag.upsert({ where: { slug: 'noida' }, update: {}, create: { name: 'Noida', slug: 'noida' } }),
        prisma.tag.upsert({ where: { slug: 'tips' }, update: {}, create: { name: 'Tips', slug: 'tips' } }),
    ])
    console.log('✅ Tags')

    // ========== 13. BLOG_POSTS ==========
    const post = await prisma.blogPost.upsert({
        where: { slug: '10-tips-pg-noida' },
        update: {},
        create: {
            title: '10 Tips for Choosing PG in Noida',
            slug: '10-tips-pg-noida',
            excerpt: 'Essential tips for finding perfect PG',
            content: '# 10 Tips\n\n1. Check location\n2. Verify amenities\n3. Taste food\n4. Check WiFi\n5. Meet residents',
            categoryId: category.id,
            authorId: superAdminUser.id,
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
            readTime: 5,
            isFeatured: true,
        },
    })
    console.log('✅ Blog Posts')

    // ========== 14. POST_TAGS (Junction) ==========
    await prisma.postTag.createMany({
        data: [
            { postId: post.id, tagId: tag1.id },
            { postId: post.id, tagId: tag2.id }
        ],
        skipDuplicates: true,
    })
    console.log('✅ Post Tags')

    // ========== 15. REVIEWS ==========
    await prisma.review.createMany({
        data: [
            {
                pgId: pg1.id,
                name: 'Rahul Sharma',
                occupation: 'Engineer',
                rating: 5,
                comment: 'Great place! Clean rooms and excellent food.',
                isVerified: true,
                isFeatured: true,
                isApproved: true
            },
            {
                pgId: pg2.id,
                name: 'Priya Singh',
                occupation: 'Designer',
                rating: 4,
                comment: 'Good value for money. Nice community.',
                isVerified: true,
                isFeatured: false,
                isApproved: true
            },
            {
                pgId: pg3.id,
                name: 'Anjali Verma',
                occupation: 'Student',
                rating: 5,
                comment: 'Very safe and comfortable for girls. Highly recommended!',
                isVerified: true,
                isFeatured: true,
                isApproved: true
            },
        ],
        skipDuplicates: true,
    })
    console.log('✅ Reviews')

    // ========== 16. FAQs ==========
    await prisma.fAQ.createMany({
        data: [
            { question: 'What documents are required?', answer: 'Aadhar, PAN, and office ID.', category: 'General', order: 1 },
            { question: 'Is food included?', answer: 'Yes, 2-3 meals per day.', category: 'Facilities', order: 2 },
            { question: 'What is the notice period?', answer: '1 month notice required.', category: 'Booking', order: 3 },
            { question: 'Are visitors allowed?', answer: 'Yes, with prior permission and registration.', category: 'Rules', order: 4 },
            { question: 'Is there power backup?', answer: 'Yes, all our PGs have 24/7 power backup.', category: 'Facilities', order: 5 },
        ],
        skipDuplicates: true,
    })
    console.log('✅ FAQs')

    // ========== 17. SETTINGS ==========
    const settings = [
        { key: 'site_name', value: 'SOHO PG', type: 'text', group: 'general', isPublic: true },
        {
            key: 'site_description',
            value: 'Premium paying guest accommodation in Noida. Experience comfort, safety, and community living at its finest.',
            type: 'text',
            group: 'general',
            isPublic: true,
        },
        { key: 'contact_phone', value: '+919876543210', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_email', value: 'info@sohopg.com', type: 'text', group: 'contact', isPublic: true },
        { key: 'contact_address', value: 'A-123, Sector 51, Noida, Uttar Pradesh 201301', type: 'text', group: 'contact', isPublic: true },
        // Keep legacy key for existing widgets; also add a cleaner key for Footer
        { key: 'whatsapp', value: '+919876543210', type: 'text', group: 'contact', isPublic: true },
        { key: 'whatsapp_number', value: '919876543210', type: 'text', group: 'contact', isPublic: true },

        { key: 'facebook_url', value: 'https://facebook.com', type: 'text', group: 'social', isPublic: true },
        { key: 'instagram_url', value: 'https://instagram.com', type: 'text', group: 'social', isPublic: true },
        { key: 'linkedin_url', value: 'https://linkedin.com', type: 'text', group: 'social', isPublic: true },
        { key: 'youtube_url', value: 'https://youtube.com', type: 'text', group: 'social', isPublic: true },
    ]
    await Promise.all(settings.map(s => prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s })))
    console.log('✅ Settings')

    // ========== 18. CMS PAGES ==========
    const aboutPage = await prisma.page.upsert({
        where: { slug: 'about' },
        update: {
            title: 'About Us',
            status: PageStatus.PUBLISHED,
            isActive: true,
            metaTitle: 'About Us',
            metaDescription: 'Learn about SOHO PG — our story, mission, and commitment to premium PG living in Noida.',
            content: {
                sections: [
                    {
                        type: 'hero',
                        heading: 'Your Trusted Partner for PG Living in Noida',
                        subheading:
                            'Since 2014, SOHO PG has been providing premium paying guest accommodation to working professionals and students in Noida.',
                        ctaLabel: 'Book a Visit',
                        ctaHref: '/contact',
                    },
                    {
                        type: 'stats',
                        items: [
                            { value: '500+', label: 'Happy Residents' },
                            { value: '5', label: 'Locations' },
                            { value: '4.8', label: 'Google Rating' },
                            { value: '10+', label: 'Years Experience' },
                        ],
                    },
                    {
                        type: 'richText',
                        heading: 'Our Story',
                        body:
                            "SOHO PG was founded with a simple vision: to provide young professionals and students a comfortable, safe, and affordable place to live while pursuing their dreams in Noida.\n\nWhat started as a single property in Sector 51 has grown into a network of premium PG accommodations across multiple sectors in Noida. We focus on a complete living experience with hygienic meals, daily housekeeping, and a supportive community.",
                    },
                ],
            },
            publishedAt: new Date(),
            updatedById: superAdminUser.id,
        },
        create: {
            title: 'About Us',
            slug: 'about',
            status: PageStatus.PUBLISHED,
            isActive: true,
            metaTitle: 'About Us',
            metaDescription: 'Learn about SOHO PG — our story, mission, and commitment to premium PG living in Noida.',
            content: {
                sections: [
                    {
                        type: 'hero',
                        heading: 'Your Trusted Partner for PG Living in Noida',
                        subheading:
                            'Since 2014, SOHO PG has been providing premium paying guest accommodation to working professionals and students in Noida.',
                        ctaLabel: 'Book a Visit',
                        ctaHref: '/contact',
                    },
                    {
                        type: 'stats',
                        items: [
                            { value: '500+', label: 'Happy Residents' },
                            { value: '5', label: 'Locations' },
                            { value: '4.8', label: 'Google Rating' },
                            { value: '10+', label: 'Years Experience' },
                        ],
                    },
                    {
                        type: 'richText',
                        heading: 'Our Story',
                        body:
                            "SOHO PG was founded with a simple vision: to provide young professionals and students a comfortable, safe, and affordable place to live while pursuing their dreams in Noida.\n\nWhat started as a single property in Sector 51 has grown into a network of premium PG accommodations across multiple sectors in Noida. We focus on a complete living experience with hygienic meals, daily housekeeping, and a supportive community.",
                    },
                ],
            },
            publishedAt: new Date(),
            createdById: superAdminUser.id,
            updatedById: superAdminUser.id,
        },
        select: { id: true },
    })
    console.log('✅ CMS Pages')

    // ========== 19. CMS MENUS ==========
    async function upsertTopMenuItem(params: {
        title: string
        order: number
        type: MenuItemType
        href?: string
        pageId?: string
        visibility: MenuVisibility
    }) {
        const existing = await prisma.menuItem.findFirst({
            where: {
                title: params.title,
                parentId: null,
                visibility: params.visibility,
                deletedAt: null,
            },
            select: { id: true },
        })

        if (existing) {
            return prisma.menuItem.update({
                where: { id: existing.id },
                data: {
                    type: params.type,
                    href: params.href,
                    pageId: params.pageId,
                    order: params.order,
                    isActive: true,
                    createdById: superAdminUser.id,
                    updatedById: superAdminUser.id,
                },
            })
        }

        return prisma.menuItem.create({
            data: {
                title: params.title,
                type: params.type,
                href: params.href,
                pageId: params.pageId,
                visibility: params.visibility,
                order: params.order,
                isActive: true,
                createdById: superAdminUser.id,
                updatedById: superAdminUser.id,
            },
        })
    }

    await Promise.all([
        upsertTopMenuItem({ title: 'PG Locations', type: MenuItemType.URL, href: '/pg-locations', order: 10, visibility: MenuVisibility.BOTH }),
        upsertTopMenuItem({ title: 'Smart Finder', type: MenuItemType.URL, href: '/smart-finder', order: 20, visibility: MenuVisibility.BOTH }),
        upsertTopMenuItem({ title: 'Gallery', type: MenuItemType.URL, href: '/gallery', order: 30, visibility: MenuVisibility.BOTH }),
        upsertTopMenuItem({ title: 'About Us', type: MenuItemType.PAGE, pageId: aboutPage.id, order: 40, visibility: MenuVisibility.BOTH }),
        upsertTopMenuItem({ title: 'Contact', type: MenuItemType.URL, href: '/contact', order: 50, visibility: MenuVisibility.BOTH }),
        upsertTopMenuItem({ title: 'Blog', type: MenuItemType.URL, href: '/blog', order: 60, visibility: MenuVisibility.BOTH }),
    ])
    console.log('✅ CMS Menus')

    // ========== 20. PAGE_VIEWS ==========
    await prisma.pageView.createMany({
        data: [
            { path: '/', referrer: 'https://google.com' },
            { path: '/pg-locations/sector-51', referrer: 'https://google.com' },
            { path: '/smart-finder' },
        ],
        skipDuplicates: true,
    })
    console.log('✅ Page Views')

    // ========== 21. EMAIL_TEMPLATES ==========
    await prisma.emailTemplate.upsert({
        where: { name: 'lead_notification' },
        update: {},
        create: {
            name: 'lead_notification',
            subject: 'New Lead: {{name}}',
            body: '<h2>New Lead</h2><p>Name: {{name}}</p><p>Phone: {{phone}}</p>',
            variables: ['name', 'phone', 'email', 'message'],
        },
    })
    console.log('✅ Email Templates')

    // ========== 22. NOTIFICATIONS ==========
    await prisma.notification.createMany({
        data: [
            { userId: superAdminUser.id, title: 'Welcome!', message: 'Your admin account is ready.', type: 'success' },
            { userId: endUser.id, title: 'Welcome to SOHO PG', message: 'Your user panel is ready.', type: 'success' },
        ],
        skipDuplicates: true,
    })
    console.log('✅ Notifications')

    // ========== 23. GALLERY_IMAGES ==========
    await prisma.galleryImage.createMany({
        data: [
            { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', album: 'rooms', altText: 'Single room', isFeatured: true, roomType: RoomType.SINGLE },
            { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', album: 'common', altText: 'Lounge' },
            { url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800', album: 'food', altText: 'Dining' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', album: 'rooms', altText: 'Double room', roomType: RoomType.DOUBLE },
        ],
        skipDuplicates: true,
    })
    console.log('✅ Gallery Images')

    // ========== 24. COMPARISONS ==========
    await prisma.comparison.upsert({
        where: { shareCode: 'abc12345' },
        update: {
            pgIds: [pg1.id, pg2.id],
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
        create: {
            pgIds: [pg1.id, pg2.id],
            shareCode: 'abc12345',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
    })
    console.log('✅ Comparisons')

    console.log('\n🎉 All tables seeded!\n')
    if (!printCreds) {
        console.log('ℹ️ To print demo login passwords, re-run seed with SEED_PRINT_CREDENTIALS=true')
    }
}

main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
