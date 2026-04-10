import { PrismaClient } from '@prisma/client'
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

async function check() {
    const users = await prisma.user.findMany({
        select: { email: true, role: true }
    })
    console.log('Current Users:', JSON.stringify(users, null, 2))
}

check()
    .finally(async () => {
        await prisma.$disconnect()
    })
