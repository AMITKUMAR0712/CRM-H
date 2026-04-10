import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

type AdapterConfig = {
  user: string
  password: string
  host: string
  port: number
  database: string
  connectionLimit: number
}

function getAdapterConfig(): AdapterConfig | null {
  const host = process.env.DATABASE_HOST
  const port = process.env.DATABASE_PORT ?? '3306'
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD ?? ''
  const database = process.env.DATABASE_DATABASE
  const connectionLimit = Number(process.env.DATABASE_CONNECTION_LIMIT ?? '10')

  if (host && user && database) {
    return {
      host,
      port: Number(port),
      user,
      password,
      database,
      connectionLimit,
    }
  }

  const url = process.env.DATABASE_URL
  if (!url) return null

  try {
    const parsed = new URL(url)
    const dbName = parsed.pathname.replace(/^\//, '')
    if (!parsed.hostname || !parsed.username || !dbName) return null
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password || ''),
      database: dbName,
      connectionLimit,
    }
  } catch {
    return null
  }
}

const adapterConfig = getAdapterConfig()
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaMariaDb(adapterConfig ?? {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'soholiv_db',
    connectionLimit: 10,
  }),
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma