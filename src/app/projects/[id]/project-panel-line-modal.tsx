"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  createProjectPanelLineAction,
  deleteProjectPanelLineAction,
  updateProjectPanelLineAction,
} from "./project-panel-line-actions";

type CableMaterialOption = {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
};

type ProjectRoomOption = {
  id: string;
  name: string;
};

type ProjectPanelLineValue = {
  id: string;
  lineCode: string;
  roomName: string;
  destination: string;
  cableType: string;
  cableSection: string;
  phases: string;
  breaker: string;
  rcd: string;
  note: string;
  sortOrder: string;
};

type Props = {
  mode: "create" | "edit";
  projectId: string;
  triggerLabel: string;
  triggerClassName?: string;
  cableMaterials: CableMaterialOption[];
  projectRooms: ProjectRoomOption[];
  initialValue?: Partial<ProjectPanelLineValue>;
  canDelete?: boolean;
};

const emptyValue: ProjectPanelLineValue = {
  id: "",
  lineCode: "",
  roomName: "",
  destination: "",
  cableType: "",
  cableSection: "",
  phases: "",
  breaker: "",
  rcd: "",
  note: "",
  sortOrder: "0",
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-900";

// Парсимо збережений рядок кімнат ("Кухня, Спальня") у масив
function parseRoomNames(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Формуємо рядок для збереження з масиву
function joinRoomNames(names: string[]): string {
  return names.join(", ");
}

export function ProjectPanelLineModal({
  mode,
  projectId,
  triggerLabel,
  triggerClassName,
  cableMaterials,
  projectRooms,
  initialValue,
  canDelete = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState(
    initialValue?.sortOrder ?? emptyValue.sortOrder,
  );
  const [cableType, setCableType] = useState(
    initialValue?.cableType ?? emptyValue.cableType,
  );
  const [cableSection, setCableSection] = useState(
    initialValue?.cableSection ?? emptyValue.cableSection,
  );
  // Мультивибір кімнат — Set із назв
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(
    () => new Set(parseRoomNames(initialValue?.roomName ?? "")),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    const next = { ...emptyValue, ...initialValue };
    setSortOrder(next.sortOrder);
    setCableType(next.cableType);
    setCableSection(next.cableSection);
    setSelectedRooms(new Set(parseRoomNames(next.roomName)));
  }, [open, initialValue]);

  function handleCableChange(selectedName: string) {
    setCableType(selectedName);

    if (!selectedName) {
      return;
    }

    const found = cableMaterials.find((m) => m.name === selectedName);
    if (found) {
      // description має пріоритет (наприклад "3×2.5"), інакше unit
      const section = found.description?.trim() || found.unit?.trim() || "";
      setCableSection(section);
    }
  }

  function toggleRoom(roomName: string) {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomName)) {
        next.delete(roomName);
      } else {
        next.add(roomName);
      }
      return next;
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    // Підставляємо roomName як joined рядок
    formData.set("roomName", joinRoomNames(Array.from(selectedRooms)));

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProjectPanelLineAction(formData);
        } else {
          await updateProjectPanelLineAction(formData);
        }
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося зберегти лінію щита.",
        );
      }
    });
  }

  function onDelete() {
    const formData = new FormData();
    formData.set("id", initialValue?.id ?? "");
    formData.set("projectId", projectId);
    setError(null);

    startTransition(async () => {
      try {
        await deleteProjectPanelLineAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося видалити лінію щита.",
        );
      }
    });
  }

  const value: ProjectPanelLineValue = { ...emptyValue, ...initialValue };

  const selectedRoomsArray = Array.from(selectedRooms);

  const modal = open ? (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4">
      <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {mode === "create" ? "Нова лінія щита" : "Редагування лінії щита"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create" ? "Додати лінію щита" : "Оновити лінію щита"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-base text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
              aria-label="Закрити модалку"
            >
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit} className="px-6 py-5">
            <input type="hidden" name="id" value={value.id} />
            <input type="hidden" name="projectId" value={projectId} />

            {/* Блок 1: Ідентифікація */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Код лінії</span>
                <input
                  name="lineCode"
                  defaultValue={value.lineCode}
                  className={inputClassName}
                  placeholder="QF1, L-01, GR-02..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Порядок</span>
                <input
                  name="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>

            {/* Блок 2: Кімнати */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Куди іде лінія
              </p>

              {projectRooms.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-700">
                  У проєкті ще немає кімнат. Спочатку додайте кімнати в розділі
                  «Кімнати і точки».
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {projectRooms.map((room) => {
                      const active = selectedRooms.has(room.name);
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => toggleRoom(room.name)}
                          className={[
                            "inline-flex items-center rounded-xl border px-3.5 py-2 text-sm font-medium transition",
                            active
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50",
                          ].join(" ")}
                        >
                          {room.name}
                        </button>
                      );
                    })}
                  </div>

                  {selectedRoomsArray.length > 0 ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Вибрано:{" "}
                      <span className="font-medium text-neutral-800">
                        {selectedRoomsArray.join(", ")}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-400">
                      Кімнати не вибрано — лінія без прив'язки до кімнати
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Блок 3: Призначення */}
            <div className="mt-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Призначення лінії</span>
                <input
                  name="destination"
                  defaultValue={value.destination}
                  className={inputClassName}
                  placeholder="Світло, розетки, кондиціонер, бойлер 3кВт..."
                />
              </label>
            </div>

            {/* Розділювач */}
            <div className="my-5 border-t border-neutral-100" />

            {/* Блок 4: Кабель */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Кабель
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Марка кабелю</span>
                {cableMaterials.length > 0 ? (
                  <>
                    <select
                      name="cableType"
                      value={cableType}
                      onChange={(e) => handleCableChange(e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Не вибрано</option>
                      {cableMaterials.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-neutral-400">
                      З матеріалів проєкту (категорія «Кабель/провід»)
                    </span>
                  </>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-700">
                    Немає матеріалів категорії «Кабель/провід». Додайте їх у
                    розділі «Матеріали проєкту».
                  </div>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>
                  Переріз
                  {cableType && cableMaterials.length > 0 ? (
                    <span className="ml-1.5 text-xs font-normal text-neutral-400">
                      (автозаповнено з опису — можна змінити)
                    </span>
                  ) : null}
                </span>
                <input
                  name="cableSection"
                  value={cableSection}
                  onChange={(e) => setCableSection(e.target.value)}
                  className={inputClassName}
                  placeholder="3×1.5, 3×2.5, 5×6..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Фази</span>
                <input
                  name="phases"
                  defaultValue={value.phases}
                  className={inputClassName}
                  placeholder="1P, 3P, L1..."
                />
              </label>
            </div>

            {/* Розділювач */}
            <div className="my-5 border-t border-neutral-100" />

            {/* Блок 5: Автоматика */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Автоматика
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Автомат</span>
                <input
                  name="breaker"
                  defaultValue={value.breaker}
                  className={inputClassName}
                  placeholder="B16, C10, C25..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>RCD / RCBO</span>
                <input
                  name="rcd"
                  defaultValue={value.rcd}
                  className={inputClassName}
                  placeholder="40A 30mA, RCBO C16 30mA..."
                />
              </label>
            </div>

            {/* Розділювач */}
            <div className="my-5 border-t border-neutral-100" />

            {/* Блок 6: Нотатки */}
            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Нотатки</span>
              <textarea
                name="note"
                defaultValue={value.note}
                rows={3}
                className={textareaClassName}
                placeholder="Коментар по лінії, резерву, групі чи автоматиці"
              />
            </label>

            {/* Помилка */}
            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {/* Footer */}
            <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {mode === "edit" && canDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Видалити лінію
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                >
                  Скасувати
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "Збереження..."
                    : mode === "create"
                      ? "Додати лінію"
                      : "Зберегти зміни"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        }
      >
        {triggerLabel}
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
