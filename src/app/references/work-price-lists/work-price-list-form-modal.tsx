"use client";

import { ReactNode, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  createWorkPriceListAction,
  updateWorkPriceListAction,
} from "./actions";

type ScopeOption = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

type WorkPriceListFormValue = {
  id: string;
  scopeId: string;
  code: string;
  name: string;
  category: string;
  description: string;
  version: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  validFrom: string;
  validTo: string;
  isCurrent: boolean;
  isArchived: boolean;
  currencyCode?: string;
  isDefault?: boolean;
};

const emptyValue: WorkPriceListFormValue = {
  id: "",
  scopeId: "",
  code: "",
  name: "",
  category: "",
  description: "",
  version: 1,
  status: "DRAFT",
  validFrom: "",
  validTo: "",
  isCurrent: false,
  isArchived: false,
  currencyCode: "UAH",
  isDefault: false,
};

type Props = {
  mode?: "create" | "edit";
  triggerLabel?: string;
  triggerClassName?: string;
  initialValue?: Partial<WorkPriceListFormValue>;
  scopeOptions: ScopeOption[];
  children?: ReactNode;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500";

const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

const checkboxLabelClassName =
  "flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800";

const defaultCreateTriggerClassName =
  "inline-flex h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800";

const defaultEditTriggerClassName =
  "inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50";

export function WorkPriceListFormModal({
  mode = "create",
  triggerLabel,
  triggerClassName,
  initialValue,
  scopeOptions,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: WorkPriceListFormValue = useMemo(
    () => ({
      ...emptyValue,
      ...initialValue,
    }),
    [initialValue],
  );

  const isReadOnlyMeta = mode === "edit" && value.status !== "DRAFT";

  function openModal() {
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    setError(null);
    setOpen(false);
  }

  function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createWorkPriceListAction(formData);
        } else {
          await updateWorkPriceListAction(formData);
        }

        closeModal();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти прайс.",
        );
      }
    });
  }

  const resolvedTriggerLabel =
    triggerLabel ??
    (mode === "create" ? "Новий прайс" : "Редагувати метадані");

  const resolvedTriggerClassName =
    triggerClassName ??
    (mode === "create"
      ? defaultCreateTriggerClassName
      : defaultEditTriggerClassName);

  const modal = open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {mode === "create" ? "Новий прайс" : "Редагування прайса"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              {mode === "create"
                ? "Створити прайс робіт"
                : "Оновити прайс робіт"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-base text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
            aria-label="Закрити модалку"
          >
            ✕
          </button>
        </div>

        <form action={onSubmit} className="px-6 py-4">
          <input type="hidden" name="id" defaultValue={value.id} />
          <input type="hidden" name="status" value={value.status || "DRAFT"} />
          <input
            type="hidden"
            name="isArchived"
            value={value.isArchived ? "on" : ""}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClassName}>Scope прайса</span>
              <select
                name="scopeId"
                defaultValue={value.scopeId}
                className={selectClassName}
                disabled={isReadOnlyMeta}
                required
              >
                <option value="">Оберіть scope</option>
                {scopeOptions.map((scope) => (
                  <option
                    key={scope.id}
                    value={scope.id}
                    disabled={!scope.isActive && scope.id !== value.scopeId}
                  >
                    {scope.name} ({scope.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Назва прайса</span>
              <input
                name="name"
                type="text"
                required
                defaultValue={value.name}
                className={inputClassName}
                placeholder="Наприклад: Загальний електромонтаж v2"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Код</span>
              <input
                name="code"
                type="text"
                defaultValue={value.code}
                className={inputClassName}
                placeholder="general-v2"
                disabled={isReadOnlyMeta}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Версія</span>
              <input
                name="version"
                type="number"
                min={1}
                step={1}
                defaultValue={value.version}
                className={inputClassName}
                disabled={isReadOnlyMeta}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Валюта</span>
              <input
                name="currencyCode"
                type="text"
                defaultValue={value.currencyCode ?? "UAH"}
                className={inputClassName}
                placeholder="UAH"
                disabled={isReadOnlyMeta}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Період від</span>
              <input
                name="validFrom"
                type="date"
                defaultValue={value.validFrom}
                className={inputClassName}
                disabled={isReadOnlyMeta}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClassName}>Період до</span>
              <input
                name="validTo"
                type="date"
                defaultValue={value.validTo}
                className={inputClassName}
                disabled={isReadOnlyMeta}
              />
            </label>
          </div>

          <label className="mt-3 flex flex-col gap-1.5">
            <span className={labelClassName}>Опис</span>
            <textarea
              name="description"
              defaultValue={value.description}
              className={textareaClassName}
              placeholder="Короткий опис призначення прайса"
              disabled={isReadOnlyMeta}
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                name="isCurrent"
                defaultChecked={value.isCurrent}
                disabled={isReadOnlyMeta}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <span>Зробити поточним у межах цього scope</span>
            </label>

            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={value.isDefault}
                disabled={isReadOnlyMeta}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <span>За замовчуванням</span>
            </label>
          </div>

          {isReadOnlyMeta ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Для активних та архівних прайсів редагування метаданих заблоковане.
              Доступне лише редагування чернеток.
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              disabled={isPending}
            >
              Скасувати
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
              disabled={isPending}
            >
              {isPending
                ? "Збереження..."
                : mode === "create"
                  ? "Створити прайс"
                  : "Зберегти зміни"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {children ? (
        <button type="button" onClick={openModal} className={triggerClassName}>
          {children}
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className={resolvedTriggerClassName}
        >
          {resolvedTriggerLabel}
        </button>
      )}

      {typeof document !== "undefined"
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
