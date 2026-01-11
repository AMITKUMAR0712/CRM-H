import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT),
  database: process.env.DATABASE_DATABASE,
})
const prisma = new PrismaClient({ adapter })

export default prisma