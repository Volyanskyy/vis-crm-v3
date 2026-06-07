"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  createProjectRoomAction,
  updateProjectRoomAction,
  deleteProjectRoomAction,
} from "./room-actions";

type RoomTypeOption = {
  id: string;
  name: string;
  code: string | null;
};

type ProjectRoomValue = {
  id: string;
  roomTypeId: string;
  name: string;
  floor: string;
  sortOrder: string;
  notes: string;
};

type Props = {
  mode: "create" | "edit";
  projectId: string;
  triggerLabel: string;
  triggerClassName?: string;
  roomTypes: RoomTypeOption[];
  initialValue?: Partial<ProjectRoomValue>;
  canDelete?: boolean;
};

const emptyValue: ProjectRoomValue = {
  id: "",
  roomTypeId: "",
  name: "",
  floor: "",
  sortOrder: "0",
  notes: "",
};

const inputClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

export function ProjectRoomModal({
  mode,
  projectId,
  triggerLabel,
  triggerClassName,
  roomTypes,
  initialValue,
  canDelete = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: ProjectRoomValue = {
    ...emptyValue,
    ...initialValue,
  };

  const [roomTypeId, setRoomTypeId] = useState(value.roomTypeId);
  const [name, setName] = useState(value.name);
  const [floor, setFloor] = useState(value.floor);
  const [sortOrder, setSortOrder] = useState(value.sortOrder);
  const [notes, setNotes] = useState(value.notes);
  const [nameTouched, setNameTouched] = useState(Boolean(value.name));

  const selectedRoomType = useMemo(
    () => roomTypes.find((item) => item.id === roomTypeId) ?? null,
    [roomTypeId, roomTypes],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    const nextValue: ProjectRoomValue = {
      ...emptyValue,
      ...initialValue,
    };

    setRoomTypeId(nextValue.roomTypeId);
    setName(nextValue.name);
    setFloor(nextValue.floor);
    setSortOrder(nextValue.sortOrder);
    setNotes(nextValue.notes);
    setNameTouched(Boolean(nextValue.name));
  }, [open, initialValue]);

  useEffect(() => {
    if (!open || mode !== "create") {
      return;
    }

    if (!selectedRoomType) {
      if (!nameTouched) {
        setName("");
      }
      return;
    }

    if (!nameTouched) {
      setName(selectedRoomType.name);
    }
  }, [open, mode, selectedRoomType, nameTouched]);

  function submitFormData(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProjectRoomAction(formData);
        } else {
          await updateProjectRoomAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти кімнату.",
        );
      }
    });
  }

  function onDelete() {
    const formData = new FormData();
    formData.set("id", value.id);
    formData.set("projectId", projectId);

    setError(null);

    startTransition(async () => {
      try {
        await deleteProjectRoomAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося видалити кімнату.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4">
      <div className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {mode === "create" ? "Нова кімната" : "Редагування кімнати"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create" ? "Додати кімнату" : "Оновити кімнату"}
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

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              submitFormData(formData);
            }}
            className="px-6 py-4"
          >
            <input type="hidden" name="id" value={value.id} />
            <input type="hidden" name="projectId" value={projectId} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Тип приміщення</span>
                <select
                  name="roomTypeId"
                  value={roomTypeId}
                  onChange={(event) => {
                    setRoomTypeId(event.target.value);
                  }}
                  className={selectClassName}
                >
                  <option value="">Без типу</option>
                  {roomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name}
                      {roomType.code ? ` — ${roomType.code}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Назва кімнати *</span>
                <input
                  name="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameTouched(true);
                  }}
                  required
                  className={inputClassName}
                  placeholder="Назва кімнати"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Поверх</span>
                <input
                  name="floor"
                  value={floor}
                  onChange={(event) => setFloor(event.target.value)}
                  className={inputClassName}
                  placeholder="1, 2, цоколь, мансарда..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Порядок сортування</span>
                <input
                  name="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className={inputClassName}
                  placeholder="0"
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Нотатки</span>
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Коментар по кімнаті, особливості монтажу, уточнення..."
                />
              </label>
            </div>

            <div className="mt-5 border-t border-neutral-200 pt-4">
              {error ? (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {mode === "edit" && canDelete ? (
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={isPending}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Видалити кімнату
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
                    className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending
                      ? "Збереження…"
                      : mode === "create"
                        ? "Додати кімнату"
                        : "Зберегти зміни"}
                  </button>
                </div>
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
          "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
        }
      >
        {triggerLabel}
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
