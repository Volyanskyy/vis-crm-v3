import { ProjectRoomModal } from "../project-room-modal";
import { FittingPointModal } from "../fitting-point-modal";

function getPointStatusLabel(status: string) {
  switch (status) {
    case "DRAFT":
      return "Чернетка";
    case "ACTIVE":
      return "Активна";
    case "ARCHIVED":
      return "Архів";
    default:
      return status;
  }
}

function getPointStatusClasses(status: string) {
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

type RoomTypeOption = {
  id: string;
  name: string;
  code: string | null;
};

type FittingTypeOption = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  brand: {
    id: string;
    name: string;
  } | null;
};

type RoomItem = {
  id: string;
  roomTypeId: string | null;
  name: string;
  floor: string | null;
  sortOrder: number;
  notes: string | null;
  roomType: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  fittingPoints: Array<{
    id: string;
    wallLabel: string | null;
    quantity: number;
    frameSize: number;
    installHeightMm: number | null;
    note: string | null;
    status: string;
    fittingTypeId1: string | null;
    fittingTypeId2: string | null;
    fittingTypeId3: string | null;
    fittingTypeId4: string | null;
    fittingTypeId5: string | null;
    fittingTypeId6: string | null;
    fittingType1: {
      id: string;
      name: string;
      code: string | null;
      category: string | null;
      brand: { id: string; name: string } | null;
    } | null;
    fittingType2: {
      id: string;
      name: string;
      code: string | null;
      category: string | null;
      brand: { id: string; name: string } | null;
    } | null;
    fittingType3: {
      id: string;
      name: string;
      code: string | null;
      category: string | null;
      brand: { id: string; name: string } | null;
    } | null;
    fittingType4: {
      id: string;
      name: string;
      code: string | null;
      category: string | null;
      brand: { id: string; name: string } | null;
    } | null;
    fittingType5: {
      id: string;
      name: string;
      code: string | null;
      category: string | null;
      brand: { id: string; name: string } | null;
    } | null;
    fittingType6: {
      id: string;
      name: string;
      code: string | null;
      category: string | null;
      brand: { id: string; name: string } | null;
    } | null;
  }>;
  _count: {
    fittingPoints: number;
    lightingPoints: number;
  };
};

export function RoomsTabContent({
  projectId,
  rooms,
  roomTypes,
  fittingTypes,
}: {
  projectId: string;
  rooms: RoomItem[];
  roomTypes: RoomTypeOption[];
  fittingTypes: FittingTypeOption[];
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Кімнати проєкту
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Структура приміщень, точки фурнітури та конфігурація по кожній кімнаті.
          </p>
        </div>

        <ProjectRoomModal
          mode="create"
          projectId={projectId}
          triggerLabel="Додати кімнату"
          roomTypes={roomTypes}
        />
      </div>

      {rooms.length === 0 ? (
        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
            У цьому проєкті ще немає кімнат.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2">
          {rooms.map((room) => {
            const draftCount = room.fittingPoints.filter(
              (point) => point.status === "DRAFT",
            ).length;

            const activeCount = room.fittingPoints.filter(
              (point) => point.status === "ACTIVE",
            ).length;

            const archivedCount = room.fittingPoints.filter(
              (point) => point.status === "ARCHIVED",
            ).length;

            return (
              <article
                key={room.id}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="border-b border-neutral-200 bg-neutral-50/70 px-5 py-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                        {room.name}
                      </h3>

                      {room.roomType ? (
                        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200">
                          {room.roomType.name}
                        </span>
                      ) : null}

                      <span className="inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
                        sort: {room.sortOrder}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-neutral-200">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Поверх
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-neutral-900">
                          {room.floor || "—"}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-neutral-200">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Фурнітура
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-neutral-900">
                          {room._count.fittingPoints}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-neutral-200">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Освітлення
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-neutral-900">
                          {room._count.lightingPoints}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-neutral-200">
                        <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                          Чернетки
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-neutral-900">
                          {draftCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <FittingPointModal
                        mode="create"
                        projectRoomId={room.id}
                        triggerLabel="Додати точку"
                        fittingTypes={fittingTypes}
                      />

                      <ProjectRoomModal
                        mode="edit"
                        projectId={projectId}
                        triggerLabel="Редагувати кімнату"
                        triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                        roomTypes={roomTypes}
                        initialValue={{
                          id: room.id,
                          roomTypeId: room.roomTypeId ?? "",
                          name: room.name,
                          floor: room.floor ?? "",
                          sortOrder: String(room.sortOrder),
                          notes: room.notes ?? "",
                        }}
                        canDelete
                      />
                    </div>

                    {room.notes ? (
                      <p className="max-w-3xl text-sm leading-6 text-neutral-600">
                        {room.notes}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Чернетки: {draftCount}
                    </span>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Активні: {activeCount}
                    </span>
                    <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      Архів: {archivedCount}
                    </span>
                  </div>

                  {room.fittingPoints.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-600">
                      У цій кімнаті ще немає точок фурнітури.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {room.fittingPoints.map((point) => {
                        const mechanisms = [
                          point.fittingType1,
                          point.fittingType2,
                          point.fittingType3,
                          point.fittingType4,
                          point.fittingType5,
                          point.fittingType6,
                        ].filter(Boolean) as Array<{
                          id: string;
                          name: string;
                          code: string | null;
                          category: string | null;
                          brand: { id: string; name: string } | null;
                        }>;

                        return (
                          <article
                            key={point.id}
                            className={`rounded-2xl border p-4 transition ${
                              point.status === "ARCHIVED"
                                ? "border-neutral-200 bg-neutral-50"
                                : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/40"
                            }`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <h4
                                    className={`text-base font-semibold tracking-tight ${
                                      point.status === "ARCHIVED"
                                        ? "text-neutral-500 line-through"
                                        : "text-neutral-950"
                                    }`}
                                  >
                                    {point.wallLabel || "Точка без опису"}
                                  </h4>

                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPointStatusClasses(
                                      point.status,
                                    )}`}
                                  >
                                    {getPointStatusLabel(point.status)}
                                  </span>

                                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                                    Рамка: {point.frameSize}
                                  </span>

                                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    x{point.quantity}
                                  </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {mechanisms.map((mechanism, index) => (
                                    <span
                                      key={`${point.id}-${mechanism.id}-${index}`}
                                      className="inline-flex rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800"
                                    >
                                      {index + 1}. {mechanism.name}
                                    </span>
                                  ))}
                                </div>

                                {(point.installHeightMm || point.note) && (
                                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-neutral-600 sm:grid-cols-2">
                                    <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                                      <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                                        Висота монтажу
                                      </span>
                                      <span className="mt-1 block font-medium text-neutral-900">
                                        {point.installHeightMm
                                          ? `${point.installHeightMm} мм`
                                          : "—"}
                                      </span>
                                    </div>

                                    <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                                      <span className="block text-xs uppercase tracking-[0.08em] text-neutral-500">
                                        Примітка
                                      </span>
                                      <span className="mt-1 block font-medium text-neutral-900">
                                        {point.note || "—"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                                <FittingPointModal
                                  mode="edit"
                                  projectRoomId={room.id}
                                  triggerLabel="Редагувати"
                                  triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                                  fittingTypes={fittingTypes}
                                  initialValue={{
                                    id: point.id,
                                    wallLabel: point.wallLabel ?? "",
                                    quantity: String(point.quantity),
                                    frameSize: point.frameSize,
                                    installHeightMm: point.installHeightMm
                                      ? String(point.installHeightMm)
                                      : "",
                                    note: point.note ?? "",
                                    status: point.status as
                                      | "DRAFT"
                                      | "ACTIVE"
                                      | "ARCHIVED",
                                    mechanisms: [
                                      point.fittingTypeId1,
                                      point.fittingTypeId2,
                                      point.fittingTypeId3,
                                      point.fittingTypeId4,
                                      point.fittingTypeId5,
                                      point.fittingTypeId6,
                                    ],
                                  }}
                                  canArchive
                                />
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
