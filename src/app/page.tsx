/**
 * Path: src/app/page.tsx
 *
 * Призначення:
 * Головна dashboard-сторінка VIS CRM V3.
 * Показує короткий статус системи, основні KPI та швидкі переходи
 * в ключові модулі.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA").format(value);
}

const quickLinks = [
  {
    title: "Клієнти",
    href: "/clients",
    description: "База замовників, контакти, звʼязок із проєктами.",
  },
  {
    title: "Проєкти",
    href: "/projects",
    description: "Обʼєкти, статуси, команди, кошториси та польові дані.",
  },
  {
    title: "Довідники",
    href: "/references",
    description: "Прайси робіт, матеріальні каталоги, типи приміщень і точки.",
  },
];

export default async function HomePage() {
  const [
    clientsCount,
    projectsCount,
    activeProjectsCount,
    workPriceListsCount,
    materialCatalogsCount,
    estimatesCount,
    fieldReportsCount,
    recentProjects,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.project.count(),
    prisma.project.count({
      where: {
        status: "ACTIVE",
      },
    }),
    prisma.workPriceList.count(),
    prisma.materialCatalog.count(),
    prisma.estimate.count(),
    prisma.fieldReport.count(),
    prisma.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const statCards = [
    {
      label: "Клієнти",
      value: formatNumber(clientsCount),
      hint: "Усі замовники в системі",
    },
    {
      label: "Проєкти",
      value: formatNumber(projectsCount),
      hint: `Активні: ${formatNumber(activeProjectsCount)}`,
    },
    {
      label: "Кошториси",
      value: formatNumber(estimatesCount),
      hint: "Чернетки та робочі версії",
    },
    {
      label: "Польові звіти",
      value: formatNumber(fieldReportsCount),
      hint: "Роботи, матеріали, лінії щита",
    },
    {
      label: "Прайси робіт",
      value: formatNumber(workPriceListsCount),
      hint: "Версії та активні списки",
    },
    {
      label: "Каталоги матеріалів",
      value: formatNumber(materialCatalogsCount),
      hint: "Довідники для кошторисів і фактів",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              VIS CRM V3
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Центральна панель системи електромонтажного CRM
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Тут зібрані основні модулі: клієнти, проєкти, довідники,
              кошториси та польова фіксація виконаних робіт. Сторінка дає
              швидкий вхід у систему і показує поточний стан бази даних.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Відкрити проєкти
            </Link>

            <Link
              href="/references"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Відкрити довідники
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-neutral-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-neutral-600">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                Швидкий перехід по модулях
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Базові точки входу в CRM для демо і щоденної роботи.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-neutral-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                      {item.description}
                    </p>
                  </div>

                  <span className="rounded-lg bg-white px-3 py-1 text-sm font-medium text-neutral-500 transition group-hover:text-neutral-900">
                    Відкрити
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                Останні проєкти
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Найсвіжіше оновлені записи з бази.
              </p>
            </div>
          </div>

          <div className="mt-6">
            {recentProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
                У базі поки немає проєктів. Після seed або першого імпорту тут
                зʼявляться актуальні записи.
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-neutral-950">
                          {project.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-neutral-600">
                          {project.client?.name ?? "Без клієнта"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">
                          {project.status}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                        Деталі
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
