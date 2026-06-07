"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  deleteMaterialItemAction,
  duplicateMaterialItemAction,
  reorderMaterialItemsAction,
} from "./actions";
import { MaterialItemFormModal } from "./material-item-form-modal";

type BrandOption = {
  id: string;
  name: string;
};

type MaterialItemRow = {
  id: string;
  materialCatalogId: string;
  code: string | null;
  sku: string | null;
  name: string;
  displayName: string;
  category: string | null;
  subcategory: string | null;
  brandId: string | null;
  brandName: string | null;
  unit: string | null;
  costPrice: string;
  recommendedRetail: string;
  description: string | null;
  technicalSpec: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specType: string | null;
  specParams: string | null;
};

type Props = {
  items: MaterialItemRow[];
  brands: BrandOption[];
  canViewCostPrice: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: string) {
  const numberValue = Number(value);

  return `${new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numberValue) ? numberValue : 0)} грн`;
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim();
}

function moveItem<T>(list: T[], fromIndex: number, toIndex: number) {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function MaterialCatalogItemsClient({
  items,
  brands,
  canViewCostPrice,
}: Props) {
  const materialCatalogId = items[0]?.materialCatalogId ?? "";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortMode, setSortMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        orderedItems.map((item) => item.category).filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, "uk"));
  }, [orderedItems]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orderedItems.filter((item) => {
      if (category !== "all" && (item.category ?? "") !== category) {
        return false;
      }

      if (status === "active" && !item.isActive) {
        return false;
      }

      if (status === "inactive" && item.isActive) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        item.displayName,
        item.name,
        item.category ?? "",
        item.subcategory ?? "",
        item.brandName ?? "",
        item.unit ?? "",
        item.code ?? "",
        item.sku ?? "",
        item.description ?? "",
        item.technicalSpec ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [orderedItems, query, category, status]);

  const activeCount = useMemo(
    () => orderedItems.filter((item) => item.isActive).length,
    [orderedItems],
  );

  const inactiveCount = useMemo(
    () => orderedItems.filter((item) => !item.isActive).length,
    [orderedItems],
  );

  function removeItemFromList(itemId: string) {
    setOrderedItems((currentItems) =>
      currentItems
        .filter((currentItem) => currentItem.id !== itemId)
        .map((currentItem, index) => ({
          ...currentItem,
          sortOrder: index + 1,
        })),
    );
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId || !materialCatalogId) {
      setDraggedId(null);
      return;
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === draggedId);
    const toIndex = orderedItems.findIndex((item) => item.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      return;
    }

    const next = moveItem(orderedItems, fromIndex, toIndex).map(
      (item, index) => ({
        ...item,
        sortOrder: index + 1,
      }),
    );

    setOrderedItems(next);
    setDraggedId(null);
    setListError(null);

    startTransition(async () => {
      const result = await reorderMaterialItemsAction({
        materialCatalogId,
        orderedIds: next.map((item) => item.id),
      });

      if (!result.ok) {
        setListError(result.error ?? "Не вдалося зберегти новий порядок.");
        setOrderedItems(items);
      }
    });
  }

  function handleDelete(item: MaterialItemRow) {
    const confirmed = window.confirm(
      `Видалити матеріал "${item.displayName}"?`,
    );

    if (!confirmed) {
      return;
    }

    setListError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      formData.set("materialCatalogId", item.materialCatalogId);

      const result = await deleteMaterialItemAction(formData);

      if (!result.ok) {
        setListError(result.error ?? "Не вдалося видалити матеріал.");
        return;
      }

      removeItemFromList(item.id);
    });
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-neutral-300 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_220px_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук за назвою, категорією, брендом, SKU, кодом..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
          >
            <option value="all">Усі категорії</option>
            {categories.map((itemCategory) => (
              <option key={itemCategory} value={itemCategory}>
                {itemCategory}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
          >
            <option value="all">Усі статуси</option>
            <option value="active">Активні</option>
            <option value="inactive">Неактивні</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700">
            Усього:{" "}
            <span className="font-semibold text-neutral-950">
              {orderedItems.length}
            </span>
          </div>

          <div className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700">
            Показано:{" "}
            <span className="font-semibold text-neutral-950">
              {filteredItems.length}
            </span>
          </div>

          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
            Активні: <span className="font-semibold">{activeCount}</span>
          </div>

          <div className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700">
            Неактивні: <span className="font-semibold">{inactiveCount}</span>
          </div>

          <div className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700">
            Категорій:{" "}
            <span className="font-semibold text-neutral-950">
              {categories.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSortMode((value) => !value)}
            className={`ml-auto rounded-xl border px-3 py-2 text-sm font-medium transition ${
              sortMode
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {sortMode ? "Завершити сортування" : "Сортувати"}
          </button>
        </div>

        {sortMode ? (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            Режим сортування увімкнено. <span className="font-semibold">Перетягуй</span>{" "}
            рядки для зміни порядку.
          </div>
        ) : null}

        {listError ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {listError}
          </div>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
        <div className="hidden grid-cols-[170px_minmax(0,1.9fr)_80px_140px_140px_120px_220px] gap-4 border-b border-neutral-300 bg-[#d9d9d9] px-4 py-3 text-sm font-semibold text-neutral-900 md:grid">
          <div>Категорія</div>
          <div>Матеріал</div>
          <div>Од.</div>
          <div>{canViewCostPrice ? "Собівартість" : "Ціна"}</div>
          <div>РРЦ</div>
          <div>Статус</div>
          <div className="text-right">Дії</div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-500">
            Нічого не знайдено за поточними фільтрами.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredItems.map((item, index) => {
              const secondLineParts = [
                normalizeText(item.subcategory) && item.subcategory,
                normalizeText(item.brandName) && item.brandName,
                item.code && item.code,
                item.sku && `SKU ${item.sku}`,
                normalizeText(item.technicalSpec) && item.technicalSpec,
                item.description && item.description,
              ].filter(Boolean) as string[];

              const rowClassName =
                index % 2 === 1 ? "bg-[#f2f2f2] px-4 py-3" : "bg-white px-4 py-3";

              return (
                <div
                  key={item.id}
                  draggable={sortMode}
                  onDragStart={() => setDraggedId(item.id)}
                  onDragOver={(event) => {
                    if (sortMode) {
                      event.preventDefault();
                    }
                  }}
                  onDrop={() => {
                    if (sortMode) {
                      handleDrop(item.id);
                    }
                  }}
                  className={`${rowClassName} ${sortMode ? "cursor-move" : ""}`}
                >
                  <div className="hidden grid-cols-[170px_minmax(0,1.9fr)_80px_140px_140px_120px_220px] items-start gap-4 md:grid">
                    <div className="flex items-start gap-3">
                      {sortMode ? (
                        <div className="pt-0.5 text-neutral-400">⋮⋮</div>
                      ) : null}

                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {item.category || "Без категорії"}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {formatDate(item.updatedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-950">
                        {item.displayName}
                      </div>

                      {secondLineParts.length > 0 ? (
                        <div className="mt-1 text-xs leading-5 text-neutral-500">
                          {secondLineParts.join(" • ")}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-sm text-neutral-700">
                      {item.unit || "—"}
                    </div>

                    <div className="text-sm text-neutral-700">
                      {canViewCostPrice
                        ? formatMoney(item.costPrice)
                        : formatMoney(item.recommendedRetail)}
                    </div>

                    <div className="text-sm text-neutral-700">
                      {formatMoney(item.recommendedRetail)}
                    </div>

                    <div>
                      {item.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Активний
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
                          Неактивний
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <MaterialItemFormModal
                        mode="edit"
                        triggerLabel="Редагувати"
                        triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                        brands={brands}
                        onDeleted={removeItemFromList}
                        onCreated={() => setOrderedItems(items)}
                        onUpdated={() =>
                          setOrderedItems((currentItems) => [...currentItems])
                        }
                        initialValue={{
                          id: item.id,
                          materialCatalogId: item.materialCatalogId,
                          code: item.code ?? "",
                          sku: item.sku ?? "",
                          name: item.name,
                          displayName: item.displayName,
                          category: item.category ?? "",
                          subcategory: item.subcategory ?? "",
                          brandId: item.brandId ?? "",
                          technicalSpec: item.technicalSpec ?? "",
                          unit: item.unit ?? "",
                          costPrice: item.costPrice,
                          recommendedRetail: item.recommendedRetail,
                          description: item.description ?? "",
                          sortOrder: item.sortOrder,
                          isInactive: !item.isActive,
                          specType: item.specType ?? "",
                          specParams: item.specParams ?? "",
                        }}
                      />

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setListError(null);

                          startTransition(async () => {
                            const result = await duplicateMaterialItemAction({
                              id: item.id,
                              materialCatalogId: item.materialCatalogId,
                            });

                            if (!result.ok) {
                              setListError(
                                result.error ?? "Не вдалося дублювати матеріал.",
                              );
                            }
                          });
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Дублювати
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 md:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                          {item.category || "Без категорії"}
                        </div>

                        <div className="mt-1 text-sm font-semibold text-neutral-950">
                          {item.displayName}
                        </div>
                      </div>

                      {item.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                          Активний
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                          Неактивний
                        </span>
                      )}
                    </div>

                    {secondLineParts.length > 0 ? (
                      <div className="text-xs leading-5 text-neutral-500">
                        {secondLineParts.join(" • ")}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-3 text-sm text-neutral-700">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                          Од.
                        </div>
                        <div className="mt-1">{item.unit || "—"}</div>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                          {canViewCostPrice ? "Собівартість" : "Ціна"}
                        </div>
                        <div className="mt-1">
                          {canViewCostPrice
                            ? formatMoney(item.costPrice)
                            : formatMoney(item.recommendedRetail)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                          РРЦ
                        </div>
                        <div className="mt-1">
                          {formatMoney(item.recommendedRetail)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                          Оновлено
                        </div>
                        <div className="mt-1">{formatDate(item.updatedAt)}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <MaterialItemFormModal
                        mode="edit"
                        triggerLabel="Редагувати"
                        triggerClassName="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                        brands={brands}
                        onDeleted={removeItemFromList}
                        onCreated={() => setOrderedItems(items)}
                        onUpdated={() =>
                          setOrderedItems((currentItems) => [...currentItems])
                        }
                        initialValue={{
                          id: item.id,
                          materialCatalogId: item.materialCatalogId,
                          code: item.code ?? "",
                          sku: item.sku ?? "",
                          name: item.name,
                          displayName: item.displayName,
                          category: item.category ?? "",
                          subcategory: item.subcategory ?? "",
                          brandId: item.brandId ?? "",
                          technicalSpec: item.technicalSpec ?? "",
                          unit: item.unit ?? "",
                          costPrice: item.costPrice,
                          recommendedRetail: item.recommendedRetail,
                          description: item.description ?? "",
                          sortOrder: item.sortOrder,
                          isInactive: !item.isActive,
                          specType: item.specType ?? "",
                          specParams: item.specParams ?? "",
                        }}
                      />

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setListError(null);

                          startTransition(async () => {
                            const result = await duplicateMaterialItemAction({
                              id: item.id,
                              materialCatalogId: item.materialCatalogId,
                            });

                            if (!result.ok) {
                              setListError(
                                result.error ?? "Не вдалося дублювати матеріал.",
                              );
                            }
                          });
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Дублювати
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
