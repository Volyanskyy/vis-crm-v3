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
  const list = await prisma.workPriceList.findFirst({
    where: {
      name: "Основний прайс електромонтажу",
      version: 1,
    },
    select: {
      id: true,
      name: true,
      version: true,
      _count: { select: { items: true } },
    },
  });

  if (!list) {
    throw new Error("Imported work price list not found");
  }

  const result = await prisma.workPriceItem.deleteMany({
    where: {
      workPriceListId: list.id,
    },
  });

  console.log({
    deleted: result.count,
    list,
  });
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
