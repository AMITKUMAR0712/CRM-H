import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
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

async function reset() {
    console.log('🔄 Creating/Resetting all role-based demo accounts...')

    const accounts = [
        { email: 'admin@sohopg.com', password: 'Admin@123', role: UserRole.SUPER_ADMIN, name: 'Soho Super Admin' },
        { email: 'admin2@sohopg.com', password: 'Admin@123', role: UserRole.ADMIN, name: 'Soho Admin' },
        { email: 'manager@sohopg.com', password: 'Manager@123', role: UserRole.MANAGER, name: 'Soho Manager' },
        { email: 'viewer@sohopg.com', password: 'Viewer@123', role: UserRole.VIEWER, name: 'Soho Viewer' },
        { email: 'user@sohopg.com', password: 'User@123', role: UserRole.USER, name: 'Soho User' },
    ]

    for (const acc of accounts) {
        const hashedPassword = await bcrypt.hash(acc.password, 10)
        
        await prisma.user.upsert({
            where: { email: acc.email },
            update: {
                password: hashedPassword,
                role: acc.role,
                isActive: true,
                name: acc.name
            },
            create: {
                name: acc.name,
                email: acc.email,
                password: hashedPassword,
                role: acc.role,
                isActive: true
            }
        })
        console.log(`✅ ${acc.role} set: ${acc.email} / ${acc.password}`)
    }

    console.log('\n🎉 All accounts are ready!')
}

reset()
    .finally(async () => {
        await prisma.$disconnect()
    })
