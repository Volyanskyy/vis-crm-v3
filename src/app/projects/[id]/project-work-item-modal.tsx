"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  archiveProjectWorkItemAction,
  createProjectWorkItemAction,
  updateProjectWorkItemAction,
} from "./project-work-item-actions";

type WorkPriceItemOption = {
  id: string;
  code: string | null;
  category: string | null;
  subcategory: string | null;
  name: string;
  description: string | null;
  unit: string | null;
  basePrice: string;
  sortOrder: number;
};

type WorkPriceListOption = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  items: WorkPriceItemOption[];
};

type EditValue = {
  id: string;
  sortOrder: string;
  code: string;
  category: string;
  subcategory: string;
  name: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  note: string;
};

type Props = {
  mode: "create" | "edit";
  projectId: string;
  triggerLabel: string;
  triggerClassName?: string;
  workPriceLists?: WorkPriceListOption[];
  initialValue?: Partial<EditValue>;
  canArchive?: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName = "text-sm font-semibold tracking-tight text-neutral-900";

export function ProjectWorkItemModal({
  mode,
  projectId,
  triggerLabel,
  triggerClassName,
  workPriceLists = [],
  initialValue,
  canArchive = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialListId = workPriceLists[0]?.id ?? "";
  const [selectedListId, setSelectedListId] = useState(initialListId);
  const [selectedItemId, setSelectedItemId] = useState("");

  const selectedList = useMemo(
    () => workPriceLists.find((list) => list.id === selectedListId) ?? null,
    [selectedListId, workPriceLists],
  );

  const selectedItem = useMemo(
    () =>
      selectedList?.items.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId, selectedList],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    if (mode === "create") {
      const firstList = workPriceLists[0];
      setSelectedListId(firstList?.id ?? "");
      setSelectedItemId(firstList?.items[0]?.id ?? "");
    }
  }, [open, mode, workPriceLists]);

  function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProjectWorkItemAction(formData);
        } else {
          await updateProjectWorkItemAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося зберегти позицію роботи.",
        );
      }
    });
  }

  function onArchive() {
    const formData = new FormData();
    formData.set("id", initialValue?.id ?? "");
    formData.set("projectId", projectId);

    setError(null);

    startTransition(async () => {
      try {
        await archiveProjectWorkItemAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося змінити статус роботи.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 bg-black/45 p-4">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center">
        <div className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {mode === "create" ? "Нова робота" : "Редагування роботи"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create" ? "Додати роботу" : "Оновити роботу"}
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

          <form action={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <input
              type="hidden"
              name="id"
              defaultValue={initialValue?.id ?? ""}
            />
            <input type="hidden" name="projectId" value={projectId} />

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {mode === "create" ? (
                <div className="grid gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClassName}>
                      Актуальний прайс робіт
                    </span>
                    <select
                      value={selectedListId}
                      onChange={(event) => {
                        const nextListId = event.target.value;
                        const nextList =
                          workPriceLists.find(
                            (list) => list.id === nextListId,
                          ) ?? null;

                        setSelectedListId(nextListId);
                        setSelectedItemId(nextList?.items[0]?.id ?? "");
                      }}
                      className={selectClassName}
                    >
                      {workPriceLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.category ? `${list.category} — ` : ""}
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClassName}>Позиція з прайсу</span>
                    <select
                      name="sourceWorkPriceItemId"
                      value={selectedItemId}
                      onChange={(event) =>
                        setSelectedItemId(event.target.value)
                      }
                      className={selectClassName}
                    >
                      {(selectedList?.items ?? []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {(item.code ? `${item.code} — ` : "") + item.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedItem ? (
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="text-sm font-semibold text-neutral-950">
                        {selectedItem.code ? `${selectedItem.code} — ` : ""}
                        {selectedItem.name}
                      </div>

                      <div className="mt-2 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                        <div>
                          Категорія:{" "}
                          <span className="font-medium text-neutral-900">
                            {selectedItem.category ??
                              selectedList?.category ??
                              "—"}
                          </span>
                        </div>
                        <div>
                          Підкатегорія:{" "}
                          <span className="font-medium text-neutral-900">
                            {selectedItem.subcategory ?? "—"}
                          </span>
                        </div>
                        <div>
                          Одиниця:{" "}
                          <span className="font-medium text-neutral-900">
                            {selectedItem.unit ?? "—"}
                          </span>
                        </div>
                        <div>
                          Базова ціна:{" "}
                          <span className="font-medium text-neutral-900">
                            {selectedItem.basePrice}
                          </span>
                        </div>
                      </div>

                      {selectedItem.description ? (
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          {selectedItem.description}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClassName}>Кількість</span>
                      <input
                        name="quantity"
                        type="number"
                        step="any"
                        defaultValue="1"
                        className={inputClassName}
                        placeholder="1"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className={labelClassName}>
                        Ціна (залишити 0 — буде базова)
                      </span>
                      <input
                        name="unitPrice"
                        type="number"
                        step="any"
                        defaultValue="0"
                        className={inputClassName}
                        placeholder="0"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClassName}>Нотатки</span>
                    <textarea
                      name="note"
                      rows={3}
                      className={textareaClassName}
                      placeholder="Коментар по виконанню, зоні робіт, уточненню обсягу"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="text-sm font-semibold text-neutral-950">
                      {initialValue?.code ? `${initialValue.code} — ` : ""}
                      {initialValue?.name ?? "—"}
                    </div>

                    <div className="mt-2 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                      <div>
                        Категорія:{" "}
                        <span className="font-medium text-neutral-900">
                          {initialValue?.category || "—"}
                        </span>
                      </div>
                      <div>
                        Підкатегорія:{" "}
                        <span className="font-medium text-neutral-900">
                          {initialValue?.subcategory || "—"}
                        </span>
                      </div>
                      <div>
                        Одиниця:{" "}
                        <span className="font-medium text-neutral-900">
                          {initialValue?.unit || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClassName}>Кількість</span>
                      <input
                        name="quantity"
                        type="number"
                        step="any"
                        defaultValue={initialValue?.quantity ?? "1"}
                        className={inputClassName}
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className={labelClassName}>Ціна</span>
                      <input
                        name="unitPrice"
                        type="number"
                        step="any"
                        defaultValue={initialValue?.unitPrice ?? "0"}
                        className={inputClassName}
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className={labelClassName}>
                        Порядок сортування
                      </span>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={initialValue?.sortOrder ?? "0"}
                        className={inputClassName}
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClassName}>Нотатки</span>
                    <textarea
                      name="note"
                      defaultValue={initialValue?.note ?? ""}
                      rows={3}
                      className={textareaClassName}
                      placeholder="Коментар по виконанню, зоні робіт, уточненню обсягу"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-neutral-200 px-6 py-4">
              {error ? (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {mode === "edit" && canArchive ? (
                    <button
                      type="button"
                      onClick={onArchive}
                      disabled={isPending}
                      className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Архівувати / повернути
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
                        ? "Додати роботу"
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
        aria-label={mode === "edit" ? "Редагувати роботу" : undefined}
        title={mode === "edit" ? "Редагувати роботу" : undefined}
      >
        {triggerLabel}
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
