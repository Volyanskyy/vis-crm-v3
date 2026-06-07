"use client";

import { useState, useTransition } from "react";
import {
  createWorkPriceListScopeAction,
  updateWorkPriceListScopeAction,
} from "./actions";

type ScopeInitialValue = {
  id: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  mode?: "create" | "edit";
  triggerLabel?: string;
  triggerClassName?: string;
  initialValue?: ScopeInitialValue;
};

const defaultTriggerClassName =
  "inline-flex h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800";

export function WorkPriceListScopeFormModal({
  mode = "create",
  triggerLabel,
  triggerClassName = defaultTriggerClassName,
  initialValue,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resolvedLabel =
    triggerLabel ?? (mode === "edit" ? "Редагувати" : "Новий scope");

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
      >
        {resolvedLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                  {mode === "edit" ? "Редагування scope" : "Новий scope"}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Scope використовується для групування прайсів і визначення поточного прайса в межах категорії.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              action={(formData) => {
                startTransition(async () => {
                  try {
                    setError(null);
                    if (mode === "edit" && initialValue?.id) {
                      formData.set("id", initialValue.id);
                      await updateWorkPriceListScopeAction(formData);
                    } else {
                      await createWorkPriceListScopeAction(formData);
                    }
                    setIsOpen(false);
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Не вдалося зберегти scope.",
                    );
                  }
                });
              }}
            >
              {mode === "edit" && initialValue?.id ? (
                <input type="hidden" name="id" value={initialValue.id} />
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Код</span>
                  <input
                    name="code"
                    defaultValue={initialValue?.code ?? ""}
                    disabled={mode === "edit"}
                    className="h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-500"
                    placeholder="electrical"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Порядок</span>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={initialValue?.sortOrder ?? 0}
                    className="h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
                  />
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">Назва</span>
                <input
                  name="name"
                  defaultValue={initialValue?.name ?? ""}
                  className="h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
                  placeholder="Електромонтажні роботи"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">Опис</span>
                <textarea
                  name="description"
                  defaultValue={initialValue?.description ?? ""}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
                  placeholder="Короткий опис сфери використання цього scope."
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="inline-flex h-11 items-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  Скасувати
                </button>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPending}
                >
                  {isPending ? "Збереження..." : "Зберегти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
