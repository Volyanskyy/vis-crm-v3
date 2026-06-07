"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  archiveFittingPointAction,
  createFittingPointAction,
  updateFittingPointAction,
} from "./fitting-point-actions";

type FittingTypeOption = {
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

type FittingPointValue = {
  id: string;
  wallLabel: string;
  quantity: string;
  frameSize: number;
  installHeightMm: string;
  note: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  mechanisms: (string | null)[];
};

type Props = {
  mode: "create" | "edit";
  projectRoomId: string;
  triggerLabel: string;
  triggerClassName?: string;
  fittingTypes: FittingTypeOption[];
  initialValue?: Partial<FittingPointValue>;
  canArchive?: boolean;
};

const emptyValue: FittingPointValue = {
  id: "",
  wallLabel: "",
  quantity: "1",
  frameSize: 1,
  installHeightMm: "",
  note: "",
  status: "DRAFT",
  mechanisms: [null, null, null, null, null, null],
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-900";

export function FittingPointModal({
  mode,
  projectRoomId,
  triggerLabel,
  triggerClassName,
  fittingTypes,
  initialValue,
  canArchive = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: FittingPointValue = {
    ...emptyValue,
    ...initialValue,
    mechanisms: initialValue?.mechanisms ?? emptyValue.mechanisms,
  };

  const [frameSize, setFrameSize] = useState<number>(value.frameSize);
  const [mechanisms, setMechanisms] = useState<(string | null)[]>(
    value.mechanisms,
  );

  const groupedTypes = useMemo(() => {
    return fittingTypes.reduce<Record<string, FittingTypeOption[]>>(
      (acc, item) => {
        const category = item.category?.trim() || "Інше";

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(item);
        return acc;
      },
      {},
    );
  }, [fittingTypes]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    setFrameSize(value.frameSize);
    setMechanisms(value.mechanisms);
  }, [open, value.frameSize, value.mechanisms]);

  function setMechanism(index: number, nextValue: string) {
    const next = [...mechanisms];
    next[index] = nextValue || null;
    setMechanisms(next);
  }

  function handleFrameSizeChange(nextSize: number) {
    setFrameSize(nextSize);
    setMechanisms((current) => {
      const next = [...current];

      for (let i = nextSize; i < 6; i += 1) {
        next[i] = null;
      }

      return next;
    });
  }

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("frameSize", String(frameSize));

    for (let i = 0; i < frameSize; i += 1) {
      if (mechanisms[i]) {
        formData.set(`mechanism_${i + 1}`, mechanisms[i] as string);
      }
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createFittingPointAction(formData);
        } else {
          await updateFittingPointAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося зберегти точку фурнітури.",
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
        await archiveFittingPointAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося архівувати точку фурнітури.",
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
                  ? "Нова точка фурнітури"
                  : "Редагування точки фурнітури"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create"
                  ? "Додати точку фурнітури"
                  : "Оновити точку фурнітури"}
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

          <form action={onSubmit} className="flex flex-col gap-5 px-6 py-5">
            <input type="hidden" name="id" defaultValue={value.id} />
            <input type="hidden" name="projectRoomId" value={projectRoomId} />

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Опис точки *</span>
              <input
                name="wallLabel"
                defaultValue={value.wallLabel}
                required
                className={inputClassName}
                placeholder="Наприклад: Біля ліжка, ТВ зона, Біля дверей"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Кількість однакових комплектів</span>
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
                <span className={labelClassName}>Висота монтажу, мм</span>
                <input
                  name="installHeightMm"
                  type="number"
                  min={0}
                  defaultValue={value.installHeightMm}
                  className={inputClassName}
                  placeholder="300"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className={labelClassName}>Конфігурація рамки</span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleFrameSizeChange(size)}
                    className={`inline-flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                      frameSize === size
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500">
                Оберіть, скільки механізмів містить ця рамка.
              </p>
            </div>

            <div className="grid gap-3">
              {Array.from({ length: frameSize }).map((_, index) => (
                <label
                  key={index}
                  className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                >
                  <span className="text-sm font-semibold text-neutral-800">
                    Позиція {index + 1}
                  </span>
                  <select
                    value={mechanisms[index] ?? ""}
                    onChange={(event) =>
                      setMechanism(index, event.target.value)
                    }
                    className={selectClassName}
                  >
                    <option value="">Оберіть механізм</option>
                    {Object.entries(groupedTypes).map(([category, items]) => (
                      <optgroup key={category} label={category}>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                            {item.brand?.name ? ` — ${item.brand.name}` : ""}
                            {item.code ? ` (${item.code})` : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Статус</span>
                <select
                  name="status"
                  defaultValue={value.status}
                  className={selectClassName}
                >
                  <option value="DRAFT">Чернетка</option>
                  <option value="ACTIVE">Активна</option>
                  <option value="ARCHIVED">Архів</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Примітка</span>
                <textarea
                  name="note"
                  defaultValue={value.note}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Коментар щодо монтажу, розміщення або специфіки"
                />
              </label>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-2.5 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {mode === "edit" && canArchive ? (
                  <button
                    type="button"
                    onClick={onArchive}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Архівувати
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
          "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        }
      >
        {triggerLabel}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
