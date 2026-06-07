import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "../print-button";

function asNumber(value: unknown) {
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber(): number }).toNumber();
  }

  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: unknown) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(asNumber(value));
}

function formatQty(value: unknown) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(asNumber(value));
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function dash(value: string | null | undefined) {
  const text = (value ?? "").trim();
  return text || "—";
}

function roomDisplayName(room: {
  name: string;
  roomType?: { name: string | null } | null;
}) {
  return room.roomType?.name ? `${room.name} · ${room.roomType.name}` : room.name;
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
  if (!user) return "";

  const fullName = user.fullName?.trim();
  if (fullName) return fullName;

  return [user.firstName?.trim(), user.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
}

type FittingRow = {
  key: string;
  name: string;
  brandName: string | null;
  count: number;
};

function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 mb-4 mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export default async function ProjectFieldReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      manager: {
        select: {
          id: true,
          fullName: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      teamMembers: {
        orderBy: [{ joinedAt: "asc" }],
        include: {
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
      rooms: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
                include: {
                  brand: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              fittingType2: {
                include: {
                  brand: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              fittingType3: {
                include: {
                  brand: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              fittingType4: {
                include: {
                  brand: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              fittingType5: {
                include: {
                  brand: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              fittingType6: {
                include: {
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
                },
              },
            },
          },
        },
      },
      workItems: {
        where: { isArchived: false },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      materialItems: {
        where: { isArchived: false },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          sourceMaterial: {
            select: {
              id: true,
              name: true,
              unit: true,
              recommendedRetail: true,
            },
          },
        },
      },
      panelLines: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!project) {
    notFound();
  }

  const leadTeamUser = project.teamMembers[0]?.user;
  const responsibleName =
    resolveUserName(project.manager) ||
    resolveUserName(leadTeamUser) ||
    leadTeamUser?.email ||
    "—";
  const responsiblePhone = project.manager?.phone || leadTeamUser?.phone || "—";

  const totalRooms = project.rooms.length;
  const totalFittingPoints = project.rooms.reduce(
    (sum, room) => sum + room.fittingPoints.length,
    0,
  );
  const totalLightingPoints = project.rooms.reduce(
    (sum, room) => sum + room.lightingPoints.length,
    0,
  );
  const totalMaterials = project.materialItems.length;
  const totalWorkItems = project.workItems.length;
  const totalPanelLines = project.panelLines.length;

  const materialRows = project.materialItems.map((item) => {
    const recommendedRetail = item.retailPrice
      ? asNumber(item.retailPrice)
      : asNumber(item.sourceMaterial?.recommendedRetail);

    const quantity = asNumber(item.quantity);
    const totalRetail =
      asNumber(item.totalRetail) > 0
        ? asNumber(item.totalRetail)
        : recommendedRetail * quantity;

    return {
      id: item.id,
      name: item.name?.trim() || item.sourceMaterial?.name || "Без назви",
      category: item.category?.trim() || "Інше",
      unit: item.unit?.trim() || item.sourceMaterial?.unit?.trim() || "",
      quantity,
      recommendedRetail,
      totalRetail,
    };
  });

  const materialTotal = materialRows.reduce(
    (sum, item) => sum + item.totalRetail,
    0,
  );

  const workRows = project.workItems.map((item) => ({
    id: item.id,
    name: item.name?.trim() || "Без назви",
    unit: item.unit?.trim() || "",
    quantity: asNumber(item.quantity),
    unitPrice: asNumber(item.unitPrice),
    totalPrice: asNumber(item.totalPrice),
  }));

  const workTotal = workRows.reduce((sum, item) => sum + item.totalPrice, 0);

  const fittingMap = new Map<string, FittingRow>();

  for (const room of project.rooms) {
    for (const point of room.fittingPoints) {
      const fittingTypes = [
        point.fittingType1,
        point.fittingType2,
        point.fittingType3,
        point.fittingType4,
        point.fittingType5,
        point.fittingType6,
      ].filter(Boolean);

      for (const fittingType of fittingTypes) {
        const name = fittingType?.name?.trim() || "Без назви";
        const brandName = fittingType?.brand?.name?.trim() || null;
        const key = `${brandName ?? ""}::${name}`;
        const existing = fittingMap.get(key);

        if (existing) {
          existing.count += point.quantity ?? 1;
        } else {
          fittingMap.set(key, {
            key,
            name,
            brandName,
            count: point.quantity ?? 1,
          });
        }
      }
    }
  }

  const fittingRows = Array.from(fittingMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "uk"),
  );

  const roomPlan = project.rooms.map((room) => {
    const fittingLines = room.fittingPoints.map((point) => {
      const types = [
        point.fittingType1,
        point.fittingType2,
        point.fittingType3,
        point.fittingType4,
        point.fittingType5,
        point.fittingType6,
      ]
        .filter(Boolean)
        .map((item) => item?.name?.trim())
        .filter((value): value is string => Boolean(value));

      return {
        id: point.id,
        title: point.wallLabel?.trim() || "Точка фурнітури",
        mountHeight:
          point.installHeightMm != null
            ? `${formatQty(point.installHeightMm / 1000)} м`
            : null,
        note: point.note?.trim() || null,
        quantity: point.quantity ?? 1,
        items: types,
      };
    });

    const lightingLines = room.lightingPoints.map((point) => ({
      id: point.id,
      title: point.zoneLabel?.trim() || point.pointCode?.trim() || "Точка освітлення",
      note: point.note?.trim() || null,
      systemName: point.lightingSystemType?.name?.trim() || null,
      quantity: point.quantity != null ? formatQty(point.quantity) : null,
      switchGroup: point.switchGroup?.trim() || null,
      dimmable: point.dimmable,
    }));

    return {
      id: room.id,
      name: roomDisplayName(room),
      fittingLines,
      lightingLines,
    };
  });

  return (
    <main className="min-h-screen bg-neutral-100 print:bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 print:max-w-none print:px-6 print:py-4">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <a
            href={`/projects/${project.id}/report`}
            className="inline-flex items-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
          >
            ← До списку звітів
          </a>

          <PrintButton />
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Повний польовий звіт · ВІС-Монтаж CRM
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-neutral-950">
                  {project.name}
                </h1>
                {project.address ? (
                  <div className="mt-1 text-sm text-neutral-500">{project.address}</div>
                ) : null}
              </div>

              <div className="mt-3 text-right sm:mt-0">
                <div className="text-sm text-neutral-500">Дата формування</div>
                <div className="text-sm font-medium text-neutral-900">
                  {formatDate(new Date())}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Замовник
                </div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {dash(project.client?.name)}
                </div>
                {project.client?.phone ? (
                  <div className="text-sm text-neutral-500">
                    {project.client.phone}
                  </div>
                ) : null}
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Відповідальний
                </div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {responsibleName}
                </div>
                {responsiblePhone !== "—" ? (
                  <div className="text-sm text-neutral-500">
                    {responsiblePhone}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
              {[
                { label: "Кімнати", value: totalRooms },
                { label: "Точки фурнітури", value: totalFittingPoints },
                { label: "Точки освітлення", value: totalLightingPoints },
                { label: "Позиції матеріалів", value: totalMaterials },
                { label: "Позиції робіт", value: totalWorkItems },
                { label: "Лінії щита", value: totalPanelLines },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-center"
                >
                  <div className="text-lg font-semibold text-neutral-950">
                    {item.value}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-950">
                Використані матеріали
              </h2>

              <div className="text-right">
                <div className="text-[11px] text-neutral-400">
                  Всього матеріалів на суму
                </div>
                <div className="text-lg font-semibold text-neutral-950 tabular-nums">
                  {formatMoney(materialTotal)} грн
                </div>
              </div>
            </div>

            {materialRows.length > 0 ? (
              <TableCard>
                <table className="min-w-full divide-y divide-neutral-100">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="w-8 px-4 py-2.5 text-left text-xs font-semibold text-neutral-400">
                        #
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Найменування
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Категорія
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        К-сть
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        РРЦ
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Сума
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {materialRows.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-2.5 text-sm text-neutral-400">
                          {idx + 1}
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="text-sm font-medium text-neutral-900">
                            {item.name}
                          </div>
                          {item.unit ? (
                            <div className="text-xs text-neutral-400">
                              {item.unit}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-2.5 text-sm text-neutral-600">
                          {item.category}
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm font-medium text-neutral-900 tabular-nums">
                          {formatQty(item.quantity)}
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm text-neutral-600 tabular-nums">
                          {item.recommendedRetail > 0
                            ? `${formatMoney(item.recommendedRetail)} грн`
                            : "—"}
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm font-semibold text-neutral-950 tabular-nums">
                          {item.totalRetail > 0
                            ? `${formatMoney(item.totalRetail)} грн`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            ) : (
              <div className="px-6 py-8 text-sm text-neutral-400">
                Матеріали не додано.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-950">
                Виконані роботи
              </h2>

              <div className="text-right">
                <div className="text-[11px] text-neutral-400">
                  Всього робіт на суму
                </div>
                <div className="text-lg font-semibold text-neutral-950 tabular-nums">
                  {formatMoney(workTotal)} грн
                </div>
              </div>
            </div>

            {workRows.length > 0 ? (
              <TableCard>
                <table className="min-w-full divide-y divide-neutral-100">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="w-8 px-4 py-2.5 text-left text-xs font-semibold text-neutral-400">
                        #
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Вид робіт
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Об&apos;єм
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Ціна
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Сума
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {workRows.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-2.5 text-sm text-neutral-400">
                          {idx + 1}
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="text-sm font-medium text-neutral-900">
                            {item.name}
                          </div>
                          {item.unit ? (
                            <div className="text-xs text-neutral-400">
                              {item.unit}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm text-neutral-600 tabular-nums">
                          {formatQty(item.quantity)}
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm text-neutral-600 tabular-nums">
                          {formatMoney(item.unitPrice)} грн
                        </td>

                        <td className="px-4 py-2.5 text-right text-sm font-semibold text-neutral-950 tabular-nums">
                          {formatMoney(item.totalPrice)} грн
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            ) : (
              <div className="px-6 py-8 text-sm text-neutral-400">
                Роботи не додано.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-950">
                Монтажний план
              </h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                Покімнатний перелік точок фурнітури та освітлення
              </p>
            </div>

            {roomPlan.length > 0 ? (
              <div className="mx-4 mb-4 mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="divide-y divide-neutral-100">
                  {roomPlan.map((room) => (
                    <div key={room.id} className="px-6 py-5">
                      <h3 className="mb-3 text-sm font-semibold text-neutral-800">
                        {room.name}
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                            Фурнітура
                          </div>

                          {room.fittingLines.length > 0 ? (
                            <div className="space-y-2">
                              {room.fittingLines.map((line) => (
                                <div
                                  key={line.id}
                                  className="rounded-xl bg-neutral-50 px-3 py-2.5"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-neutral-900">
                                      {line.title}
                                    </span>

                                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                                      {formatQty(line.quantity)} шт
                                    </span>

                                    {line.mountHeight ? (
                                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                                        h={line.mountHeight}
                                      </span>
                                    ) : null}
                                  </div>

                                  {line.items.length > 0 ? (
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                      {line.items.map((item, index) => (
                                        <span
                                          key={`${line.id}-${index}`}
                                          className="rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600"
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}

                                  {line.note ? (
                                    <div className="mt-1 text-xs text-neutral-400">
                                      {line.note}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-neutral-400">
                              Немає точок фурнітури.
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                            Освітлення
                          </div>

                          {room.lightingLines.length > 0 ? (
                            <div className="space-y-2">
                              {room.lightingLines.map((line) => (
                                <div
                                  key={line.id}
                                  className="rounded-xl bg-neutral-50 px-3 py-2.5"
                                >
                                  <div className="text-sm font-medium text-neutral-900">
                                    {line.title}
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {line.systemName ? (
                                      <span className="rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600">
                                        {line.systemName}
                                      </span>
                                    ) : null}

                                    {line.quantity ? (
                                      <span className="rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600">
                                        {line.quantity} шт
                                      </span>
                                    ) : null}

                                    {line.switchGroup ? (
                                      <span className="rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600">
                                        Гр. {line.switchGroup}
                                      </span>
                                    ) : null}

                                    {line.dimmable ? (
                                      <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                                        Дімування
                                      </span>
                                    ) : null}
                                  </div>

                                  {line.note ? (
                                    <div className="mt-1 text-xs text-neutral-400">
                                      {line.note}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-neutral-400">
                              Немає точок освітлення.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 text-sm text-neutral-400">
                Кімнати не додано.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-950">
                Фурнітура для закупівлі
              </h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                Зведений перелік усіх елементів фурнітури по проєкту
              </p>
            </div>

            {fittingRows.length > 0 ? (
              <TableCard>
                <table className="min-w-full divide-y divide-neutral-100">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="w-8 px-4 py-2.5 text-left text-xs font-semibold text-neutral-400">
                        #
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Найменування
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Бренд
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        К-сть, шт
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {fittingRows.map((row, idx) => (
                      <tr key={row.key} className="hover:bg-neutral-50">
                        <td className="px-4 py-2.5 text-sm text-neutral-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 text-sm font-medium text-neutral-900">
                          {row.name}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-600">
                          {row.brandName ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-semibold text-neutral-950 tabular-nums">
                          {formatQty(row.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            ) : (
              <div className="px-6 py-8 text-sm text-neutral-400">
                Фурнітура не заповнена.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-950">
                Перелік ліній щита
              </h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                Розподільчий щит — лінії, призначення, переріз кабелю
              </p>
            </div>

            {project.panelLines.length > 0 ? (
              <TableCard>
                <table className="min-w-full divide-y divide-neutral-100">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Лінія
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Кімната
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Призначення
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Кабель
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Переріз
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
                        Автомат
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {project.panelLines.map((line) => (
                      <tr key={line.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-2.5 text-sm font-semibold text-neutral-900 tabular-nums">
                          {dash(line.lineCode)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-600">
                          {dash(line.roomName)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-900">
                          {dash(line.destination)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-600">
                          {dash(line.cableType)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-600 tabular-nums">
                          {dash(line.cableSection)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-600">
                          {dash(line.breaker)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            ) : (
              <div className="px-6 py-8 text-sm text-neutral-400">
                Лінії щита не додано.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
