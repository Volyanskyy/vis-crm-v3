import { prisma } from "@/lib/prisma";
import { EmployeeFormModal } from "./employee-form-modal";

export default async function EmployeesPage() {
  const [employees, roles, skillTags, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        employeeProfile: {
          isNot: null,
        },
      },
      include: {
        employeeProfile: {
          include: {
            skillTags: {
              include: {
                skillTag: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.role.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
    prisma.skillTag.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
    prisma.user.count({
      where: {
        employeeProfile: {
          isNot: null,
        },
      },
    }),
  ]);

  const responsibleCount = employees.filter(
    (employee) => employee.employeeProfile?.isResponsible,
  ).length;

  const archivedCount = employees.filter(
    (employee) => employee.employeeProfile?.isArchived,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              Team / Employees
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Працівники
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Команда працівників і відповідальних з ролями, статусами, навичками та робочими профілями.
            </p>
          </div>

          <EmployeeFormModal
            mode="create"
            triggerLabel="Створити працівника"
            roles={roles}
            skillTags={skillTags}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Всього працівників</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {totalCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Відповідальні</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">
            {responsibleCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">В архіві</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-400">
            {archivedCount}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Доступні навички</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {skillTags.length}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Список працівників
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Профілі працівників, ролі, відповідальність, навички та статуси.
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
              У системі ще немає працівників. Додайте першого працівника, щоб формувати команду проєктів.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
            {employees.map((employee) => {
              const profile = employee.employeeProfile;
              const roleIds = employee.userRoles.map((item) => item.roleId);
              const skillTagIds =
                profile?.skillTags.map((item) => item.skillTagId) ?? [];

              return (
                <article
                  key={employee.id}
                  className={`rounded-2xl border border-neutral-200 p-4 shadow-sm transition hover:border-neutral-300 ${
                    profile?.isArchived
                      ? "bg-neutral-50/80"
                      : "bg-white hover:bg-neutral-50/40"
                  }`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3
                          className={`text-lg font-semibold ${
                            profile?.isArchived
                              ? "text-neutral-500 line-through"
                              : "text-neutral-950"
                          }`}
                        >
                          {employee.fullName ||
                            `${employee.firstName} ${employee.lastName}`}
                        </h3>

                        {profile?.isResponsible ? (
                          <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Відповідальний
                          </span>
                        ) : null}

                        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          {employee.status}
                        </span>

                        {profile?.employeeCode ? (
                          <span className="inline-flex rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-mono text-xs font-medium text-neutral-500">
                            {profile.employeeCode}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                        <span>Email: <span className="font-medium text-neutral-900">{employee.email}</span></span>
                        <span>Телефон: <span className="font-medium text-neutral-900">{employee.phone || "—"}</span></span>
                        <span>Посада: <span className="font-medium text-neutral-900">{profile?.positionTitle || "—"}</span></span>
                        <span>Ставка: <span className="font-medium text-neutral-900">{profile?.hourlyRate?.toString() || "—"}</span></span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {employee.userRoles.length > 0 ? (
                          employee.userRoles.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700"
                            >
                              {item.role.name}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                            Без ролей
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {profile?.skillTags && profile.skillTags.length > 0 ? (
                          profile.skillTags.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                            >
                              {item.skillTag.name}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                            Без навичок
                          </span>
                        )}
                      </div>

                      {profile?.skillsSummary ? (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                          {profile.skillsSummary}
                        </p>
                      ) : null}

                      {profile?.notes ? (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                          {profile.notes}
                        </p>
                      ) : null}
                    </div>

                    {profile ? (
                      <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                        <EmployeeFormModal
                          mode="edit"
                          triggerLabel="Редагувати"
                          triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                          roles={roles}
                          skillTags={skillTags}
                          initialValue={{
                            userId: employee.id,
                            employeeProfileId: profile.id,
                            firstName: employee.firstName,
                            lastName: employee.lastName,
                            email: employee.email,
                            phone: employee.phone ?? "",
                            status: employee.status,
                            employeeCode: profile.employeeCode ?? "",
                            positionTitle: profile.positionTitle ?? "",
                            isResponsible: profile.isResponsible,
                            skillsSummary: profile.skillsSummary ?? "",
                            notes: profile.notes ?? "",
                            hourlyRate: profile.hourlyRate?.toString() ?? "",
                            isArchived: profile.isArchived,
                            roleIds,
                            skillTagIds,
                          }}
                        />
                      </div>
                    ) : null}
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
