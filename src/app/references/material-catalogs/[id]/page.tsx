import { getMaterialCatalogDetailsPageData } from "@/modules/material-catalogs/server/get-material-catalog-details-page-data";
import Link from "next/link";
import { MaterialCatalogItemsClient } from "./material-catalog-items-client";
import { MaterialItemFormModal } from "./material-item-form-modal";

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

  const {
    catalog,
    brands,
    activeItemsCount,
    canViewCostPrice,
    items,
  } = await getMaterialCatalogDetailsPageData(id);

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

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Активні позиції
            </div>
            <div className="mt-2 text-2xl font-semibold text-neutral-950">
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

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Позиції каталогу
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Тут зберігаються матеріали каталогу з брендом, категорією, цінами й
            технічними параметрами.
          </p>
        </div>

        <MaterialCatalogItemsClient
          materialCatalogId={catalog.id}
          items={items}
          brands={brands}
          canViewCostPrice={canViewCostPrice}
        />
      </section>
    </div>
  );
}
