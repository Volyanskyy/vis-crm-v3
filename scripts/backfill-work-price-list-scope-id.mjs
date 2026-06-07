import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workPriceLists = await prisma.workPriceList.findMany({
    where: {
      scopeId: null,
      category: {
        not: null,
      },
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`Прайсів для backfill: ${workPriceLists.length}`);

  for (const item of workPriceLists) {
    const categoryCode = String(item.category ?? "").trim();

    if (!categoryCode) {
      console.warn(`Пропуск: ${item.id} (${item.name}) — category порожня`);
      continue;
    }

    const scope = await prisma.workPriceListScope.findFirst({
      where: {
        tenantId: item.tenantId,
        code: categoryCode,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!scope) {
      console.warn(
        `Не знайдено scope для прайса ${item.id} (${item.name}), category=${categoryCode}`,
      );
      continue;
    }

    await prisma.workPriceList.update({
      where: {
        id: item.id,
      },
      data: {
        scopeId: scope.id,
      },
    });

    console.log(
      `✓ ${item.name} → scopeId=${scope.id} (${scope.code} / ${scope.name})`,
    );
  }

  console.log("Backfill scopeId завершено.");
}

main()
  .catch((error) => {
    console.error("Помилка backfill scopeId:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
