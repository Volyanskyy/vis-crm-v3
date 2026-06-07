import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SkillTagFormModal } from "./skill-tag-form-modal";

export default async function SkillTagsPage() {
  const [skillTags, totalCount] = await Promise.all([
    prisma.skillTag.findMany({
      include: {
        employeeSkillTags: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.skillTag.count(),
  ]);

  const linkedCount = skillTags.filter(
    (skillTag) => skillTag.employeeSkillTags.length > 0,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Reference / Skill Tags
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Навички працівників
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Довідник навичок для працівників і відповідальних: електромонтаж,
              щити, автоматика, освітлення, слаботочка, пусконалагодження та
              інші компетенції.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SkillTagFormModal mode="create" triggerLabel="Створити навичку" />

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
          <p className="text-sm font-medium text-neutral-500">Всього навичок</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Привʼязані до працівників</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">
            {linkedCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Поки без використання</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-400">
            {totalCount - linkedCount}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список навичок
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            База тегів навичок для призначення працівникам і фільтрації команди за компетенціями.
          </p>
        </div>

        {skillTags.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
              У довіднику ще немає жодної навички. Додайте першу навичку,
              наприклад: Монтаж щита, Прокладання кабелю, Автоматика.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {skillTags.map((skillTag) => (
              <article
                key={skillTag.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/40"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        {skillTag.name}
                      </h3>

                      <span className="inline-flex rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-mono text-xs font-medium text-neutral-500">
                        {skillTag.code}
                      </span>

                      <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        Призначень: {skillTag.employeeSkillTags.length}
                      </span>
                    </div>

                    {skillTag.description ? (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                        {skillTag.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    <SkillTagFormModal
                      mode="edit"
                      triggerLabel="Редагувати"
                      triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      initialValue={{
                        id: skillTag.id,
                        code: skillTag.code,
                        name: skillTag.name,
                        description: skillTag.description ?? "",
                      }}
                    />
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
