import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrandFormModal } from "./brand-form-modal";

function normalizeUrl(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export default async function BrandsPage() {
  const [brands, totalCount] = await Promise.all([
    prisma.brand.findMany({
      orderBy: [{ name: "asc" }],
    }),
    prisma.brand.count(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Reference / Brands
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Бренди
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Довідник брендів для матеріалів, освітлення, автоматики та
              електрофурнітури. Це базовий reference-шар для каталогів і
              майбутніх звʼязків по номенклатурі.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BrandFormModal mode="create" triggerLabel="Створити бренд" />

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
          <p className="text-sm font-medium text-neutral-500">Брендів всього</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalCount}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список брендів
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            База виробників і торгових марок, які використовуються в системі.
          </p>
        </div>

        {brands.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-sm text-neutral-600">
              У довіднику ще немає брендів. Додай перший бренд для наповнення reference layer.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {brands.map((brand) => {
              const url = normalizeUrl(brand.website);

              return (
                <article
                  key={brand.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/40"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        {brand.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                        {brand.category ? (
                          <span>Категорія: {brand.category}</span>
                        ) : null}
                        {brand.country ? (
                          <span>Країна: {brand.country}</span>
                        ) : null}
                      </div>

                      {brand.notes ? (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                          {brand.notes}
                        </p>
                      ) : null}

                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
                        >
                          {brand.website}
                        </a>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                      <BrandFormModal
                        mode="edit"
                        triggerLabel="Редагувати"
                        triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                        initialValue={{
                          id: brand.id,
                          name: brand.name,
                          category: brand.category ?? "",
                          country: brand.country ?? "",
                          website: brand.website ?? "",
                          notes: brand.notes ?? "",
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
