import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LightingSystemTypeFormModal } from "./lighting-system-type-form-modal";

export default async function LightingSystemTypesPage() {
  const [lightingSystemTypes, brands, totalCount, archivedCount] =
    await Promise.all([
      prisma.lightingSystemType.findMany({
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ name: "asc" }],
      }),
      prisma.brand.findMany({
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.lightingSystemType.count(),
      prisma.lightingSystemType.count({
        where: { isArchived: true },
      }),
    ]);

  const activeCount = totalCount - archivedCount;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Reference / Lighting System Types
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Типи систем освітлення
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Довідник типових систем освітлення для проєктів: трекові,
              магнітні, декоративні, вбудовані, профільні та інші сценарії.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LightingSystemTypeFormModal
              mode="create"
              triggerLabel="Створити тип"
              brands={brands}
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Всього типів</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Активні</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">
            {activeCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">В архіві</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-400">
            {archivedCount}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список типів систем освітлення
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Перелік усіх довідникових систем із брендом, категорією та статусом.
          </p>
        </div>

        {lightingSystemTypes.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
              У довіднику ще немає типів систем освітлення. Додайте перший
              тип, наприклад: трекова система, LED-профіль або магнітна
              система.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {lightingSystemTypes.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border border-neutral-200 p-4 shadow-sm transition hover:border-neutral-300 ${
                  item.isArchived
                    ? "bg-neutral-50/80"
                    : "bg-white hover:bg-neutral-50/40"
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3
                        className={`text-lg font-semibold ${
                          item.isArchived
                            ? "text-neutral-500 line-through"
                            : "text-neutral-950"
                        }`}
                      >
                        {item.name}
                      </h3>

                      {item.isArchived ? (
                        <span className="inline-flex rounded-md bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          В архіві
                        </span>
                      ) : null}

                      {item.code ? (
                        <span className="inline-flex rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-mono text-xs font-medium text-neutral-500">
                          {item.code}
                        </span>
                      ) : null}

                      {item.category ? (
                        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          {item.category}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                      <span>
                        Бренд:{" "}
                        <span className="font-medium text-neutral-900">
                          {item.brand?.name ?? "Не вказано"}
                        </span>
                      </span>
                    </div>

                    {item.description ? (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    <LightingSystemTypeFormModal
                      mode="edit"
                      triggerLabel="Редагувати"
                      triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      brands={brands}
                      initialValue={{
                        id: item.id,
                        brandId: item.brandId ?? "",
                        code: item.code ?? "",
                        name: item.name,
                        category: item.category ?? "",
                        description: item.description ?? "",
                        isArchived: item.isArchived,
                      }}
                    />
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
