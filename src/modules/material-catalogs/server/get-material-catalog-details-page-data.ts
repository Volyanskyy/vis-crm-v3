import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getMaterialCatalogDetailsPageData(id: string) {
  const [catalog, brands] = await Promise.all([
    prisma.materialCatalog.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.brand.findMany({
      where: {
        isArchived: false,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!catalog) {
    notFound();
  }

  const activeItemsCount = catalog.items.filter((item) => item.isActive).length;

  // Тимчасово.
  // Далі замінимо на реальну перевірку прав / ролей.
  const canViewCostPrice = false;

  const items = catalog.items.map((item) => ({
    id: item.id,
    materialCatalogId: catalog.id,
    code: item.code,
    sku: item.sku,
    name: item.name,
    displayName: item.displayName ?? item.name,
    category: item.category,
    subcategory: item.subcategory,
    brandId: item.brandId,
    brandName: item.brand?.name ?? null,
    unit: item.unit,
    costPrice: item.costPrice.toString(),
    recommendedRetail: item.recommendedRetail.toString(),
    description: item.description,
    technicalSpec: item.technicalSpec,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    specType: item.specType ?? null,
    specParams:
      item.specParams === null ? null : JSON.stringify(item.specParams),
  }));

  return {
    catalog,
    brands,
    activeItemsCount,
    canViewCostPrice,
    items,
  };
}
