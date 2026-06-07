import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MaterialItemFormModal } from "./material-item-form-modal";
import { MaterialCatalogItemsClient } from "./material-catalog-items-client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: Date | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export default async function MaterialCatalogDetailsPage({ params }: PageProps) {
  const { id } = await params;

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

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <Link
                href="/references/material-catalogs"
                className="transition hover:text-neutral-900"
              >
                Довідники матеріалів
              </Link>
              <span>/</span>
              <span className="text-neutral-900">{catalog.name}</span>
            </div>

            <div className="space-y-2">
              <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Каталог матеріалів
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                  {catalog.name}
                </h1>

                <p className="max-w-3xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
                  {catalog.description?.trim() ||
                    "Каталог матеріалів для підбору позицій у кошториси, фактичні матеріали та об’єктні звіти."}
                </p>
              </div>
            </div>
          </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <MaterialItemFormModal
              mode="create"
              triggerLabel="Додати матеріал"
              triggerClassName="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              materialCatalogId={catalog.id}
              brands={brands}
            />

            <Link
              href="/references/material-catalogs"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Назад до каталогів
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Усього позицій
            </div>
            <div className="mt-2 text-2xl font-semibold text-neutral-950">
              {catalog._count.items}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Активні
            </div>
            <div className="mt-2 text-2xl font-semibold text-emerald-900">
              {activeItemsCount}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Оновлено
            </div>
            <div className="mt-2 text-2xl font-semibold text-neutral-950">
              {formatDate(catalog.updatedAt)}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-neutral-950 sm:text-xl">
            Позиції каталогу
          </h2>

          <p className="text-sm leading-6 text-neutral-600">
            Редагування, сортування, дублювання та керування активністю позицій
            довідника.
          </p>
        </div>

        <MaterialCatalogItemsClient
          items={items}
          brands={brands}
          canViewCostPrice={canViewCostPrice}
        />
      </section>
    </div>
  );
}
