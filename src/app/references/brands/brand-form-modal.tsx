"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createBrandAction, updateBrandAction } from "./actions";

type BrandFormValue = {
  id: string;
  name: string;
  category: string;
  country: string;
  website: string;
  notes: string;
};

const emptyValue: BrandFormValue = {
  id: "",
  name: "",
  category: "",
  country: "",
  website: "",
  notes: "",
};

type Props = {
  mode: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  initialValue?: Partial<BrandFormValue>;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

export function BrandFormModal({
  mode,
  triggerLabel,
  triggerClassName,
  initialValue,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: BrandFormValue = {
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
          await createBrandAction(formData);
        } else {
          await updateBrandAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти бренд.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {mode === "create" ? "Новий бренд" : "Редагування бренду"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              {mode === "create" ? "Створити бренд" : "Оновити бренд"}
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

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClassName}>Назва *</span>
              <input
                name="name"
                defaultValue={value.name}
                required
                className={inputClassName}
                placeholder="Schneider Electric"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Категорія</span>
              <input
                name="category"
                defaultValue={value.category}
                className={inputClassName}
                placeholder="Електрофурнітура / автоматика / світло"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Країна</span>
              <input
                name="country"
                defaultValue={value.country}
                className={inputClassName}
                placeholder="France"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClassName}>Вебсайт</span>
              <input
                name="website"
                defaultValue={value.website}
                className={inputClassName}
                placeholder="https://example.com"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClassName}>Нотатки</span>
              <textarea
                name="notes"
                defaultValue={value.notes}
                rows={4}
                className={textareaClassName}
                placeholder="Додаткові примітки про бренд, позиціонування або використання"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-2.5 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
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
                  ? "Створити бренд"
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
          "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        }
      >
        {triggerLabel}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
