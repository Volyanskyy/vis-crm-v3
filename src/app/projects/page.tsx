/**
 * Path: src/app/projects/page.tsx
 *
 * Призначення:
 * Сторінка списку проєктів для VIS CRM V3.
 * Показує центральну операційну сутність системи:
 * клієнта, статус, адресу, менеджера та базові лічильники.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectFormModal } from "./project-form-modal";

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateForInput(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("sv-SE").format(date);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "DRAFT":
      return "Чернетка";
    case "ACTIVE":
      return "Активний";
    case "ON_HOLD":
      return "Пауза";
    case "COMPLETED":
      return "Завершений";
    case "CANCELLED":
      return "Скасований";
    case "ARCHIVED":
      return "Архівний";
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "ON_HOLD":
      return "bg-amber-100 text-amber-700";
    case "COMPLETED":
      return "bg-sky-100 text-sky-700";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    case "ARCHIVED":
      return "bg-neutral-200 text-neutral-700";
    case "DRAFT":
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

export default async function ProjectsPage() {
  const [projects, clients, managers] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            teamMembers: true,
            estimates: true,
            fieldReports: true,
            rooms: true,
          },
        },
      },
    }),
    prisma.client.findMany({
      where: {
        isArchived: false,
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        companyName: true,
      },
    }),
    prisma.user.findMany({
      where: {
        employeeProfile: {
          is: {
            isArchived: false,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        employeeProfile: {
          select: {
            positionTitle: true,
          },
        },
      },
    }),
  ]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (project) => project.status === "ACTIVE",
  ).length;
  const draftProjects = projects.filter(
    (project) => project.status === "DRAFT",
  ).length;
  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  const managerOptions = managers.map((manager) => ({
    id: manager.id,
    fullName:
      manager.fullName ||
      `${manager.firstName} ${manager.lastName}`.trim(),
    positionTitle: manager.employeeProfile?.positionTitle ?? "",
  }));

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Модуль проєктів
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Проєкти та обʼєкти
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Тут зібрані всі обʼєкти, до яких далі будуть підвʼязані кошториси,
              команди, кімнати, точки, матеріали та польові звіти. Це головна
              операційна сутність CRM.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/clients"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              До клієнтів
            </Link>

            <ProjectFormModal
              mode="create"
              triggerLabel="Додати проєкт"
              clients={clients}
              managers={managerOptions}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Усього проєктів</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalProjects}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Активні</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {activeProjects}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Чернетки</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {draftProjects}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Завершені</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {completedProjects}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список проєктів
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Огляд усіх обʼєктів із клієнтом, менеджером, статусом та короткою
            операційною статистикою.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
              У системі ще немає проєктів. Додайте перший обʼєкт, щоб почати
              роботу з командами, кошторисами, кімнатами та польовими звітами.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {projects.map((project) => {
              const managerName =
                project.manager?.fullName ||
                `${project.manager?.firstName ?? ""} ${
                  project.manager?.lastName ?? ""
                }`.trim() ||
                "Не призначено";

              const clientName =
                project.client.companyName || project.client.name;

              return (
                <article
                  key={project.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/40"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold tracking-tight text-neutral-950 sm:text-xl">
                            {project.name}
                          </h3>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              project.status,
                            )}`}
                          >
                            {getStatusLabel(project.status)}
                          </span>

                          {project.code ? (
                            <span className="inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-neutral-600">
                              {project.code}
                            </span>
                          ) : null}
                        </div>

                        {project.description ? (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                            {project.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-neutral-600 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Клієнт
                        </span>
                        <span className="mt-1 block font-medium text-neutral-900">
                          {clientName}
                        </span>
                      </div>

                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Менеджер
                        </span>
                        <span className="mt-1 block font-medium text-neutral-900">
                          {managerName}
                        </span>
                      </div>

                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Локація
                        </span>
                        <span className="mt-1 block font-medium text-neutral-900">
                          {[project.city, project.address].filter(Boolean).join(", ") ||
                            "—"}
                        </span>
                      </div>

                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Дати
                        </span>
                        <span className="mt-1 block font-medium text-neutral-900">
                          {formatDate(project.startDate)} →{" "}
                          {formatDate(project.plannedEndDate || project.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Команда
                        </p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                          {project._count.teamMembers}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Кошториси
                        </p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                          {project._count.estimates}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Звіти
                        </p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                          {project._count.fieldReports}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Кімнати
                        </p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                          {project._count.rooms}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-neutral-500">
                        Оновлено: {formatDate(project.updatedAt)}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <ProjectFormModal
                          mode="edit"
                          triggerLabel="Редагувати"
                          triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                          clients={clients}
                          managers={managerOptions}
                          initialValue={{
                            id: project.id,
                            clientId: project.clientId,
                            code: project.code ?? "",
                            name: project.name,
                            description: project.description ?? "",
                            address: project.address ?? "",
                            city: project.city ?? "",
                            status: project.status,
                            startDate: formatDateForInput(project.startDate),
                            plannedEndDate: formatDateForInput(project.plannedEndDate),
                            endDate: formatDateForInput(project.endDate),
                            managerId: project.managerId ?? "",
                          }}
                        />

                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                        >
                          Відкрити проєкт
                        </Link>
                      </div>
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
