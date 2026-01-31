const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function getAdapterConfig() {
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT ?? '3306';
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD ?? '';
  const database = process.env.DATABASE_DATABASE;
  const connectionLimit = Number(process.env.DATABASE_CONNECTION_LIMIT ?? '10');

  if (host && user && database) {
    return {
      host,
      port: Number(port),
      user,
      password,
      database,
      connectionLimit,
    };
  }

  const url = process.env.DATABASE_URL;
  if (!url) return {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'soholiv_db',
    connectionLimit,
  };

  try {
    const parsed = new URL(url);
    const dbName = parsed.pathname.replace(/^\//, '');
    if (!parsed.hostname || !parsed.username || !dbName) {
      return {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'soholiv_db',
        connectionLimit,
      };
    }
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password || ''),
      database: dbName,
      connectionLimit,
    };
  } catch {
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'soholiv_db',
      connectionLimit,
    };
  }
}

async function main() {
  const adapterConfig = getAdapterConfig();
  const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(adapterConfig),
  });
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: { id: true },
    });

    const managerIds = managers.map((m) => m.id);
    if (!managerIds.length) {
      console.log('No MANAGER users found');
      return;
    }

    const pgs = await prisma.pG.findMany({
      where: { createdById: { in: managerIds } },
      select: { id: true, createdById: true },
    });

    const assignments = pgs
      .filter((p) => p.createdById)
      .map((p) => ({ pgId: p.id, userId: p.createdById }));

    if (!assignments.length) {
      console.log('No PGs created by managers');
      return;
    }

    const result = await prisma.pgAssignment.createMany({
      data: assignments,
      skipDuplicates: true,
    });

    console.log(`Assigned ${result.count} manager-PG links`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
