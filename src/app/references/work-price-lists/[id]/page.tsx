import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  activateArchivedWorkPriceListAction,
  archiveWorkPriceListAction,
  moveWorkPriceListToDraftAction,
  publishWorkPriceListDraftAction,
} from "../actions";
import {
  ArchiveWorkPriceListButton,
  CreateDraftButton,
  PublishDraftButton,
  RestoreArchivedButton,
} from "./work-price-list-action-buttons";
import { WorkPriceItemFormModal } from "./work-price-item-form-modal";
import { WorkPriceItemsClient } from "./work-price-items-client";

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

  return `${formatDate(validFrom)} → ${formatDate(validTo)}`;
}

function getStatusLabel(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  if (status === "DRAFT") {
    return "Чернетка";
  }

  if (status === "ARCHIVED") {
    return "Архів";
  }

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
      ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
      : tone === "amber"
        ? "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
        : tone === "blue"
          ? "rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4"
          : "rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4";

  const labelClassName =
    tone === "emerald"
      ? "text-xs font-medium uppercase tracking-[0.12em] text-emerald-700"
      : tone === "amber"
        ? "text-xs font-medium uppercase tracking-[0.12em] text-amber-700"
        : tone === "blue"
          ? "text-xs font-medium uppercase tracking-[0.12em] text-blue-700"
          : "text-xs font-medium uppercase tracking-[0.12em] text-neutral-500";

  const valueClassName =
    tone === "emerald"
      ? "mt-2 text-2xl font-semibold tracking-tight text-emerald-900"
      : tone === "amber"
        ? "mt-2 text-2xl font-semibold tracking-tight text-amber-900"
        : tone === "blue"
          ? "mt-2 text-2xl font-semibold tracking-tight text-blue-900"
          : "mt-2 text-2xl font-semibold tracking-tight text-neutral-950";

  return (
    <div className={className}>
      <p className={labelClassName}>{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
}

function ServiceInfoItem({
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
      <p className="mt-1 break-words text-sm text-neutral-900">{value || "—"}</p>
    </div>
  );
}

export default async function WorkPriceListDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    include: {
      scope: true,
      items: {
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      },
      _count: {
        select: {
          items: true,
          projectWorkItems: true,
        },
      },
    },
  });

  if (!workPriceList) {
    notFound();
  }

  const isDraft = workPriceList.status === "DRAFT";
  const isActive = workPriceList.status === "ACTIVE" && !workPriceList.isArchived;
  const isArchived = workPriceList.isArchived || workPriceList.status === "ARCHIVED";

  const serializedItems = workPriceList.items.map((item) => ({
    ...item,
    description: item.description ?? null,
    unit: item.unit ?? null,
    notes: item.notes ?? null,
    basePrice: item.basePrice.toString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/references/work-price-lists"
                  className="inline-flex h-9 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  ← До списку прайсів
                </Link>

                <span
                  className={getStatusClassName(
                    workPriceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
                  )}
                >
                  {getStatusLabel(
                    workPriceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
                  )}
                </span>

                {workPriceList.isCurrent ? (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    Поточний у scope
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
                  {workPriceList.name}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                  {workPriceList.description?.trim()
                    ? workPriceList.description
                    : "Опис прайса поки не заповнений."}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ServiceInfoItem
                  label="Scope"
                  value={workPriceList.scope?.name ?? workPriceList.category ?? "—"}
                />
                <ServiceInfoItem label="Код прайса" value={workPriceList.code ?? "—"} />
                <ServiceInfoItem
                  label="Період дії"
                  value={formatPeriod(workPriceList.validFrom, workPriceList.validTo)}
                />
                <ServiceInfoItem
                  label="Дата оновлення"
                  value={formatDate(workPriceList.updatedAt)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:max-w-md xl:justify-end">
              {isDraft ? (
                <>
                  <PublishDraftButton
                    action={publishWorkPriceListDraftAction.bind(null, workPriceList.id)}
                  />
                  <ArchiveWorkPriceListButton
                    action={archiveWorkPriceListAction.bind(null, workPriceList.id)}
                  />
                </>
              ) : null}

              {isActive ? (
                <>
                  <CreateDraftButton
                    label="У чернетку"
                    action={moveWorkPriceListToDraftAction.bind(null, workPriceList.id)}
                  />
                  <ArchiveWorkPriceListButton
                    action={archiveWorkPriceListAction.bind(null, workPriceList.id)}
                  />
                </>
              ) : null}

              {isArchived ? (
                <>
                  <CreateDraftButton
                    label="У чернетку"
                    action={moveWorkPriceListToDraftAction.bind(null, workPriceList.id)}
                  />
                  <RestoreArchivedButton
                    action={activateArchivedWorkPriceListAction.bind(
                      null,
                      workPriceList.id,
                    )}
                  />
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Позицій" value={workPriceList._count.items} />
          <MetricCard label="Версія" value={`v${workPriceList.version}`} />
          <MetricCard
            label="Проєктів"
            value={workPriceList._count.projectWorkItems}
            tone="blue"
          />
          <MetricCard
            label="Статус"
            value={getStatusLabel(
              workPriceList.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
            )}
            tone={isDraft ? "amber" : isActive ? "emerald" : "neutral"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-950">
                Основна інформація
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Базові параметри прайса та його прив’язка до scope.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ServiceInfoItem
                label="Scope"
                value={workPriceList.scope?.name ?? workPriceList.category ?? "—"}
              />
              <ServiceInfoItem label="Код" value={workPriceList.code ?? "—"} />
              <ServiceInfoItem label="Версія" value={workPriceList.version} />
              <ServiceInfoItem
                label="Валюта"
                value={workPriceList.currencyCode ?? "UAH"}
              />
              <ServiceInfoItem
                label="Період дії"
                value={formatPeriod(workPriceList.validFrom, workPriceList.validTo)}
              />
              <ServiceInfoItem
                label="Оновлено"
                value={formatDate(workPriceList.updatedAt)}
              />
              <ServiceInfoItem
                label="Створено"
                value={formatDate(workPriceList.createdAt)}
              />
              <ServiceInfoItem
                label="Default"
                value={workPriceList.isDefault ? "Так" : "Ні"}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-950">
                Робота з прайсом
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Друк доступний тільки з тіла прайсу, а редагування позицій — лише для
                чернетки.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-900">
                  Publication / друк
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Підготовка друкованої версії, налаштування шапки, контактів і
                  текстових блоків виконується на окремій сторінці publication.
                </p>
                <Link
                  href={`/references/work-price-lists/${workPriceList.id}/publication`}
                  className="mt-3 inline-flex h-10 items-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  Відкрити publication
                </Link>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-900">Статусна логіка</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Чернетка активується напряму. Активний прайс можна перевести в архів
                  або у чернетку. Архівний прайс можна або активувати, або повернути у
                  чернетку.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Позиції прайса
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Склад робіт, сортування та базові параметри позицій.
              </p>
            </div>

            {isDraft ? (
              <WorkPriceItemFormModal
                mode="create"
                triggerLabel="Додати позицію"
                initialValue={{
                  workPriceListId: workPriceList.id,
                }}
                triggerClassName="inline-flex h-10 items-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
              />
            ) : (
              <span className="text-sm text-neutral-500">
                Додавання позицій доступне лише для прайса у статусі чернетки.
              </span>
            )}
          </div>

          <WorkPriceItemsClient
            workPriceListId={workPriceList.id}
            items={serializedItems}
          />
        </section>

        {isDraft ? (
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-950">
                Редагування параметрів прайса
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Метадані прайса редагуються тільки в статусі чернетки.
              </p>
            </div>

            <form
              action={`/references/work-price-lists/${workPriceList.id}`}
              className="grid gap-4 md:grid-cols-2"
            >
              <input type="hidden" name="id" value={workPriceList.id} />

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-neutral-700">Назва</span>
                <input
                  name="name"
                  defaultValue={workPriceList.name}
                  className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-neutral-700">Код</span>
                <input
                  name="code"
                  defaultValue={workPriceList.code ?? ""}
                  className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium text-neutral-700">Опис</span>
                <textarea
                  name="description"
                  defaultValue={workPriceList.description ?? ""}
                  rows={4}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-neutral-700">Версія</span>
                <input
                  name="version"
                  type="number"
                  min={1}
                  defaultValue={workPriceList.version}
                  className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-neutral-700">Дата початку</span>
                <input
                  name="validFrom"
                  type="date"
                  defaultValue={formatDateInput(workPriceList.validFrom)}
                  className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-neutral-700">Дата завершення</span>
                <input
                  name="validTo"
                  type="date"
                  defaultValue={formatDateInput(workPriceList.validTo)}
                  className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Зберегти зміни
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
