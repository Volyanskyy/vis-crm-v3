"use client";

import { ReactNode, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  createWorkPriceItemAction,
  updateWorkPriceItemAction,
} from "./actions";

type WorkPriceItemFormValue = {
  id: string;
  workPriceListId: string;
  code: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  unit: string;
  basePrice: string;
  sortOrder: number;
  isInactive: boolean;
};

const emptyValue: WorkPriceItemFormValue = {
  id: "",
  workPriceListId: "",
  code: "",
  category: "",
  subcategory: "",
  name: "",
  description: "",
  unit: "",
  basePrice: "0.00",
  sortOrder: 0,
  isInactive: false,
};

type Props = {
  mode: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  triggerVariant?: "default" | "icon";
  initialValue?: Partial<WorkPriceItemFormValue>;
  children?: ReactNode;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

export function WorkPriceItemFormModal({
  mode,
  triggerLabel,
  triggerClassName,
  triggerVariant = "default",
  initialValue,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: WorkPriceItemFormValue = {
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
          await createWorkPriceItemAction(formData);
        } else {
          await updateWorkPriceItemAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти позицію.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {mode === "create" ? "Нова позиція" : "Редагування позиції"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              {mode === "create"
                ? "Додати позицію в прайс"
                : "Оновити позицію прайсу"}
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
          <input
            type="hidden"
            name="workPriceListId"
            defaultValue={value.workPriceListId}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Категорія</span>
              <input
                name="category"
                defaultValue={value.category}
                className={inputClassName}
                placeholder="Наприклад: Монтажні роботи"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Підкатегорія</span>
              <input
                name="subcategory"
                defaultValue={value.subcategory}
                className={inputClassName}
                placeholder="Наприклад: Розетки"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClassName}>Назва *</span>
              <input
                name="name"
                defaultValue={value.name}
                required
                className={inputClassName}
                placeholder="Назва роботи"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClassName}>Опис</span>
              <textarea
                name="description"
                defaultValue={value.description}
                className={textareaClassName}
                placeholder="Короткий опис або уточнення по позиції"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Одиниця</span>
              <input
                name="unit"
                defaultValue={value.unit}
                className={inputClassName}
                placeholder="шт / м / точка"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Ціна *</span>
              <input
                name="basePrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={value.basePrice}
                required
                className={inputClassName}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Порядок</span>
              <input
                name="sortOrder"
                type="number"
                min="0"
                step="1"
                defaultValue={value.sortOrder}
                className={inputClassName}
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:col-span-2">
              <input
                type="checkbox"
                name="isInactive"
                defaultChecked={value.isInactive}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
              />
              <span className="text-sm font-medium text-neutral-800">
                Неактивна позиція
              </span>
            </label>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
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
              className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Збереження..."
                : mode === "create"
                  ? "Додати позицію"
                  : "Зберегти зміни"}
            </button>
          </div>
        </form>
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
          (triggerVariant === "icon"
            ? "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm transition hover:border-neutral-300 hover:bg-neutral-50"
            : "inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800")
        }
        aria-label={triggerVariant === "icon" ? triggerLabel : undefined}
        title={triggerVariant === "icon" ? triggerLabel : undefined}
      >
        {triggerVariant === "icon" ? (
          children ?? (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                d="M13.958 2.916a1.768 1.768 0 0 1 2.5 2.5l-8.125 8.126-3.125.625.625-3.126 8.125-8.125Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.292 4.583 15.417 7.708"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
        ) : (
          triggerLabel
        )}
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
