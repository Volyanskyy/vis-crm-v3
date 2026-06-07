import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteWorkPriceListScopeAction } from "./actions";
import { WorkPriceListScopeFormModal } from "./work-price-list-scope-form-modal";
import { ConfirmSubmitButton } from "../work-price-lists/confirm-submit-button";

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

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={
        isActive
          ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
          : "inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700"
      }
    >
      {isActive ? "Активний" : "Неактивний"}
    </span>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-900">{value || "—"}</p>
    </div>
  );
}

export default async function WorkPriceListScopesPage() {
  const scopes = await prisma.workPriceListScope.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          workPriceLists: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Довідники / Scope-и прайсів
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
                Scope-и прайсів
              </h1>

              <p className="max-w-3xl text-sm leading-6 text-neutral-600">
                Окремий довідник для керування scope-ами прайсів. Активні scope-и
                доступні при створенні нових прайсів.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/references/work-price-lists"
                className="inline-flex h-11 items-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                До прайсів
              </Link>

              <WorkPriceListScopeFormModal />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Всього scope-ів
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {scopes.length}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Активні
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-900">
              {scopes.filter((scope) => scope.isActive).length}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-300 bg-neutral-100 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Неактивні
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {scopes.filter((scope) => !scope.isActive).length}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Прайсів прив’язано
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-blue-900">
              {scopes.reduce((sum, scope) => sum + scope._count.workPriceLists, 0)}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {scopes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm">
              Поки що немає жодного scope.
            </div>
          ) : (
            scopes.map((scope) => (
              <article
                key={scope.id}
                className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge isActive={scope.isActive} />

                      <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                        code: {scope.code}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                        {scope.name}
                      </h2>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-600">
                        {scope.description || "Опис відсутній."}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <MetaItem label="Порядок" value={scope.sortOrder} />
                      <MetaItem label="Прайсів" value={scope._count.workPriceLists} />
                      <MetaItem label="Створено" value={formatDate(scope.createdAt)} />
                      <MetaItem label="Оновлено" value={formatDate(scope.updatedAt)} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <WorkPriceListScopeFormModal
                      mode="edit"
                      triggerLabel="Редагувати"
                      triggerClassName="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                      initialValue={{
                        id: scope.id,
                        code: scope.code,
                        name: scope.name,
                        description: scope.description ?? "",
                        sortOrder: scope.sortOrder ?? 0,
                        isActive: scope.isActive,
                      }}
                    />

                    {scope._count.workPriceLists === 0 ? (
                      <form action={deleteWorkPriceListScopeAction.bind(null, scope.id)}>
                        <ConfirmSubmitButton
                          className="inline-flex h-10 items-center rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50"
                          confirmMessage="Видалити scope? Цю дію не можна скасувати."
                        >
                          Видалити
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      <span className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-medium text-neutral-500">
                        Використовується у прайсах
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
