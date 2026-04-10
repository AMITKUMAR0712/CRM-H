import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? '3306'),
  connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? '10'),
  database: process.env.DATABASE_DATABASE,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const manager = await prisma.user.findFirst({ where: { role: 'MANAGER' }, select: { id: true, email: true } })
  if (!manager) {
    console.log('No MANAGER user found')
    return
  }

  const pgs = await prisma.pG.findMany({ select: { id: true } })
  if (!pgs.length) {
    console.log('No PGs found')
    return
  }

  const assignments = pgs.map((pg) => ({ pgId: pg.id, userId: manager.id }))
  const result = await prisma.pgAssignment.createMany({ data: assignments, skipDuplicates: true })

  console.log(`Assigned ${result.count} PGs to manager ${manager.email}`)
}

main()
  .catch((err) => {
    console.error(err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
