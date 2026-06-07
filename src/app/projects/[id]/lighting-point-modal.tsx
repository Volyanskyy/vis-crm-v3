"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  archiveLightingPointAction,
  createLightingPointAction,
  updateLightingPointAction,
} from "./lighting-point-actions";

type LightingSystemTypeOption = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  brandId: string | null;
  brand: {
    id: string;
    name: string;
  } | null;
};

type LightingPointValue = {
  id: string;
  lightingSystemTypeId: string;
  pointCode: string;
  zoneLabel: string;
  quantity: string;
  switchGroup: string;
  dimmable: boolean;
  note: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
};

type Props = {
  mode: "create" | "edit";
  projectRoomId: string;
  triggerLabel: string;
  triggerClassName?: string;
  lightingSystemTypes: LightingSystemTypeOption[];
  initialValue?: Partial<LightingPointValue>;
  canArchive?: boolean;
};

const emptyValue: LightingPointValue = {
  id: "",
  lightingSystemTypeId: "",
  pointCode: "",
  zoneLabel: "",
  quantity: "1",
  switchGroup: "",
  dimmable: false,
  note: "",
  status: "DRAFT",
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-900";

export function LightingPointModal({
  mode,
  projectRoomId,
  triggerLabel,
  triggerClassName,
  lightingSystemTypes,
  initialValue,
  canArchive = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: LightingPointValue = {
    ...emptyValue,
    ...initialValue,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createLightingPointAction(formData);
        } else {
          await updateLightingPointAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося зберегти точку освітлення.",
        );
      }
    });
  }

  function onArchive() {
    const formData = new FormData();
    formData.set("id", value.id);
    formData.set("projectRoomId", projectRoomId);

    setError(null);

    startTransition(async () => {
      try {
        await archiveLightingPointAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося архівувати точку освітлення.",
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
                {mode === "create"
                  ? "Нова точка освітлення"
                  : "Редагування точки освітлення"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create"
                  ? "Додати точку освітлення"
                  : "Оновити точку освітлення"}
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

          <form action={onSubmit} className="px-6 py-4">
            <input type="hidden" name="id" defaultValue={value.id} />
            <input type="hidden" name="projectRoomId" value={projectRoomId} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Тип освітлення</span>
                <select
                  name="lightingSystemTypeId"
                  defaultValue={value.lightingSystemTypeId}
                  className={selectClassName}
                >
                  <option value="">Без типу</option>
                  {lightingSystemTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.brand?.name ? ` · ${item.brand.name}` : ""}
                      {item.code ? ` · ${item.code}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Код точки</span>
                <input
                  name="pointCode"
                  defaultValue={value.pointCode}
                  className={inputClassName}
                  placeholder="L-01, SPOT-2, CH-01..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Зона / привʼязка</span>
                <input
                  name="zoneLabel"
                  defaultValue={value.zoneLabel}
                  className={inputClassName}
                  placeholder="Над столом, центр кімнати, біля ліжка..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Кількість</span>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={value.quantity}
                  className={inputClassName}
                  placeholder="1"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Група вимикача</span>
                <input
                  name="switchGroup"
                  defaultValue={value.switchGroup}
                  className={inputClassName}
                  placeholder="SW1, прохідний 1, димер..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Статус</span>
                <select
                  name="status"
                  defaultValue={value.status}
                  className={selectClassName}
                >
                  <option value="DRAFT">Чернетка</option>
                  <option value="ACTIVE">Активна</option>
                  <option value="ARCHIVED">В архіві</option>
                </select>
              </label>

              <label className="mt-7 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="dimmable"
                  defaultChecked={value.dimmable}
                  className="h-4 w-4 rounded border-neutral-400 accent-neutral-900"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Підтримує димування
                </span>
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Нотатки</span>
                <textarea
                  name="note"
                  defaultValue={value.note}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Коментар по світильнику, сценарію чи зоні"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {mode === "edit" && canArchive ? (
                  <button
                    type="button"
                    onClick={onArchive}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Архівувати точку
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
                      ? "Додати точку"
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

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
