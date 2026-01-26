import { RoomType, OccupancyType, UserRole, PostStatus, LeadStatus, Priority, PageStatus, MenuItemType, MenuVisibility, type User } from '@prisma/client'
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
        data: { leadId: lead.id, activityType: 'NOTE', description: 'Initial inquiry received', performedById: superAdminUser.id },
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
            categoryId: category.id, authorId: superAdminUser.id, status: PostStatus.PUBLISHED, publishedAt: new Date(), readTime: 5, isFeatured: true,
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

    // ========== 16. CMS PAGES ==========
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

    // ========== 17. CMS MENUS ==========
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

    // ========== 18. PAGE_VIEWS ==========
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
    await prisma.notification.createMany({
        data: [
            { userId: superAdminUser.id, title: 'Welcome!', message: 'Your admin account is ready.', type: 'success' },
            { userId: endUser.id, title: 'Welcome to SOHO PG', message: 'Your user panel is ready.', type: 'success' },
        ],
        skipDuplicates: true,
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


    // ========== 21. BLOG_POSTS ==========
    console.log('🌱 Seeding blog posts...')

    // First, ensure we have an admin user as author
    let blogAuthor = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
    })

    if (!blogAuthor) {
        blogAuthor = await prisma.user.create({
            data: {
                email: 'admin@sohopg.com',
                name: 'SOHO PG Team',
                role: 'ADMIN',
                password: 'hashed_password_placeholder',
            },
        })
        console.log('  ✅ Created admin author')
    }

    // Create or find a category for blog posts
    let blogCategory = await prisma.category.findFirst({
        where: { slug: 'pg-tips' },
    })

    if (!blogCategory) {
        blogCategory = await prisma.category.create({
            data: {
                name: 'PG Tips',
                slug: 'pg-tips',
                description: 'Tips and guides for finding and living in PG accommodation',
                isActive: true,
            },
        })
        console.log('  ✅ Created category: PG Tips')
    }

    // Blog Post 1: 10 Tips for Finding Best PG in Noida
    const post1Slug = '10-tips-for-finding-best-pg-in-noida'
    const existingPost1 = await prisma.blogPost.findUnique({
        where: { slug: post1Slug },
    })

    if (!existingPost1) {
        await prisma.blogPost.create({
            data: {
                slug: post1Slug,
                title: '10 Tips for Finding the Best PG in Noida',
                excerpt: 'Looking for a PG in Noida? Here are 10 practical tips to help you find the perfect paying guest accommodation that fits your budget, location preferences, and lifestyle.',
                content: `
<h2>Finding the Right PG in Noida: A Complete Guide</h2>

<p>Moving to Noida for work or studies? Finding the right PG (paying guest) accommodation can feel overwhelming with so many options available. Here's our comprehensive guide to help you make the best choice.</p>

<h3>1. Define Your Budget Clearly</h3>
<p>Before you start searching, set a realistic budget. In Noida, PG rentals typically range from ₹6,000 to ₹15,000 per month depending on the sector, room type, and amenities. Factor in additional costs like security deposit (usually 1-2 months' rent), meals, and utilities.</p>

<h3>2. Choose the Right Sector</h3>
<p>Noida's sectors vary significantly in terms of connectivity, safety, and amenities:</p>
<ul>
<li><strong>Sector 62:</strong> IT hub with excellent connectivity to Noida City Centre Metro</li>
<li><strong>Sector 51:</strong> Residential area with good markets and metro access</li>
<li><strong>Sector 18:</strong> Commercial hub with nightlife and shopping</li>
<li><strong>Sector 137:</strong> Near Expressway, ideal for Gurgaon commuters</li>
</ul>

<h3>3. Check Metro Connectivity</h3>
<p>If you're working in IT parks or need to commute frequently, prioritize PGs near Aqua Line or Blue Line metro stations. This can save you significant time and money on daily commutes.</p>

<h3>4. Visit Before Committing</h3>
<p>Always schedule a physical visit before booking. Photos can be deceiving. During your visit:</p>
<ul>
<li>Check room sizes and natural lighting</li>
<li>Inspect bathroom cleanliness</li>
<li>Meet your potential roommates if it's shared</li>
<li>Test Wi-Fi speed</li>
<li>Check power backup availability</li>
</ul>

<h3>5. Understand the Food Situation</h3>
<p>PGs offering meals can save you ₹3,000-5,000 monthly eating out. Ask about:</p>
<ul>
<li>Meal timings and flexibility</li>
<li>Menu variety (veg/non-veg options)</li>
<li>Kitchen hygiene standards</li>
<li>Guest meal policies</li>
</ul>

<h3>6. Verify Security Measures</h3>
<p>Your safety is paramount. Look for:</p>
<ul>
<li>CCTV cameras at entry points</li>
<li>Biometric or key card access</li>
<li>Security guards (especially important for women's PGs)</li>
<li>Visitor registration system</li>
</ul>

<h3>7. Read the Agreement Carefully</h3>
<p>Before signing, understand:</p>
<ul>
<li>Lock-in period and notice requirements</li>
<li>Deposit refund policy</li>
<li>Rules about guests and overnight stays</li>
<li>Maintenance responsibilities</li>
</ul>

<h3>8. Check Reviews and References</h3>
<p>Search online for reviews. Ask the PG owner for references from current or past residents. Genuine PGs will have no problem connecting you with residents.</p>

<h3>9. Assess Housekeeping Standards</h3>
<p>A clean PG indicates good management. During your visit, check:</p>
<ul>
<li>Common area cleanliness</li>
<li>Bathroom maintenance frequency</li>
<li>Room cleaning schedule</li>
<li>Laundry facilities available</li>
</ul>

<h3>10. Trust Your Instincts</h3>
<p>Finally, trust your gut feeling. If something feels off during your visit—unfriendly staff, hidden costs, or evasive answers—it's better to keep looking. The right PG should feel welcoming from day one.</p>

<h3>Ready to Find Your Perfect PG?</h3>
<p>At SOHO PG, we've done the hard work for you. All our properties are verified for safety, cleanliness, and quality amenities. Use our Smart Finder tool to filter options based on your specific requirements and book a visit today!</p>
`,
                featuredImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
                status: 'PUBLISHED',
                publishedAt: new Date(),
                metaTitle: '10 Tips for Finding Best PG in Noida | SOHO PG Guide',
                metaDescription: 'Expert tips for finding the perfect PG accommodation in Noida. Learn about budgeting, location selection, safety checks, and more.',
                readTime: 8,
                isFeatured: true,
                authorId: blogAuthor.id,
                categoryId: blogCategory.id,
            },
        })
        console.log('  ✅ Created blog post: 10 Tips for Finding Best PG in Noida')
    }

    // Blog Post 2: Living in Noida Sector 51: Complete Guide
    const post2Slug = 'living-in-noida-sector-51-complete-guide'
    const existingPost2 = await prisma.blogPost.findUnique({
        where: { slug: post2Slug },
    })

    if (!existingPost2) {
        await prisma.blogPost.create({
            data: {
                slug: post2Slug,
                title: 'Living in Noida Sector 51: A Complete Guide for PG Residents',
                excerpt: 'Everything you need to know about living in Sector 51, Noida—from metro connectivity and nearby amenities to the best places to eat and work.',
                content: `
<h2>Your Complete Guide to Living in Sector 51, Noida</h2>

<p>Sector 51 is one of the most sought-after residential areas in Noida, especially popular among working professionals and students. Here's everything you need to know about living in this vibrant sector.</p>

<h3>Location & Connectivity</h3>
<p>Sector 51 enjoys excellent connectivity to major areas:</p>
<ul>
<li><strong>Metro Access:</strong> Sector 51 Metro Station (Aqua Line) is within walking distance</li>
<li><strong>Road Connectivity:</strong> Easy access to Noida Expressway and DND Flyway</li>
<li><strong>Delhi:</strong> 35-40 minutes to Connaught Place via metro</li>
<li><strong>Noida City Centre:</strong> Just 3 stations away on Blue Line</li>
</ul>

<h3>Nearby IT Parks & Offices</h3>
<p>Sector 51 is perfectly positioned for IT professionals:</p>
<ul>
<li>Sector 62 IT Hub: 15 minutes by metro</li>
<li>Sector 125-135 Tech Park: 20 minutes via expressway</li>
<li>Noida SEZ: 25 minutes commute</li>
</ul>

<h3>Essential Amenities</h3>
<p>Everything you need is within reach:</p>

<h4>Shopping</h4>
<ul>
<li>Atta Market (Sector 18): 10 minutes</li>
<li>DLF Mall of India: 15 minutes</li>
<li>Local markets within the sector for daily needs</li>
</ul>

<h4>Food & Dining</h4>
<ul>
<li>Multiple restaurants and cafes along main roads</li>
<li>Street food corners for budget meals</li>
<li>Swiggy/Zomato highly active in the area</li>
</ul>

<h4>Healthcare</h4>
<ul>
<li>Yatharth Hospital: 5 minutes</li>
<li>Max Hospital Ghaziabad: 20 minutes</li>
<li>Multiple clinics and pharmacies in sector</li>
</ul>

<h3>Why PG Residents Love Sector 51</h3>

<h4>1. Peaceful Environment</h4>
<p>Unlike commercial sectors, Sector 51 maintains a quiet, residential vibe. It's ideal for those who want to escape the hustle after work while still being connected to it.</p>

<h4>2. Safety</h4>
<p>The sector has active RWA (Resident Welfare Association) and regular police patrolling. Women's safety is particularly good here.</p>

<h4>3. Green Spaces</h4>
<p>Well-maintained parks and green belts throughout the sector make morning jogs and evening walks pleasant.</p>

<h4>4. Affordability</h4>
<p>Compared to sectors like 18 or 62, Sector 51 offers better value for money while maintaining quality living standards.</p>

<h3>PG Rent Guide for Sector 51</h3>
<table>
<tr><th>Room Type</th><th>Average Rent</th></tr>
<tr><td>Single Sharing</td><td>₹12,000 - ₹15,000</td></tr>
<tr><td>Double Sharing</td><td>₹8,000 - ₹10,000</td></tr>
<tr><td>Triple Sharing</td><td>₹6,000 - ₹8,000</td></tr>
</table>
<p><em>Prices include basic amenities. Meals may be additional.</em></p>

<h3>Tips for New Residents</h3>
<ol>
<li><strong>Download metro apps:</strong> DMRC and Delhi Metro Rail apps help plan commutes</li>
<li><strong>Join local groups:</strong> Facebook and WhatsApp groups for Sector 51 residents</li>
<li><strong>Explore on weekends:</strong> Take time to discover local gems and shortcuts</li>
<li><strong>Register with RWA:</strong> Important for security and community involvement</li>
</ol>

<h3>Find Your PG in Sector 51</h3>
<p>Ready to make Sector 51 your new home? SOHO PG has verified, premium PG accommodations in Sector 51 with excellent amenities, security, and community vibes. Use our Smart Finder to explore available options!</p>
`,
                featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
                status: 'PUBLISHED',
                publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                metaTitle: 'Living in Noida Sector 51: Complete Guide | SOHO PG',
                metaDescription: 'Everything about living in Sector 51 Noida - metro connectivity, nearby amenities, safety, and PG rent guide for working professionals.',
                readTime: 6,
                isFeatured: false,
                authorId: blogAuthor.id,
                categoryId: blogCategory.id,
            },
        })
        console.log('  ✅ Created blog post: Living in Noida Sector 51: Complete Guide')
    }

    console.log('✅ Blog posts seeding complete!')
}

main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
