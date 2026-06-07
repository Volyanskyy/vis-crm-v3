import path from "node:path";
import { V2_REFERENCE_DIR } from "../../config";
import { parseCsvFile } from "../../csv/parse-csv";
import { isTruthyFlag, nullable } from "../../csv/csv-utils";
import { ImportResult, ReferenceImportContext } from "../../types";
import { createCounters } from "../../utils/logging";
import { slugCode } from "../../utils/normalize";

export async function importLightingSystemTypes(
  context: ReferenceImportContext,
): Promise<ImportResult> {
  const source = path.join(V2_REFERENCE_DIR, "lighting_system_types.csv");
  const rows = await parseCsvFile(source);
  const counters = createCounters();
  counters.read = rows.length;

  for (const row of rows) {
    try {
      const name = row.name?.trim();

      if (!name) {
        counters.failed += 1;
        continue;
      }

      if (context.dryRun) {
        counters.created += 1;
        continue;
      }

      await context.prisma.lightingSystemType.upsert({
        where: {
          tenantId_name: {
            tenantId: context.tenantId,
            name,
          } as never,
        },
        update: {
          code: slugCode(row.code, name),
          category: nullable(row.category),
          description: nullable(row.note),
          isArchived: !isTruthyFlag(row.is_active),
        },
        create: {
          tenantId: context.tenantId,
          code: slugCode(row.code, name),
          name,
          category: nullable(row.category),
          description: nullable(row.note),
          isArchived: !isTruthyFlag(row.is_active),
        },
      });

      counters.created += 1;
    } catch (error) {
      counters.failed += 1;
      console.error("[IMPORT_ERROR]", {
        importer: "NAME_HERE",
        row,
        error,
      });
    }

  }

  return {
    key: "lighting-system-types",
    source,
    target: "LightingSystemType",
    counters,
    notes: ["Імпорт систем освітлення"],
  };
}
