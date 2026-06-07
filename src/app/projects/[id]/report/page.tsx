import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProjectReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      address: true,
      client: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          rooms: true,
          materialItems: true,
          workItems: true,
          panelLines: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const reportCards = [
    {
      title: "Повний польовий звіт",
      subtitle: "Внутрішній",
      description:
        "Комплексний звіт по об’єкту: матеріали, роботи, монтажний план, фурнітура для закупівлі та лінії щита.",
      href: `/projects/${projectId}/report/field`,
    },
    {
      title: "Фурнітура для закупівлі",
      subtitle: "Скорочений",
      description:
        "Окремий звіт для замовлення фурнітури без зайвих внутрішніх блоків.",
      href: `/projects/${projectId}/report/procurement`,
    },
    {
      title: "Матеріали по об’єкту",
      subtitle: "Скорочений",
      description:
        "Звіт по використаних матеріалах: найменування, категорія, кількість, РРЦ і сума.",
      href: `/projects/${projectId}/report/materials`,
    },
    {
      title: "Монтажний план",
      subtitle: "Монтаж",
      description:
        "Покімнатний перелік точок фурнітури та освітлення для роботи бригади.",
      href: `/projects/${projectId}/report/mounting-plan`,
    },
    {
      title: "Лінії щита",
      subtitle: "Щитова",
      description:
        "Окремий звіт по лініях щита: призначення, кабель, переріз та автоматика.",
      href: `/projects/${projectId}/report/panel-lines`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Звіти проєкту
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
              Вибирай формат звіту під конкретну задачу: повний внутрішній
              документ, закупівля, монтаж або короткий звіт для передачі клієнту.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-600">
            <div>
              <span className="font-medium text-neutral-900">Клієнт:</span>{" "}
              {project.client?.name ?? "—"}
            </div>
            <div className="mt-1">
              <span className="font-medium text-neutral-900">Адреса:</span>{" "}
              {project.address ?? "—"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="text-sm text-neutral-500">Кімнати</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-950">
              {project._count.rooms}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="text-sm text-neutral-500">Матеріали</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-950">
              {project._count.materialItems}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="text-sm text-neutral-500">Роботи</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-950">
              {project._count.workItems}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="text-sm text-neutral-500">Лінії щита</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-950">
              {project._count.panelLines}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Формати документів
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
              Доступні звіти
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {reportCards.map((report) => (
            <div
              key={report.href}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                {report.subtitle}
              </div>

              <div className="mt-2 text-lg font-semibold text-neutral-950">
                {report.title}
              </div>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {report.description}
              </p>

              <div className="mt-5">
                <Link
                  href={report.href}
                  className="inline-flex items-center rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Відкрити звіт
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
