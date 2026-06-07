import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WorkPriceListFormModal } from "./work-price-list-form-modal";
import { WorkPriceListRowActions } from "./work-price-list-row-actions";

type SearchParams = Promise<{
  status?: string;
  scope?: string;
  usage?: string;
}>;

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

function formatDateInput(value: Date | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPeriod(validFrom: Date | null, validTo: Date | null) {
  if (!validFrom && !validTo) {
    return "Без періоду";
  }

  if (validFrom && !validTo) {
    return `від ${formatDate(validFrom)}`;
  }

  if (!validFrom && validTo) {
    return `до ${formatDate(validTo)}`;
  }

  return `${formatDate(validFrom)} — ${formatDate(validTo)}`;
}

function getStatusLabel(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  if (status === "DRAFT") return "Чернетка";
  if (status === "ARCHIVED") return "Архів";
  return "Активний";
}

function getStatusClassName(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  if (status === "DRAFT") {
    return "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700";
  }

  if (status === "ARCHIVED") {
    return "inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700";
  }

  return "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700";
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "emerald" | "amber" | "blue";
}) {
  const className =
    tone === "emerald"
      ? "rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
      : tone === "amber"
        ? "rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
        : tone === "blue"
          ? "rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm"
          : "rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm";

  const labelClassName =
    tone === "emerald"
      ? "text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700"
      : tone === "amber"
        ? "text-xs font-semibold uppercase tracking-[0.14em] text-amber-700"
        : tone === "blue"
          ? "text-xs font-semibold uppercase tracking-[0.14em] text-blue-700"
          : "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500";

  const valueClassName =
    tone === "emerald"
      ? "mt-2 text-3xl font-semibold tracking-tight text-emerald-900"
      : tone === "amber"
        ? "mt-2 text-3xl font-semibold tracking-tight text-amber-900"
        : tone === "blue"
          ? "mt-2 text-3xl font-semibold tracking-tight text-blue-900"
          : "mt-2 text-3xl font-semibold tracking-tight text-neutral-950";

  return (
    <div className={className}>
      <p className={labelClassName}>{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
}

function MetaText({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500">
      <span className="font-medium text-neutral-400">{title}:</span>
      <span className="text-neutral-700">{value || "—"}</span>
    </div>
  );
}

function FilterLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        isActive
          ? "inline-flex h-10 items-center rounded-xl border border-neutral-900 bg-neutral-900 px-4 text-sm font-medium text-white"
          : "inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
      }
    >
      {label}
    </Link>
  );
}

export default async function WorkPriceListsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";
  const scopeFilter = params.scope ?? "all";
  const usageFilter = params.usage ?? "all";

  const [workPriceLists, scopeOptions, projectUsage] = await Promise.all([
    prisma.workPriceList.findMany({
      where: {
        ...(statusFilter !== "all"
          ? { status: statusFilter as "DRAFT" | "ACTIVE" | "ARCHIVED" }
          : {}),
        ...(scopeFilter !== "all" ? { scopeId: scopeFilter } : {}),
      },
      orderBy: [
        {
          scope: {
            sortOrder: "asc",
          },
        },
        { isCurrent: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        scope: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.workPriceListScope.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    }),
    prisma.projectWorkItem.groupBy({
      by: ["sourceWorkPriceListId"],
      where: {
        isArchived: false,
        sourceWorkPriceListId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const projectUsageMap = new Map(
    projectUsage
      .filter((item) => item.sourceWorkPriceListId)
      .map((item) => [item.sourceWorkPriceListId as string, item._count._all]),
  );

  const enrichedLists = workPriceLists.map((item) => ({
    ...item,
    usedInProjectsCount: projectUsageMap.get(item.id) ?? 0,
  }));

  const filteredLists = enrichedLists.filter((item) => {
    if (usageFilter === "used") {
      return item.usedInProjectsCount > 0;
    }

    if (usageFilter === "free") {
      return item.usedInProjectsCount === 0;
    }

    return true;
  });

  const stats = {
    total: enrichedLists.length,
    drafts: enrichedLists.filter((item) => item.status === "DRAFT").length,
    active: enrichedLists.filter((item) => item.status === "ACTIVE").length,
    archived: enrichedLists.filter((item) => item.status === "ARCHIVED").length,
    used: enrichedLists.filter((item) => item.usedInProjectsCount > 0).length,
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Довідники / Прайси робіт
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
                  Прайси робіт
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                  Керуйте версіями прайсів, scope, статусами та доступністю для
                  використання в проєктах. Активні прайси можна переводити в
                  чернетку або архів прямо зі списку.
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <WorkPriceListFormModal
                mode="create"
                scopeOptions={scopeOptions}
                triggerLabel="Новий прайс"
                triggerClassName="inline-flex h-11 items-center rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Усього" value={stats.total} />
          <MetricCard label="Чернетки" value={stats.drafts} tone="amber" />
          <MetricCard label="Активні" value={stats.active} tone="emerald" />
          <MetricCard label="Архів" value={stats.archived} />
          <MetricCard label="В проектах" value={stats.used} tone="blue" />
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">Фільтри</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Відфільтруйте список за статусом, scope та фактом використання в
                проєктах.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <FilterLink
                  href="/references/work-price-lists"
                  label="Всі статуси"
                  isActive={statusFilter === "all"}
                />
                <FilterLink
                  href="/references/work-price-lists?status=DRAFT"
                  label="Чернетки"
                  isActive={statusFilter === "DRAFT"}
                />
                <FilterLink
                  href="/references/work-price-lists?status=ACTIVE"
                  label="Активні"
                  isActive={statusFilter === "ACTIVE"}
                />
                <FilterLink
                  href="/references/work-price-lists?status=ARCHIVED"
                  label="Архів"
                  isActive={statusFilter === "ARCHIVED"}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterLink
                  href="/references/work-price-lists"
                  label="Всі scope"
                  isActive={scopeFilter === "all"}
                />

                {scopeOptions.map((scope) => (
                  <FilterLink
                    key={scope.id}
                    href={`/references/work-price-lists?scope=${scope.id}`}
                    label={scope.name}
                    isActive={scopeFilter === scope.id}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterLink
                  href="/references/work-price-lists"
                  label="Всі"
                  isActive={usageFilter === "all"}
                />
                <FilterLink
                  href="/references/work-price-lists?usage=used"
                  label="Задіяні"
                  isActive={usageFilter === "used"}
                />
                <FilterLink
                  href="/references/work-price-lists?usage=free"
                  label="Вільні"
                  isActive={usageFilter === "free"}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-950">
              Список прайсів
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Для кожного прайса доступні відкриття, дублювання та зміна статусу
              прямо зі списку.
            </p>
          </div>

          {filteredLists.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                За поточними фільтрами прайсів не знайдено
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Змініть фільтри або створіть новий прайс.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {filteredLists.map((priceList) => {
                const canEdit =
                  priceList.status === "DRAFT" &&
                  priceList.usedInProjectsCount === 0;

                const editInitialValue = {
                  id: priceList.id,
                  scopeId: priceList.scopeId ?? "",
                  code: priceList.code ?? "",
                  name: priceList.name ?? "",
                  category: priceList.category ?? "",
                  description: priceList.description ?? "",
                  version: Number(priceList.version ?? 1),
                  status: priceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
                  validFrom: formatDateInput(priceList.validFrom),
                  validTo: formatDateInput(priceList.validTo),
                  currencyCode: priceList.currencyCode ?? "UAH",
                  isCurrent: Boolean(priceList.isCurrent),
                  isArchived: Boolean(priceList.isArchived),
                  isDefault: Boolean(priceList.isDefault),
                };

                return (
                  <article key={priceList.id} className="px-6 py-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={getStatusClassName(
                              priceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
                            )}
                          >
                            {getStatusLabel(
                              priceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
                            )}
                          </span>

                          {priceList.isCurrent ? (
                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Поточний у scope
                            </span>
                          ) : null}

                          {priceList.usedInProjectsCount > 0 ? (
                            <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                              Задіяний у проектах
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-neutral-950">
                              {priceList.name}
                            </h3>
                            <span className="text-sm text-neutral-400">
                              v{priceList.version}
                            </span>
                          </div>

                          {priceList.description ? (
                            <p className="max-w-3xl text-sm leading-6 text-neutral-500">
                              {priceList.description}
                            </p>
                          ) : (
                            <p className="text-sm text-neutral-400">
                              Опис прайса поки не заповнений.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <MetaText
                            title="Scope"
                            value={priceList.scope?.name ?? priceList.category ?? "—"}
                          />
                          <MetaText title="Код" value={priceList.code || "—"} />
                          <MetaText
                            title="Період"
                            value={formatPeriod(priceList.validFrom, priceList.validTo)}
                          />
                          <MetaText title="Позицій" value={priceList._count.items} />
                          <MetaText
                            title="Проектів"
                            value={priceList.usedInProjectsCount}
                          />
                          <MetaText
                            title="Оновлено"
                            value={formatDate(priceList.updatedAt)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 xl:items-end">
                        <WorkPriceListRowActions
                          id={priceList.id}
                          status={
                            priceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED"
                          }
                        />

                        {canEdit ? (
                          <WorkPriceListFormModal
                            mode="edit"
                            initialValue={editInitialValue}
                            triggerLabel="Редагувати"
                            triggerClassName="inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                            scopeOptions={scopeOptions}
                          />
                        ) : (
                          <span className="text-xs text-neutral-500">
                            {priceList.status !== "DRAFT"
                              ? "Редагування доступне лише для чернеток."
                              : "Прайс уже задіяний у проектах, тому редагування заблоковане."}
                          </span>
                        )}

                        <Link
                          href={`/references/work-price-lists/${priceList.id}/publication`}
                          className="inline-flex h-9 items-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          Publication / друк
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
