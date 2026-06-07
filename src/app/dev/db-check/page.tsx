import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const REFERENCE_EXPORT_DIR =
  "/Users/volyanskyy/Projects/db_exports/v2/data/reference";

type CsvFileStat = {
  fileName: string;
  fullPath: string;
  totalLines: number;
  dataRows: number;
  header: string;
};

type ImportMatrixRow = {
  key: string;
  label: string;
  target: string;
  csvFile: string;
  csvRows: number | null;
  v3Count: number;
  notes: string;
};

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatPeriod(validFrom: Date | null, validTo: Date | null) {
  if (!validFrom && !validTo) {
    return "—";
  }

  return `${formatDate(validFrom)} → ${formatDate(validTo)}`;
}

function getStateBadge(count: number) {
  if (count > 0) {
    return {
      label: "Є дані",
      className:
        "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700",
    };
  }

  return {
    label: "Порожньо",
    className:
      "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700",
  };
}

function getImportBadge(v3Count: number, csvRows: number | null) {
  if (csvRows === null) {
    return {
      label: "CSV не знайдено",
      className:
        "inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600",
    };
  }

  if (csvRows === 0) {
    return {
      label: "CSV порожній",
      className:
        "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700",
    };
  }

  if (v3Count === 0) {
    return {
      label: "Готово до імпорту",
      className:
        "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700",
    };
  }

  if (v3Count > 0 && v3Count < csvRows) {
    return {
      label: "Частково імпортовано",
      className:
        "inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700",
    };
  }

  return {
    label: "Є дані в V3",
    className:
      "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700",
  };
}

function CountCard({
  title,
  value,
  note,
}: {
  title: string;
  value: number;
  note: string;
}) {
  const badge = getStateBadge(value);

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {value}
          </p>
        </div>

        <span className={badge.className}>{badge.label}</span>
      </div>

      <p className="mt-3 text-sm text-neutral-600">{note}</p>
    </article>
  );
}

async function getCsvStats() {
  try {
    const fileNames = await fs.readdir(REFERENCE_EXPORT_DIR);
    const csvFiles = fileNames.filter((name) => name.endsWith(".csv")).sort();

    const stats = await Promise.all(
      csvFiles.map(async (fileName) => {
        const fullPath = path.join(REFERENCE_EXPORT_DIR, fileName);
        const content = await fs.readFile(fullPath, "utf8");
        const lines = content
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);

        const totalLines = lines.length;
        const dataRows = totalLines > 0 ? Math.max(totalLines - 1, 0) : 0;
        const header = totalLines > 0 ? lines[0] : "";

        return {
          fileName,
          fullPath,
          totalLines,
          dataRows,
          header,
        } satisfies CsvFileStat;
      }),
    );

    return {
      exists: true,
      files: stats,
    };
  } catch {
    return {
      exists: false,
      files: [] as CsvFileStat[],
    };
  }
}

function csvRowCount(files: CsvFileStat[], fileName: string) {
  return files.find((file) => file.fileName === fileName)?.dataRows ?? null;
}

function buildImportMatrix(
  files: CsvFileStat[],
  counts: {
    workPriceListCount: number;
    workPriceItemCount: number;
    brandCount: number;
    roomTypeCount: number;
    fittingTypeCount: number;
    lightingSystemTypeCount: number;
    skillTagCount: number;
  },
): ImportMatrixRow[] {
  return [
    {
      key: "brands",
      label: "Бренди",
      target: "Brand",
      csvFile: "brands_catalog.csv",
      csvRows: csvRowCount(files, "brands_catalog.csv"),
      v3Count: counts.brandCount,
      notes: "Reference import з V2 brands_catalog.csv",
    },
    {
      key: "room-types",
      label: "Типи приміщень",
      target: "RoomType",
      csvFile: "room_types_catalog.csv",
      csvRows: csvRowCount(files, "room_types_catalog.csv"),
      v3Count: counts.roomTypeCount,
      notes: "Reference import з room_types_catalog.csv",
    },
    {
      key: "skill-tags",
      label: "Навички",
      target: "SkillTag",
      csvFile: "skills_catalog.csv",
      csvRows: csvRowCount(files, "skills_catalog.csv"),
      v3Count: counts.skillTagCount,
      notes: "Reference import з skills_catalog.csv",
    },
    {
      key: "lighting-system-types",
      label: "Типи систем освітлення",
      target: "LightingSystemType",
      csvFile: "lighting_system_types.csv",
      csvRows: csvRowCount(files, "lighting_system_types.csv"),
      v3Count: counts.lightingSystemTypeCount,
      notes: "Reference import з lighting_system_types.csv",
    },
    {
      key: "fixture-types",
      label: "Типи точок / фурнітури",
      target: "FittingType",
      csvFile: "fixture_point_types.csv",
      csvRows: csvRowCount(files, "fixture_point_types.csv"),
      v3Count: counts.fittingTypeCount,
      notes: "Optional: CSV зараз може бути порожній",
    },
    {
      key: "work-price-lists",
      label: "Прайси робіт",
      target: "WorkPriceList",
      csvFile: "work_price_lists.csv",
      csvRows: csvRowCount(files, "work_price_lists.csv"),
      v3Count: counts.workPriceListCount,
      notes: "Голови прайсів, версії, періоди дії",
    },
    {
      key: "work-price-items",
      label: "Позиції прайсів робіт",
      target: "WorkPriceItem",
      csvFile: "work_price_items.csv",
      csvRows: csvRowCount(files, "work_price_items.csv"),
      v3Count: counts.workPriceItemCount,
      notes: "Позиції з category_id -> category name mapping",
    },
  ];
}

export default async function DbCheckPage() {
  const csvStats = await getCsvStats();

  const [
    tenantCount,
    userCount,
    roleCount,
    permissionCount,
    employeeProfileCount,
    clientCount,
    projectCount,
    estimateCount,
    workPriceListCount,
    workPriceItemCount,
    materialCatalogCount,
    materialItemCount,
    brandCount,
    roomTypeCount,
    fittingTypeCount,
    lightingSystemTypeCount,
    skillTagCount,
    fieldReportCount,
    workLogCount,
    materialLogCount,
    tenants,
    recentWorkPriceLists,
    recentMaterialCatalogs,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.employeeProfile.count(),
    prisma.client.count(),
    prisma.project.count(),
    prisma.estimate.count(),
    prisma.workPriceList.count(),
    prisma.workPriceItem.count(),
    prisma.materialCatalog.count(),
    prisma.materialItem.count(),
    prisma.brand.count(),
    prisma.roomType.count(),
    prisma.fittingType.count(),
    prisma.lightingSystemType.count(),
    prisma.skillTag.count(),
    prisma.fieldReport.count(),
    prisma.workLog.count(),
    prisma.materialLog.count(),
    prisma.tenant.findMany({
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.workPriceList.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        version: true,
        status: true,
        validFrom: true,
        validTo: true,
        updatedAt: true,
      },
    }),
    prisma.materialCatalog.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        isCurrent: true,
        updatedAt: true,
      },
    }),
  ]);

  const importMatrix = buildImportMatrix(csvStats.files, {
    workPriceListCount,
    workPriceItemCount,
    brandCount,
    roomTypeCount,
    fittingTypeCount,
    lightingSystemTypeCount,
    skillTagCount,
  });

  const totalCsvRows = csvStats.files.reduce((sum, file) => sum + file.dataRows, 0);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Dev / DB Check
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 lg:text-4xl">
                  Стан бази даних та готовність до V2 → V3 міграції
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-neutral-600 lg:text-base">
                  Ця сторінка показує наповнення V3 бази, наявність reference CSV з V2 та
                  прогрес імпорту по ключових сутностях. Використовуємо її як контрольну
                  панель перед dry-run, після імпорту і перед переходом до business layer.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  CSV reference
                </p>
                <p className="mt-2 text-2xl font-semibold text-neutral-950">
                  {csvStats.exists ? csvStats.files.length : 0}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {csvStats.exists
                    ? `Знайдено файлів: ${csvStats.files.length}, рядків даних: ${totalCsvRows}`
                    : "Каталог reference CSV недоступний"}
                </p>
              </article>

              <article className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Reference V3
                </p>
                <p className="mt-2 text-2xl font-semibold text-neutral-950">
                  {brandCount +
                    roomTypeCount +
                    fittingTypeCount +
                    lightingSystemTypeCount +
                    skillTagCount +
                    workPriceListCount +
                    workPriceItemCount}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Сумарно по reference tables у V3.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <CountCard title="Tenants" value={tenantCount} note="Організації / інстанси CRM." />
          <CountCard title="Users" value={userCount} note="Користувачі системи." />
          <CountCard title="Roles" value={roleCount} note="RBAC ролі для доступу." />
          <CountCard title="Permissions" value={permissionCount} note="Дозволи та матриця доступів." />
          <CountCard title="Employee Profiles" value={employeeProfileCount} note="Профілі співробітників." />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CountCard title="Clients" value={clientCount} note="Business layer: клієнти." />
          <CountCard title="Projects" value={projectCount} note="Business layer: проєкти." />
          <CountCard title="Estimates" value={estimateCount} note="Business layer: кошториси." />
          <CountCard title="Field Reports" value={fieldReportCount} note="Операційний шар: виїзди / акти." />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CountCard title="Work Price Lists" value={workPriceListCount} note="Reference: заголовки прайсів робіт." />
          <CountCard title="Work Price Items" value={workPriceItemCount} note="Reference: позиції прайсів робіт." />
          <CountCard title="Material Catalogs" value={materialCatalogCount} note="Reference / бізнес: каталоги матеріалів." />
          <CountCard title="Material Items" value={materialItemCount} note="Позиції матеріалів." />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <CountCard title="Brands" value={brandCount} note="Reference: бренди." />
          <CountCard title="Room Types" value={roomTypeCount} note="Reference: типи приміщень." />
          <CountCard title="Fitting Types" value={fittingTypeCount} note="Reference: типи точок / фурнітури." />
          <CountCard title="Lighting System Types" value={lightingSystemTypeCount} note="Reference: системи освітлення." />
          <CountCard title="Skill Tags" value={skillTagCount} note="Reference: навички працівників." />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <CountCard title="Work Logs" value={workLogCount} note="Операційний шар: виконані роботи." />
          <CountCard title="Material Logs" value={materialLogCount} note="Операційний шар: витрати матеріалів." />
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-neutral-950">Матриця reference-імпорту</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Порівняння CSV джерел з V2 і відповідних таблиць у V3.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-[0.14em] text-neutral-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Сутність</th>
                  <th className="px-6 py-4 font-semibold">Target</th>
                  <th className="px-6 py-4 font-semibold">CSV</th>
                  <th className="px-6 py-4 font-semibold">Rows</th>
                  <th className="px-6 py-4 font-semibold">V3</th>
                  <th className="px-6 py-4 font-semibold">Статус</th>
                  <th className="px-6 py-4 font-semibold">Нотатки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {importMatrix.map((row) => {
                  const badge = getImportBadge(row.v3Count, row.csvRows);

                  return (
                    <tr key={row.key} className="align-top">
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-950">{row.label}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-700">{row.target}</td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-700">{row.csvFile}</td>
                      <td className="px-6 py-4 text-neutral-700">
                        {row.csvRows === null ? "—" : row.csvRows}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">{row.v3Count}</td>
                      <td className="px-6 py-4">
                        <span className={badge.className}>{badge.label}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{row.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-neutral-950">V2 reference CSV</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Фактичні CSV файли, доступні для reference-імпорту.
            </p>
          </div>

          {!csvStats.exists ? (
            <div className="px-6 py-6 text-sm text-neutral-600">
              Каталог <code className="rounded bg-neutral-100 px-2 py-1 text-xs">{REFERENCE_EXPORT_DIR}</code> не знайдено.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-[0.14em] text-neutral-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Файл</th>
                    <th className="px-6 py-4 font-semibold">Rows</th>
                    <th className="px-6 py-4 font-semibold">Header</th>
                    <th className="px-6 py-4 font-semibold">Шлях</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {csvStats.files.map((file) => (
                    <tr key={file.fileName} className="align-top">
                      <td className="px-6 py-4 font-medium text-neutral-950">{file.fileName}</td>
                      <td className="px-6 py-4 text-neutral-700">{file.dataRows}</td>
                      <td className="px-6 py-4 font-mono text-[11px] leading-5 text-neutral-600">
                        {file.header || "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] leading-5 text-neutral-600">
                        {file.fullPath}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-xl font-semibold text-neutral-950">Tenants</h2>
            <div className="mt-4 space-y-3">
              {tenants.length === 0 ? (
                <p className="text-sm text-neutral-600">Поки немає tenant-записів.</p>
              ) : (
                tenants.map((tenant) => (
                  <div key={tenant.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="font-medium text-neutral-950">{tenant.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">slug: {tenant.slug}</p>
                    <p className="mt-2 text-xs text-neutral-500">створено: {formatDate(tenant.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-xl font-semibold text-neutral-950">Recent Work Price Lists</h2>
            <div className="mt-4 space-y-3">
              {recentWorkPriceLists.length === 0 ? (
                <p className="text-sm text-neutral-600">Прайси робіт ще не імпортовані.</p>
              ) : (
                recentWorkPriceLists.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-950">{item.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          v{item.version} · {item.status}
                        </p>
                      </div>
                      <span className={getStateBadge(1).className}>є запис</span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Період: {formatPeriod(item.validFrom, item.validTo)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Оновлено: {formatDate(item.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-xl font-semibold text-neutral-950">Recent Material Catalogs</h2>
            <div className="mt-4 space-y-3">
              {recentMaterialCatalogs.length === 0 ? (
                <p className="text-sm text-neutral-600">Каталоги матеріалів ще не створені.</p>
              ) : (
                recentMaterialCatalogs.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-950">{item.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.category || "без категорії"}
                        </p>
                      </div>
                      <span className={item.isCurrent ? getStateBadge(1).className : getStateBadge(0).className}>
                        {item.isCurrent ? "current" : "not current"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Оновлено: {formatDate(item.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
