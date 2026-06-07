import path from "node:path";
import { V2_REFERENCE_DIR } from "../../config";
import { parseCsvFile } from "../../csv/parse-csv";
import { isTruthyFlag, nullable } from "../../csv/csv-utils";
import { ImportResult, ReferenceImportContext } from "../../types";
import { createCounters } from "../../utils/logging";
import { slugCode } from "../../utils/normalize";

export async function importBrands(
  context: ReferenceImportContext,
): Promise<ImportResult> {
  const source = path.join(V2_REFERENCE_DIR, "brands_catalog.csv");
  const rows = await parseCsvFile(source);
  const counters = createCounters();
  counters.read = rows.length;

  for (const row of rows) {
    try {
      const code = slugCode(row.code, row.name || "brand");
      const name = row.name?.trim();

      if (!name) {
        counters.failed += 1;
        continue;
      }

      if (context.dryRun) {
        counters.created += 1;
        continue;
      }

      await context.prisma.brand.upsert({
        where: {
          tenantId_name: {
            tenantId: context.tenantId,
            name,
          } as never,
        },
        update: {
          code,
          category: nullable(row.country),
          description: nullable(row.note),
          isArchived: !isTruthyFlag(row.is_active),
        },
        create: {
          tenantId: context.tenantId,
          code,
          name,
          category: nullable(row.country),
          description: nullable(row.note),
          isArchived: !isTruthyFlag(row.is_active),
        },
      });

      counters.created += 1;
    } catch (error) {
      counters.failed += 1;
      console.error("[IMPORT_ERROR]", {
        importer: "brands",
        row,
        error,
      });
    }
  }

  return {
    key: "brands",
    source,
    target: "Brand",
    counters,
    notes: ["Імпорт брендів з brands_catalog.csv"],
  };
}
