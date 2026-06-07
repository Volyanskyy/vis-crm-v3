"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { reorderWorkPriceItemsAction } from "./actions";
import { WorkPriceItemFormModal } from "./work-price-item-form-modal";

type WorkPriceItemRow = {
  id: string;
  workPriceListId: string;
  code: string | null;
  category: string | null;
  subcategory: string | null;
  name: string;
  description: string | null;
  unit: string | null;
  basePrice: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  workPriceListId: string;
  items: WorkPriceItemRow[];
};

type SortScope = "categories" | "items";

type CategoryMeta = {
  name: string;
  itemCount: number;
  activeCount: number;
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

function moveItem<T>(list: T[], fromIndex: number, toIndex: number) {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

const rowEditTriggerClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm transition hover:border-neutral-300 hover:bg-neutral-50";

function EditIcon() {
  return (
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
  );
}

function SortIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M7 4.167h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 8.333h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 12.5h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M1.667 16.667H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FolderSortIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M2.5 5.833A1.667 1.667 0 0 1 4.167 4.167h3.166l1.334 1.666h7.166A1.667 1.667 0 0 1 17.5 7.5v7.5a1.667 1.667 0 0 1-1.667 1.667H4.167A1.667 1.667 0 0 1 2.5 15V5.833Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListSortIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M6.667 5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.667 10h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.667 15h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="3.333" cy="5" r="0.833" fill="currentColor" />
      <circle cx="3.333" cy="10" r="0.833" fill="currentColor" />
      <circle cx="3.333" cy="15" r="0.833" fill="currentColor" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 text-neutral-400"
    >
      <circle cx="7" cy="5" r="1" fill="currentColor" />
      <circle cx="13" cy="5" r="1" fill="currentColor" />
      <circle cx="7" cy="10" r="1" fill="currentColor" />
      <circle cx="13" cy="10" r="1" fill="currentColor" />
      <circle cx="7" cy="15" r="1" fill="currentColor" />
      <circle cx="13" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

function getCategoryKey(value: string | null) {
  return value?.trim() || "Без категорії";
}

export function WorkPriceItemsClient({ workPriceListId, items }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortMode, setSortMode] = useState(false);
  const [sortScope, setSortScope] = useState<SortScope>("items");
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of orderedItems) {
      const categoryName = getCategoryKey(item.category);

      if (!seen.has(categoryName)) {
        seen.add(categoryName);
        result.push(categoryName);
      }
    }

    return result;
  }, [orderedItems]);

  const categoryMeta = useMemo(() => {
    const map = new Map<string, CategoryMeta>();

    for (const item of orderedItems) {
      const categoryName = getCategoryKey(item.category);
      const current = map.get(categoryName);

      if (!current) {
        map.set(categoryName, {
          name: categoryName,
          itemCount: 1,
          activeCount: item.isActive ? 1 : 0,
        });
      } else {
        current.itemCount += 1;
        if (item.isActive) {
          current.activeCount += 1;
        }
      }
    }

    return categories.map((categoryName) => {
      return (
        map.get(categoryName) ?? {
          name: categoryName,
          itemCount: 0,
          activeCount: 0,
        }
      );
    });
  }, [orderedItems, categories]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orderedItems.filter((item) => {
      const itemCategory = getCategoryKey(item.category);

      if (category !== "all" && itemCategory !== category) {
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
        item.name,
        item.category ?? "",
        item.subcategory ?? "",
        item.unit ?? "",
        item.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [orderedItems, query, category, status]);

  const visibleCategoryOrder = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of filteredItems) {
      const categoryName = getCategoryKey(item.category);

      if (!seen.has(categoryName)) {
        seen.add(categoryName);
        result.push(categoryName);
      }
    }

    return result;
  }, [filteredItems]);

  const activeCount = useMemo(
    () => orderedItems.filter((item) => item.isActive).length,
    [orderedItems],
  );

  const inactiveCount = useMemo(
    () => orderedItems.filter((item) => !item.isActive).length,
    [orderedItems],
  );

  const groupedItems = useMemo(() => {
    const map = new Map<string, WorkPriceItemRow[]>();

    for (const item of filteredItems) {
      const categoryName = getCategoryKey(item.category);
      const current = map.get(categoryName);

      if (!current) {
        map.set(categoryName, [item]);
      } else {
        current.push(item);
      }
    }

    return visibleCategoryOrder.map((categoryName) => ({
      categoryName,
      items: map.get(categoryName) ?? [],
    }));
  }, [filteredItems, visibleCategoryOrder]);

  function handleItemDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === draggedId);
    const toIndex = orderedItems.findIndex((item) => item.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      return;
    }

    const draggedItem = orderedItems[fromIndex];
    const targetItem = orderedItems[toIndex];

    if (getCategoryKey(draggedItem.category) !== getCategoryKey(targetItem.category)) {
      setDraggedId(null);
      return;
    }

    const next = moveItem(orderedItems, fromIndex, toIndex).map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));

    setOrderedItems(next);
    setDraggedId(null);

    startTransition(async () => {
      await reorderWorkPriceItemsAction({
        workPriceListId,
        orderedIds: next.map((item) => item.id),
      });
    });
  }

  function handleCategoryDrop(targetCategory: string) {
    if (!draggedCategory || draggedCategory === targetCategory) {
      setDraggedCategory(null);
      return;
    }

    const fromIndex = categories.findIndex((item) => item === draggedCategory);
    const toIndex = categories.findIndex((item) => item === targetCategory);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedCategory(null);
      return;
    }

    const nextCategories = moveItem(categories, fromIndex, toIndex);
    const categoryRank = new Map(nextCategories.map((item, index) => [item, index]));

    const next = [...orderedItems]
      .sort((a, b) => {
        const categoryDiff =
          (categoryRank.get(getCategoryKey(a.category)) ?? 0) -
          (categoryRank.get(getCategoryKey(b.category)) ?? 0);

        if (categoryDiff !== 0) {
          return categoryDiff;
        }

        return a.sortOrder - b.sortOrder;
      })
      .map((item, index) => ({
        ...item,
        sortOrder: index + 1,
      }));

    setOrderedItems(next);
    setDraggedCategory(null);

    startTransition(async () => {
      await reorderWorkPriceItemsAction({
        workPriceListId,
        orderedIds: next.map((item) => item.id),
      });
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-neutral-300 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.8fr)_240px_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук по назві, категорії, підкатегорії, одиниці, примітці..."
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

        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
            <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1.5">
              Усього:
              <span className="ml-1 font-semibold text-neutral-900">
                {orderedItems.length}
              </span>
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
              Активні:
              <span className="ml-1 font-semibold">{activeCount}</span>
            </span>
            <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700">
              Неактивні:
              <span className="ml-1 font-semibold">{inactiveCount}</span>
            </span>
            <span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">
              Показано:
              <span className="ml-1 font-semibold">{filteredItems.length}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {sortMode ? (
              <div className="inline-flex rounded-xl border border-neutral-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setSortScope("categories")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    sortScope === "categories"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <FolderSortIcon />
                  Категорії
                </button>

                <button
                  type="button"
                  onClick={() => setSortScope("items")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    sortScope === "items"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <ListSortIcon />
                  Позиції
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setSortMode((value) => !value);
                setDraggedId(null);
                setDraggedCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                sortMode
                  ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <SortIcon />
              {sortMode ? "Завершити сортування" : "Режим сортування"}
            </button>
          </div>
        </div>

        {sortMode ? (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            {sortScope === "categories"
              ? "У цьому режимі ти змінюєш порядок категорій у прайсі. Позиції всередині категорій лишаються на своїх місцях."
              : category === "all"
                ? "Для сортування позицій спочатку вибери потрібну категорію у фільтрі."
                : `Зараз сортуються позиції в категорії “${category}”. Підкатегорії та позиції залишаються в поточній структурі списку.`}
          </div>
        ) : null}
      </section>

      {sortMode && sortScope === "categories" ? (
        <section className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Сортування категорій
          </div>

          <div className="divide-y divide-neutral-200">
            {categoryMeta.map((item) => (
              <div
                key={item.name}
                draggable
                onDragStart={() => setDraggedCategory(item.name)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleCategoryDrop(item.name)}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <DragHandleIcon />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-neutral-950">
                      {item.name}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Позицій: {item.itemCount} · Активних: {item.activeCount}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-neutral-400">Перетягни</div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
          <div className="hidden grid-cols-[60px_minmax(0,2.7fr)_170px_92px_120px_72px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid">
            <div>Порядок</div>
            <div>Позиція</div>
            <div>Категорія / підкатегорія</div>
            <div>Од.</div>
            <div className="text-right">Ціна</div>
            <div className="text-right">✏️</div>
          </div>

          {groupedItems.length > 0 ? (
            <div className="divide-y divide-neutral-200 bg-white">
              {groupedItems.map((group) => (
                <div key={group.categoryName}>
                  <div className="border-b border-neutral-200 bg-neutral-50/80 px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-950">
                        {group.categoryName}
                      </h3>
                      <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-600">
                        {group.items.length} поз.
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {group.items.map((item) => {
                      const allowItemDrag =
                        sortMode &&
                        sortScope === "items" &&
                        category !== "all" &&
                        getCategoryKey(item.category) === category;

                      return (
                        <div
                          key={item.id}
                          draggable={allowItemDrag}
                          onDragStart={() => {
                            if (allowItemDrag) {
                              setDraggedId(item.id);
                            }
                          }}
                          onDragOver={(event) => {
                            if (allowItemDrag) {
                              event.preventDefault();
                            }
                          }}
                          onDrop={() => {
                            if (allowItemDrag) {
                              handleItemDrop(item.id);
                            }
                          }}
                          className={`grid gap-3 px-5 py-4 transition lg:grid-cols-[60px_minmax(0,2.7fr)_170px_92px_120px_72px] lg:items-center lg:gap-4 ${
                            allowItemDrag
                              ? "cursor-move hover:bg-neutral-50"
                              : "hover:bg-neutral-50/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                            {allowItemDrag ? <DragHandleIcon /> : null}
                            <span>
                              <span className="font-medium text-neutral-900 lg:hidden">
                                Порядок:{" "}
                              </span>
                              {item.sortOrder}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate text-sm font-semibold text-neutral-950 sm:text-base">
                                {item.name}
                              </div>

                              {!item.isActive ? (
                                <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                                  Неактивна
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 lg:hidden">
                              <span>
                                <span className="font-medium text-neutral-700">
                                  Категорія:
                                </span>{" "}
                                {getCategoryKey(item.category)}
                              </span>
                              <span>
                                <span className="font-medium text-neutral-700">
                                  Підкатегорія:
                                </span>{" "}
                                {item.subcategory || "—"}
                              </span>
                              <span>
                                <span className="font-medium text-neutral-700">
                                  Од.:
                                </span>{" "}
                                {item.unit || "—"}
                              </span>
                              <span>
                                <span className="font-medium text-neutral-700">
                                  Ціна:
                                </span>{" "}
                                {formatMoney(item.basePrice)}
                              </span>
                              <span>
                                <span className="font-medium text-neutral-700">
                                  Оновлено:
                                </span>{" "}
                                {formatDate(item.updatedAt)}
                              </span>
                            </div>

                            {item.description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                                {item.description}
                              </p>
                            ) : null}
                          </div>

                          <div className="hidden text-sm text-neutral-700 lg:block">
                            <div className="truncate">{getCategoryKey(item.category)}</div>
                            <div className="mt-1 truncate text-xs text-neutral-500">
                              {item.subcategory || "—"}
                            </div>
                          </div>

                          <div className="hidden text-sm text-neutral-700 lg:block">
                            {item.unit || "—"}
                          </div>

                          <div className="hidden text-right text-sm font-semibold text-neutral-950 lg:block">
                            {formatMoney(item.basePrice)}
                          </div>

                          <div className="flex items-center justify-end">
                            <WorkPriceItemFormModal
                              mode="edit"
                              triggerLabel="Змінити позицію"
                              triggerVariant="icon"
                              triggerClassName={rowEditTriggerClassName}
                              initialValue={{
                                id: item.id,
                                workPriceListId: item.workPriceListId,
                                code: item.code ?? "",
                                category: item.category ?? "",
                                subcategory: item.subcategory ?? "",
                                name: item.name,
                                description: item.description ?? "",
                                unit: item.unit ?? "",
                                basePrice: item.basePrice,
                                sortOrder: item.sortOrder,
                                isInactive: !item.isActive,
                              }}
                            >
                              <EditIcon />
                            </WorkPriceItemFormModal>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-sm text-neutral-500">
              Нічого не знайдено за поточним фільтром або пошуком.
            </div>
          )}
        </section>
      )}

      {isPending ? (
        <div className="text-sm text-neutral-500">
          Зберігаю новий порядок позицій...
        </div>
      ) : null}
    </div>
  );
}
