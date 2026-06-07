import { prisma } from "@/lib/prisma";
import { ProjectRoomModal } from "../project-room-modal";
import { FittingPointModal } from "../fitting-point-modal";
import { LightingPointModal } from "../lighting-point-modal";

export default async function ProjectRoomsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const [rooms, roomTypes, fittingTypes, lightingSystemTypes] = await Promise.all([
    prisma.projectRoom.findMany({
      where: { projectId },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        fittingPoints: {
          orderBy: [{ createdAt: "asc" }],
          include: {
            fittingType1: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            fittingType2: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            fittingType3: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            fittingType4: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            fittingType5: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            fittingType6: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        lightingPoints: {
          orderBy: [{ createdAt: "asc" }],
          include: {
            lightingSystemType: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            fittingPoints: true,
            lightingPoints: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.roomType.findMany({
      where: {
        isArchived: false,
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
    prisma.fittingType.findMany({
      where: {
        isArchived: false,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
        category: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.lightingSystemType.findMany({
      where: {
        isArchived: false,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
        category: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  function getPointStatusLabel(status: string) {
    switch (status) {
      case "ACTIVE":
        return "Активна";
      case "ARCHIVED":
        return "В архіві";
      case "DRAFT":
      default:
        return "Чернетка";
    }
  }

  function getPointStatusClass(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "ARCHIVED":
        return "bg-neutral-200 text-neutral-700";
      case "DRAFT":
      default:
        return "bg-amber-100 text-amber-700";
    }
  }

  function mechanismList(point: (typeof rooms)[number]["fittingPoints"][number]) {
    return [
      point.fittingType1,
      point.fittingType2,
      point.fittingType3,
      point.fittingType4,
      point.fittingType5,
      point.fittingType6,
    ]
      .map((item, index) => ({
        slot: index + 1,
        item,
      }))
      .filter((entry) => Boolean(entry.item));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Кімнати і точки
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Польова структура проєкту: приміщення, точки фурнітури та точки
              освітлення для специфікації й монтажного плану.
            </p>
          </div>

          <ProjectRoomModal
            mode="create"
            projectId={projectId}
            triggerLabel="Додати кімнату"
            roomTypes={roomTypes}
            initialValue={{
              sortOrder: String(
                rooms.length > 0
                ? Math.max(...rooms.map((room) => room.sortOrder ?? 0)) + 1
                : 1,
              ),
            }}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {rooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500 xl:col-span-2">
            У проєкті ще немає кімнат. Додайте першу кімнату, щоб описати точки
            фурнітури та освітлення.
          </div>
        ) : (
          rooms.map((room) => (
            <article
              key={room.id}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                        {room.name}
                      </h3>

                      {room.roomType ? (
                        <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                          {room.roomType.name}
                          {room.roomType.code ? ` · ${room.roomType.code}` : ""}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm text-neutral-600">
                      Порядок: {room.sortOrder} · Точок фурнітури:{" "}
                      {room._count.fittingPoints} · Точок освітлення:{" "}
                      {room._count.lightingPoints}
                    </p>

                    {room.floor ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        Поверх: {room.floor}
                      </p>
                    ) : null}

                    {room.notes ? (
                      <p className="mt-3 text-sm leading-6 text-neutral-600">
                        {room.notes}
                      </p>
                    ) : null}
                  </div>

                  <ProjectRoomModal
                    mode="edit"
                    projectId={projectId}
                    triggerLabel="Редагувати"
                    triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                    roomTypes={roomTypes}
                    canDelete
                    initialValue={{
                      id: room.id,
                      roomTypeId: room.roomTypeId ?? "",
                      name: room.name,
                      floor: room.floor ?? "",
                      sortOrder: String(room.sortOrder ?? 0),
                      notes: room.notes ?? "",
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Точки фурнітури
                    </h4>

                    <FittingPointModal
                      mode="create"
                      projectId={projectId}
                      roomId={room.id}
                      triggerLabel="Додати точку"
                      fittingTypes={fittingTypes}
                    />
                  </div>

                  {room.fittingPoints.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Немає точок фурнітури.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {room.fittingPoints.map((point) => {
                        const mechanisms = mechanismList(point);

                        return (
                          <div
                            key={point.id}
                            className="rounded-2xl border border-neutral-200 bg-white p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPointStatusClass(point.status)}`}
                                  >
                                    {getPointStatusLabel(point.status)}
                                  </span>

                                  <span className="text-sm font-medium text-neutral-900">
                                    {point.wallLabel || "Без позначення стіни"}
                                  </span>
                                </div>

                                <p className="mt-2 text-sm text-neutral-600">
                                  Кількість: {point.quantity} · Рамка:{" "}
                                  {point.frameSize}
                                  {point.installHeightMm
                                    ? ` · Висота: ${point.installHeightMm} мм`
                                    : ""}
                                </p>

                                {mechanisms.length > 0 ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {mechanisms.map(({ slot, item }) =>
                                      item ? (
                                        <span
                                          key={`${point.id}-${slot}-${item.id}`}
                                          className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                                        >
                                          {slot}. {item.brand ? `${item.brand.name} ` : ""}
                                          {item.name}
                                          {item.code ? ` · ${item.code}` : ""}
                                        </span>
                                      ) : null,
                                    )}
                                  </div>
                                ) : null}

                                {point.note ? (
                                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                                    {point.note}
                                  </p>
                                ) : null}
                              </div>

                              <FittingPointModal
                                mode="edit"
                                projectId={projectId}
                                roomId={room.id}
                                triggerLabel="Редагувати"
                                triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                                fittingTypes={fittingTypes}
                                initialValue={{
                                  id: point.id,
                                  wallLabel: point.wallLabel ?? "",
                                  quantity: String(point.quantity ?? 1),
                                  frameSize: String(point.frameSize ?? 1),
                                  installHeightMm: point.installHeightMm
                                    ? String(point.installHeightMm)
                                    : "",
                                  note: point.note ?? "",
                                  status: point.status,
                                  fittingTypeId1: point.fittingTypeId1 ?? "",
                                  fittingTypeId2: point.fittingTypeId2 ?? "",
                                  fittingTypeId3: point.fittingTypeId3 ?? "",
                                  fittingTypeId4: point.fittingTypeId4 ?? "",
                                  fittingTypeId5: point.fittingTypeId5 ?? "",
                                  fittingTypeId6: point.fittingTypeId6 ?? "",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Точки освітлення
                    </h4>

                    <LightingPointModal
                      mode="create"
                      projectId={projectId}
                      roomId={room.id}
                      triggerLabel="Додати точку"
                      lightingSystemTypes={lightingSystemTypes}
                    />
                  </div>

                  {room.lightingPoints.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Немає точок освітлення.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {room.lightingPoints.map((point) => (
                        <div
                          key={point.id}
                          className="rounded-2xl border border-neutral-200 bg-white p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPointStatusClass(point.status)}`}
                                >
                                  {getPointStatusLabel(point.status)}
                                </span>

                                <span className="text-sm font-medium text-neutral-900">
                                  {point.wallLabel || "Без позначення стіни"}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-neutral-600">
                                Кількість: {point.quantity}
                                {point.installHeightMm
                                  ? ` · Висота: ${point.installHeightMm} мм`
                                  : ""}
                              </p>

                              {point.lightingSystemType ? (
                                <div className="mt-3">
                                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                                    {point.lightingSystemType.brand
                                      ? `${point.lightingSystemType.brand.name} `
                                      : ""}
                                    {point.lightingSystemType.name}
                                    {point.lightingSystemType.code
                                      ? ` · ${point.lightingSystemType.code}`
                                      : ""}
                                  </span>
                                </div>
                              ) : null}

                              {point.note ? (
                                <p className="mt-3 text-sm leading-6 text-neutral-600">
                                  {point.note}
                                </p>
                              ) : null}
                            </div>

                            <LightingPointModal
                              mode="edit"
                              projectId={projectId}
                              roomId={room.id}
                              triggerLabel="Редагувати"
                              triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                              lightingSystemTypes={lightingSystemTypes}
                              initialValue={{
                                id: point.id,
                                wallLabel: point.wallLabel ?? "",
                                quantity: String(point.quantity ?? 1),
                                installHeightMm: point.installHeightMm
                                  ? String(point.installHeightMm)
                                  : "",
                                note: point.note ?? "",
                                status: point.status,
                                lightingSystemTypeId:
                                  point.lightingSystemTypeId ?? "",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
