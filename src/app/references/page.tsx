/**
 * Path: src/app/references/page.tsx
 *
 * Призначення:
 * Центральний хаб довідників VIS CRM V3.
 * Відображає реальний стан reference-модулів: що вже готово, а що ще в черзі.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

const referenceRoutes = [
  {
    title: "Прайси робіт",
    href: "/references/work-price-lists",
    description:
      "Версії прайсів робіт, позиції прайсів і база для кошторисів.",
    status: "ready",
  },
  {
    title: "Каталоги матеріалів",
    href: "/references/material-catalogs",
    description:
      "Каталоги матеріалів, номенклатура і база для кошторисів та фактичного обліку.",
    status: "ready",
  },
  {
    title: "Бренди",
    href: "/references/brands",
    description:
      "Довідник брендів для матеріалів, електрофурнітури, автоматики та освітлення.",
    status: "ready",
  },
  {
    title: "Типи приміщень",
    href: "/references/room-types",
    description:
      "Типові приміщення для структури об’єктів, кімнат і подальших точок.",
    status: "ready",
  },
  {
    title: "Типова фурнітура",
    href: "/references/fitting-types",
    description:
      "Типові позиції електрофурнітури для точок на обʼєкті та специфікацій.",
    status: "ready",
  },
  {
    title: "Типові системи освітлення",
    href: "/references/lighting-system-types",
    description:
      "Типові рішення для освітлення об’єктів, зон і сценаріїв.",
    status: "ready",
  },
  {
    title: "Кадровий блок",
    href: "/references/team",
    description:
      "Працівники, відповідальні, ролі та навички команди.",
    status: "ready",
  }, 
  {
    title: "Навички працівників",
    href: "/references/skill-tags",
    description:
      "Довідник навичок і компетенцій для працівників, відповідальних і команд.",
    status: "ready",
  },    
] as const;

function getRouteBadge(status: "ready" | "next") {
  if (status === "ready") {
    return {
      label: "Готово",
      className:
        "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700",
    };
  }

  return {
    label: "Наступна черга",
    className:
      "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700",
  };
}

export default async function ReferencesPage() {
  const [
    workPriceListsCount,
    workPriceItemsCount,
    materialCatalogsCount,
    materialItemsCount,
    brandsCount,
    roomTypesCount,
    fittingTypesCount,
    lightingSystemTypesCount,
    skillTagsCount,
    currentWorkPriceListsCount,
    currentMaterialCatalogsCount,
  ] = await Promise.all([
    prisma.workPriceList.count(),
    prisma.workPriceItem.count(),
    prisma.materialCatalog.count(),
    prisma.materialItem.count(),
    prisma.brand.count(),
    prisma.roomType.count(),
    prisma.fittingType.count(),
    prisma.lightingSystemType.count(),
    prisma.skillTag.count(),
    prisma.workPriceList.count({
      where: {
        isCurrent: true,
        isArchived: false,
      },
    }),
    prisma.materialCatalog.count({
      where: {
        isCurrent: true,
        isArchived: false,
      },
    }),
  ]);

  const statCards = [
    {
      label: "Прайси робіт",
      value: workPriceListsCount,
      hint: `Поточні активні: ${currentWorkPriceListsCount}`,
    },
    {
      label: "Позиції прайсів",
      value: workPriceItemsCount,
      hint: "Розцінки всередині прайсів робіт",
    },
    {
      label: "Каталоги матеріалів",
      value: materialCatalogsCount,
      hint: `Поточні активні: ${currentMaterialCatalogsCount}`,
    },
    {
      label: "Позиції матеріалів",
      value: materialItemsCount,
      hint: "Номенклатура всередині каталогів",
    },
    {
      label: "Бренди",
      value: brandsCount,
      hint: "Матеріали, фурнітура, автоматика, світло",
    },
    {
      label: "Типи приміщень",
      value: roomTypesCount,
      hint: "Наступний довідник у черзі",
    },
    {
      label: "Типи фурнітури",
      value: fittingTypesCount,
      hint: "Наступний довідник у черзі",
    },
    {
      label: "Типи освітлення",
      value: lightingSystemTypesCount,
      hint: "Наступний довідник у черзі",
    },   
    {
      label: "Навички працівників",
      value: skillTagsCount,
      hint: "Теги компетенцій для профілів працівників",
    },    
  ];

  const readyModules = referenceRoutes.filter((item) => item.status === "ready").length;
  const nextModules = referenceRoutes.filter((item) => item.status === "next").length;

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Довідники
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Центральний хаб reference-модулів
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Тут зібрані довідники, на яких тримається reference layer CRM:
              прайси робіт, каталоги матеріалів, бренди та наступна черга
              типових сутностей для структури об’єктів і точок.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Готові модулі
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {readyModules}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Уже можна відкривати й використовувати.
              </p>
            </article>

            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Наступна черга
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {nextModules}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Ще потрібно добудувати після поточного reference layer.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Маршрути довідників
          </h2>
          <p className="text-sm leading-7 text-neutral-600">
            Тут видно реальний стан модулів: що вже працює як окремий маршрут, а
            що ще лишається в черзі на реалізацію.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {referenceRoutes.map((item) => {
            const badge = getRouteBadge(item.status);

            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-neutral-950">
                    {item.title}
                  </h3>
                  <span className={badge.className}>{badge.label}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.description}
                </p>
              </>
            );

            if (item.href !== "#") {
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-neutral-300 hover:bg-white"
                >
                  {content}
                </Link>
              );
            }

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
              >
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Що вже реалізовано
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
              Прайси робіт зі списком, деталкою і позиціями прайса.
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
              Каталоги матеріалів зі списком, деталкою і позиціями матеріалів.
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
              Бренди як окремий базовий reference-модуль.
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
              Єдина точка входу в reference layer без хаотичної навігації.
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Наступні сутності
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            Після цього reference layer логічно добудовувати через типи
            приміщень, типи фурнітури та типи освітлення, щоб закрити базу для
            room/point/light structure.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-3 py-2 text-sm font-medium text-neutral-700">
              room-types
            </span>
            <span className="rounded-full bg-white px-3 py-2 text-sm font-medium text-neutral-700">
              fitting-types
            </span>
            <span className="rounded-full bg-white px-3 py-2 text-sm font-medium text-neutral-700">
              lighting-system-types
            </span>
          </div>
        </article>
      </section>
    </div>
  );
}
