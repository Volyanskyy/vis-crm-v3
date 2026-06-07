import { prisma } from "@/lib/prisma";
import { ProjectMaterialItemModal } from "../project-material-item-modal";
import { ProjectWorkItemModal } from "../project-work-item-modal";

function formatMoney(value: unknown) {
  const amount =
    typeof value === "object" && value !== null && "toNumber" in value
      ? (value as { toNumber(): number }).toNumber()
      : Number(value ?? 0);

  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatQuantity(value: unknown) {
  const amount =
    typeof value === "object" && value !== null && "toNumber" in value
      ? (value as { toNumber(): number }).toNumber()
      : Number(value ?? 0);

  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(amount);
}

const rowEditTriggerClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm transition hover:border-neutral-300 hover:bg-neutral-50";

export default async function ProjectWorkMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const [workItems, materialItems, workPriceLists, materialCatalogs] =
    await Promise.all([
      prisma.projectWorkItem.findMany({
        where: { projectId, isArchived: false },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.projectMaterialItem.findMany({
        where: { projectId, isArchived: false },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.workPriceList.findMany({
        where: {
          status: "ACTIVE",
          isCurrent: true,
          isArchived: false,
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        include: {
          items: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
        },
      }),
      prisma.materialCatalog.findMany({
        where: {
          status: "ACTIVE",
          isArchived: false,
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        include: {
          items: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            include: {
              brand: true,
            },
          },
        },
      }),
    ]);

  const workTotal = workItems.reduce((sum, item) => {
    const value =
      typeof item.totalPrice === "object" && "toNumber" in item.totalPrice
        ? item.totalPrice.toNumber()
        : Number(item.totalPrice ?? 0);

    return sum + value;
  }, 0);

  const materialRetailTotal = materialItems.reduce((sum, item) => {
    const value =
      typeof item.totalRetail === "object" && "toNumber" in item.totalRetail
        ? item.totalRetail.toNumber()
        : Number(item.totalRetail ?? 0);

    return sum + value;
  }, 0);

  const projectGrandTotal = workTotal + materialRetailTotal;

  const selectableWorkPriceLists = workPriceLists
    .map((list) => ({
      id: list.id,
      name: list.name,
      code: list.code,
      category: list.category,
      items: list.items.map((item) => ({
        id: item.id,
        code: item.code,
        category: item.category,
        subcategory: item.subcategory,
        name: item.name,
        description: item.description,
        unit: item.unit,
        basePrice: String(item.basePrice),
        sortOrder: item.sortOrder,
      })),
    }))
    .filter((list) => list.items.length > 0);

  const selectableMaterialCatalogs = materialCatalogs
    .map((catalog) => ({
      id: catalog.id,
      name: catalog.name,
      code: catalog.code,
      category: catalog.category,
      items: catalog.items.map((item) => ({
        id: item.id,
        code: item.code,
        sku: item.sku,
        category: item.category,
        subcategory: item.subcategory,
        name: item.name,
        description: item.description,
        technicalSpec: item.technicalSpec,
        unit: item.unit,
        costPrice: String(item.costPrice),
        recommendedRetail: String(item.recommendedRetail),
        sortOrder: item.sortOrder,
        brand: item.brand
          ? {
              id: item.brand.id,
              name: item.brand.name,
            }
          : null,
      })),
    }))
    .filter((catalog) => catalog.items.length > 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Роботи та матеріали
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Виконані роботи і використані матеріали
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
              Фіксуй фактично виконані роботи та використані матеріали по
              проєкту, щоб швидко формувати підсумкову вартість, кошторис і
              закупівлі.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                Роботи
              </div>
              <div className="mt-2 text-2xl font-semibold text-neutral-950">
                {workItems.length}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                На суму {formatMoney(workTotal)}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                Матеріали
              </div>
              <div className="mt-2 text-2xl font-semibold text-neutral-950">
                {materialItems.length}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                На суму {formatMoney(materialRetailTotal)}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-900 px-4 py-3 text-white">
              <div className="text-xs uppercase tracking-[0.14em] text-neutral-300">
                Разом
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatMoney(projectGrandTotal)}
              </div>
              <div className="mt-1 text-sm text-neutral-300">
                Роботи + матеріали
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Виконані роботи
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
              Список робіт по проєкту
            </h3>
          </div>

          <div className="shrink-0">
            <ProjectWorkItemModal
              mode="create"
              projectId={projectId}
              triggerLabel="Додати роботу"
              workPriceLists={selectableWorkPriceLists}
            />
          </div>
        </div>

        {workItems.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
            <div className="hidden grid-cols-[120px_minmax(0,1fr)_90px_110px_120px_120px_64px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid">
              <div>Категорія</div>
              <div>Назва роботи</div>
              <div>Од.</div>
              <div className="text-right">Кількість</div>
              <div className="text-right">Ціна</div>
              <div className="text-right">Сума</div>
              <div className="text-right">✏️</div>
            </div>

            <div className="divide-y divide-neutral-200 bg-white">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 px-5 py-4 lg:grid-cols-[120px_minmax(0,1fr)_90px_110px_120px_120px_64px] lg:items-center lg:gap-4"
                >
                  <div className="text-sm text-neutral-500">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Категорія:{" "}
                    </span>
                    {item.category || "—"}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-950">
                      {item.name}
                    </div>
                    {item.description ? (
                      <div className="mt-1 text-sm text-neutral-500">
                        {item.description}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-sm text-neutral-600">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Од.:{" "}
                    </span>
                    {item.unit || "—"}
                  </div>

                  <div className="text-sm text-neutral-700 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Кількість:{" "}
                    </span>
                    {formatQuantity(item.quantity)}
                  </div>

                  <div className="text-sm text-neutral-700 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Ціна:{" "}
                    </span>
                    {formatMoney(item.unitPrice)}
                  </div>

                  <div className="text-sm font-semibold text-neutral-950 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Сума:{" "}
                    </span>
                    {formatMoney(item.totalPrice)}
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <ProjectWorkItemModal
                      mode="edit"
                      projectId={projectId}
                      triggerLabel="✏️"
                      triggerClassName={rowEditTriggerClassName}
                      workPriceLists={selectableWorkPriceLists}
                      canArchive
                      initialValue={{
                        id: item.id,
                        sortOrder: String(item.sortOrder ?? ""),
                        code: item.code ?? "",
                        category: item.category ?? "",
                        subcategory: item.subcategory ?? "",
                        name: item.name ?? "",
                        unit: item.unit ?? "",
                        quantity: String(item.quantity ?? ""),
                        unitPrice: String(item.unitPrice ?? ""),
                        note: item.note ?? "",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-sm text-neutral-500">
            Поки що не додано жодної роботи. Додай позиції з прайсу або внеси
            виконані роботи вручну.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Використані матеріали
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
              Список матеріалів по проєкту
            </h3>
          </div>

          <div className="shrink-0">
            <ProjectMaterialItemModal
              mode="create"
              projectId={projectId}
              triggerLabel="Додати матеріал"
              materialCatalogs={selectableMaterialCatalogs}
            />
          </div>
        </div>

        {materialItems.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
            <div className="hidden grid-cols-[120px_minmax(0,1fr)_90px_110px_110px_110px_120px_64px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid">
              <div>Категорія</div>
              <div>Матеріал</div>
              <div>Од.</div>
              <div className="text-right">Кількість</div>
              <div className="text-right">Собівартість</div>
              <div className="text-right">РРЦ</div>
              <div className="text-right">Сума РРЦ</div>
              <div className="text-right">✏️</div>
            </div>

            <div className="divide-y divide-neutral-200 bg-white">
              {materialItems.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 px-5 py-4 lg:grid-cols-[120px_minmax(0,1fr)_90px_110px_110px_110px_120px_64px] lg:items-center lg:gap-4"
                >
                  <div className="text-sm text-neutral-500">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Категорія:{" "}
                    </span>
                    {item.category || "—"}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-950">
                      {item.name}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      {item.brandName ? <span>{item.brandName}</span> : null}
                      {item.sku ? <span>SKU: {item.sku}</span> : null}
                    </div>

                    {item.description ? (
                      <div className="mt-1 text-sm text-neutral-500">
                        {item.description}
                      </div>
                    ) : null}

                    {item.technicalSpec ? (
                      <div className="mt-1 text-xs font-medium text-neutral-600">
                        Технічний параметр: {item.technicalSpec}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-sm text-neutral-600">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Од.:{" "}
                    </span>
                    {item.unit || "—"}
                  </div>

                  <div className="text-sm text-neutral-700 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Кількість:{" "}
                    </span>
                    {formatQuantity(item.quantity)}
                  </div>

                  <div className="text-sm text-neutral-700 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Собівартість:{" "}
                    </span>
                    {formatMoney(item.costPrice)}
                  </div>

                  <div className="text-sm text-neutral-700 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      РРЦ:{" "}
                    </span>
                    {formatMoney(item.retailPrice)}
                  </div>

                  <div className="text-sm font-semibold text-neutral-950 lg:text-right">
                    <span className="font-medium text-neutral-900 lg:hidden">
                      Сума РРЦ:{" "}
                    </span>
                    {formatMoney(item.totalRetail)}
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <ProjectMaterialItemModal
                      mode="edit"
                      projectId={projectId}
                      triggerLabel="✏️"
                      triggerClassName={rowEditTriggerClassName}
                      materialCatalogs={selectableMaterialCatalogs}
                      canArchive
                      initialValue={{
                        id: item.id,
                        sortOrder: String(item.sortOrder ?? ""),
                        code: item.code ?? "",
                        sku: item.sku ?? "",
                        brandName: item.brandName ?? "",
                        category: item.category ?? "",
                        subcategory: item.subcategory ?? "",
                        name: item.name ?? "",
                        description: item.description ?? "",
                        technicalSpec: item.technicalSpec ?? "",
                        unit: item.unit ?? "",
                        quantity: String(item.quantity ?? ""),
                        costPrice: String(item.costPrice ?? ""),
                        retailPrice: String(item.retailPrice ?? ""),
                        note: item.note ?? "",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-sm text-neutral-500">
            Поки що не додано жодного матеріалу. Додай позиції з каталогу або
            внеси використані матеріали вручну.
          </div>
        )}
      </section>
    </div>
  );
}
