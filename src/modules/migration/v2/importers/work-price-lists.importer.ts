import path from "node:path";
import { V2_REFERENCE_DIR } from "../../config";
import { parseCsvFile } from "../../csv/parse-csv";
import { isTruthyFlag, nullable, toDate, toInt } from "../../csv/csv-utils";
import { CsvRow, ImportResult, ReferenceImportContext } from "../../types";
import { createCounters } from "../../utils/logging";
import { normalizeStatus, slugCode } from "../../utils/normalize";

type WorkPriceCategoryMap = Map<string, string>;

function buildCategoryMap(rows: CsvRow[]): WorkPriceCategoryMap {
  const map: WorkPriceCategoryMap = new Map();

  for (const row of rows) {
    const id = row.id?.trim();
    const name = row.name?.trim();

    if (!id || !name) {
      continue;
    }

    map.set(id, name);
  }

  return map;
}

export async function importWorkPriceListsAndItems(
  context: ReferenceImportContext,
): Promise<ImportResult> {
  const listsSource = path.join(V2_REFERENCE_DIR, "work_price_lists.csv");
  const categoriesSource = path.join(V2_REFERENCE_DIR, "work_price_categories.csv");
  const itemsSource = path.join(V2_REFERENCE_DIR, "work_price_items.csv");

  const [listRows, categoryRows, itemRows] = await Promise.all([
    parseCsvFile(listsSource),
    parseCsvFile(categoriesSource),
    parseCsvFile(itemsSource),
  ]);

  const counters = createCounters();
  counters.read = listRows.length + categoryRows.length + itemRows.length;

  const categoryMap = buildCategoryMap(categoryRows);
  const listIdMap = new Map<string, string>();

  for (const row of listRows) {
    try {
      const name = row.name?.trim();

      if (!name) {
        counters.failed += 1;
        continue;
      }

      const code = slugCode(row.code, name);
      const version = toInt(row.version_no, 1);

      if (context.dryRun) {
        counters.created += 1;
        if (row.id?.trim()) {
          listIdMap.set(row.id.trim(), `dry-run:${code}:${version}`);
        }
        continue;
      }

      const workPriceList = await context.prisma.workPriceList.upsert({
        where: {
          tenantId_name_version: {
            tenantId: context.tenantId,
            name,
            version,
          } as never,
        },
        update: {
          code,
          category: nullable(row.scope_id),
          description: nullable(row.description),
          status: normalizeStatus(row.status),
          validFrom: toDate(row.valid_from),
          validTo: toDate(row.valid_to),
          isCurrent: isTruthyFlag(row.is_default),
          isArchived: !isTruthyFlag(row.is_active),
        },
        create: {
          tenantId: context.tenantId,
          code,
          name,
          category: nullable(row.scope_id),
          description: nullable(row.description),
          version,
          status: normalizeStatus(row.status),
          validFrom: toDate(row.valid_from),
          validTo: toDate(row.valid_to),
          isCurrent: isTruthyFlag(row.is_default),
          isArchived: !isTruthyFlag(row.is_active),
        },
      });

      if (row.id?.trim()) {
        listIdMap.set(row.id.trim(), workPriceList.id);
      }

      counters.created += 1;
    } catch (error) {
      counters.failed += 1;
      console.error("[IMPORT_ERROR]", {
        importer: "work-price-lists",
        row,
        error,
      });
    }
  }

  for (const row of itemRows) {
    try {
      const name = row.name?.trim();
      const sourceListId = row.work_price_list_id?.trim();

      if (!name || !sourceListId) {
        counters.failed += 1;
        continue;
      }

      const targetListId = listIdMap.get(sourceListId);

      if (!targetListId) {
        counters.failed += 1;
        continue;
      }

      const sourceItemId = row.id?.trim();
      const code = slugCode(sourceItemId, name);

      const categoryName = nullable(categoryMap.get(row.category_id?.trim() || "") ?? null);

      if (context.dryRun) {
        counters.created += 1;
        continue;
      }

      await context.prisma.workPriceItem.upsert({
        where: {
          workPriceListId_code: {
            workPriceListId: targetListId,
            code,
          } as never,
        },
        update: {
          category: categoryName,
          subcategory: null,
          name,
          description: nullable(row.description),
          unit: nullable(row.unit),
          basePrice: row.price && row.price.trim().length > 0 ? row.price.trim() : "0",
          isActive: isTruthyFlag(row.is_active),
          sortOrder: toInt(row.sort_order, 0),
        },
        create: {
          workPriceListId: targetListId,
          code,
          category: categoryName,
          subcategory: null,
          name,
          description: nullable(row.description),
          unit: nullable(row.unit),
          basePrice: row.price && row.price.trim().length > 0 ? row.price.trim() : "0",
          isActive: isTruthyFlag(row.is_active),
          sortOrder: toInt(row.sort_order, 0),
        },
      });

      counters.created += 1;
    } catch (error) {
      counters.failed += 1;
      console.error("[IMPORT_ERROR]", {
        importer: "work-price-items",
        row,
        error,
      });
    }
  }

  return {
    key: "work-price-lists",
    source: `${listsSource}, ${categoriesSource}, ${itemsSource}`,
    target: "WorkPriceList + WorkPriceItem",
    counters,
    notes: [
      "Імпорт заголовків прайсів, категорій і позицій",
      "category_id з V2 мапиться в category name у V3 WorkPriceItem",
    ],
  };
}
