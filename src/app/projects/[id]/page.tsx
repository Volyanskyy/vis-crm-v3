import { prisma } from "@/lib/prisma";
import { ProjectTeamManager } from "./_components/project-team-manager";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const [
    roomsCount,
    fittingPointsCount,
    lightingPointsCount,
    panelLinesCount,
    materialItemsCount,
    workItemsCount,
    project,
  ] = await Promise.all([
    prisma.projectRoom.count({
      where: { projectId },
    }),
    prisma.fittingPoint.count({
      where: {
        projectRoom: {
          projectId,
        },
      },
    }),
    prisma.lightingPoint.count({
      where: {
        projectRoom: {
          projectId,
        },
      },
    }),
    prisma.projectPanelLine.count({
      where: { projectId },
    }),
    prisma.projectMaterialItem.count({
      where: {
        projectId,
        isArchived: false,
      },
    }),
    prisma.projectWorkItem.count({
      where: {
        projectId,
        isArchived: false,
      },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        teamMembers: {
          where: {
            leftAt: null,
          },
          orderBy: [{ isLead: "desc" }, { joinedAt: "asc" }],
          select: {
            id: true,
            roleLabel: true,
            isLead: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                fullName: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const compactStats = [
    { label: "Кімнати", value: roomsCount },
    { label: "Фурнітура", value: fittingPointsCount },
    { label: "Освітлення", value: lightingPointsCount },
    { label: "Лінії щита", value: panelLinesCount },
    { label: "Матеріали", value: materialItemsCount },
    { label: "Роботи", value: workItemsCount },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Огляд проєкту
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
              Поточний стан наповнення
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Короткий зріз по структурі об’єкта та наповненню проєкту.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {compactStats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                {item.label}
              </div>
              <div className="mt-2 text-2xl font-semibold text-neutral-950">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProjectTeamManager
        projectId={projectId}
        members={project?.teamMembers ?? []}
      />
    </div>
  );
}
