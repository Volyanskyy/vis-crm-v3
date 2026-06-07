"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createClientAction, updateClientAction } from "./actions";

type ClientFormValue = {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  notes: string;
  isArchived: boolean;
};

const emptyValue: ClientFormValue = {
  id: "",
  name: "",
  companyName: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  notes: "",
  isArchived: false,
};

type Props = {
  mode: "create" | "edit";
  initialValue?: Partial<ClientFormValue>;
  triggerLabel: string;
  triggerClassName?: string;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

export function ClientFormModal({
  mode,
  initialValue,
  triggerLabel,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: ClientFormValue = {
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
          await createClientAction(formData);
        } else {
          await updateClientAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти клієнта.",
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
              {mode === "create" ? "Новий клієнт" : "Редагування клієнта"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              {mode === "create" ? "Додати клієнта" : "Оновити дані клієнта"}
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
              <span className="text-sm font-medium text-neutral-800">
                Імʼя / назва *
              </span>
              <input
                name="name"
                defaultValue={value.name}
                required
                className={inputClassName}
                placeholder="Наприклад: Довгань Володимир"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-neutral-800">
                Компанія
              </span>
              <input
                name="companyName"
                defaultValue={value.companyName}
                className={inputClassName}
                placeholder="ТОВ Приклад"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-800">
                Телефон
              </span>
              <input
                name="phone"
                defaultValue={value.phone}
                className={inputClassName}
                placeholder="+380..."
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-800">
                Email
              </span>
              <input
                name="email"
                type="email"
                defaultValue={value.email}
                className={inputClassName}
                placeholder="client@example.com"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-800">
                ІПН / ЄДРПОУ
              </span>
              <input
                name="taxNumber"
                defaultValue={value.taxNumber}
                className={inputClassName}
                placeholder="1234567890"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-800">
                Адреса
              </span>
              <input
                name="address"
                defaultValue={value.address}
                className={inputClassName}
                placeholder="м. Тернопіль..."
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-neutral-800">
                Нотатки
              </span>
              <textarea
                name="notes"
                defaultValue={value.notes}
                rows={3}
                className={textareaClassName}
                placeholder="Короткий коментар по клієнту"
              />
            </label>

            <label className="mt-1 inline-flex items-center gap-2.5 sm:col-span-2">
              <input
                name="isArchived"
                type="checkbox"
                defaultChecked={value.isArchived}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
              />
              <span className="text-sm text-neutral-700">
                Позначити як архівного
              </span>
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
                  ? "Створити клієнта"
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
