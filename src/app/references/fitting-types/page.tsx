import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FittingTypeFormModal } from "./fitting-type-form-modal";

export default async function FittingTypesPage() {
  const [fittingTypes, brands] = await Promise.all([
    prisma.fittingType.findMany({
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ isArchived: "asc" }, { name: "asc" }],
    }),
    prisma.brand.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Reference / Fitting Types
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Типи фурнітури
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Довідник типових позицій електрофурнітури: розетки, вимикачі,
              інтернет-розетки, TV-виводи та інші елементи.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <FittingTypeFormModal
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

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список типів фурнітури
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Усі довідникові позиції з брендом, категорією та статусом.
          </p>
        </div>

        {fittingTypes.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
              У довіднику ще немає типів фурнітури. Додайте перший тип,
              наприклад: розетка, вимикач або інтернет-розетка.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {fittingTypes.map((fittingType) => (
              <article
                key={fittingType.id}
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  fittingType.isArchived
                    ? "border-neutral-200 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/40"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3
                        className={`text-lg font-semibold tracking-tight ${
                          fittingType.isArchived
                            ? "text-neutral-500"
                            : "text-neutral-950"
                        }`}
                      >
                        {fittingType.name}
                      </h3>

                      {fittingType.isArchived ? (
                        <span className="inline-flex rounded-md bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          В архіві
                        </span>
                      ) : null}

                      {fittingType.code ? (
                        <span className="inline-flex rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-mono text-xs font-medium text-neutral-500">
                          {fittingType.code}
                        </span>
                      ) : null}

                      {fittingType.category ? (
                        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          {fittingType.category}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                      <span>
                        Бренд:{" "}
                        <span className="font-medium text-neutral-900">
                          {fittingType.brand?.name ?? "Не вказано"}
                        </span>
                      </span>
                    </div>

                    {fittingType.description ? (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                        {fittingType.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0">
                    <FittingTypeFormModal
                      mode="edit"
                      triggerLabel="Редагувати"
                      triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      brands={brands}
                      initialValue={{
                        id: fittingType.id,
                        brandId: fittingType.brandId ?? "",
                        code: fittingType.code ?? "",
                        name: fittingType.name,
                        category: fittingType.category ?? "",
                        description: fittingType.description ?? "",
                        isArchived: fittingType.isArchived,
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
