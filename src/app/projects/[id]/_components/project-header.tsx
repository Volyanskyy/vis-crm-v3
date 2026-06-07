type ProjectHeaderProps = {
  project: {
    id: string;
    name: string;
    status: string | null;
    address: string | null;
    description: string | null;
    createdAt: Date | string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    client?: {
      name: string;
      phone: string | null;
      email: string | null;
    } | null;
    manager?: {
      fullName?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "DRAFT":
      return "Чернетка";
    case "ACTIVE":
      return "Активний";
    case "ON_HOLD":
      return "Призупинений";
    case "COMPLETED":
      return "Завершений";
    case "CANCELLED":
      return "Скасований";
    case "ARCHIVED":
      return "В архіві";
    default:
      return "Без статусу";
  }
}

function getStatusClass(status: string | null) {
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
      return "bg-neutral-200 text-neutral-600";
    case "DRAFT":
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

function resolveUserName(
  user:
    | {
        fullName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      }
    | null
    | undefined,
) {
  if (!user) return "—";

  const fullName = user.fullName?.trim();
  if (fullName) return fullName;

  const composed = [user.firstName?.trim(), user.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  return composed || "—";
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const responsibleName = resolveUserName(project.manager);
  const responsiblePhone = project.manager?.phone?.trim() || null;
  const responsibleEmail = project.manager?.email?.trim() || null;

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="px-6 py-6 sm:px-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {project.name}
            </h1>

            {project.description ? (
              <p className="mt-3 max-w-4xl text-sm leading-7 text-neutral-600">
                {project.description}
              </p>
            ) : null}

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Дані клієнта
              </div>

              <div className="mt-4 grid gap-4 text-sm text-neutral-600 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Назва
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-950">
                    {project.client?.name || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Телефон
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-950">
                    {project.client?.phone || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Адреса
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-950">
                    {project.address || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 self-start">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Терміни
              </div>

              <div className="mt-3 space-y-2 text-sm text-neutral-700">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Статус</span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Початок</span>
                  <span className="font-medium text-neutral-950">
                    {formatDate(project.startDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Завершено</span>
                  <span className="font-medium text-neutral-950">
                    {formatDate(project.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Створено</span>
                  <span className="font-medium text-neutral-950">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Відповідальний
              </div>

              <div className="mt-3 text-sm font-semibold text-neutral-950">
                {responsibleName}
              </div>

              <div className="mt-3 space-y-2 text-sm text-neutral-700">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Телефон</span>
                  <span className="font-medium text-neutral-950">
                    {responsiblePhone || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Email</span>
                  <span className="truncate font-medium text-neutral-950">
                    {responsibleEmail || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
