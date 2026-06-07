import { prisma } from "@/lib/prisma";
import { ProjectPanelLineModal } from "../project-panel-line-modal";

export default async function ProjectShieldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const [panelLines, cableMaterials, projectRooms] = await Promise.all([
    prisma.projectPanelLine.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.projectMaterialItem.findMany({
      where: {
        projectId,
        isArchived: false,
        OR: [
          { category: { contains: "кабел", mode: "insensitive" } },
          { category: { contains: "провід", mode: "insensitive" } },
          { category: { contains: "wire", mode: "insensitive" } },
          { category: { contains: "cable", mode: "insensitive" } },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        unit: true,
      },
    }),
    prisma.projectRoom.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const nextSortOrder =
    panelLines.length === 0
      ? 0
      : Math.max(...panelLines.map((line) => line.sortOrder ?? 0)) + 1;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Щит і лінії
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Базова структура майбутнього щита: лінії, групи, автоматика,
              привʼязка до кімнат і навантажень.
            </p>
          </div>

          <ProjectPanelLineModal
            mode="create"
            projectId={projectId}
            triggerLabel="Додати лінію"
            cableMaterials={cableMaterials}
            projectRooms={projectRooms}
            initialValue={{ sortOrder: String(nextSortOrder) }}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {panelLines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
            У проєкті ще немає ліній щита. Додайте першу лінію, щоб почати
            структуру майбутнього щита.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {panelLines.map((line) => (
              <article
                key={line.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-900">
                        {line.lineCode || "Без коду лінії"}
                      </h3>

                      <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        #{line.sortOrder}
                      </span>

                      {/* Кімнати як окремі чіпи */}
                      {line.roomName
                        ? line.roomName.split(",").map((r) => (
                            <span
                              key={r.trim()}
                              className="inline-flex rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700"
                            >
                              {r.trim()}
                            </span>
                          ))
                        : null}

                      {line.cableType ? (
                        <span className="inline-flex rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                          {line.cableType}
                          {line.cableSection ? ` · ${line.cableSection}` : ""}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        Призначення:{" "}
                        <span className="font-medium text-neutral-900">
                          {line.destination || "—"}
                        </span>
                      </div>
                      <div>
                        Фази:{" "}
                        <span className="font-medium text-neutral-900">
                          {line.phases || "—"}
                        </span>
                      </div>
                      <div>
                        Автомат:{" "}
                        <span className="font-medium text-neutral-900">
                          {line.breaker || "—"}
                        </span>
                      </div>
                      <div>
                        RCD / RCBO:{" "}
                        <span className="font-medium text-neutral-900">
                          {line.rcd || "—"}
                        </span>
                      </div>
                    </div>

                    {line.note ? (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                        {line.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0">
                    <ProjectPanelLineModal
                      mode="edit"
                      projectId={projectId}
                      triggerLabel="Редагувати"
                      triggerClassName="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      cableMaterials={cableMaterials}
                      projectRooms={projectRooms}
                      canDelete
                      initialValue={{
                        id: line.id,
                        lineCode: line.lineCode ?? "",
                        roomName: line.roomName ?? "",
                        destination: line.destination ?? "",
                        cableType: line.cableType ?? "",
                        cableSection: line.cableSection ?? "",
                        phases: line.phases ?? "",
                        breaker: line.breaker ?? "",
                        rcd: line.rcd ?? "",
                        note: line.note ?? "",
                        sortOrder: String(line.sortOrder),
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
