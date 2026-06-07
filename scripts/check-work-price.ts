import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const count = await prisma.workPriceItem.count();
  const lists = await prisma.workPriceList.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      version: true,
      updatedAt: true,
      _count: { select: { items: true } }
    }
  });

  console.dir({ workPriceItemCount: count, lists }, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
