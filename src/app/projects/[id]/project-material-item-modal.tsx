"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  archiveProjectMaterialItemAction,
  createProjectMaterialItemAction,
  updateProjectMaterialItemAction,
} from "./project-material-item-actions";

type MaterialItemOption = {
  id: string;
  code: string | null;
  sku: string | null;
  category: string | null;
  subcategory: string | null;
  name: string;
  description: string | null;
  technicalSpec: string | null;
  unit: string | null;
  costPrice: string;
  recommendedRetail: string;
  sortOrder: number;
  brand: { id: string; name: string } | null;
};

type MaterialCatalogOption = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  items: MaterialItemOption[];
};

type EditValue = {
  id: string;
  sortOrder: string;
  code: string;
  sku: string;
  brandName: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  technicalSpec: string;
  unit: string;
  quantity: string;
  costPrice: string;
  retailPrice: string;
  note: string;
};

type Props = {
  mode: "create" | "edit";
  projectId: string;
  triggerLabel: string;
  triggerClassName?: string;
  materialCatalogs?: MaterialCatalogOption[];
  initialValue?: Partial<EditValue>;
  canArchive?: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-950";
const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-950";
const textareaClassName =
  "min-h-[88px] w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition focus:border-neutral-950";
const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-900";

export function ProjectMaterialItemModal({
  mode,
  projectId,
  triggerLabel,
  triggerClassName,
  materialCatalogs = [],
  initialValue,
  canArchive = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialCatalogId = materialCatalogs[0]?.id ?? "";
  const [selectedCatalogId, setSelectedCatalogId] = useState(initialCatalogId);
  const [selectedItemId, setSelectedItemId] = useState("");

  const selectedCatalog = useMemo(
    () =>
      materialCatalogs.find((catalog) => catalog.id === selectedCatalogId) ?? null,
    [materialCatalogs, selectedCatalogId],
  );

  const selectedItem = useMemo(
    () => selectedCatalog?.items.find((item) => item.id === selectedItemId) ?? null,
    [selectedCatalog, selectedItemId],
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
      const firstCatalog = materialCatalogs[0];
      setSelectedCatalogId(firstCatalog?.id ?? "");
      setSelectedItemId(firstCatalog?.items[0]?.id ?? "");
    }
  }, [open, mode, materialCatalogs]);

  useEffect(() => {
    if (!selectedCatalog) {
      setSelectedItemId("");
      return;
    }

    const exists = selectedCatalog.items.some((item) => item.id === selectedItemId);

    if (!exists) {
      setSelectedItemId(selectedCatalog.items[0]?.id ?? "");
    }
  }, [selectedCatalog, selectedItemId]);

  function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProjectMaterialItemAction(formData);
        } else {
          await updateProjectMaterialItemAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти матеріал.",
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
        await archiveProjectMaterialItemAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося змінити статус матеріалу.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 bg-black/45 p-4">
      <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
        <div className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {mode === "create" ? "Новий матеріал" : "Редагування матеріалу"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create"
                  ? "Додати матеріал"
                  : "Оновити матеріал у проєкті"}
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

          <div className="min-h-0 flex-1 overflow-y-auto">
            <form action={onSubmit} className="space-y-5 px-6 py-5">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="id" value={initialValue?.id ?? ""} />

              {mode === "create" ? (
                <>
                  <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-950">
                        Вибір із довідника
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500">
                        Оберіть активний довідник матеріалів і конкретну позицію для
                        додавання в проєкт.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className={labelClassName}>Довідник матеріалів</span>
                        <select
                          name="sourceMaterialCatalogId"
                          value={selectedCatalogId}
                          onChange={(event) => setSelectedCatalogId(event.target.value)}
                          className={selectClassName}
                        >
                          {materialCatalogs.length === 0 ? (
                            <option value="">Немає активних довідників</option>
                          ) : null}

                          {materialCatalogs.map((catalog) => (
                            <option key={catalog.id} value={catalog.id}>
                              {catalog.name}
                              {catalog.code ? ` (${catalog.code})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1.5">
                        <span className={labelClassName}>Матеріал</span>
                        <select
                          name="sourceMaterialItemId"
                          value={selectedItemId}
                          onChange={(event) => setSelectedItemId(event.target.value)}
                          className={selectClassName}
                        >
                          {selectedCatalog?.items.length ? null : (
                            <option value="">У довіднику немає активних позицій</option>
                          )}

                          {selectedCatalog?.items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                              {item.code ? ` (${item.code})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {selectedItem ? (
                      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Дані з довідника
                        </p>
                        <div className="mt-2 grid gap-2 text-sm text-neutral-600 md:grid-cols-2">
                          <p>
                            <span className="font-medium text-neutral-900">Назва:</span>{" "}
                            {selectedItem.name}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">Категорія:</span>{" "}
                            {selectedItem.category ?? "—"}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">Підкатегорія:</span>{" "}
                            {selectedItem.subcategory ?? "—"}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">Бренд:</span>{" "}
                            {selectedItem.brand?.name ?? "—"}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">Одиниця:</span>{" "}
                            {selectedItem.unit ?? "—"}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">Собівартість:</span>{" "}
                            {selectedItem.costPrice}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">РРЦ:</span>{" "}
                            {selectedItem.recommendedRetail}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-900">Код:</span>{" "}
                            {selectedItem.code ?? "—"}
                          </p>
                        </div>

                        {selectedItem.description ? (
                          <p className="mt-3 text-sm text-neutral-500">
                            <span className="font-medium text-neutral-900">Опис:</span>{" "}
                            {selectedItem.description}
                          </p>
                        ) : null}

                        {selectedItem.technicalSpec ? (
                          <p className="mt-2 text-sm text-neutral-500">
                            <span className="font-medium text-neutral-900">
                              Технічна специфікація:
                            </span>{" "}
                            {selectedItem.technicalSpec}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </section>

                  <section className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-1.5">
                      <span className={labelClassName}>Кількість</span>
                      <input
                        name="quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue="1"
                        className={inputClassName}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className={labelClassName}>Порядок</span>
                      <input
                        name="sortOrder"
                        type="number"
                        step="1"
                        min="0"
                        defaultValue={selectedItem?.sortOrder ?? 0}
                        className={inputClassName}
                      />
                    </label>

                    <label className="space-y-1.5 md:col-span-3">
                      <span className={labelClassName}>Примітка</span>
                      <textarea
                        name="note"
                        defaultValue=""
                        className={textareaClassName}
                        placeholder="Коментар до використання матеріалу в проєкті"
                      />
                    </label>
                  </section>
                </>
              ) : (
                <section className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className={labelClassName}>Код</span>
                    <input
                      value={initialValue?.code ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>SKU</span>
                    <input
                      value={initialValue?.sku ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Бренд</span>
                    <input
                      value={initialValue?.brandName ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Категорія</span>
                    <input
                      value={initialValue?.category ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Підкатегорія</span>
                    <input
                      value={initialValue?.subcategory ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className={labelClassName}>Назва</span>
                    <input
                      value={initialValue?.name ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className={labelClassName}>Опис</span>
                    <textarea
                      value={initialValue?.description ?? ""}
                      disabled
                      className={`${textareaClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className={labelClassName}>Технічна специфікація</span>
                    <textarea
                      name="technicalSpec"
                      defaultValue={initialValue?.technicalSpec ?? ""}
                      className={textareaClassName}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Одиниця</span>
                    <input
                      value={initialValue?.unit ?? ""}
                      disabled
                      className={`${inputClassName} bg-neutral-100 text-neutral-500`}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Кількість</span>
                    <input
                      name="quantity"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={initialValue?.quantity ?? "1"}
                      className={inputClassName}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Собівартість</span>
                    <input
                      name="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={initialValue?.costPrice ?? "0"}
                      className={inputClassName}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Ціна продажу</span>
                    <input
                      name="retailPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={initialValue?.retailPrice ?? "0"}
                      className={inputClassName}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className={labelClassName}>Порядок</span>
                    <input
                      name="sortOrder"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={initialValue?.sortOrder ?? "0"}
                      className={inputClassName}
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className={labelClassName}>Примітка</span>
                    <textarea
                      name="note"
                      defaultValue={initialValue?.note ?? ""}
                      className={textareaClassName}
                    />
                  </label>
                </section>
              )}

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {mode === "edit" && canArchive ? (
                    <button
                      type="button"
                      onClick={onArchive}
                      disabled={isPending}
                      className="inline-flex h-11 items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Архівувати
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Скасувати
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isPending || mode === "create"
                        ? !selectedCatalogId || !selectedItemId
                        : false
                    }
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending
                      ? "Збереження..."
                      : mode === "create"
                        ? "Додати матеріал"
                        : "Зберегти зміни"}
                  </button>
                </div>
              </div>
            </form>
          </div>
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
          "inline-flex h-10 items-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        }
      >
        {triggerLabel}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
