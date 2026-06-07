/**
 * Path: src/app/clients/page.tsx
 *
 * Призначення:
 * Сторінка списку клієнтів для VIS CRM V3.
 * Показує базові поля клієнта, кількість пов’язаних проєктів
 * і дає візуально завершений модуль для демо.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClientFormModal } from "./client-form-modal";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function InfoItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-neutral-900">{value || "—"}</p>
    </div>
  );
}

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: [{ isArchived: "asc" }, { updatedAt: "desc" }],
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  const totalClients = clients.length;
  const archivedClients = clients.filter((client) => client.isArchived).length;
  const activeClients = totalClients - archivedClients;
  const totalProjectsLinked = clients.reduce(
    (sum, client) => sum + client._count.projects,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Модуль клієнтів
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Клієнти та замовники
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              База клієнтів для зв’язку з проєктами, кошторисами та подальшою
              історією роботи. Сторінка вже читає живі записи з Prisma і може
              бути опорною точкою для подальшого CRUD.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ClientFormModal mode="create" triggerLabel="Додати клієнта" />

            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Перейти до проєктів
            </Link>

            <Link
              href="/references"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Перейти до довідників
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Усього клієнтів</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalClients}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Активні</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {activeClients}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Архівні</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {archivedClients}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Повʼязані проєкти</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalProjectsLinked}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список клієнтів
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Компактний список клієнтів без горизонтального скролу. Дані
            згруповані в картки, щоб комфортно працювати і на ноутбуці, і на
            планшеті.
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-sm text-neutral-600">
              У базі ще немає клієнтів. Після seed або імпорту тут зʼявиться
              робочий список замовників.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {clients.map((client) => (
              <article
                key={client.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-neutral-950">
                            {client.name}
                          </h3>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              client.isArchived
                                ? "bg-neutral-200 text-neutral-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {client.isArchived ? "Архівний" : "Активний"}
                          </span>
                        </div>

                        {client.companyName ? (
                          <p className="mt-1 text-sm text-neutral-600">
                            {client.companyName}
                          </p>
                        ) : null}

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                          {client.taxNumber ? (
                            <span>ІПН / ЄДРПОУ: {client.taxNumber}</span>
                          ) : null}
                          {client.legacyId ? (
                            <span>Legacy ID: {client.legacyId}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ClientFormModal
                          mode="edit"
                          triggerLabel="Редагувати"
                          triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                          initialValue={{
                            id: client.id,
                            name: client.name ?? "",
                            companyName: client.companyName ?? "",
                            phone: client.phone ?? "",
                            email: client.email ?? "",
                            address: client.address ?? "",
                            taxNumber: client.taxNumber ?? "",
                            notes: client.notes ?? "",
                            isArchived: client.isArchived,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <InfoItem
                        label="Телефон"
                        value={client.phone || "—"}
                      />
                      <InfoItem
                        label="Email"
                        value={client.email || "—"}
                        className="min-w-0"
                      />
                      <InfoItem
                        label="Адреса"
                        value={client.address || "—"}
                        className="sm:col-span-2 xl:col-span-1"
                      />
                      <InfoItem
                        label="Проєкти"
                        value={client._count.projects}
                      />
                    </div>
                  </div>

                  <div className="lg:w-[140px] lg:pl-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Оновлено
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {formatDate(client.updatedAt)}
                    </p>
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
