import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TeamReferencesPage() {
  const [
    employeesCount,
    responsibleCount,
    archivedEmployeesCount,
    rolesCount,
    skillTagsCount,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        employeeProfile: {
          isNot: null,
        },
      },
    }),
    prisma.employeeProfile.count({
      where: {
        isResponsible: true,
        isArchived: false,
      },
    }),
    prisma.employeeProfile.count({
      where: {
        isArchived: true,
      },
    }),
    prisma.role.count(),
    prisma.skillTag.count(),
  ]);

  const cards = [
    {
      title: "Працівники",
      href: "/employees",
      description:
        "Список працівників, ролі, відповідальні, статуси, ставки та профілі.",
      badge: `${employeesCount} у системі`,
    },
    {
      title: "Навички працівників",
      href: "/references/skill-tags",
      description:
        "Довідник навичок і компетенцій для працівників, команд і відповідальних.",
      badge: `${skillTagsCount} навичок`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              References / Team
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Кадровий довідник
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Центральна точка для кадрового блоку: працівники, відповідальні,
              ролі та навички команди.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/employees"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Відкрити працівників
            </Link>

            <Link
              href="/references"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              До довідників
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Працівники</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {employeesCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Відповідальні</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">
            {responsibleCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Ролі</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {rolesCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Навички</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {skillTagsCount}
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                  {card.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">
                  {card.description}
                </p>
              </div>

              <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                {card.badge}
              </span>
            </div>

            <div className="mt-5 inline-flex items-center text-sm font-semibold text-neutral-900">
              Відкрити →
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
          Поточна логіка блоку
        </h2>
        <div className="mt-4 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="font-semibold text-neutral-900">Типи працівників</p>
            <p className="mt-2">
              На цьому етапі реалізуються через <code>Role</code> і
              <code> UserRole</code>.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="font-semibold text-neutral-900">Відповідальні</p>
            <p className="mt-2">
              Позначаються через прапорець <code>isResponsible</code> в
              <code> EmployeeProfile</code>.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="font-semibold text-neutral-900">Навички</p>
            <p className="mt-2">
              Прив’язуються через <code>SkillTag</code> та
              <code> EmployeeSkillTag</code>.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="font-semibold text-neutral-900">Архівація</p>
            <p className="mt-2">
              Архів працівників ведеться через <code>EmployeeProfile.isArchived</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
