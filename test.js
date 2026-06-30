const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const adapter = new PrismaBetterSqlite3(new Database('dev.db'));
const prisma = new PrismaClient({ adapter });

async function t() {
  try {
    console.log(await prisma.user.findFirst());
  } catch(e) {
    console.error(e)
  }
}
t();
