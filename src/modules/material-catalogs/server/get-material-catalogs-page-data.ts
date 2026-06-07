import { prisma } from "@/lib/prisma";

export type MaterialCatalogListItem = Awaited<
  ReturnType<typeof getMaterialCatalogsPageData>
>["catalogs"][number];

export async function getMaterialCatalogsPageData() {
  const [catalogs, totalCount, currentCount, archivedCount, itemsCount] =
    await Promise.all([
      prisma.materialCatalog.findMany({
        orderBy: [{ updatedAt: "desc" }],
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.materialCatalog.count(),
      prisma.materialCatalog.count({
        where: {
          isCurrent: true,
          isArchived: false,
        },
      }),
      prisma.materialCatalog.count({
        where: {
          isArchived: true,
        },
      }),
      prisma.materialItem.count(),
    ]);

  return {
    catalogs,
    totalCount,
    currentCount,
    archivedCount,
    itemsCount,
  };
}
