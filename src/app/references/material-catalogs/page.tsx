import { getMaterialCatalogsPageData } from "@/modules/material-catalogs/server/get-material-catalogs-page-data";
import Link from "next/link";
import { MaterialCatalogFormModal } from "./material-catalog-form-modal";

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

function getBadgeClassName(kind: "current" | "archived" | "default") {
  if (kind === "current") {
    return "inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700";
  }

  if (kind === "archived") {
    return "inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700";
  }

  return "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700";
}

export default async function MaterialCatalogsPage() {
  const {
    catalogs,
    totalCount,
    currentCount,
    archivedCount,
    itemsCount,
  } = await getMaterialCatalogsPageData();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Reference / Materials
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Каталоги матеріалів
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Каталоги матеріалів потрібні для кошторисів, фактичного списання,
              комплектації об’єктів і єдиної номенклатурної бази по CRM.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <MaterialCatalogFormModal
              mode="create"
              triggerLabel="Створити каталог"
            />

            <Link
              href="/references"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              До довідників
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Каталогів всього
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Поточні каталоги
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {currentCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Архівні каталоги
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {archivedCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Позицій матеріалів
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {itemsCount}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список каталогів
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Тут зберігаються окремі версії номенклатурних каталогів матеріалів.
          </p>
        </div>

        {catalogs.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-sm text-neutral-600">
              Поки що каталогів матеріалів немає. Створи перший каталог, щоб
              почати структурувати номенклатуру.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {catalogs.map((catalog) => (
              <article
                key={catalog.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/40"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        {catalog.name}
                      </h3>

                      {catalog.isCurrent ? (
                        <span className={getBadgeClassName("current")}>
                          Поточний
                        </span>
                      ) : null}

                      {catalog.isArchived ? (
                        <span className={getBadgeClassName("archived")}>
                          Архів
                        </span>
                      ) : null}

                      {!catalog.isArchived ? (
                        <span className={getBadgeClassName("default")}>
                          Активний
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                      {catalog.code ? <span>Код: {catalog.code}</span> : null}
                      {catalog.category ? (
                        <span>Категорія: {catalog.category}</span>
                      ) : null}
                      <span>Версія: {catalog.version}</span>
                      <span>Позицій: {catalog._count.items}</span>
                    </div>

                    {catalog.description ? (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                        {catalog.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
                      <span>Оновлено: {formatDate(catalog.updatedAt)}</span>
                      <span>Створено: {formatDate(catalog.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    <MaterialCatalogFormModal
                      mode="edit"
                      triggerLabel="Редагувати"
                      triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      initialValue={{
                        id: catalog.id,
                        code: catalog.code ?? "",
                        name: catalog.name,
                        category: catalog.category ?? "",
                        description: catalog.description ?? "",
                        version: catalog.version,
                        isCurrent: catalog.isCurrent,
                        isArchived: catalog.isArchived,
                      }}
                    />

                    <Link
                      href={`/references/material-catalogs/${catalog.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Відкрити
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
